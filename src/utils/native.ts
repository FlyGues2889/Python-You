// 原生能力桥接层：把 Rust 后端命令暴露给前端，并在纯浏览器环境下优雅降级。
// 所有方法都假定调用前已用 nativeApi.available() 判断过环境，否则 invoke 会直接报错。
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import type { FSItem } from '../types';

interface FsEntry {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FsEntry[];
  content?: string | null;
}

interface PythonInfo {
  available: boolean;
  version?: string | null;
  command?: string | null;
}

interface PyOutputEvent {
  kind: string;
  text: string;
  session: string;
}

export const nativeApi = {
  available(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  },

  // ---------- 文件对话框 ----------
  pickFolder(): Promise<string | null> {
    return open({ directory: true, multiple: false }) as Promise<string | null>;
  },

  pickFile(): Promise<string | null> {
    return open({ multiple: false }) as Promise<string | null>;
  },

  // ---------- 文件系统 ----------
  readDirectory(path: string): Promise<FsEntry[]> {
    return invoke('fs_read_directory', { path });
  },
  readFile(path: string): Promise<string> {
    return invoke('fs_read_file', { path });
  },
  writeFile(path: string, content: string): Promise<void> {
    return invoke('fs_write_file', { path, content });
  },
  createDir(parentPath: string, name: string): Promise<string> {
    return invoke('fs_create_dir', { parentPath, name });
  },
  renamePath(path: string, newName: string): Promise<string> {
    return invoke('fs_rename', { path, newName });
  },
  deletePath(path: string): Promise<void> {
    return invoke('fs_delete', { path });
  },
  materializeWorkspace(items: { path: string; content: string; isFolder: boolean }[]): Promise<string> {
    return invoke('fs_materialize_workspace', { items });
  },
  ensureDefaultWorkspace(): Promise<string> {
    return invoke('ensure_default_workspace');
  },

  // ---------- Python 子进程 ----------
  detectPython(): Promise<PythonInfo> {
    return invoke('python_detect');
  },
  runPython(code: string, cwd?: string | null): Promise<void> {
    return invoke('python_run', { code, cwd: cwd || null });
  },
  stopPython(): Promise<void> {
    return invoke('python_stop');
  },
  replStart(cwd?: string | null): Promise<void> {
    return invoke('python_repl_start', { cwd: cwd || null });
  },
  replInput(line: string): Promise<void> {
    return invoke('python_repl_input', { line });
  },
  pipInstall(pkg: string): Promise<void> {
    return invoke('python_pip_install', { pkg });
  },

  onPythonEvent(cb: (e: PyOutputEvent) => void): Promise<() => void> {
    return listen<PyOutputEvent>('py-output', (event) => cb(event.payload));
  },
};

// 把磁盘上扫描到的原生条目转换为应用内部的虚拟文件树（path 使用相对路径 /xxx）
export function fsEntriesToFSItems(
  entries: FsEntry[],
  parentId: string | null = null,
  relDir = ''
): FSItem[] {
  return entries.map((entry, index) => {
    const relPath = `${relDir}/${entry.name}`;
    const id = `n${Math.random().toString(36).substring(2, 9)}${index}`;
    if (entry.isFolder) {
      return {
        id,
        name: entry.name,
        path: relPath,
        isFolder: true,
        parentId,
        isOpen: false,
        // 懒加载：children 为 null（Rust 只返回一层）时保持 undefined，
        // 前端在展开文件夹时再按需从磁盘读取子目录
        children: entry.children ? fsEntriesToFSItems(entry.children, id, relPath) : undefined,
      };
    }
    return {
      id,
      name: entry.name,
      path: relPath,
      isFolder: false,
      content: entry.content ?? '',
      parentId,
    };
  });
}

// 工作区根目录 + 虚拟相对路径 => 磁盘绝对路径
export function absPath(root: string, relPath: string): string {
  return root.replace(/[\\/]+$/, '') + relPath;
}
