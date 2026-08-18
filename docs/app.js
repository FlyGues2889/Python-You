/* ============================================================
   Python You 教程 · 网页版核心逻辑
   - 目录树 / 内容渲染 / 代码编辑器 / Pyodide 运行 / 测验
   - 仅依赖 Pyodide CDN（运行引擎），其余全部本地
   ============================================================ */
'use strict';

const STAGES = window.TUTORIAL_STAGES;
const QUIZZES = window.TOPIC_QUIZZES;
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

/* ---------- 工具 ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
const save = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };

// 扁平化所有主题（含子分类）
function allTopics() {
  const out = [];
  for (const s of STAGES) {
    if (s.topics) out.push(...s.topics.map(t => ({ ...t, _stageId: s.id })));
    for (const sub of s.subcategories || []) {
      out.push(...sub.topics.map(t => ({ ...t, _stageId: s.id, _subId: sub.id })));
    }
  }
  return out;
}
const TOPICS = allTopics();
const topicById = (id) => TOPICS.find(t => t.id === id);

/* ---------- 轻量 Python 语法高亮（正则，无外部依赖） ---------- */
const KEYWORDS = new Set(['and','as','assert','async','await','break','class','continue','def','del','elif','else','except','False','finally','for','from','global','if','import','in','is','lambda','None','nonlocal','not','or','pass','raise','return','True','try','while','with','yield']);
const BUILTINS = new Set(['abs','all','any','bin','bool','bytearray','bytes','chr','complex','dict','dir','divmod','enumerate','eval','exec','filter','float','format','frozenset','getattr','globals','hasattr','hash','help','hex','id','input','int','isinstance','issubclass','iter','len','list','locals','map','max','memoryview','min','next','object','oct','open','ord','pow','print','range','repr','reversed','round','set','setattr','slice','sorted','staticmethod','str','sum','super','tuple','type','vars','zip','__import__']);

function highlightPython(code) {
  const lines = code.split('\n');
  return lines.map((line) => {
    let html = '';
    let i = 0;
    while (i < line.length) {
      const rest = line.slice(i);
      // 注释
      if (rest.startsWith('#')) { html += `<span class="hl-comment">${esc(rest)}</span>`; break; }
      // 字符串（单双引号，含 f 前缀）
      const strM = rest.match(/^(f|r|b|fr|rf)?('{3}|"{3}|'|")/);
      if (strM) {
        const q = strM[2];
        const isTriple = q.length === 3;
        const endIdx = isTriple ? rest.indexOf(q, strM[0].length) : rest.indexOf(q, strM[0].length);
        if (isTriple && endIdx === -1) { html += `<span class="hl-string">${esc(rest)}</span>`; break; }
        const end = endIdx === -1 ? rest.length : endIdx + q.length;
        html += `<span class="hl-string">${esc(rest.slice(0, end))}</span>`;
        i += end;
        continue;
      }
      // 装饰器
      const decM = rest.match(/^@\w+/);
      if (decM) { html += `<span class="hl-decorator">${esc(decM[0])}</span>`; i += decM[0].length; continue; }
      // 标识符（关键字/内置/函数调用）
      const idM = rest.match(/^[A-Za-z_]\w*/);
      if (idM) {
        const word = idM[0];
        const after = line[i + word.length];
        if (KEYWORDS.has(word)) {
          html += `<span class="hl-keyword">${word}</span>`;
        } else if (after === '(') {
          html += `<span class="hl-function">${word}</span>`;
        } else if (BUILTINS.has(word)) {
          html += `<span class="hl-builtin">${word}</span>`;
        } else {
          html += word;
        }
        i += word.length;
        continue;
      }
      // 数字
      const numM = rest.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/);
      if (numM) { html += `<span class="hl-number">${numM[0]}</span>`; i += numM[0].length; continue; }
      // 普通字符
      html += esc(line[i]);
      i++;
    }
    return html;
  }).join('\n');
}

/* ---------- 编辑器 ---------- */
const codeInput = $('#codeInput');
const lineNumbers = $('#lineNumbers');
const highlightCode = $('#highlightCode');
const highlightPre = $('#highlight');

function syncEditor() {
  const code = codeInput.value;
  highlightCode.innerHTML = highlightPython(code) || '&nbsp;';
  // 行号
  const lineCount = code.split('\n').length;
  let nums = '';
  for (let i = 1; i <= lineCount; i++) nums += i + '\n';
  lineNumbers.textContent = nums;
}
function syncScroll() {
  lineNumbers.scrollTop = codeInput.scrollTop;
  highlightPre.scrollTop = codeInput.scrollTop;
  highlightPre.scrollLeft = codeInput.scrollLeft;
}
codeInput.addEventListener('input', syncEditor);
codeInput.addEventListener('scroll', syncScroll);

function setEditorCode(code) {
  codeInput.value = code;
  syncEditor();
  codeInput.scrollTop = 0;
  codeInput.scrollLeft = 0;
  codeInput.focus();
}

/* ---------- 输出 ---------- */
const outputEl = $('#output');
function appendOutput(text, isErr) {
  const span = document.createElement('span');
  if (isErr) span.className = 'stderr';
  span.textContent = text;
  outputEl.appendChild(span);
  outputEl.scrollTop = outputEl.scrollHeight;
}
function clearOutput() { outputEl.innerHTML = ''; }

/* ---------- Pyodide 运行引擎 ---------- */
let pyodide = null;
const pyStatus = $('#pyStatus');
const runBtn = $('#runBtn');
// 顶栏下载状态（主题按钮左侧）：加载中显示 spinner + 状态文字
const pyDownloadStatus = $('#pyDownloadStatus');
const pyDownloadText = $('#pyDownloadText');

async function loadPyodideRuntime() {
  if (pyodide) return;
  pyStatus.textContent = '正在加载 Pyodide（首次需联网下载，约 15MB）…';
  pyStatus.className = 'py-status loading';
  runBtn.disabled = true;
  pyDownloadStatus.hidden = false;
  pyDownloadText.textContent = '正在下载 Pyodide 引擎…';
  try {
    if (!window.loadPyodide) {
      pyDownloadText.textContent = '正在下载 Pyodide 引擎…';
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = PYODIDE_CDN + 'pyodide.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Pyodide 加载失败，请检查网络'));
        document.head.appendChild(s);
      });
    }
    pyDownloadText.textContent = '正在初始化引擎…';
    pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    pyDownloadStatus.hidden = true;
    pyStatus.textContent = 'Pyodide 就绪（Python 3.11）';
    pyStatus.className = 'py-status ready';
    runBtn.disabled = false;
  } catch (e) {
    pyDownloadStatus.hidden = true;
    pyStatus.textContent = '引擎加载失败：' + e.message;
    pyStatus.className = 'py-status error';
  }
}

// 第三方包按需加载：代码中出现 import numpy/matplotlib 等时懒加载（一次缓存）
const PACKAGE_HINTS = [
  ['numpy', /^\s*(import|from)\s+numpy/m],
  ['matplotlib', /^\s*(import|from)\s+matplotlib/m],
  ['pandas', /^\s*(import|from)\s+pandas/m],
  ['scipy', /^\s*(import|from)\s+scipy/m],
  ['sympy', /^\s*(import|from)\s+sympy/m],
];
const loadedPkgs = new Set();

async function ensurePackages(code) {
  if (!pyodide) return;
  for (const [pkg, re] of PACKAGE_HINTS) {
    if (re.test(code) && !loadedPkgs.has(pkg)) {
      appendOutput(`[系统] 正在加载 ${pkg}（首次需联网下载）…\n`);
      await pyodide.loadPackage(pkg);
      loadedPkgs.add(pkg);
    }
  }
}

async function runCode(code) {
  if (!pyodide) {
    appendOutput('[系统] 引擎尚未就绪，正在加载…\n');
    await loadPyodideRuntime();
    if (!pyodide) return;
  }
  clearOutput();
  try {
    await ensurePackages(code);
    pyodide.setStdout({ batched: (t) => appendOutput(t + '\n') });
    pyodide.setStderr({ batched: (t) => appendOutput(t + '\n', true) });
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null) {
      appendOutput(String(result) + '\n');
    }
  } catch (e) {
    appendOutput(String(e && e.message || e) + '\n', true);
  }
}

runBtn.addEventListener('click', () => runCode(codeInput.value));

/* ---------- 内容渲染 ---------- */
// 行内格式化：反引号代码、**粗体**
function inline(text) {
  let out = esc(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return out;
}

function codeBlockHtml(code, extraActions = '') {
  return `
  <div class="code-block">
    <div class="code-block-header">
      <span>Python</span>
      <div class="code-block-actions">
        <m3e-button size="extra-small" variant="tonal" data-action="load">
          <span slot="icon" class="material-symbols-rounded">upload</span>
          载入编辑器
        </m3e-button>
        <m3e-button size="extra-small" variant="filled" data-action="run">
          <span slot="icon" class="material-symbols-rounded">play_arrow</span>
          运行
        </m3e-button>
        ${extraActions}
      </div>
    </div>
    <pre><code>${highlightPython(code)}</code></pre>
  </div>`;
}

function renderContent(topic) {
  const c = topic.content;
  let html = '';
  html += `<h1 class="topic-title" id="topic-title">${esc(topic.title)}</h1>`;
  html += `<p class="topic-summary">${esc(topic.summary)}</p>`;
  html += `<div class="sec-text">${inline(c.overview)}</div>`;

  // 标题带锚点 id（m3e-toc 扫描定位用）
  for (let si = 0; si < c.sections.length; si++) {
    const sec = c.sections[si];
    html += `<h2 class="sec-heading" id="sec-${si}">${esc(sec.heading)}</h2>`;
    if (sec.text) html += `<div class="sec-text">${inline(sec.text)}</div>`;
    if (sec.table) {
      html += `<div class="sec-table-wrap"><table class="sec-table"><thead><tr>${sec.table.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>`;
      for (const row of sec.table.rows) {
        html += `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`;
      }
      html += `</tbody></table></div>`;
    }
    if (sec.code) html += codeBlockHtml(sec.code);
    if (sec.notes) html += `<div class="sec-notes">${inline(sec.notes)}</div>`;
  }

  if (c.codeExample) {
    html += `<h2 class="sec-heading" id="sec-example">示例代码</h2>`;
    html += codeBlockHtml(c.codeExample);
  }

  if (c.takeaways && c.takeaways.length) {
    html += `<div class="takeaways"><div class="takeaways-title"><span class="material-symbols-rounded">star</span>核心要点</div><ul>${c.takeaways.map(t => `<li>${inline(t)}</li>`).join('')}</ul></div>`;
  }
  if (c.tips && c.tips.length) {
    html += `<div class="tips"><div class="tips-title"><span class="material-symbols-rounded">lightbulb</span>学习小贴士</div><ul>${c.tips.map(t => `<li>${inline(t)}</li>`).join('')}</ul></div>`;
  }

  // 测验
  html += renderQuiz(topic.id);

  // 上一节 / 下一节跳转卡片（按教程顺序）
  const topicIndex = TOPICS.findIndex(t => t.id === topic.id);
  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;
  html += `<div class="topic-nav">
    ${prevTopic ? `<div class="topic-nav-card prev" data-nav="${prevTopic.id}" title="${esc(prevTopic.title)}">
      <span class="topic-nav-label"><span class="material-symbols-rounded">chevron_left</span>上一节</span>
      <span class="topic-nav-title">${esc(prevTopic.title)}</span>
    </div>` : '<div class="topic-nav-card prev disabled"></div>'}
    ${nextTopic ? `<div class="topic-nav-card next" data-nav="${nextTopic.id}" title="${esc(nextTopic.title)}">
      <span class="topic-nav-label">下一节<span class="material-symbols-rounded">chevron_right</span></span>
      <span class="topic-nav-title">${esc(nextTopic.title)}</span>
    </div>` : '<div class="topic-nav-card next disabled"></div>'}
  </div>`;

  $('#tutorial-article').innerHTML = html;

  // 上一节/下一节点击跳转
  $$('.topic-nav-card[data-nav]').forEach((card) => {
    card.addEventListener('click', () => selectTopic(card.dataset.nav));
  });

  // 代码块按钮事件
  $$('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block');
      const code = block.querySelector('code').textContent;
      setEditorCode(code);
      if (btn.dataset.action === 'run') runCode(code);
    });
  });
  bindQuizEvents(topic.id);

  // 正文区滚动到顶（content-inner 内部滚动）
  const inner = $('#contentInner');
  if (inner) inner.scrollTop = 0;

}

/* ---------- 测验 ---------- */
const QUIZ_RESULTS_KEY = 'tutor_quiz_results';
const QUIZ_ANSWERS_KEY = 'tutor_quiz_answers';

function renderQuiz(topicId) {
  const quiz = QUIZZES.find(q => q.topicId === topicId);
  if (!quiz || !quiz.questions.length) return '';
  const answers = load(QUIZ_ANSWERS_KEY, {})[topicId] || {};
  const results = load(QUIZ_RESULTS_KEY, {})[topicId] || {};

  let html = `<div class="quiz-section"><div class="quiz-title"><span class="material-symbols-rounded">edit_note</span>课后测验</div>`;
  for (const q of quiz.questions) {
    if (q.type === 'choice') {
      const saved = answers[q.id];
      const res = results[q.id];
      html += `<div class="quiz-item" data-qid="${q.id}">
        <div class="quiz-q">${esc(q.question)}</div>
        <div class="quiz-options">`;
      q.options.forEach((opt, idx) => {
        let cls = '';
        if (res === 'pass') cls = idx === q.answerIndex ? 'correct' : '';
        else if (res === 'fail' && saved === idx) cls = saved === q.answerIndex ? 'correct' : 'wrong';
        else if (res === 'fail' && idx === q.answerIndex) cls = 'correct';
        html += `<div class="quiz-option ${cls}${saved === idx ? ' selected' : ''}" data-idx="${idx}">${esc(opt)}</div>`;
      });
      html += `</div>`;
      if (res) {
        html += `<div class="quiz-result ${res === 'pass' ? 'ok' : 'no'}">${res === 'pass' ? '✅ 回答正确' : '❌ 回答错误'}</div>`;
        if (q.explanation) html += `<div class="quiz-explanation">${inline(q.explanation)}</div>`;
      }
      html += `</div>`;
    } else {
      // 代码题
      const res = results[q.id];
      html += `<div class="quiz-item" data-qid="${q.id}">
        <div class="quiz-q">${esc(q.question)}</div>`;
      if (q.hint) html += `<div class="quiz-explanation"><span class="material-symbols-rounded" style="font-size: 1rem; vertical-align: -2px;">lightbulb</span> ${esc(q.hint)}</div>`;
      html += `<div class="quiz-code-actions">
        <m3e-button size="extra-small" variant="tonal" data-quiz-load="${q.id}">
          <span slot="icon" class="material-symbols-rounded">upload</span>
          载入题目代码
        </m3e-button>
        <m3e-button size="extra-small" variant="filled" data-quiz-run="${q.id}">
          <span slot="icon" class="material-symbols-rounded">play_arrow</span>
          运行并校验
        </m3e-button>
      </div>`;
      if (res) {
        html += `<div class="quiz-result ${res === 'pass' ? 'ok' : 'no'}">${res === 'pass' ? '✅ 输出正确，通过！' : '❌ 输出与预期不符，请再试'}</div>`;
      }
      html += `</div>`;
    }
  }
  html += `</div>`;
  return html;
}

function bindQuizEvents(topicId) {
  // 选择题
  $$('.quiz-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      const item = opt.closest('.quiz-item');
      const qid = item.dataset.qid;
      const quiz = QUIZZES.find(q => q.topicId === topicId);
      const q = quiz.questions.find(x => x.id === qid);
      if (q.type !== 'choice') return;
      const idx = Number(opt.dataset.idx);

      const answers = load(QUIZ_ANSWERS_KEY, {});
      answers[topicId] = answers[topicId] || {};
      answers[topicId][qid] = idx;
      save(QUIZ_ANSWERS_KEY, answers);

      const pass = idx === q.answerIndex;
      const results = load(QUIZ_RESULTS_KEY, {});
      results[topicId] = results[topicId] || {};
      results[topicId][qid] = pass ? 'pass' : 'fail';
      save(QUIZ_RESULTS_KEY, results);

      // 重新渲染测验区
      const quizSection = item.closest('.quiz-section');
      quizSection.outerHTML = renderQuiz(topicId);
      bindQuizEvents(topicId);
      markTopicDone(topicId);
    });
  });

  // 代码题
  $$('[data-quiz-load]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qid = btn.dataset.quizLoad;
      const quiz = QUIZZES.find(q => q.topicId === topicId);
      const q = quiz.questions.find(x => x.id === qid);
      setEditorCode(q.starterCode);
    });
  });
  $$('[data-quiz-run]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const qid = btn.dataset.quizRun;
      const quiz = QUIZZES.find(q => q.topicId === topicId);
      const q = quiz.questions.find(x => x.id === qid);
      const result = await runCodeCapture(codeInput.value);
      const pass = result.trim() === q.expectedOutput.trim();

      const results = load(QUIZ_RESULTS_KEY, {});
      results[topicId] = results[topicId] || {};
      results[topicId][qid] = pass ? 'pass' : 'fail';
      save(QUIZ_RESULTS_KEY, results);

      const item = btn.closest('.quiz-item');
      const resEl = item.querySelector('.quiz-result');
      if (resEl) {
        resEl.className = 'quiz-result ' + (pass ? 'ok' : 'no');
        resEl.textContent = pass ? '✅ 输出正确，通过！' : '❌ 输出与预期不符，请再试';
      } else {
        const div = document.createElement('div');
        div.className = 'quiz-result ' + (pass ? 'ok' : 'no');
        div.textContent = pass ? '✅ 输出正确，通过！' : '❌ 输出与预期不符，请再试';
        item.appendChild(div);
      }
      markTopicDone(topicId);
    });
  });
}

// 运行代码并捕获全部输出（用于代码题比对）
async function runCodeCapture(code) {
  if (!pyodide) {
    await loadPyodideRuntime();
    if (!pyodide) return '';
  }
  let captured = '';
  try {
    await ensurePackages(code);
    pyodide.setStdout({ batched: (t) => { captured += t + '\n'; } });
    pyodide.setStderr({ batched: (t) => { captured += t + '\n'; } });
    await pyodide.runPythonAsync(code);
  } catch (e) {
    captured += String(e && e.message || e) + '\n';
  }
  return captured;
}

/* ---------- 目录树（m3e-tree 组件） ---------- */
const DONE_KEY = 'tutor_done_topics';
const treeEl = $('#tree');

function markTopicDone(topicId) {
  // 选择题全部通过 + 代码题全部通过才标记完成
  const quiz = QUIZZES.find(q => q.topicId === topicId);
  if (!quiz || !quiz.questions.length) return;
  const results = load(QUIZ_RESULTS_KEY, {})[topicId] || {};
  const allPass = quiz.questions.every(q => results[q.id] === 'pass');
  if (allPass) {
    const done = load(DONE_KEY, []);
    if (!done.includes(topicId)) {
      done.push(topicId);
      save(DONE_KEY, done);
      renderTree();
    }
  }
}

let currentTopicId = null;

// 生成一个 m3e-tree-item（label/icon/toggle 图标槽）
function treeItemHtml(icon, label, topicId) {
  const done = topicId ? load(DONE_KEY, []).includes(topicId) : false;
  return `
    <span slot="toggle-icon" class="material-symbols-rounded">chevron_right</span>
    <span slot="open-toggle-icon" class="material-symbols-rounded">expand_more</span>
    <span slot="icon" class="material-symbols-rounded">${icon}</span>
    <span slot="label">${esc(label)}${done ? ' ✓' : ''}</span>`;
}

function renderTree(filter = '') {
  const q = filter.trim().toLowerCase();
  treeEl.innerHTML = '';
  let any = false;
  for (const stage of STAGES) {
    const topics = [];
    if (stage.topics) topics.push(...stage.topics.map(t => ({ t, sub: null })));
    for (const sub of stage.subcategories || []) {
      topics.push(...sub.topics.map(t => ({ t, sub })));
    }
    const matched = topics.filter(({ t }) =>
      !q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q));
    if (q && !matched.length) continue;
    any = true;

    const stageItem = document.createElement('m3e-tree-item');
    stageItem.innerHTML = treeItemHtml('folder', stage.title, null);
    stageItem.open = true; // 默认展开

    let lastSub = null;
    for (const { t, sub } of matched) {
      if (sub && sub.id !== lastSub) {
        lastSub = sub.id;
        const subItem = document.createElement('m3e-tree-item');
        subItem.innerHTML = treeItemHtml('folder_special', sub.title, null);
        stageItem.appendChild(subItem);
      }
      const topicItem = document.createElement('m3e-tree-item');
      topicItem.dataset.topic = t.id;
      topicItem.innerHTML = treeItemHtml('article', t.title, t.id);
      if (t.id === currentTopicId) {
        topicItem.selected = true;
        // 等组件升级后应用源码风格（透明背景 + 全圆角）
        requestAnimationFrame(() => styleSelectedItem(topicItem));
      }
      stageItem.appendChild(topicItem);
    }
    treeEl.appendChild(stageItem);
  }
  if (!any) treeEl.innerHTML = '<div class="tree-empty">未找到匹配的教程内容</div>';
}

// 源码风格：选中项透明背景 + secondary 边框 + 全圆角（.topic-item.is-active 同款）。
// 组件的 selected 背景走内部规则（无公开变量）且边框只能加在内容行（.base）上，
// host 边框会落在整行容器上 → 经 shadow 直接覆盖 .base
function styleSelectedItem(item) {
  const base = item?.shadowRoot?.querySelector('.base');
  if (base) {
    base.style.background = 'transparent';
    base.style.borderRadius = '9999px';
    base.style.border = '1.4px solid var(--secondary)';
    base.style.boxSizing = 'border-box';
  }
}

// m3e-tree 点击：选中主题（组件已处理 selected 状态，此处仅路由）
treeEl.addEventListener('click', (e) => {
  const item = e.target.closest('m3e-tree-item');
  if (!item || !item.dataset.topic) return;
  item.selected = true;
  selectTopic(item.dataset.topic);
  styleSelectedItem(item);
});

function selectTopic(id) {
  const topic = topicById(id);
  if (!topic) return;
  currentTopicId = id;
  renderTree($('#searchInput').value);
  renderContent(topic);
  // 选中主题后自动收起目录抽屉
  closeDrawer();
}

/* ---------- 顶栏交互 ---------- */
$('#searchInput').addEventListener('input', (e) => {
  renderTree(e.target.value);
});
// m3e-search-bar 的清除按钮事件
document.querySelector('m3e-search-bar').addEventListener('clear', () => {
  $('#searchInput').value = '';
  renderTree('');
});

// 主题切换（m3e-icon-button + material-symbols 图标）
const themeToggle = $('#themeToggle');
const themeIcon = $('#themeIcon');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  save('tutor_theme', theme);
}
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

$('#clearOutput').addEventListener('click', clearOutput);

/* ---------- 双面板 split（大屏左右 / 手机上下，手柄调整） ---------- */
const mainSplit = $('#mainSplit');
const mqMobile = matchMedia('(max-width: 768px)');

// split-pane 兜底：组件的 .start/.end flex 规则依赖 --with-start/--with-end
// 自定义状态（slotchange 时序可能未设置）→ 手动注入内联 flex + min 约束
function fixSplitPane() {
  const sr = mainSplit.shadowRoot;
  if (!sr) return;
  const start = sr.querySelector('.start');
  const end = sr.querySelector('.end');
  const handle = sr.querySelector('.drag-handle');
  const v = Number(mainSplit.value) || 55;
  const isColumn = mainSplit.orientation === 'vertical';
  const main = isColumn ? 'height' : 'width';
  const size = `${v}%`;
  if (start) {
    start.style.flex = isColumn ? `0 1 ${size}` : `0 1 calc(${size} - 4px)`;
    start.style.minWidth = '0';
    start.style.minHeight = '0';
    start.style.overflow = 'hidden';
  }
  if (end) {
    end.style.flex = '1 1 auto';
    end.style.minWidth = '0';
    end.style.minHeight = '0';
    end.style.overflow = 'hidden';
  }
  if (handle) handle.style.flex = '0 0 auto';
}

function applyLayout() {
  mainSplit.orientation = mqMobile.matches ? 'vertical' : 'horizontal';
  mainSplit.value = 60; // 正文 60% / 编辑器 40%，桌面与手机一致
  fixSplitPane();
}
mainSplit.addEventListener('input', fixSplitPane);
mqMobile.addEventListener('change', applyLayout);
applyLayout();

/* ---------- 目录抽屉（统一抽屉形式） ---------- */
const treeDrawer = $('#treeDrawer');

function openDrawer() {
  treeDrawer.classList.add('open');
  document.body.classList.add('drawer-open');
}
function closeDrawer() {
  treeDrawer.classList.remove('open');
  document.body.classList.remove('drawer-open');
}
$('#menuBtn').addEventListener('click', () => {
  if (treeDrawer.classList.contains('open')) closeDrawer();
  else openDrawer();
});
$('#treeBackdrop').addEventListener('click', closeDrawer);

// 定位当前主题 FAB：若所在文件夹（stage）已折叠，先展开祖先再滚动定位
$('.locate-fab').addEventListener('click', () => {
  const target = treeEl.querySelector('m3e-tree-item[data-topic][selected]')
    || treeEl.querySelector('m3e-tree-item[data-topic]');
  if (!target) return;
  // 展开所有祖先（折叠状态下隐藏项无法定位）
  let anc = target.parentElement?.closest('m3e-tree-item');
  while (anc) {
    if (!anc.open && anc.hasChildItems) anc.open = true;
    anc = anc.parentElement?.closest('m3e-tree-item');
  }
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

/* ---------- 初始化 ---------- */
function init() {
  // 加载遮罩：与桌面版同款操作文字序列
  const statusEl = $('#loadingStatus');
  const steps = [
    '正在启动 Python You 教程…',
    '正在加载组件库…',
    '正在准备教程内容…',
  ];
  let step = 0;
  const stepTimer = setInterval(() => {
    step++;
    if (step < steps.length) statusEl.textContent = steps[step];
  }, 600);

  const theme = load('tutor_theme', 'dark');
  applyTheme(theme);
  setEditorCode(`# 欢迎来到 Python You 教程！
# 在左侧选择课程，或直接在这里编写代码运行。

print("Hello, Python You!")`);
  renderTree();
  // 默认打开第一个主题
  const first = STAGES[0].topics?.[0] || STAGES[0].subcategories?.[0]?.topics?.[0];
  if (first) selectTopic(first.id);

  // 初始化完成：淡出遮罩
  setTimeout(() => {
    clearInterval(stepTimer);
    const modal = $('#loadingModal');
    if (modal) {
      modal.classList.add('hidden');
      setTimeout(() => modal.remove(), 400);
    }
  }, 1800);

  // 预热引擎（用户进入后再加载，避免首屏阻塞）
  setTimeout(loadPyodideRuntime, 800);
}
init();
