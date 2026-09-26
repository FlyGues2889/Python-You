import { FSItem } from '../types';
import { safeStorage } from './storage';

const STORAGE_KEY = 'python_you_installed_packages';

const STDLIB_MODULES = new Set([
  'sys', 'os', 'math', 'random', 'time', 'datetime', 'json', 're', 'string',
  'collections', 'functools', 'itertools', 'typing', 'io', 'pathlib', 'copy',
  'struct', 'enum', 'dataclasses', 'abc', 'ast', 'asyncio', 'base64', 'hashlib',
  'unittest', 'logging', 'traceback', 'inspect', 'threading', 'queue', 'subprocess',
  'csv', 'xml', 'urllib', 'http', 'socket', 'sqlite3', 'tempfile', 'shutil', 'glob',
  'select', 'signal', 'errno', 'getpass', 'platform', 'types', 'weakref', 'gc'
]);

const MODULE_TO_PACKAGE_MAP: Record<string, string> = {
  'sklearn': 'scikit-learn',
  'bs4': 'beautifulsoup4',
  'PIL': 'pillow',
  'cv2': 'opencv-python',
  'yaml': 'pyyaml',
  'requests_mock': 'requests-mock'
};

export function extractImportsFromCode(code: string): string[] {
  if (!code) return [];
  const found = new Set<string>();
  const lines = code.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Match: import xxx, yyy or import xxx.yyy as z
    let match = line.match(/^import\s+([a-zA-Z0-9_,\s.]+)/);
    if (match && match[1]) {
      const parts = match[1].split(',');
      for (const part of parts) {
        const modName = part.trim().split('.')[0].split(/\s+as\s+/)[0].trim();
        if (modName && !STDLIB_MODULES.has(modName)) {
          const pkgName = MODULE_TO_PACKAGE_MAP[modName] || modName;
          found.add(pkgName);
        }
      }
      continue;
    }

    // Match: from xxx.yyy import z
    match = line.match(/^from\s+([a-zA-Z0-9_.]+)\s+import/);
    if (match && match[1]) {
      const modName = match[1].split('.')[0].trim();
      if (modName && !STDLIB_MODULES.has(modName)) {
        const pkgName = MODULE_TO_PACKAGE_MAP[modName] || modName;
        found.add(pkgName);
      }
    }
  }

  return Array.from(found);
}

function extractAllImportsFromWorkspace(items: FSItem[]): string[] {
  const pkgs = new Set<string>();
  function walk(list: FSItem[]) {
    for (const item of list) {
      if (item.isFolder && item.children) {
        walk(item.children);
      } else if (!item.isFolder && item.name.endsWith('.py') && item.content) {
        const imports = extractImportsFromCode(item.content);
        imports.forEach((p) => pkgs.add(p));
      }
    }
  }
  walk(items);
  return Array.from(pkgs);
}

export function getStoredInstalledPackages(): string[] {
  try {
    const stored = safeStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return ['numpy'];
}

export function saveInstalledPackages(pkgs: string[]): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(pkgs))));
  } catch (e) {}
}

// 工作区内的本地模块名（不含 .py）：运行前依赖检查时要排除，避免把 import utils 当成第三方包自动安装
export function collectLocalModules(items: FSItem[]): Set<string> {
  const names = new Set<string>();
  const walk = (list: FSItem[]) => {
    for (const item of list) {
      if (item.isFolder) {
        if (item.children) walk(item.children);
      } else if (item.name.endsWith('.py')) {
        names.add(item.name.slice(0, -3));
      }
    }
  };
  walk(items);
  return names;
}

const RECENT_KEY = 'python_you_recent_packages';
const RECENT_LIMIT = 20;

export interface RecentPackage {
  name: string;
  /** 安装时间（Unix 毫秒） */
  at: number;
}

// 本应用经手安装过的包（按时间倒序）：供包管理「最近安装」页签展示
export function getRecentPackages(): RecentPackage[] {
  try {
    const raw = safeStorage.getItem(RECENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && typeof p.name === 'string' && typeof p.at === 'number');
      }
    }
  } catch (e) {}
  return [];
}

export function recordPackageInstall(name: string): void {
  const clean = name.trim().toLowerCase();
  if (!clean) return;
  const list = getRecentPackages().filter((pkg) => pkg.name !== clean);
  list.unshift({ name: clean, at: Date.now() });
  try {
    safeStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_LIMIT)));
  } catch (e) {}
}

// 工作区代码里 import 的第三方包（只扫描，不写入已装记录）：
// 已装记录仅由安装/卸载动作修改——若把 import 结果并进去，卸载会被代码里的 import 立即复原
export function detectImportedPackages(workspaceItems: FSItem[], extraCode?: string): string[] {
  const detected = extractAllImportsFromWorkspace(workspaceItems);
  const extraDetected = extraCode ? extractImportsFromCode(extraCode) : [];
  return Array.from(new Set([...detected, ...extraDetected]));
}
