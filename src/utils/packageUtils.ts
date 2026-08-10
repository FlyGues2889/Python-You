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

function extractImportsFromCode(code: string): string[] {
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

function getStoredInstalledPackages(): string[] {
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

export function syncWorkspacePackages(workspaceItems: FSItem[], extraCode?: string): string[] {
  const stored = getStoredInstalledPackages();
  const detected = extractAllImportsFromWorkspace(workspaceItems);
  let extraDetected: string[] = [];
  if (extraCode) {
    extraDetected = extractImportsFromCode(extraCode);
  }
  const combined = Array.from(new Set([...stored, ...detected, ...extraDetected]));
  saveInstalledPackages(combined);
  return combined;
}
