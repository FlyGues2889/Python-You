import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // m3e 是原生 Web Components 自定义元素库（shadow DOM + 原生 slot 分发），
          // 不是 Vue 组件：标记为自定义元素，消除 "Failed to resolve component: m3e-xxx"
          // 的 Vue 运行时警告（dev 控制台与构建均可观察到）
          isCustomElement: (tag) => tag.startsWith("m3e-"),
        },
      },
    }),
    // 把 npm 包 pyodide 的运行时文件复制到构建产物 /pyodide/ 目录：
    // 开发模式由 vite 静态服务直接提供；构建后进入 dist，随 Tauri 打包携带。
    // 替代原先手动放在 public/pyodide 的硬编码副本（版本由 package.json 的 pyodide 依赖管理）。
    viteStaticCopy({
      targets: [
        {
          // stripBase: 去掉 src 里的目录层级，直接复制到 /pyodide/ 根（indexURL 从那里加载）
          src: "node_modules/pyodide/{pyodide.js,pyodide.mjs,pyodide.asm.mjs,pyodide.asm.wasm,python_stdlib.zip,pyodide-lock.json}",
          dest: "pyodide",
          rename: { stripBase: true },
        },
      ],
    }),
  ],

  build: {
    // vendor-m3e 为单体组件库（gzip 约 250KB），按需拆分需手工导入 80+ 子路径、
    // 易漏装导致白屏，代价高于收益——独立 chunk 已隔离其缓存，故放宽阈值
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // 手动分包：把大体积第三方库拆出主 chunk，
        // 消除 "chunks are larger than 500 kB" 警告并改善缓存利用率。
        // @m3e/web 无根导出（仅子路径 ./all 等），对象形式无法解析，故用函数按模块 id 匹配
        manualChunks(id) {
          if (id.includes("@m3e/web")) return "vendor-m3e";
          if (id.includes("highlight.js")) return "vendor-highlight";
          if (id.includes("/vue") || id.includes("/pinia")) return "vendor-vue";
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
