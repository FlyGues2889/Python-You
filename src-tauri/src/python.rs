// 本机 Python 子进程引擎：检测 / 运行 / 停止 / REPL / pip
//
// 设计要点：
// - 通过事件 "py-output" 把 stdout/stderr/完成信息流式推送给前端
// - 进程保存在全局 State 中，前端可随时调用 python_stop 强制 kill（让"停止运行"真正可用）
// - 脚本写入临时文件后以 `python -u <file>` 运行，支持超长代码，且以工作区为 cwd
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

pub struct PythonState {
    pub proc: Mutex<Option<Child>>,
    pub repl_stdin: Mutex<Option<ChildStdin>>,
    // run 会话（python_run 启动的脚本）的 stdin：供 input() 交互写入
    pub run_stdin: Mutex<Option<ChildStdin>>,
    // 用户选择的解释器 id（"python" / "py" / "py-3.13" / 等），None = 自动选第一个可用
    pub selected_python: Mutex<Option<String>>,
    // 当前正在运行的任务会话（run / repl / pip），用于停止时正确通知前端收尾
    pub current_session: Mutex<Option<String>>,
}

impl Default for PythonState {
    fn default() -> Self {
        Self {
            proc: Mutex::new(None),
            repl_stdin: Mutex::new(None),
            run_stdin: Mutex::new(None),
            selected_python: Mutex::new(None),
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
    versions: Vec<PythonVersion>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PythonVersion {
    /// 选择器 id（前端 config.interpreter 存此值）
    id: String,
    /// 版本字符串，如 "Python 3.13.14"
    version: String,
    /// 展示名，如 "Python 3.13.14 (py -3.13)"
    label: String,
    /// 启动命令拆分（首元素为可执行文件，后续为固定参数，如 ["py", "-3.13"]）
    command: Vec<String>,
    /// 解释器可执行文件绝对路径（供选择器辨认；探测不到时为空串）
    path: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PyEvent {
    kind: String,
    text: String,
    session: String,
    /// true = 这段文本后面还没有换行，属于「正在写的这一行」。
    /// 前端据此把同一行的片段接起来，并把输入光标接在未结束的提示串后面。
    partial: bool,
}

// Windows 下给子进程设置 CREATE_NO_WINDOW，避免 GUI 应用每次 spawn 都闪现控制台窗口
#[cfg(windows)]
fn no_console(cmd: &mut Command) {
    use std::os::windows::process::CommandExt;
    cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
}

#[cfg(not(windows))]
fn no_console(_cmd: &mut Command) {}

// 探测解释器：一次调用同时取回版本号与可执行文件绝对路径（选择器里需要展示路径辨认）
fn probe_interpreter(parts: &[String]) -> Option<(String, String)> {
    use std::io::Read;

    let mut c = command_from_parts(parts);
    c.arg("-c").arg("import sys;print(sys.version.split()[0]);print(sys.executable)");
    no_console(&mut c);
    c.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = c.spawn().ok()?;

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

    let mut buf = String::new();
    let success = status.map(|s| s.success()).unwrap_or(false);
    if success {
        if let Some(mut so) = child.stdout.take() {
            let _ = so.read_to_string(&mut buf);
        }
    }
    // 无论如何确保子进程被回收，避免残留
    let _ = child.kill();
    let _ = child.wait();
    if !success {
        return None;
    }

    let mut lines = buf.lines().map(str::trim).filter(|line| !line.is_empty());
    let version = lines.next()?.to_string();
    let path = lines.next().unwrap_or("").to_string();
    Some((version, path))
}

// 用户手动添加的解释器（持久化到应用数据目录，scan_python_versions 会并入列表）
#[derive(Clone, Serialize, Deserialize)]
struct CustomPython {
    path: String,
    version: String,
}

static CUSTOM_PYTHONS: OnceLock<Mutex<Vec<CustomPython>>> = OnceLock::new();

fn custom_pythons() -> &'static Mutex<Vec<CustomPython>> {
    CUSTOM_PYTHONS.get_or_init(|| Mutex::new(Vec::new()))
}

fn custom_store_file(app: &AppHandle) -> Option<PathBuf> {
    app.path()
        .app_data_dir()
        .ok()
        .map(|dir| dir.join("custom_interpreters.json"))
}

fn load_custom_pythons(app: &AppHandle) {
    let Some(file) = custom_store_file(app) else { return };
    let Ok(text) = std::fs::read_to_string(&file) else { return };
    if let Ok(list) = serde_json::from_str::<Vec<CustomPython>>(&text) {
        *custom_pythons().lock().unwrap() = list;
    }
}

fn save_custom_pythons(app: &AppHandle) {
    let Some(file) = custom_store_file(app) else { return };
    if let Some(dir) = file.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    if let Ok(text) = serde_json::to_string_pretty(&*custom_pythons().lock().unwrap()) {
        let _ = std::fs::write(&file, text);
    }
}

// 扫描本机所有可用 Python 解释器（python / python3 / py 启动器及其具体版本 + 用户自定义）
fn scan_python_versions() -> Vec<PythonVersion> {
    let mut out: Vec<PythonVersion> = Vec::new();
    for cmd in ["python", "python3"] {
        if let Some((ver, path)) = probe_interpreter(&[cmd.to_string()]) {
            out.push(PythonVersion {
                id: cmd.to_string(),
                version: format!("Python {ver}"),
                label: format!("Python {ver} ({cmd})"),
                command: vec![cmd.to_string()],
                path,
            });
        }
    }
    // py 启动器本身 + py -0 枚举的具体版本
    if let Some((ver, path)) = probe_interpreter(&["py".to_string()]) {
        out.push(PythonVersion {
            id: "py".to_string(),
            version: format!("Python {ver}"),
            label: format!("Python {ver} (py)"),
            command: vec!["py".to_string()],
            path,
        });
        for v in list_py_versions() {
            let parts = vec!["py".to_string(), format!("-{v}")];
            let probed = probe_interpreter(&parts);
            out.push(PythonVersion {
                id: format!("py-{v}"),
                version: format!("Python {v}"),
                label: format!("Python {v} (py -{v})"),
                command: parts,
                path: probed.map(|(_, p)| p).unwrap_or_default(),
            });
        }
    }
    // 用户手动添加的解释器
    for custom in custom_pythons().lock().unwrap().iter() {
        out.push(PythonVersion {
            id: format!("custom:{}", custom.path),
            version: custom.version.clone(),
            label: format!("{}（自定义）", custom.version),
            command: vec![custom.path.clone()],
            path: custom.path.clone(),
        });
    }
    out
}

// `py -0` 列出本机安装的所有 Python 版本（输出行形如 " -V:3.13 *"）
fn list_py_versions() -> Vec<String> {
    use std::io::Read;

    let mut c = Command::new("py");
    c.arg("-0");
    no_console(&mut c);
    c.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = match c.spawn() {
        Ok(ch) => ch,
        Err(_) => return Vec::new(),
    };
    let mut buf = String::new();
    if let Some(mut so) = child.stdout.take() {
        let _ = so.read_to_string(&mut buf);
    }
    let _ = child.wait();
    buf.lines()
        .filter_map(|l| {
            let v = l.trim().strip_prefix("-V:").unwrap_or(l.trim());
            let v = v.trim().trim_end_matches('*').trim();
            if v.is_empty() {
                None
            } else {
                Some(v.to_string())
            }
        })
        .collect()
}

// 解析当前应使用的解释器命令参数；按 state.selected_python 选择，未选择时用第一个可用
fn resolve_python(state: &State<PythonState>) -> Result<Vec<String>, String> {
    let all = scan_python_versions();
    if all.is_empty() {
        return Err("未检测到本机 Python 环境，请安装 Python 3.8+ 后使用本地引擎（当前将回退到 Pyodide / 演示模式）".to_string());
    }
    let selected = state.selected_python.lock().unwrap().clone();
    if let Some(id) = selected {
        if let Some(v) = all.iter().find(|v| v.id == id) {
            return Ok(v.command.clone());
        }
    }
    Ok(all[0].command.clone())
}

fn command_from_parts(parts: &[String]) -> Command {
    let mut cmd = Command::new(&parts[0]);
    if parts.len() > 1 {
        cmd.args(&parts[1..]);
    }
    // Windows 下 Python stdout/stdin/-c 默认按 ANSI 码页（GBK）编解码，
    // 与 Rust/前端 UTF-8 不一致会导致中文输出乱码/丢失 → 统一 UTF-8
    cmd.env("PYTHONUTF8", "1");
    cmd
}

fn emit(app: &AppHandle, kind: &str, text: &str, session: &str, partial: bool) {
    let _ = app.emit(
        "py-output",
        PyEvent {
            kind: kind.to_string(),
            text: text.to_string(),
            session: session.to_string(),
            partial,
        },
    );
}

// 读取子进程输出并逐段转成 py-output 事件。
// split_cr = true 时按 \r 与 \n 双双切分：pip 下载进度条以 \r 原地刷新，
// 只按 \n 读取时进度要等整条进度条结束才到达前端，无法实时显示（FR-5.6）。
//
// 非 pip 流（脚本 / REPL）额外把「还没有终止符的尾巴」也实时送出（partial = true）：
// input() 的提示串不带换行，若攒到下一行才发，提示会出现在用户输入之后，终端交互就反了。
fn stream_reader<R: Read + Send + 'static>(
    app: AppHandle,
    mut reader: R,
    kind: &'static str,
    session: String,
    split_cr: bool,
) {
    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        let mut pending: Vec<u8> = Vec::new();
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    pending.extend_from_slice(&buf[..n]);
                    for (text, partial) in drain_segments(&mut pending, split_cr) {
                        emit(&app, kind, &text, &session, partial);
                    }
                }
                Err(_) => break,
            }
        }
        // 收尾：进程结束，残留的尾巴按完整片段送出
        if !pending.is_empty() {
            if let Ok(text) = std::str::from_utf8(&pending) {
                emit(&app, kind, text, &session, false);
            }
        }
    });
}

// 从缓冲区切出可发送的片段：(文本, partial)。纯函数，便于单测。
// - 终止符（\n，split_cr 时还有 \r）之前的整段以 partial = false 送出，并连终止符一起消费；
//   非 pip 流里行尾的 \r 属于 CRLF 终止符（Windows 子进程），随终止符一起剥掉；
// - 非 pip 流里还没遇到终止符的尾巴也以 partial = true 送出并消费：input() 的提示串没有换行，
//   攒到下一行才发会让提示出现在用户输入之后；
// - 跨 read 边界的多字节字符（from_utf8 报 error_len 为 None）留在缓冲区等补齐。
fn drain_segments(pending: &mut Vec<u8>, split_cr: bool) -> Vec<(String, bool)> {
    let mut out = Vec::new();
    let mut start = 0usize;
    for i in 0..pending.len() {
        let b = pending[i];
        if b == b'\n' || (split_cr && b == b'\r') {
            if i > start {
                if let Ok(text) = std::str::from_utf8(&pending[start..i]) {
                    // 非 pip 流按行切：Windows 的子进程按文本模式写出的 \r\n 里，\r 属于行尾终止符
                    // 而不是内容。不剥掉的话片段文本以裸 \r 结尾，前端的错误摘要正则 (.+)$ 匹配不到
                    // \r，整段 traceback 就只剩裸文本、无法折叠（旧按行读取用的正是 trim_end_matches('\r')）。
                    // pip 流按 \r 切分（进度条原地刷新），\r 是分隔符，行为不变。
                    let text = if split_cr { text } else { text.trim_end_matches('\r') };
                    out.push((text.to_string(), false));
                }
            } else if !split_cr {
                // 空片段也是「这一行到此结束」的信号：前面那段已经作为 partial 送出过，
                // 不补这一下前端就永远不知道行结束了（空行同理，本来就该显示成空行）
                out.push((String::new(), false));
            }
            start = i + 1;
        }
    }
    pending.drain(0..start);
    if !split_cr && !pending.is_empty() {
        match std::str::from_utf8(pending) {
            Ok(text) => {
                out.push((text.to_string(), true));
                pending.clear();
            }
            // 真的是坏字节：按替换字符送出，别让缓冲区无限增长
            Err(e) if e.error_len().is_some() => {
                out.push((String::from_utf8_lossy(pending).into_owned(), true));
                pending.clear();
            }
            Err(_) => {}
        }
    }
    out
}

// 通用：启动一个流式子进程（stdout/stderr -> 事件），并存下句柄以便 stop 强杀
fn spawn_streaming(
    app: AppHandle,
    state: &State<PythonState>,
    mut cmd: Command,
    script: Option<PathBuf>,
    session: &str,
    split_cr: bool,
    interactive_stdin: bool,
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
                emit(&app, "done", "-1", &ps, false);
            }
        }
    }
    state.run_stdin.lock().unwrap().take();
    *state.current_session.lock().unwrap() = Some(session.to_string());

    if interactive_stdin {
        cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::piped());
    } else {
        cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::null());
    }
    no_console(&mut cmd);
    let mut child = cmd.spawn().map_err(|e| format!("启动 Python 失败: {e}"))?;

    let stdout = child.stdout.take().expect("child stdout");
    let stderr = child.stderr.take().expect("child stderr");
    if interactive_stdin {
        *state.run_stdin.lock().unwrap() = child.stdin.take();
    }

    stream_reader(app.clone(), stdout, "stdout", session.to_string(), split_cr);
    stream_reader(app.clone(), stderr, "stderr", session.to_string(), split_cr);

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
                        st.run_stdin.lock().unwrap().take();
                        *st.current_session.lock().unwrap() = None;
                    }
                    emit(&app, "done", &code.to_string(), &session_done, false);
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
pub async fn python_detect(app: AppHandle, state: State<'_, PythonState>) -> Result<PythonInfo, String> {
    let selected = state.selected_python.lock().unwrap().clone();
    let detected = tauri::async_runtime::spawn_blocking(move || {
        load_custom_pythons(&app);
        let all = scan_python_versions();
        if all.is_empty() {
            return PythonInfo {
                available: false,
                version: None,
                command: None,
                versions: Vec::new(),
            };
        }
        let cur = selected
            .as_ref()
            .and_then(|id| all.iter().find(|v| v.id == *id))
            .unwrap_or(&all[0]);
        PythonInfo {
            available: true,
            version: Some(cur.version.clone()),
            command: Some(cur.command.join(" ")),
            versions: all,
        }
    })
    .await;
    Ok(detected.unwrap_or_else(|_| PythonInfo {
        available: false,
        version: None,
        command: None,
        versions: Vec::new(),
    }))
}

// 前端切换解释器（设置页 / 编辑器版本管理器）；id 为 python_detect 返回的 versions[].id
#[tauri::command]
pub fn python_select(state: State<PythonState>, id: String) -> Result<(), String> {
    if !scan_python_versions().iter().any(|v| v.id == id) {
        return Err(format!("未知的 Python 解释器: {id}"));
    }
    *state.selected_python.lock().unwrap() = Some(id);
    Ok(())
}

#[tauri::command]
pub fn python_run(
    app: AppHandle,
    state: State<PythonState>,
    code: String,
    cwd: Option<String>,
) -> Result<(), String> {
    let py_parts = resolve_python(&state)?;
    let script = write_temp_script(&code)?;
    let mut cmd = command_from_parts(&py_parts);
    cmd.arg("-u").arg(&script);
    cmd.env("PYTHONPATH", "."); // 让脚本可以 import 工作区里的兄弟模块
    if let Some(dir) = &cwd {
        crate::fs::validate_cwd(Path::new(dir))?; // 白名单校验（NFR-5.2）
        cmd.current_dir(dir);
    }
    spawn_streaming(app, &state, cmd, Some(script), "run", false, true)
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
    if let Ok(mut guard) = state.run_stdin.lock() {
        guard.take();
    }
    // 通知前端该会话已结束，让 runCode 的 Promise 正常收尾
    emit(&app, "done", "-1", &session, false);
    Ok(())
}

#[tauri::command]
pub fn python_repl_start(
    app: AppHandle,
    state: State<PythonState>,
    cwd: Option<String>,
    hook: Option<String>,
) -> Result<(), String> {
    let py_parts = resolve_python(&state)?;

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
                emit(&app, "done", "-1", &ps, false);
            }
        }
    }
    if let Ok(mut guard) = state.repl_stdin.lock() {
        guard.take();
    }
    *state.current_session.lock().unwrap() = Some("repl".to_string());

    let mut cmd = command_from_parts(&py_parts);
    // REPL 无 tty 且 stdin 为管道（python_repl_input 写入）：help() 无参会进入
    // pydoc 交互并从 stdin 读取 → 管道无数据 → 子进程永久阻塞，REPL 卡死。
    // 启动时用 -i -c 注入安全 help 包装（先执行初始化再进入交互）：
    // help() 打印提示不读 stdin，help(obj) 惰性 import pydoc 打印文档。
    // PYTHONUTF8 由 command_from_parts 统一设置：-c 参数与管道 stdin/stdout
    // 均为 UTF-8（Windows 默认 ANSI 码页会导致中文乱码）
    const REPL_HELP_PATCH: &str = "import builtins
def _py_help(obj=None):
    if obj is None:
        print('帮助：使用 help(对象) 查看对象的文档。')
        return
    import pydoc
    # pydoc.plain 剥离 \\b 粗体/下划线格式（真实终端渲染成样式，
    # 非终端通道会变成 iinntt 式重复字符乱码）
    print(pydoc.plain(pydoc.render_doc(obj)))
builtins.help = _py_help";
    // 前端传进来的 matplotlib 出图钩子：作为交互前的初始化代码，跟 help 包装一起执行，
    // 这样 REPL 里 plt.show() 也能把图发给终端（脚本运行路径用的是同一份钩子）
    let init = match hook {
        Some(h) if !h.trim().is_empty() => format!("{REPL_HELP_PATCH}
{h}"),
        _ => REPL_HELP_PATCH.to_string(),
    };
    cmd.arg("-u").arg("-i").arg("-c").arg(init);
    if let Some(dir) = &cwd {
        crate::fs::validate_cwd(Path::new(dir))?; // 白名单校验（NFR-5.2）
        cmd.current_dir(dir);
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::piped());
    no_console(&mut cmd);

    let mut child = cmd.spawn().map_err(|e| format!("启动 REPL 失败: {e}"))?;
    let stdin = child.stdin.take().expect("child stdin");
    let stdout = child.stdout.take().expect("child stdout");
    let stderr = child.stderr.take().expect("child stderr");

    // 与脚本运行共用同一读取器：REPL 提示串同样是不带换行的部分行，需要实时送出
    stream_reader(app.clone(), stdout, "stdout", "repl".to_string(), false);
    stream_reader(app.clone(), stderr, "stderr", "repl".to_string(), false);

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
                    emit(&app, "done", &code.to_string(), "repl", false);
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

// 向前端正在运行的脚本（run 会话）的 stdin 写一行：供终端内 input() 交互
#[tauri::command]
pub fn python_run_input(state: State<PythonState>, line: String) -> Result<(), String> {
    let mut guard = state.run_stdin.lock().unwrap();
    let stdin = guard.as_mut().ok_or("没有正在运行的程序")?;
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
    if let Ok(mut guard) = state.run_stdin.lock() {
        guard.take();
    }
    if let Ok(mut g) = state.current_session.lock() {
        g.take();
    }
}

// 解释器是否为虚拟环境：venv 内 pip 不支持 --user，会直接报错
fn is_venv(py_parts: &[String]) -> bool {
    let mut probe = command_from_parts(py_parts);
    probe.arg("-c").arg("import sys; print(1 if sys.prefix != sys.base_prefix else 0)");
    no_console(&mut probe);
    match probe.output() {
        Ok(out) => String::from_utf8_lossy(&out.stdout).trim() == "1",
        Err(_) => false,
    }
}

#[tauri::command]
pub fn python_pip_install(app: AppHandle, state: State<PythonState>, pkg: String) -> Result<(), String> {
    let py_parts = resolve_python(&state)?;
    let mut cmd = command_from_parts(&py_parts);
    cmd.arg("-m").arg("pip").arg("install").arg("--no-input");
    // NFR-5.3：系统解释器用 --user 装到用户目录，避免污染全局 site-packages
    if !is_venv(&py_parts) {
        cmd.arg("--user");
    }
    cmd.arg(&pkg);
    spawn_streaming(app, &state, cmd, None, "pip", true, false)
}

// 真实卸载扩展包（本机 pip）：与安装共用 pip 会话与输出通道
#[tauri::command]
pub fn python_pip_uninstall(
    app: AppHandle,
    state: State<PythonState>,
    pkg: String,
) -> Result<(), String> {
    let py_parts = resolve_python(&state)?;
    let mut cmd = command_from_parts(&py_parts);
    cmd.arg("-m").arg("pip").arg("uninstall").arg("--yes").arg(&pkg);
    spawn_streaming(app, &state, cmd, None, "pip", true, false)
}

// 添加自定义解释器：探测所选的 Python 可执行文件，成功后持久化并返回可直接使用的条目
#[tauri::command]
pub async fn python_add_interpreter(app: AppHandle, path: String) -> Result<PythonVersion, String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !PathBuf::from(&path).is_file() {
            return Err("所选文件不存在".to_string());
        }
        let parts = vec![path.clone()];
        let (ver, exe) = probe_interpreter(&parts)
            .ok_or_else(|| "该文件不是可用的 Python 解释器".to_string())?;
        let exe = if exe.is_empty() { path } else { exe };
        let entry = PythonVersion {
            id: format!("custom:{exe}"),
            version: format!("Python {ver}"),
            label: format!("Python {ver}（自定义）"),
            command: vec![exe.clone()],
            path: exe.clone(),
        };

        load_custom_pythons(&app);
        {
            let mut list = custom_pythons().lock().unwrap();
            if !list.iter().any(|c| c.path == exe) {
                list.push(CustomPython { path: exe, version: entry.version.clone() });
            }
        }
        save_custom_pythons(&app);
        Ok(entry)
    })
    .await
    .map_err(|e| format!("探测任务失败: {e}"))?
}

// 本机已安装包名列表：运行前的依赖检查与包管理界面的手动扫描用。
// 必须是 async 命令：同步命令跑在主线程，pip list 的等待期间界面会完全冻结（连加载指示器都画不出来）
#[tauri::command]
pub async fn python_pip_list(state: State<'_, PythonState>) -> Result<Vec<String>, String> {
    let py_parts = resolve_python(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        let mut cmd = command_from_parts(&py_parts);
        cmd.arg("-m").arg("pip").arg("list").arg("--format=json").arg("--disable-pip-version-check");
        no_console(&mut cmd);
        let out = cmd.output().map_err(|e| format!("读取已安装包失败: {e}"))?;
        if !out.status.success() {
            return Err(String::from_utf8_lossy(&out.stderr).trim().to_string());
        }
        let list: Vec<serde_json::Value> =
            serde_json::from_slice(&out.stdout).map_err(|e| format!("解析 pip list 输出失败: {e}"))?;
        Ok(list
            .into_iter()
            .filter_map(|item| item.get("name").and_then(|n| n.as_str()).map(str::to_lowercase))
            .collect())
    })
    .await
    .map_err(|e| format!("扫描任务失败: {e}"))?
}

// 从本地文件安装扩展包（wheel / sdist）：与在线安装共用 pip 会话与输出通道
#[tauri::command]
pub fn python_pip_install_file(
    app: AppHandle,
    state: State<PythonState>,
    path: String,
) -> Result<(), String> {
    if !PathBuf::from(&path).is_file() {
        return Err("所选安装包文件不存在".to_string());
    }
    let py_parts = resolve_python(&state)?;
    let mut cmd = command_from_parts(&py_parts);
    cmd.arg("-m").arg("pip").arg("install").arg("--no-input");
    if !is_venv(&py_parts) {
        cmd.arg("--user");
    }
    cmd.arg(&path);
    spawn_streaming(app, &state, cmd, None, "pip", true, false)
}

#[cfg(test)]
mod tests {
    use super::drain_segments;

    fn segs(input: &[u8], split_cr: bool) -> Vec<(String, bool)> {
        let mut buf = input.to_vec();
        drain_segments(&mut buf, split_cr)
    }

    #[test]
    fn 完整行不带_partial() {
        assert_eq!(segs(b"hello\n", false), vec![("hello".to_string(), false)]);
    }

    #[test]
    fn 无换行的尾巴实时送出并标记_partial() {
        // input("Test: ") 的提示串：没有换行也必须立刻可见
        assert_eq!(segs(b"Test: ", false), vec![("Test: ".to_string(), true)]);
    }

    #[test]
    fn 尾巴按增量送出不会重复() {
        let mut buf = b"Tes".to_vec();
        assert_eq!(drain_segments(&mut buf, false), vec![("Tes".to_string(), true)]);
        buf.extend_from_slice(b"t: ");
        assert_eq!(drain_segments(&mut buf, false), vec![("t: ".to_string(), true)]);
        buf.extend_from_slice(b"world\n");
        assert_eq!(drain_segments(&mut buf, false), vec![("world".to_string(), false)]);
        assert!(buf.is_empty());
    }

    #[test]
    fn 跨读取的半个多字节字符留在缓冲里() {
        // "中" 的 UTF-8 是 E4 B8 AD，先给前两字节
        let mut buf = vec![0xE4, 0xB8];
        assert!(drain_segments(&mut buf, false).is_empty());
        assert_eq!(buf.len(), 2);
        buf.push(0xAD);
        assert_eq!(drain_segments(&mut buf, false), vec![("中".to_string(), true)]);
    }

    #[test]
    fn 坏字节按替换字符送出并清空() {
        let mut buf = vec![0xFF, 0xFE];
        let out = drain_segments(&mut buf, false);
        assert_eq!(out.len(), 1);
        assert!(out[0].1);
        assert!(buf.is_empty());
    }

    #[test]
    fn pip_流不送_partial_且按_cr_切分() {
        // 末段没有终止符：pip 流按设计不送 partial，留在缓冲里等下一个 \r
        let mut buf = b"Downloading 45%\rDownloading 80%".to_vec();
        assert_eq!(drain_segments(&mut buf, true), vec![("Downloading 45%".to_string(), false)]);
        assert_eq!(buf, b"Downloading 80%");
        buf.push(b'\r');
        assert_eq!(drain_segments(&mut buf, true), vec![("Downloading 80%".to_string(), false)]);
    }

    #[test]
    fn 空行产生行结束信号() {
        // 空片段 = 「这一行到此结束」：空行要显示成空行，且紧跟 partial 之后的行尾
        // 也必须送这一下，否则前端不知道行结束了
        assert_eq!(
            segs(b"a\n\nb\n", false),
            vec![
                ("a".to_string(), false),
                (String::new(), false),
                ("b".to_string(), false),
            ]
        );
    }

    #[test]
    fn partial_之后的行尾会补空片段() {
        let mut buf = b"abc".to_vec();
        assert_eq!(drain_segments(&mut buf, false), vec![("abc".to_string(), true)]);
        buf.push(b'\n');
        assert_eq!(drain_segments(&mut buf, false), vec![(String::new(), false)]);
        assert!(buf.is_empty());
    }

    #[test]
    fn crlf_行尾的_r_不混进片段() {
        // Windows 子进程（脚本 / REPL）按文本模式写 \r\n：完整片段不能带裸 \r，
        // 否则前端拿到的末行以 \r 结尾，错误摘要正则 (.+)$ 匹配不到，traceback 无法折叠
        assert_eq!(
            segs(b"Traceback (most recent call last):\r\nValueError: boom\r\n", false),
            vec![
                ("Traceback (most recent call last):".to_string(), false),
                ("ValueError: boom".to_string(), false),
            ]
        );
    }

    #[test]
    fn crlf_从_r_与_n_之间断读时补空片段收尾() {
        // 读取边界正好落在 \r 与 \n 之间：先送 partial（前端拼回 \r\n），
        // \n 到达时补空片段表示这一行结束——与「partial 之后补空片段」同一套语义
        let mut buf = b"ValueError: boom\r".to_vec();
        assert_eq!(
            drain_segments(&mut buf, false),
            vec![("ValueError: boom\r".to_string(), true)]
        );
        buf.push(b'\n');
        assert_eq!(drain_segments(&mut buf, false), vec![(String::new(), false)]);
        assert!(buf.is_empty());
    }

    #[test]
    fn 只剩_rn_的片段剥_r_后按空行结束信号送出() {
        // 行尾的 \r\n 里 \r 不是内容：剥掉后与裸 \n 一样补一个空片段
        let mut buf = b"\r\n".to_vec();
        assert_eq!(drain_segments(&mut buf, false), vec![(String::new(), false)]);
    }

    #[test]
    fn pip_流的_crlf_不受影响() {
        // pip 按 \r 切分（进度条原地刷新），\r 是分隔符不是内容，不走行尾剥离
        let mut buf = b"Downloading 45%\rDownloading 100%\r\n".to_vec();
        assert_eq!(
            drain_segments(&mut buf, true),
            vec![
                ("Downloading 45%".to_string(), false),
                ("Downloading 100%".to_string(), false),
            ]
        );
    }
}
