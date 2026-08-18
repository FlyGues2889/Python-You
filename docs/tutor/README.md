# Python You 教程 · 网页版

GitHub Pages 静态教程站点：内置 Python 教程（7 个阶段 / 43 个主题 / 117 道测验题）+ 网页版代码编辑器。

## 部署（GitHub Pages）

1. 推送本目录到仓库的 `main` 分支（保持 `docs/tutor/` 路径不变）
2. 仓库 **Settings → Pages** → Source 选择 `Deploy from a branch` → 分支 `main` → 目录 `/docs`
3. 保存后等待构建，访问 `https://<user>.github.io/<repo>/tutor/`

## 本地预览

Pyodide 运行引擎通过 CDN 加载（需要 http/https，不能直接双击 `file://` 打开）：

```bash
# 任意静态服务器均可，例如：
npx serve docs/tutor
# 或
python -m http.server 8080 -d docs/tutor
```

## 文件结构

| 文件 | 说明 |
|---|---|
| `index.html` | 页面骨架（顶栏 / 目录 / 内容 / 编辑器面板，m3e 组件） |
| `style.css` | 样式（主题 token 提取自桌面版 theme.css/font.css/m3eStyle.css，自动生成） |
| `app.js` | 核心逻辑（目录树、内容渲染、编辑器、Pyodide 运行、测验） |
| `tutorial-data.js` | 教程数据（自动生成，勿手改） |
| `build-data.mjs` | 数据生成脚本（`node build-data.mjs`） |
| `build-style.mjs` | 样式生成脚本（`node build-style.mjs`） |
| `vendor/` | 本地资源：`m3e/all.bundle.js`（@m3e/web 组件库）、`material-symbols/`（图标字体） |

> `all.bundle.js` 由 `all.min.js` 剥离 `export{...}` 并包 IIFE 生成——原生 ESM 在 `file://` 下被 CORS 阻止、且顶层变量会与页面脚本全局冲突，剥离后可用普通 `<script>` 直接加载，**双击 index.html 即可离线打开**（仅 Pyodide 首次运行需联网）。重新生成：`node build-vendor.mjs`（见下）。

## 说明

- **组件与图标**：使用与桌面版相同的 `@m3e/web` 组件库（m3e-content-pane / m3e-button / m3e-search-bar / m3e-icon-button）与 Material Symbols 图标字体，均为本地 vendor 引用，不依赖外部 CDN
- **主题**：亮/暗双主题，颜色 token 直接提取自桌面版 `theme.css`（md-sys 全套 + 应用别名），样式与桌面版一致
- **解释器**：仅使用 Pyodide（Python 3.11 WASM），首次运行需联网下载（约 15MB，之后走浏览器缓存）；`import numpy` 等第三方包按需懒加载
- **测验**：选择题与代码题结果保存在 `localStorage`，无需账号
- **数据源**：教程内容与测验数据提取自桌面版 `src/components/tutor/`，如需更新内容重新运行 `build-data.mjs`；主题 token 变更重新运行 `build-style.mjs`
