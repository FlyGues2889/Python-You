use std::process::Command;

/// 从 git remote 推导 owner/repo。
/// 构建期取而不是运行期取：终端用户的机器上不一定装了 git。
fn repo_slug() -> Option<String> {
    let out = Command::new("git")
        .args(["remote", "get-url", "origin"])
        .current_dir("..")
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let url = String::from_utf8(out.stdout).ok()?;
    parse_slug(url.trim())
}

/// 支持 https://github.com/OWNER/REPO(.git) 与 git@github.com:OWNER/REPO(.git)
fn parse_slug(url: &str) -> Option<String> {
    let cleaned = url.trim().trim_end_matches('/').trim_end_matches(".git");
    let rest = cleaned.split("github.com").nth(1)?;
    let rest = rest.trim_start_matches(['/', ':']);
    let mut parts = rest.split('/').filter(|p| !p.is_empty());
    let owner = parts.next()?;
    let repo = parts.next()?;
    Some(format!("{owner}/{repo}"))
}

fn main() {
    println!("cargo:rerun-if-changed=../.git/config");
    // 构建时间（秒级 epoch）：更新器拿它和 release 的发布时间比新旧，
    // 这样版本号怎么编号都不影响判断。取不到就写 0（客户端会拒绝比较并报错）。
    let build_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    println!("cargo:rustc-env=PYTHON_YOU_BUILD_TIME={build_time}");
    let repo = repo_slug().unwrap_or_else(|| "FlyGues2889/Python-You".to_string());
    println!("cargo:rustc-env=PYTHON_YOU_REPO={repo}");
    tauri_build::build()
}
