// 工作区外部变更检测（轮询整树清单）：发现其他程序对工作区的增删改
import { nativeApi, type WorkspaceEntry } from './native';

export interface WorkspaceChange {
  added: WorkspaceEntry[];
  removed: string[];
  modified: string[];
}

// 轮询间隔：教学规模的工作区扫描在毫秒级，5 秒足够及时又不浪费
const POLL_INTERVAL_MS = 5000;

export class WorkspaceWatcher {
  private timer: ReturnType<typeof setInterval> | null = null;
  private snapshot = new Map<string, WorkspaceEntry>();
  private ticking = false;
  private onChange: (change: WorkspaceChange) => void;

  constructor(onChange: (change: WorkspaceChange) => void) {
    this.onChange = onChange;
  }

  /** 重新记录基线（工作区刚加载、或应用自身刚改过文件后调用） */
  async prime(): Promise<void> {
    try {
      const entries = await nativeApi.scanWorkspace();
      this.snapshot = new Map(entries.map((entry) => [entry.path, entry]));
    } catch (e) { /* 工作区暂不可用：保留旧基线 */ }
  }

  start() {
    this.stop();
    this.timer = setInterval(() => void this.tick(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick() {
    // 窗口不可见时不轮询；上一轮未结束则跳过
    if (this.ticking || document.visibilityState !== 'visible') return;
    this.ticking = true;
    try {
      const entries = await nativeApi.scanWorkspace();
      const next = new Map(entries.map((entry) => [entry.path, entry]));
      const change: WorkspaceChange = { added: [], removed: [], modified: [] };

      for (const [path, entry] of next) {
        const prev = this.snapshot.get(path);
        if (!prev) {
          change.added.push(entry);
        } else if (!entry.isFolder && (prev.mtime !== entry.mtime || prev.size !== entry.size)) {
          change.modified.push(path);
        }
      }
      for (const path of this.snapshot.keys()) {
        if (!next.has(path)) change.removed.push(path);
      }

      this.snapshot = next;
      if (change.added.length || change.removed.length || change.modified.length) {
        this.onChange(change);
      }
    } catch (e) {
      // 工作区不可用时忽略本轮
    } finally {
      this.ticking = false;
    }
  }
}
