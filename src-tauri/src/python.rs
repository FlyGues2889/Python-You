// 本机 Python 子进程引擎：检测 / 运行 / 停止 / REPL / pip
//
// 设计要点：
// - 通过事件 "py-output" 把 stdout/stderr/完成信息流式推送给前端
// - 进程保存在全局 State 中，前端可随时调用 python_stop 强制 kill（让"停止运行"真正可用）
// - 脚本写入临时文件后以 `python -u <file>` 运行，支持超长代码，且以工作区为 cwd
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

pub struct PythonState {
    pub proc: Mutex<Option<Child>>,
    pub repl_stdin: Mutex<Option<ChildStdin>>,
    pub python_path: Mutex<Option<String>>,
    // 当前正在运行的任务会话（run / repl / pip），用于停止时正确通知前端收尾
    pub current_session: Mutex<Option<String>>,
}

impl Default for PythonState {
    fn default() -> Self {
        Self {
            proc: Mutex::new(None),
            repl_stdin: Mutex::new(None),
            python_path: Mutex::new(None),
            current_session: Mutex::new(None),
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PythonInfo {
    available: bool,
    version: Option<String>,
    command: Option<String>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PyEvent {
    kind: String,
    text: String,
    session: String,
}

// Windows 下给子进程设置 CREATE_NO_WINDOW，避免 GUI 应用每次 spawn 都闪现控制台窗口
#[cfg(windows)]
fn no_console(cmd: &mut Command) {
    use std::os::windows::process::CommandExt;
    cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
}

#[cfg(not(windows))]
fn no_console(_cmd: &mut Command) {}

fn detect_version(cmd: &str) -> Option<String> {
    use std::io::Read;

    let mut c = Command::new(cmd);
    c.arg("--version");
    no_console(&mut c);
    c.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = match c.spawn() {
        Ok(ch) => ch,
        Err(_) => return None,
    };

    // 限定等待时间（3s），防止异常 python 启动器（商店占位/杀软拦截）让引擎检测永久挂起
    let deadline = SystemTime::now() + Duration::from_millis(3000);
    let status = loop {
        match child.try_wait() {
            Ok(Some(st)) => break Some(st),
            Ok(None) => {}
            Err(_) => break None,
        }
        if SystemTime::now() >= deadline {
            break None;
        }
        std::thread::sleep(Duration::from_millis(30));
    };

    let mut text = String::new();
    if let Some(status) = status {
        if status.success() {
            let mut buf = String::new();
            if let Some(mut so) = child.stdout.take() {
                let _ = so.read_to_string(&mut buf);
            }
            if buf.trim().is_empty() {
                if let Some(mut se) = child.stderr.take() {
                    let _ = se.read_to_string(&mut buf);
                }
            }
            text = buf.trim().to_string();
        }
    }
    // 无论如何确保子进程被回收，避免残留
    let _ = child.kill();
    let _ = child.wait();

    // 过滤 Windows 商店的 "Python was not found" 占位桩
    if text.contains("Python") && !text.to_lowercase().contains("not found") {
        return Some(text);
    }
    None
}

fn detect_python() -> Option<(String, String)> {
    for cmd in ["python", "python3", "py"] {
        if let Some(ver) = detect_version(cmd) {
            return Some((cmd.to_string(), ver));
        }
    }
    None
}

fn resolve_python(state: &State<PythonState>) -> Result<(String, String), String> {
    if let Some(cmd) = state.python_path.lock().unwrap().clone() {
        let ver = detect_version(&cmd).unwrap_or_default();
        return Ok((cmd, ver));
    }
    match detect_python() {
        Some((cmd, ver)) => {
            *state.python_path.lock().unwrap() = Some(cmd.clone());
            Ok((cmd, ver))
        }
        None => Err("未检测到本机 Python 环境，请安装 Python 3.8+ 后使用本地引擎（当前将回退到 Pyodide / 演示模式）".to_string()),
    }
}

fn emit(app: &AppHandle, kind: &str, text: &str, session: &str) {
    let _ = app.emit(
        "py-output",
        PyEvent {
            kind: kind.to_string(),
            text: text.to_string(),
            session: session.to_string(),
        },
    );
}

// 通用：启动一个流式子进程（stdout/stderr -> 事件），并存下句柄以便 stop 强杀
fn spawn_streaming(
    app: AppHandle,
    state: &State<PythonState>,
    mut cmd: Command,
    script: Option<PathBuf>,
    session: &str,
) -> Result<(), String> {
    // 先杀掉上一个进程（运行脚本 / REPL / pip 之间互斥），并通知上一个会话已终止
    let prev_session = {
        let mut g = state.current_session.lock().unwrap();
        g.take()
    };
    if let Ok(mut guard) = state.proc.lock() {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
            let _ = child.wait();
            if let Some(ps) = prev_session {
                emit(&app, "done", "-1", &ps);
            }
        }
    }
    *state.current_session.lock().unwrap() = Some(session.to_string());

    cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::null());
    no_console(&mut cmd);
    let mut child = cmd.spawn().map_err(|e| format!("启动 Python 失败: {e}"))?;

    let stdout = child.stdout.take().expect("child stdout");
    let stderr = child.stderr.take().expect("child stderr");

    let app_stdout = app.clone();
    let session_stdout = session.to_string();
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            emit(&app_stdout, "stdout", line.trim_end_matches('\r'), &session_stdout);
        }
    });

    let app_stderr = app.clone();
    let session_stderr = session.to_string();
    std::thread::spawn(move || {
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            emit(&app_stderr, "stderr", line.trim_end_matches('\r'), &session_stderr);
        }
    });

    *state.proc.lock().unwrap() = Some(child);

    // 收割线程：轮询退出状态，进程结束后清理并广播 "done"
    let session_done = session.to_string();
    std::thread::spawn(move || {
        loop {
            let outcome: Option<Option<i32>> = {
                let st = app.state::<PythonState>();
                let mut guard = st.proc.lock().unwrap();
                let res = match guard.as_mut() {
                    Some(c) => match c.try_wait() {
                        Ok(Some(status)) => Some(Some(status.code().unwrap_or(-1))),
                        Ok(None) => None,
                        Err(_) => Some(Some(-1)),
                    },
                    None => Some(None),
                };
                if matches!(res, Some(_)) {
                    *guard = None;
                }
                res
            };
            match outcome {
                Some(Some(code)) => {
                    if let Some(p) = script {
                        let _ = std::fs::remove_file(p);
                    }
                    {
                        let st = app.state::<PythonState>();
                        *st.current_session.lock().unwrap() = None;
                    }
                    emit(&app, "done", &code.to_string(), &session_done);
                    break;
                }
                Some(None) => break,
                None => {}
            }
            std::thread::sleep(Duration::from_millis(80));
        }
    });

    Ok(())
}

fn write_temp_script(code: &str) -> Result<PathBuf, String> {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let name = format!("python_you_{}_{}.py", std::process::id(), nanos);
    let path = std::env::temp_dir().join(name);
    std::fs::write(&path, code).map_err(|e| format!("写入临时脚本失败: {e}"))?;
    Ok(path)
}

#[tauri::command]
pub fn python_detect(state: State<PythonState>) -> PythonInfo {
    match resolve_python(&state) {
        Ok((cmd, ver)) => PythonInfo {
            available: true,
            version: Some(ver),
            command: Some(cmd),
        },
        Err(_) => PythonInfo {
            available: false,
            version: None,
            command: None,
        },
    }
}

#[tauri::command]
pub fn python_run(
    app: AppHandle,
    state: State<PythonState>,
    code: String,
    cwd: Option<String>,
) -> Result<(), String> {
    let (py, _) = resolve_python(&state)?;
    let script = write_temp_script(&code)?;
    let mut cmd = Command::new(&py);
    cmd.arg("-u").arg(&script);
    cmd.env("PYTHONPATH", "."); // 让脚本可以 import 工作区里的兄弟模块
    if let Some(dir) = &cwd {
        cmd.current_dir(dir);
    }
    spawn_streaming(app, &state, cmd, Some(script), "run")
}

#[tauri::command]
pub fn python_stop(app: AppHandle, state: State<PythonState>) -> Result<(), String> {
    let session = {
        let mut g = state.current_session.lock().unwrap();
        g.take().unwrap_or_else(|| "run".to_string())
    };
    if let Ok(mut guard) = state.proc.lock() {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
    if let Ok(mut guard) = state.repl_stdin.lock() {
        guard.take();
    }
    // 通知前端该会话已结束，让 runCode 的 Promise 正常收尾
    emit(&app, "done", "-1", &session);
    Ok(())
}

#[tauri::command]
pub fn python_repl_start(app: AppHandle, state: State<PythonState>, cwd: Option<String>) -> Result<(), String> {
    let (py, _) = resolve_python(&state)?;

    // 清理上一个会话
    let prev_session = {
        let mut g = state.current_session.lock().unwrap();
        g.take()
    };
    if let Ok(mut guard) = state.proc.lock() {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
            let _ = child.wait();
            if let Some(ps) = prev_session {
                emit(&app, "done", "-1", &ps);
            }
        }
    }
    if let Ok(mut guard) = state.repl_stdin.lock() {
        guard.take();
    }
    *state.current_session.lock().unwrap() = Some("repl".to_string());

    let mut cmd = Command::new(&py);
    cmd.arg("-u").arg("-i");
    if let Some(dir) = &cwd {
        cmd.current_dir(dir);
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::piped());
    no_console(&mut cmd);

    let mut child = cmd.spawn().map_err(|e| format!("启动 REPL 失败: {e}"))?;
    let stdin = child.stdin.take().expect("child stdin");
    let stdout = child.stdout.take().expect("child stdout");
    let stderr = child.stderr.take().expect("child stderr");

    let app_stdout = app.clone();
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            emit(&app_stdout, "stdout", line.trim_end_matches('\r'), "repl");
        }
    });

    let app_stderr = app.clone();
    std::thread::spawn(move || {
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            emit(&app_stderr, "stderr", line.trim_end_matches('\r'), "repl");
        }
    });

    *state.repl_stdin.lock().unwrap() = Some(stdin);
    *state.proc.lock().unwrap() = Some(child);

    // 收割线程：REPL 进程意外退出时通知前端
    std::thread::spawn(move || {
        loop {
            let outcome: Option<Option<i32>> = {
                let st = app.state::<PythonState>();
                let mut guard = st.proc.lock().unwrap();
                let res = match guard.as_mut() {
                    Some(c) => match c.try_wait() {
                        Ok(Some(status)) => Some(Some(status.code().unwrap_or(-1))),
                        Ok(None) => None,
                        Err(_) => Some(Some(-1)),
                    },
                    None => Some(None),
                };
                if matches!(res, Some(_)) {
                    *guard = None;
                }
                res
            };
            match outcome {
                Some(Some(code)) => {
                    {
                        let st = app.state::<PythonState>();
                        st.repl_stdin.lock().unwrap().take();
                        *st.current_session.lock().unwrap() = None;
                    }
                    emit(&app, "done", &code.to_string(), "repl");
                    break;
                }
                Some(None) => break,
                None => {}
            }
            std::thread::sleep(Duration::from_millis(80));
        }
    });

    Ok(())
}

#[tauri::command]
pub fn python_repl_input(state: State<PythonState>, line: String) -> Result<(), String> {
    let mut guard = state.repl_stdin.lock().unwrap();
    let stdin = guard.as_mut().ok_or("REPL 会话尚未启动")?;
    let mut buf = line;
    if !buf.ends_with('\n') {
        buf.push('\n');
    }
    stdin.write_all(buf.as_bytes()).map_err(|e| e.to_string())?;
    stdin.flush().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn python_repl_stop(app: AppHandle, state: State<PythonState>) -> Result<(), String> {
    python_stop(app, state)
}

// 应用退出时调用：杀掉仍存活的子进程（REPL / 运行中的脚本 / pip），避免留下孤儿进程
pub fn shutdown(state: &PythonState) {
    if let Ok(mut guard) = state.proc.lock() {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
    if let Ok(mut guard) = state.repl_stdin.lock() {
        guard.take();
    }
    if let Ok(mut g) = state.current_session.lock() {
        g.take();
    }
}

#[tauri::command]
pub fn python_pip_install(app: AppHandle, state: State<PythonState>, pkg: String) -> Result<(), String> {
    let (py, _) = resolve_python(&state)?;
    let mut cmd = Command::new(&py);
    cmd.arg("-m").arg("pip").arg("install").arg("--no-input").arg(&pkg);
    spawn_streaming(app, &state, cmd, None, "pip")
}
