// 网页版（docs/）的教程数据生成器。
//
// 数据源就是桌面端用的那套（src/components/tutor/data/<系列>/ 与 quiz/<系列>Quizzes.ts），
// 所以两端共用一个「学习数据库」：桌面端改了教程或题库，跑一次本脚本网页端就同步。
//
//   node docs/build-tutorial-data.mjs        # 也可 cd docs 后 node build-tutorial-data.mjs
//
// 实现说明：数据是 TypeScript 模块，Node 不能直接 import（内部 import 不带扩展名），
// 这里借用项目自带的 Vite/Rollup 把它打成一份内存里的 ESM 再动态导入，不需要额外依赖。

import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 脚本在 docs/ 下，仓库根是它的上一级；vite 的 root 显式指定，避免依赖当前工作目录
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ENTRY = path.join(ROOT, '.tutorial-data-entry.ts');
const OUTPUT = path.join(ROOT, 'docs', 'tutorial-data.js');

/** 把应用的教程数据 + 题库打包后导入 */
async function loadAppData() {
  fs.writeFileSync(ENTRY, [
    `export { TUTORIAL_SERIES } from './src/components/tutor/tutorialData';`,
    `export { TOPIC_QUIZZES } from './src/components/tutor/quizData';`,
  ].join('\n'));
  try {
    const result = await build({
      root: ROOT,
      logLevel: 'error',
      build: {
        write: false,
        minify: false,
        lib: { entry: ENTRY, formats: ['es'], fileName: 'data' },
      },
    });
    const chunk = result[0].output.find((o) => o.type === 'chunk');
    // 用 data URL 动态导入这份内存产物，避免落临时文件
    const mod = await import('data:text/javascript;base64,' + Buffer.from(chunk.code).toString('base64'));
    return { series: mod.TUTORIAL_SERIES, quizzes: mod.TOPIC_QUIZZES };
  } finally {
    fs.rmSync(ENTRY, { force: true });
  }
}

const { series, quizzes } = await loadAppData();

// 扁平阶段列表在页面里由系列展开得到（不重复写一份，否则文件翻倍）
const stages = [];
for (const s of series) {
  for (const stage of s.stages) {
    stages.push({ ...stage, seriesId: s.id, seriesTitle: s.title });
  }
}

const stamp = new Date().toISOString().slice(0, 10);
const header = `// 教程数据（自动生成，勿手改）
// 源：src/components/tutor/data/<系列>/ + src/components/tutor/quiz/<系列>Quizzes.ts
// 生成命令：node docs/build-tutorial-data.mjs      生成日期：${stamp}
// 桌面端与网页端共用这一份数据：改完教程跑一次本脚本即可同步。
'use strict';

`;

const stamp_json = (v) => JSON.stringify(v);
const body = [
  `window.TUTORIAL_SERIES = ${stamp_json(series)};`,
  ``,
  `// 扁平阶段列表（含所属系列），网页端按 seriesTitle 分组——由上面的系列展开，不重复存储`,
  `window.TUTORIAL_STAGES = window.TUTORIAL_SERIES.flatMap(function (s) {`,
  `  return s.stages.map(function (stage) {`,
  `    var copy = Object.assign({}, stage);`,
  `    copy.seriesId = s.id;`,
  `    copy.seriesTitle = s.title;`,
  `    return copy;`,
  `  });`,
  `});`,
  ``,
  `window.TOPIC_QUIZZES = ${stamp_json(quizzes)};`,
  ``,
].join('\n');

fs.writeFileSync(OUTPUT, header + body, 'utf8');

const topicCount = stages.reduce((n, s) => n + (s.topics?.length || 0)
  + (s.subcategories || []).reduce((m, sub) => m + sub.topics.length, 0), 0);
const questionCount = quizzes.reduce((n, q) => n + q.questions.length, 0);
console.log(`已生成 ${path.relative(ROOT, OUTPUT)}`);
console.log(`  系列 ${series.length} 个 / 阶段 ${stages.length} 个 / 主题 ${topicCount} 个 / 测验 ${quizzes.length} 组（${questionCount} 题）`);
console.log(`  文件大小 ${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB`);
