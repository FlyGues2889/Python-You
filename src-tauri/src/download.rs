//! 带进度事件的分块下载：自更新（updater.rs）与本机 Python 安装包（python.rs）共用。
//! 只有拿到 Content-Length 才报百分比（不伪造进度）；可选中途取消与 SHA256 校验。
use sha2::{Digest, Sha256};
use std::io::Write;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

/// 服务器要求带 User-Agent，缺了直接 403（GitHub API / 清华镜像）
pub const USER_AGENT: &str = concat!("Python-You/", env!("CARGO_PKG_VERSION"));
/// 建连超时：连不上时尽快报错，不在下载中途干等
pub const CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
/// 取消下载时返回的固定文案，前端据此区分「用户取消」与「真失败」
pub const CANCELLED: &str = "已取消下载";

/// 把 url 分块下载到 target；进度按 1% 步进发到 progress_event（0-100）。
/// cancel 置位时中止并删除半成品；expected_sha256 非空时校验不一致即丢弃。
pub async fn stream_download(
    app: &AppHandle,
    url: &str,
    target: &Path,
    progress_event: &str,
    cancel: Option<&AtomicBool>,
    expected_sha256: Option<&str>,
) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .connect_timeout(CONNECT_TIMEOUT)
        .build()
        .map_err(|e| format!("初始化网络客户端失败：{e}"))?;

    let mut resp = client
        .get(url)
        .header("User-Agent", USER_AGENT)
        .send()
        .await
        .map_err(|e| format!("下载失败，请检查网络：{e}"))?;

    if !resp.status().is_success() {
        return Err(format!("下载失败：服务器返回 {}", resp.status().as_u16()));
    }

    if let Some(flag) = cancel {
        flag.store(false, Ordering::SeqCst);
    }
    let mut file = std::fs::File::create(target).map_err(|e| format!("无法写入临时文件：{e}"))?;
    let total = resp.content_length().unwrap_or(0);
    let mut hasher = Sha256::new();
    let mut downloaded: u64 = 0;
    let mut last_percent = u64::MAX;

    while let Some(chunk) = resp.chunk().await.map_err(|e| format!("下载中断：{e}"))? {
        if cancel.is_some_and(|f| f.load(Ordering::SeqCst)) {
            drop(file);
            let _ = std::fs::remove_file(target);
            return Err(CANCELLED.to_string());
        }
        hasher.update(&chunk);
        if let Err(e) = file.write_all(&chunk) {
            drop(file);
            let _ = std::fs::remove_file(target);
            return Err(format!("写入临时文件失败：{e}"));
        }
        downloaded += chunk.len() as u64;
        if total > 0 {
            // 钳到 0-100：服务端声明长度与实际字节数不一致时不让进度越界
            let percent = (downloaded.saturating_mul(100) / total).min(100);
            if percent != last_percent {
                last_percent = percent;
                let _ = app.emit(progress_event, percent);
            }
        }
    }
    file.flush().map_err(|e| format!("写入临时文件失败：{e}"))?;
    drop(file);

    if let Some(expected) = expected_sha256.map(str::trim).filter(|s| !s.is_empty()) {
        let actual = hex::encode(hasher.finalize());
        if !expected.eq_ignore_ascii_case(&actual) {
            let _ = std::fs::remove_file(target);
            return Err(format!(
                "下载文件的 SHA256 与发布说明不一致，已丢弃：期望 {expected}，实际 {actual}"
            ));
        }
    }

    Ok(())
}
