import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
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
