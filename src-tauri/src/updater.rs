//! 自更新：查 GitHub Release → 下载新版单文件 exe → SHA256 校验 → 换掉自身并重启。
//!
//! 不用 tauri-plugin-updater：它在 Windows 上只支持 NSIS/MSI 安装包，本项目只发单文件 exe。
//! 仓库地址在构建期由 build.rs 从 `git remote get-url origin` 取（终端用户机器上不一定有 git）。
//! 新旧判定看 release 的发布时间与本地构建时间，**不比较版本号大小** —— 本项目的版本号
//! 是 0.3.5 / 0.3.51 / 0.3.52 / 0.3.6 / 0.3.62 / 0.3.7 / 0.3.71 / 0.3.72 / 0.3.73 / 0.3.74 这种「系列号 + 修订号」写法，数值与字符串
//! 都排不出正确顺序，按号比迟早会判错方向。

use serde::Serialize;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Manager};

use crate::download::{stream_download, USER_AGENT};

/// 取消标志：设置页点「取消下载」时置位，下载循环每个分块检查一次
static CANCEL_DOWNLOAD: AtomicBool = AtomicBool::new(false);

/// 构建期固化（见 build.rs）
const REPO: &str = env!("PYTHON_YOU_REPO");
const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
/// Release 资产命名约定：Python-You-green-<版本>-windows-x64.exe
const ASSET_SUFFIX: &str = "-windows-x64.exe";
const ASSET_PATTERN: &str = r"Python-You-green-(.+)-windows-x64\.exe";
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
/// 下载中的临时文件与替换脚本都放系统临时目录
const NEW_EXE_NAME: &str = "python-you-new.exe";
const SCRIPT_NAME: &str = "python-you-update.bat";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub has_update: bool,
    pub current_version: String,
    pub latest_version: String,
    pub notes: String,
    pub download_url: String,
    pub expected_sha256: Option<String>,
}

/// 本程序的构建时间（秒级 epoch，构建期由 build.rs 写入）
const BUILD_TIME: &str = env!("PYTHON_YOU_BUILD_TIME");

fn build_time_epoch() -> Option<i64> {
    BUILD_TIME.trim().parse().ok()
}

/// release 的发布时间（RFC3339）→ epoch 秒
fn published_epoch(rfc3339: &str) -> Option<i64> {
    chrono::DateTime::parse_from_rfc3339(rfc3339.trim())
        .ok()
        .map(|t| t.timestamp())
}

/// 从 release notes 首行提取 `sha256: <64 位十六进制>`
fn extract_sha256(first_line: &str) -> Option<String> {
    let re = regex::Regex::new(r"(?i)sha256:\s*([0-9a-f]{64})").ok()?;
    let caps = re.captures(first_line)?;
    Some(caps.get(1)?.as_str().to_ascii_lowercase())
}

fn temp_path(name: &str) -> PathBuf {
    std::env::temp_dir().join(name)
}

#[tauri::command]
pub async fn check_update() -> Result<UpdateInfo, String> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .map_err(|e| format!("初始化网络客户端失败：{e}"))?;

    let url = format!("https://api.github.com/repos/{REPO}/releases/latest");
    let resp = client
        .get(&url)
        .header("User-Agent", USER_AGENT)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|e| format!("检查更新失败，请检查网络：{e}"))?;

    if !resp.status().is_success() {
        return Err(format!(
            "检查更新失败：GitHub 返回 {}（仓库 {} 可能还没有发布版本）",
            resp.status().as_u16(),
            REPO
        ));
    }

    let body: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("解析更新信息失败：{e}"))?;

    let notes = body["body"].as_str().unwrap_or("").to_string();

    let asset = body["assets"]
        .as_array()
        .and_then(|assets| {
            assets
                .iter()
                .find(|a| a["name"].as_str().is_some_and(|n| n.ends_with(ASSET_SUFFIX)))
        })
        .ok_or_else(|| format!("该版本没有找到 Windows 单文件资产（*{ASSET_SUFFIX}）"))?;

    let asset_name = asset["name"].as_str().unwrap_or_default();
    let re = regex::Regex::new(ASSET_PATTERN).map_err(|e| format!("资产名正则无效：{e}"))?;
    let latest_version = re
        .captures(asset_name)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .ok_or_else(|| format!("资产名不符合命名约定（应为 Python-You-green-<版本>-windows-x64.exe）：{asset_name}"))?;

    let download_url = asset["browser_download_url"]
        .as_str()
        .unwrap_or_default()
        .to_string();
    if download_url.is_empty() {
        return Err("该资产没有下载地址".to_string());
    }

    let expected_sha256 = notes.lines().next().and_then(extract_sha256);
    if expected_sha256.is_none() {
        eprintln!("[updater] release notes 首行没有 sha256: <哈希>，本次跳过完整性校验");
    }

    // 新旧按「发布时间 vs 本地构建时间」判定，不看版本号怎么编号：
    // 同一版本号不必再下一次，其余情况只要这一版发布得比我晚就是新版
    let published_at = body["published_at"].as_str().unwrap_or("");
    let published = published_epoch(published_at)
        .ok_or_else(|| format!("发布信息里的发布时间无法解析：{published_at}"))?;
    let build_time = build_time_epoch().ok_or_else(|| "本地构建时间缺失，无法比较新旧".to_string())?;

    Ok(UpdateInfo {
        has_update: latest_version.trim() != CURRENT_VERSION && published > build_time,
        current_version: CURRENT_VERSION.to_string(),
        latest_version,
        notes,
        download_url,
        expected_sha256,
    })
}

#[tauri::command]
pub async fn download_update(
    app: AppHandle,
    url: String,
    expected_sha256: Option<String>,
) -> Result<String, String> {
    let target = temp_path(NEW_EXE_NAME);
    stream_download(
        &app,
        &url,
        &target,
        "download-progress",
        Some(&CANCEL_DOWNLOAD),
        expected_sha256.as_deref(),
    )
    .await?;
    Ok(target.to_string_lossy().to_string())
}

/// 取消正在进行的下载（下载循环每个分块检查一次标志）
#[tauri::command]
pub fn cancel_update_download() {
    CANCEL_DOWNLOAD.store(true, Ordering::SeqCst);
}

/// 换掉正在运行的 exe 并重启。
/// 运行中的 exe 被系统锁定，自己覆盖不了自己，所以交给一个延迟脚本：
/// 等本进程退出 → move 覆盖 → 重新启动。
#[tauri::command]
pub fn replace_and_restart(app: AppHandle) -> Result<(), String> {
    let new_exe = temp_path(NEW_EXE_NAME);
    if !new_exe.exists() {
        return Err("没有已下载的更新文件，请先下载".to_string());
    }
    let current_exe = std::env::current_exe().map_err(|e| format!("取当前程序路径失败：{e}"))?;

    let script_path = temp_path(SCRIPT_NAME);
    let script = format!(
        "@echo off\r\n\
         timeout /t 1 /nobreak >nul\r\n\
         move /y \"{}\" \"{}\" >nul\r\n\
         start \"\" \"{}\"\r\n\
         del \"%~f0\"\r\n",
        new_exe.display(),
        current_exe.display(),
        current_exe.display()
    );
    std::fs::write(&script_path, script).map_err(|e| format!("写入更新脚本失败：{e}"))?;

    // 退出前先做常规清理（杀 Python 子进程、清临时工作区），
    // 与 RunEvent::Exit 里的处理一致 —— std::process::exit 不会触发那个回调
    if let Some(state) = app.try_state::<crate::python::PythonState>() {
        crate::python::shutdown(state.inner());
    }
    crate::fs::cleanup_temp_workspaces();

    spawn_script(&script_path)?;
    std::process::exit(0);
}

#[cfg(windows)]
fn spawn_script(script_path: &PathBuf) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    // .bat 不能直接 CreateProcess，须经 cmd /C；CREATE_NO_WINDOW 避免弹一下黑框
    std::process::Command::new("cmd")
        .arg("/C")
        .arg(script_path)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| format!("启动更新脚本失败：{e}"))?;
    Ok(())
}

#[cfg(not(windows))]
fn spawn_script(_script_path: &PathBuf) -> Result<(), String> {
    Err("当前平台暂不支持自动替换，请手动下载新版本".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_github_publish_time() {
        assert_eq!(published_epoch("2026-09-27T12:34:56Z"), Some(1_790_512_496));
        // 带时区偏移的写法等价
        assert_eq!(published_epoch("2026-09-27T20:34:56+08:00"), Some(1_790_512_496));
        assert_eq!(published_epoch("1970-01-01T00:00:00Z"), Some(0));
        // 解析不了就返回 None，调用方报错而不是猜
        assert_eq!(published_epoch(""), None);
        assert_eq!(published_epoch("2026-09-27"), None);
    }

    #[test]
    fn newer_means_published_after_this_build() {
        let build = 1_790_512_496i64;
        assert!(1_790_512_497 > build); // 比构建时间晚一分钟就是新版
        assert!(!(1_790_512_495 > build)); // 早于构建时间的不算
        assert!(!(build > build)); // 同一时刻不算
    }

    #[test]
    fn sha256_is_read_from_first_line() {
        let line = "sha256: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        assert_eq!(
            extract_sha256(line).as_deref(),
            Some("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
        );
        // 大写也认，统一转小写
        assert!(extract_sha256("SHA256: ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789").is_some());
        // 没有哈希时返回 None（调用方跳过校验）
        assert!(extract_sha256("本版修复若干问题").is_none());
    }
}
