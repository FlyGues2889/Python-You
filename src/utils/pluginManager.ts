import { ref, computed } from 'vue';
import { safeStorage } from './storage';
import { nativeApi, absPath } from './native';
import type { TutorialSeries } from '../components/tutor/tutorialData';

const STORAGE_KEY = 'python_you_plugins';
const PLUGINS_DIR = '/plugins';

let workspaceRoot: string | null = null;

export function setWorkspaceRoot(path: string | null) {
  workspaceRoot = path;
}


function pluginsRootPath(): string | null {
  if (!workspaceRoot) return null;
  return absPath(workspaceRoot, PLUGINS_DIR);
}

export interface PluginPanel {
  id: string;
  title: string;
  icon?: string;
  html?: string;
}

export interface PluginTheme {
  id: string;
  name: string;
  colors: Record<string, string>;
}

export interface PluginSnippet {
  label: string;
  body: string;
  description?: string;
}

export interface PluginCommand {
  id: string;
  title: string;
  icon?: string;
}

export interface PluginContributes {
  panels?: PluginPanel[];
  themes?: PluginTheme[];
  snippets?: PluginSnippet[];
  commands?: PluginCommand[];
  css?: string;
  cssFile?: string;
  scripts?: string[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  icon?: string;
  tutorials?: TutorialSeries[];
  contributes?: PluginContributes;
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  enabled: boolean;
  installedAt: number;
  dir?: string;
}

export interface PluginRuntimeHost {
  id: string;
  onCleanup(fn: () => void): void;
}

interface PluginRuntime {
  id: string;
  dispose: () => void;
}

const _plugins = ref<InstalledPlugin[]>(loadPlugins());

function loadPlugins(): InstalledPlugin[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as InstalledPlugin[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persist() {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(_plugins.value));
}

export const plugins = computed(() => _plugins.value);

export function getPlugin(id: string): InstalledPlugin | undefined {
  return _plugins.value.find((p) => p.manifest.id === id);
}

export function isPluginEnabled(id: string): boolean {
  return _plugins.value.some((p) => p.manifest.id === id && p.enabled);
}

export async function scanPlugins(): Promise<{ ok: boolean; count: number; error?: string }> {
  const root = pluginsRootPath();
  if (!root) return { ok: false, count: 0, error: 'no-workspace' };
  try {
    const entries = await nativeApi.readDirectory(root);
    let count = 0;
    for (const entry of entries) {
      if (!entry.isFolder) continue;
      try {
        const manifestPath = absPath(root, `/${entry.name}/plugin.json`);
        const content = await nativeApi.readFile(manifestPath);
        const manifest = JSON.parse(content) as PluginManifest;
        if (!manifest.id || !manifest.name) continue;
        const existing = _plugins.value.find((p) => p.manifest.id === manifest.id);
        const dir = absPath(root, `/${entry.name}`);
        if (existing) {
          existing.manifest = manifest;
          existing.dir = dir;
        } else {
          _plugins.value.push({
            manifest,
            enabled: true,
            installedAt: Date.now(),
            dir,
          });
        }
        count++;
      } catch { /* 跳过无效插件文件夹 */ }
    }
    persist();
    return { ok: true, count };
  } catch (err: any) {
    return { ok: false, count: 0, error: String(err?.message || err) };
  }
}

export async function ensurePluginsDir(): Promise<void> {
  if (!workspaceRoot) return;
  try {
    await nativeApi.createDir(workspaceRoot, 'plugins');
  } catch { /* 目录已存在 */ }
}

export function uninstallPlugin(id: string): boolean {
  const idx = _plugins.value.findIndex((p) => p.manifest.id === id);
  if (idx < 0) return false;
  _plugins.value.splice(idx, 1);
  persist();

  return true;
}

export function togglePlugin(id: string, enabled: boolean) {
  const plugin = _plugins.value.find((p) => p.manifest.id === id);
  if (!plugin) return;
  plugin.enabled = enabled;
  persist();
}

export function getEnabledPlugins(): InstalledPlugin[] {
  return _plugins.value.filter((p) => p.enabled);
}

export function getPluginTutorials(): TutorialSeries[] {
  return _plugins.value
    .filter((p) => p.enabled && p.manifest.tutorials)
    .flatMap((p) => p.manifest.tutorials || []);
}

export interface PluginPanelEntry {
  pluginId: string;
  panel: PluginPanel;
}

export function getPluginPanels(): PluginPanelEntry[] {
  return getEnabledPlugins()
    .filter((p) => p.manifest.contributes?.panels)
    .flatMap((p) =>
      (p.manifest.contributes!.panels || []).map((panel) => ({
        pluginId: p.manifest.id,
        panel,
      }))
    );
}

export interface PluginThemeEntry {
  pluginId: string;
  theme: PluginTheme;
}

export function getPluginThemes(): PluginThemeEntry[] {
  return getEnabledPlugins()
    .filter((p) => p.manifest.contributes?.themes)
    .flatMap((p) =>
      (p.manifest.contributes!.themes || []).map((theme) => ({
        pluginId: p.manifest.id,
        theme,
      }))
    );
}

export function getPluginSnippets(): PluginSnippet[] {
  return getEnabledPlugins()
    .filter((p) => p.manifest.contributes?.snippets)
    .flatMap((p) => p.manifest.contributes!.snippets || []);
}

export interface PluginCommandEntry {
  pluginId: string;
  command: PluginCommand;
}

export function getPluginCommands(): PluginCommandEntry[] {
  return getEnabledPlugins()
    .filter((p) => p.manifest.contributes?.commands)
    .flatMap((p) =>
      (p.manifest.contributes!.commands || []).map((command) => ({
        pluginId: p.manifest.id,
        command,
      }))
    );
}


export async function resolvePluginsCss(): Promise<string> {
  const parts: string[] = [];
  for (const plugin of getEnabledPlugins()) {
    const contributes = plugin.manifest.contributes;
    if (!contributes) continue;
    if (contributes.css) {
      parts.push(`/* plugin: ${plugin.manifest.id} */\n${contributes.css}`);
    }
    if (contributes.cssFile && plugin.dir) {
      try {
        const css = await nativeApi.readFile(absPath(plugin.dir, `/${contributes.cssFile}`));
        parts.push(`/* plugin: ${plugin.manifest.id} */\n${css}`);
      } catch { /* 样式文件缺失时跳过 */ }
    }
  }
  return parts.join('\n');
}

let runtimes: PluginRuntime[] = [];

export function deactivatePluginScripts(): void {
  for (const runtime of runtimes) {
    try {
      runtime.dispose();
    } catch { /* 单个插件清理失败不影响其他插件 */ }
  }
  runtimes = [];
}

export async function activatePluginScripts(): Promise<void> {
  deactivatePluginScripts();
  if (!nativeApi.available()) return;

  for (const plugin of getEnabledPlugins()) {
    const scripts = plugin.manifest.contributes?.scripts;
    if (!scripts?.length || !plugin.dir) continue;

    const cleanups: (() => void)[] = [];
    const host: PluginRuntimeHost = {
      id: plugin.manifest.id,
      onCleanup: (fn) => cleanups.push(fn),
    };

    try {
      for (const file of scripts) {
        const code = await nativeApi.readFile(absPath(plugin.dir, `/${file}`));
        const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
        try {
          const mod = await import(/* @vite-ignore */ url);
          const result = await mod.activate?.(host);
          if (typeof result === 'function') cleanups.push(result);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      runtimes.push({
        id: plugin.manifest.id,
        dispose: () => {
          for (const fn of cleanups.reverse()) {
            try {
              fn();
            } catch { /* 清理失败不阻断后续 */ }
          }
        },
      });
    } catch (err) {
      console.warn(`[plugin:${plugin.manifest.id}] activation failed`, err);
    }
  }
}

export function getPluginPanelHtml(pluginId: string, panelId: string): string | undefined {
  const plugin = getEnabledPlugins().find((p) => p.manifest.id === pluginId);
  return plugin?.manifest.contributes?.panels?.find((panel) => panel.id === panelId)?.html;
}