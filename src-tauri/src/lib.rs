mod fs;
mod python;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(python::PythonState::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            fs::fs_read_directory,
            fs::fs_read_file,
            fs::fs_write_file,
            fs::fs_create_file,
            fs::fs_create_dir,
            fs::fs_rename,
            fs::fs_delete,
            fs::fs_materialize_workspace,
            fs::ensure_default_workspace,
            fs::set_workspace_root,
            python::python_detect,
            python::python_select,
            python::python_run,
            python::python_stop,
            python::python_repl_start,
            python::python_repl_input,
            python::python_repl_stop,
            python::python_pip_install,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // 应用退出时杀掉仍存活的 Python 子进程（REPL / 脚本 / pip），避免留下孤儿进程
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = app.try_state::<python::PythonState>() {
                    python::shutdown(state.inner());
                }
            }
        });
}
