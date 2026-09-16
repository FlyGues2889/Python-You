// 标题栏后台任务指示器的共享状态（FR-1.3 / FR-5.6）：
// 引擎加载、解释器切换、包安装等长任务在此登记；进度可为 null（不确定态）。
import { ref } from 'vue';

export interface BackendTask {
  id: string;
  label: string;
  status: 'running' | 'done' | 'failed';
  /** 真实进度 0-100；null / undefined 表示当前阶段没有进度数据（不确定态） */
  progress?: number | null;
}

export const backendTasks = ref<BackendTask[]>([]);

export const addBackendTask = (id: string, label: string) => {
  const existing = backendTasks.value.find((task) => task.id === id);
  if (existing) {
    existing.status = 'running';
    existing.label = label;
  } else {
    backendTasks.value.push({ id, label, status: 'running', progress: null });
  }
};

export const updateBackendTask = (id: string, patch: { label?: string; progress?: number | null }) => {
  const task = backendTasks.value.find((t) => t.id === id);
  if (!task) return;
  if (patch.label !== undefined) task.label = patch.label;
  if (patch.progress !== undefined) task.progress = patch.progress;
};

export const finishBackendTask = (id: string, status: 'done' | 'failed' = 'done') => {
  const task = backendTasks.value.find((t) => t.id === id);
  if (task) task.status = status;
};
