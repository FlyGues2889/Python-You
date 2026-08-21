// 本地真实文件系统命令：让 Python You 可以直接读写磁盘上的工作区
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::{Mutex, OnceLock};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

// 当前工作区根目录（前端打开文件夹/加载默认工作区时经 set_workspace_root 设置）。
// 所有 fs_* 命令必须校验目标路径位于该根目录之内，防止路径穿越/符号链接逃逸
// 读写工作区之外的任意文件（NFR-5.2）。
static WORKSPACE_ROOT: OnceLock<Mutex<Option<PathBuf>>> = OnceLock::new();

fn workspace_root() -> &'static Mutex<Option<PathBuf>> {
    WORKSPACE_ROOT.get_or_init(|| Mutex::new(None))
}

#[tauri::command]
pub fn set_workspace_root(path: String) {
    *workspace_root().lock().unwrap() = Some(PathBuf::from(&path));
}

// 校验目标路径位于当前工作区根目录之内。
// - 存在的路径：canonicalize 双方后比较（解析符号链接，拒绝 symlink 逃逸）
// - 不存在的路径（新建/写入目标）：canonicalize 其父目录 + 文件名再比较
fn ensure_within_root(path: &Path) -> Result<(), String> {
    let guard = workspace_root().lock().unwrap();
    let root = guard.as_ref().ok_or_else(|| "工作区根目录未设置".to_string())?;
    let root_canon = root.canonicalize().unwrap_or_else(|_| root.clone());
    let target = if path.exists() {
        path.canonicalize().map_err(|e| e.to_string())?
    } else {
        let parent = path.parent().unwrap_or(path);
        let parent_canon = parent.canonicalize().map_err(|e| e.to_string())?;
        match path.file_name() {
            Some(name) => parent_canon.join(name),
            None => parent_canon,
        }
    };
    if !target.starts_with(&root_canon) {
        return Err(format!("路径不在工作区内: {}", path.display()));
    }
    Ok(())
}

// 新建/重命名时的名称校验（与前端 FileTree 校验一致）：拒绝路径分隔符、
// Windows 保留字符、控制字符与 ..（配合 ensure_within_root 防逃逸）
fn ensure_valid_name(name: &str) -> Result<(), String> {
    if name.is_empty()
        || name == "."
        || name == ".."
        || name.contains("..")
        || name.contains('/')
        || name.contains('\\')
        || name.contains(':')
        || name.chars().any(|c| c.is_control())
    {
        return Err(format!("文件名不合法: {name}"));
    }
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FsEntry {
    name: String,
    path: String,
    is_folder: bool,
    children: Option<Vec<FsEntry>>,
    content: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportItem {
    path: String,
    content: String,
    is_folder: bool,
}

// 打开文件夹时跳过与学习无关的目录，避免拖慢树构建
const SKIP_DIRS: &[&str] = &[
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env", ".env",
    ".idea", ".vscode", ".pnpm-store", "dist", "target", "build",
];

// 只读取当前目录的“一层”（懒加载）：文件夹的 children 返回 None，
// 由前端在展开文件夹时再按需调用本命令读取子目录，避免启动时全量递归拖慢初始化。
// 同时用 DirEntry::file_type 判断类型，省掉对每个条目再做一次 stat 系统调用。
fn read_dir_once(dir: &Path) -> std::io::Result<Vec<FsEntry>> {
    let mut entries = Vec::new();
    let rd = fs::read_dir(dir)?;
    for entry in rd.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if SKIP_DIRS.contains(&name.as_str()) {
            continue;
        }
        let file_type = match entry.file_type() {
            Ok(ft) => ft,
            Err(_) => continue,
        };
        if file_type.is_dir() {
            entries.push(FsEntry {
                name,
                path: entry.path().to_string_lossy().to_string(),
                is_folder: true,
                children: None,
                content: None,
            });
        } else if file_type.is_file() {
            // 内容按需加载（打开文件时再读取），启动时不做任何文件内容 IO
            entries.push(FsEntry {
                name,
                path: entry.path().to_string_lossy().to_string(),
                is_folder: false,
                children: None,
                content: None,
            });
        }
    }
    // 文件夹优先，其次文件，均按名称排序
    entries.sort_by(|a, b| {
        if a.is_folder != b.is_folder {
            return if a.is_folder { std::cmp::Ordering::Less } else { std::cmp::Ordering::Greater };
        }
        a.name.to_lowercase().cmp(&b.name.to_lowercase())
    });
    Ok(entries)
}

#[tauri::command]
pub fn fs_read_directory(path: String) -> Result<Vec<FsEntry>, String> {
    let p = PathBuf::from(&path);
    ensure_within_root(&p)?;
    read_dir_once(&p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_read_file(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    ensure_within_root(&p)?;
    fs::read_to_string(&p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_write_file(path: String, content: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    ensure_within_root(&p)?;
    fs::write(&p, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fs_create_file(parent_path: String, name: String) -> Result<String, String> {
    ensure_valid_name(&name)?;
    let dir = if parent_path.is_empty() {
        PathBuf::from(".")
    } else {
        PathBuf::from(&parent_path)
    };
    ensure_within_root(&dir)?;
    let path = dir.join(&name);
    fs::write(&path, format!("# {name}\n")).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_create_dir(parent_path: String, name: String) -> Result<String, String> {
    ensure_valid_name(&name)?;
    let dir = if parent_path.is_empty() {
        PathBuf::from(".")
    } else {
        PathBuf::from(&parent_path)
    };
    ensure_within_root(&dir)?;
    let path = dir.join(&name);
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_rename(path: String, new_name: String) -> Result<String, String> {
    ensure_valid_name(&new_name)?;
    let old = PathBuf::from(&path);
    ensure_within_root(&old)?;
    let new_path = old
        .parent()
        .map(|p| p.join(&new_name))
        .unwrap_or_else(|| PathBuf::from(&new_name));
    ensure_within_root(&new_path)?;
    fs::rename(&old, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_delete(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    ensure_within_root(&p)?;
    if p.is_dir() {
        fs::remove_dir_all(&p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&p).map_err(|e| e.to_string())
    }
}

// 首次启动时由本命令创建空的 WorkSpace/ 工作区文件夹（不写入任何示例文件）。
// 便携布局：优先放在 exe 同级目录；若不可写则回退到应用数据目录。
#[tauri::command]
pub fn ensure_default_workspace(app: AppHandle) -> Result<String, String> {
    let app_data_root = || {
        app.path()
            .app_data_dir()
            .map_err(|e| e.to_string())
            .map(|d| d.join("WorkSpace"))
    };

    let root: PathBuf = match std::env::current_exe() {
        Ok(exe) => match exe.parent() {
            Some(dir) => {
                let candidate = dir.join("WorkSpace");
                if candidate.exists() {
                    candidate
                } else {
                    match fs::create_dir_all(&candidate) {
                        Ok(_) => candidate,
                        Err(_) => app_data_root()?,
                    }
                }
            }
            None => app_data_root()?,
        },
        Err(_) => app_data_root()?,
    };
    // 仅在不存在时才创建空文件夹，避免每次启动都重复建目录
    if !root.exists() {
        fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    }
    Ok(root.to_string_lossy().to_string())
}

// 把虚拟工作区（内存中的文件树）落盘到临时目录，供本机 Python 以该目录为 cwd 运行
#[tauri::command]
pub fn fs_materialize_workspace(items: Vec<ImportItem>) -> Result<String, String> {
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let base = std::env::temp_dir().join(format!("python_you_ws_{}_{}", std::process::id(), nanos));
    for item in &items {
        let rel = item.path.trim_start_matches('/');
        // 相对路径不得包含父目录组件（..），防止虚拟工作区文件名逃逸出临时目录
        let rel_path = Path::new(rel);
        if rel_path.components().any(|c| matches!(c, Component::ParentDir)) {
            return Err(format!("虚拟工作区路径包含 .. 逃逸: {}", item.path));
        }
        let target = base.join(rel_path);
        if item.is_folder {
            fs::create_dir_all(&target).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            fs::write(&target, &item.content).map_err(|e| e.to_string())?;
        }
    }
    Ok(base.to_string_lossy().to_string())
}
