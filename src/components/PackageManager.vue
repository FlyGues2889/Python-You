<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { pythonRunner } from '../utils/pythonRunner';
import { ConsoleOutput, FSItem } from '../types';
import { useI18n } from '../utils/i18n';
import PageHeader from './PageHeader.vue';
import {
  detectImportedPackages,
  getStoredInstalledPackages,
  saveInstalledPackages,
  getRecentPackages,
  recordPackageInstall,
  type RecentPackage
} from '../utils/packageUtils';
import { addBackendTask, updateBackendTask, finishBackendTask } from '../utils/backendTasks';
import { nativePython } from '../utils/nativePython';
import { nativeApi } from '../utils/native';

const props = defineProps<{
  workspaceFiles?: FSItem[];
}>();

const emit = defineEmits<{
  (e: 'add-console-output', output: ConsoleOutput): void;
  (e: 'show-toast', msg: string): void;
}>();

const { t, tf } = useI18n();
const customPackageName = ref('');
const filterQuery = ref('');
const installingSet = ref<Set<string>>(new Set());

// 已安装 = 应用自身的安装记录（只有安装/卸载会改），不从代码 import 推断
const installedSet = ref<Set<string>>(new Set(getStoredInstalledPackages()));
// 工作区代码引用到的包：仅作提示，不参与已安装判定
const referencedPackages = ref<Set<string>>(new Set());

const syncPackages = () => {
  installedSet.value = new Set(getStoredInstalledPackages());
  referencedPackages.value = new Set(detectImportedPackages(props.workspaceFiles || []));
  recentList.value = getRecentPackages();
};

// 三个页签：最近安装（本应用装过的，按时间倒序）/ 推荐安装（预设包中未装的）/ 已安装
const activePkgTab = ref<'recent' | 'recommended' | 'installed'>('recent');
// 页签内容首次访问时构建、之后常驻（配合 v-show 切换）：
// 每切一次都重建整张列表（已安装列表最大）会明显卡顿
const visitedPkgTabs = ref<Set<string>>(new Set(['recent']));
watch(activePkgTab, (tab) => {
  visitedPkgTabs.value.add(tab);
});
const recentList = ref<RecentPackage[]>(getRecentPackages());

const recentPackages = computed(() => {
  const q = filterQuery.value.trim().toLowerCase();
  return recentList.value
    .filter((pkg) => !q || pkg.name.toLowerCase().includes(q))
    .map((pkg) => ({ name: pkg.name, time: new Date(pkg.at).toLocaleString() }));
});

onMounted(() => {
  syncPackages();
});

watch(
  () => props.workspaceFiles,
  () => {
    referencedPackages.value = new Set(detectImportedPackages(props.workspaceFiles || []));
  },
  { deep: true }
);

const presetPackages = [
  {
    name: 'numpy',
    descZh: '用于多维数组科学计算的基础库。',
    descEn: 'Fundamental package for scientific computing with multi-dimensional arrays.'
  },
  {
    name: 'pandas',
    descZh: '用于高性能数据分析和操作的结构（数据框）。',
    descEn: 'High-performance data analysis and manipulation structures (DataFrames).'
  },
  {
    name: 'matplotlib',
    descZh: '用于创建静态、动画和交互式可视化的综合库。',
    descEn: 'Comprehensive library for creating static, animated, and interactive visualizations.'
  },
  {
    name: 'scipy',
    descZh: '用于优化、积分、插值、线性代数和统计的算法库。',
    descEn: 'Algorithms for optimization, integration, interpolation, linear algebra, and statistics.'
  },
  {
    name: 'sympy',
    descZh: '用于符号数学和计算机代数系统的 Python 库。',
    descEn: 'Python library for symbolic mathematics and computer algebra systems.'
  },
  {
    name: 'requests-mock',
    descZh: '用于在 Pyodide 环境中测试 HTTP 请求的模拟库。',
    descEn: 'Mock library for testing HTTP requests in Pyodide environment.'
  },
  {
    name: 'scikit-learn',
    descZh: '用于预测数据分析和机器学习的简单高效工具。',
    descEn: 'Simple and efficient tools for predictive data analysis and machine learning.'
  }
];

const allPackages = computed(() => {
  const result = presetPackages.map((pkg) => ({
    ...pkg,
    installed: installedSet.value.has(pkg.name)
  }));

  // Add custom installed packages that aren't in preset
  for (const pkgName of installedSet.value) {
    if (!presetPackages.some((p) => p.name === pkgName)) {
      result.push({
        name: pkgName,
        descZh: `已安装扩展包 '${pkgName}'`,
        descEn: `Installed extension package '${pkgName}'`,
        installed: true
      });
    }
  }

  return result;
});

function matchesQuery(pkg: { name: string; descZh: string; descEn: string }) {
  if (!filterQuery.value.trim()) return true;
  const q = filterQuery.value.toLowerCase().trim();
  return (
    pkg.name.toLowerCase().includes(q) ||
    pkg.descZh.toLowerCase().includes(q) ||
    pkg.descEn.toLowerCase().includes(q)
  );
}

// 「已安装」默认只显示与本应用相关的包：经本应用安装过（最近安装记录）或工作区代码 import 过。
// 其余（发行版预装、被其他依赖顺带装上的）视为环境自带，默认隐藏——扫描 conda 这类环境时列表不会上百项
const showBuiltin = ref(false);

const relatedInstalledNames = computed(() => {
  const names = new Set(recentList.value.map((pkg) => pkg.name.toLowerCase()));
  for (const name of referencedPackages.value) names.add(name.toLowerCase());
  return names;
});

const isRelatedInstalled = (name: string) => relatedInstalledNames.value.has(name.toLowerCase());

const installedPackages = computed(() =>
  allPackages.value.filter(
    (pkg) => pkg.installed && matchesQuery(pkg) && (showBuiltin.value || isRelatedInstalled(pkg.name))
  )
);

// 被默认隐藏的已安装包数量：用于空态提示（列表空不代表真的没装）
const hiddenInstalledCount = computed(() =>
  allPackages.value.filter((pkg) => pkg.installed && matchesQuery(pkg) && !isRelatedInstalled(pkg.name)).length
);

const availablePackages = computed(() => {
  return allPackages.value.filter((pkg) => !pkg.installed && matchesQuery(pkg));
});

// 安装失败提示（FR-5.3：页面内联错误 + Toast，不静默无声）
const installError = ref('');

// NFR-5.3：安装前确认（包名 + 来源 + 风险），确认后才真正执行
const pendingInstall = ref<string | null>(null);

const requestInstall = (pkgName: string) => {
  const cleanName = pkgName.trim().toLowerCase();
  if (!cleanName || installingSet.value.has(cleanName)) return;
  pendingInstall.value = cleanName;
};

const installTargetText = computed(() =>
  nativePython.supported && nativePython.enabled && nativePython.versions.value.length > 0
    ? tf('pkgConfirmTargetLocal', { name: pendingInstall.value || '' })
    : tf('pkgConfirmTargetWasm', { name: pendingInstall.value || '' })
);

const handleConfirmInstall = async () => {
  const cleanName = pendingInstall.value;
  pendingInstall.value = null;
  if (cleanName) await handleInstall(cleanName);
};

const handleInstall = async (pkgName: string) => {
  const cleanName = pkgName.trim().toLowerCase();
  if (!cleanName || installingSet.value.has(cleanName)) return;

  installError.value = '';
  installingSet.value.add(cleanName);

  // FR-5.6：安装任务登记到标题栏后台指示区，进度随 pip 输出实时更新
  const taskId = `install-pkg-${cleanName}`;
  addBackendTask(taskId, tf('statusInstallingPkg', { name: cleanName }));
  const ok = await pythonRunner.loadPackage(cleanName, (out) => {
    emit('add-console-output', out);
  }, (progress) => {
    updateBackendTask(taskId, { progress });
  });
  finishBackendTask(taskId, ok ? 'done' : 'failed');

  if (ok) {
    installedSet.value.add(cleanName);
    saveInstalledPackages(Array.from(installedSet.value));
    recordPackageInstall(cleanName);
    recentList.value = getRecentPackages();
    customPackageName.value = '';
  } else {
    // 失败：错误详情已进终端面板，页面内联摘要 + Toast 双重反馈
    const msg = tf('pkgInstallFailedMsg', { name: cleanName });
    installError.value = msg;
    emit('show-toast', msg);
    customPackageName.value = '';
  }
  installingSet.value.delete(cleanName);
};

// 扫描本机包列表时的占位指示器：立即显示，并保证至少停留 0.5s——
// 既不会因为太快而"闪一下"，也不会在慢操作期间让列表空着像卡住
const packagesLoading = ref(false);
const PACKAGES_LOADING_MIN_MS = 1000;
let packagesLoadingStartedAt = 0;
let packagesLoadingTimer: ReturnType<typeof setTimeout> | null = null;

const beginPackagesLoading = () => {
  if (packagesLoadingTimer !== null) {
    clearTimeout(packagesLoadingTimer);
    packagesLoadingTimer = null;
  }
  packagesLoadingStartedAt = Date.now();
  packagesLoading.value = true;
};

const endPackagesLoading = () => {
  const remaining = Math.max(0, PACKAGES_LOADING_MIN_MS - (Date.now() - packagesLoadingStartedAt));
  if (remaining === 0) {
    packagesLoading.value = false;
    return;
  }
  if (packagesLoadingTimer !== null) clearTimeout(packagesLoadingTimer);
  packagesLoadingTimer = setTimeout(() => {
    packagesLoading.value = false;
    packagesLoadingTimer = null;
  }, remaining);
};

// 手动扫描本机已安装的包：并入已安装列表（仅本机引擎可枚举，其余引擎说明原因）
const handleRefreshPackages = async () => {
  const taskId = 'scan-packages';
  addBackendTask(taskId, t('statusScanningPackages'));
  beginPackagesLoading();
  try {
    const found = await pythonRunner.scanInstalledPackages();
    if (!found) {
      emit('show-toast', t('scanPackagesUnsupported'));
      return;
    }
    installedSet.value = new Set([...installedSet.value, ...found]);
    saveInstalledPackages(Array.from(installedSet.value));
    emit('show-toast', tf('scanPackagesDone', { count: String(found.size) }));
  } finally {
    endPackagesLoading();
    finishBackendTask(taskId);
  }
};

// 从本地文件安装扩展包（wheel / sdist）：仅本机引擎可用，安装后并入已安装列表
const handleImportPackage = async () => {
  const path = await nativeApi.pickFile([
    { name: 'Python 安装包', extensions: ['whl', 'gz', 'zip', 'tar'] }
  ]);
  if (!path) return;
  const fileName = path.split(/[\\/]/).pop() || path;

  const taskId = `install-file-${fileName}`;
  addBackendTask(taskId, tf('statusInstallingPkg', { name: fileName }));
  const ok = await pythonRunner.installPackageFile(path, fileName, (out) => {
    emit('add-console-output', out);
  }, (progress) => {
    updateBackendTask(taskId, { progress });
  });
  finishBackendTask(taskId, ok ? 'done' : 'failed');

  if (ok) {
    // 轮子文件名形如 包名-版本-...，取第一段作为包名并入已装列表
    const distName = fileName.replace(/\.(whl|tar\.gz|zip)$/i, '').split('-')[0];
    if (distName) {
      installedSet.value.add(distName);
      saveInstalledPackages(Array.from(installedSet.value));
      recordPackageInstall(distName);
      recentList.value = getRecentPackages();
    }
    emit('show-toast', tf('importPkgInstalled', { name: fileName }));
  } else {
    emit('show-toast', tf('pkgInstallFailedMsg', { name: fileName }));
  }
};

// 卸载：本机引擎走真实 pip 卸载；其他引擎只能移出应用记录（FR-5.4，结果如实告知）
const handleUninstall = async (pkgName: string) => {
  const cleanName = pkgName.trim();
  if (!cleanName) return;

  const taskId = `uninstall-pkg-${cleanName}`;
  addBackendTask(taskId, tf('statusUninstallingPkg', { name: cleanName }));
  const result = await pythonRunner.uninstallPackage(cleanName, (out) => {
    emit('add-console-output', out);
  }, (progress) => {
    updateBackendTask(taskId, { progress });
  });
  finishBackendTask(taskId, result === 'failed' ? 'failed' : 'done');

  if (result === 'failed') {
    // 真实卸载失败：保留在已安装列表，等用户看终端输出
    emit('show-toast', tf('pkgUninstallFailedMsg', { name: cleanName }));
    return;
  }
  installedSet.value.delete(cleanName);
  saveInstalledPackages(Array.from(installedSet.value));
  emit('show-toast', result === 'done'
    ? tf('pkgUninstalledReal', { name: cleanName })
    : tf('pkgUninstalledListOnlyToast', { name: cleanName }));
};
</script>

<template>
  <m3e-content-pane class="package-manager-container">
    <!-- Top Header -->
    <PageHeader :title="t('pkgTitle')" :subtitle="t('pkgSubtitle')" />

    <!-- Custom Package Install Bar (Placed Below Header) -->
    <div class="install-section">
      <div class="install-bar-card">
        <div class="input-flex-grow">
          <m3e-search-bar clearable @clear="customPackageName = ''; filterQuery = ''">
            <span slot="leading" class="material-symbols-rounded">search</span>
            <input slot="input" v-model="customPackageName" :placeholder="t('pkgSearchPlaceholder')"
              @input="filterQuery = customPackageName" @keydown.enter.prevent="requestInstall(customPackageName)" />
          </m3e-search-bar>
        </div>
        <m3e-button variant="filled" size="small" :disabled="installingSet.has(customPackageName.trim().toLowerCase()) || !customPackageName.trim()"
          @click="requestInstall(customPackageName)">
          <span slot="icon" class="material-symbols-rounded">download</span>
          {{ installingSet.has(customPackageName.trim().toLowerCase()) ? t('installing') : t('installPkg') }}
        </m3e-button>
        <!-- 扫描已安装的扩展包 / 从本地文件安装（.whl / .tar.gz），与相邻按钮各留 4dp 间隔 -->
        <m3e-icon-button class="pkg-icon-btn" size="extra-small" :title="t('refreshPackagesTooltip')"
          @click="handleRefreshPackages">
          <span class="material-symbols-rounded">refresh</span>
        </m3e-icon-button>
        <m3e-icon-button class="pkg-icon-btn" size="extra-small" :title="t('importPkgTooltip')"
          @click="handleImportPackage">
          <span class="material-symbols-rounded">upload_file</span>
        </m3e-icon-button>
      </div>
      <p v-if="installError" class="install-error">{{ installError }}</p>
    </div>

    <!-- 包列表：m3e-tabs 三档切换（最近安装 / 推荐安装 / 已安装），不再用卡片分组 -->
    <m3e-tabs class="pkg-tabs density-3" variant="primary">
      <m3e-tab selected for="pkg-recent" @click="activePkgTab = 'recent'">
        {{ t('pkgTabRecent') }}
      </m3e-tab>
      <m3e-tab for="pkg-recommended" @click="activePkgTab = 'recommended'">
        {{ t('pkgTabRecommended') }}
      </m3e-tab>
      <m3e-tab for="pkg-installed" @click="activePkgTab = 'installed'">
        {{ t('pkgTabInstalled') }}
      </m3e-tab>

      <!-- 最近安装（本应用装过的，按时间倒序） -->
      <m3e-tab-panel id="pkg-recent">
        <div v-if="visitedPkgTabs.has('recent')" v-show="activePkgTab === 'recent'" class="pkg-tab-body">
          <div class="pkg-tab-summary">
            <span class="count-tag">{{ tf('pkgCountText', { count: recentPackages.length }) }}</span>
          </div>
          <div v-if="packagesLoading" class="pkg-loading">
            <m3e-loading-indicator></m3e-loading-indicator>
            <span>{{ t('pkgListLoading') }}</span>
          </div>
          <template v-else>
            <m3e-list v-if="recentPackages.length > 0" class="pkg-m3e-list">
              <m3e-list-item v-for="pkg in recentPackages" :key="pkg.name">
                <span slot="leading" class="material-symbols-rounded">extension</span>
                {{ pkg.name }}
                <span slot="supporting-text">{{ tf('pkgInstalledAt', { time: pkg.time }) }}</span>
                <div slot="trailing" class="item-actions">
                  <m3e-button v-if="!installedSet.has(pkg.name)" variant="filled" size="extra-small"
                    @click="requestInstall(pkg.name)">
                    <span slot="icon" class="material-symbols-rounded">download</span>
                    {{ t('loadPkg') }}
                  </m3e-button>
                </div>
              </m3e-list-item>
            </m3e-list>
            <div v-else class="empty-category-hint">{{ t('pkgRecentEmpty') }}</div>
          </template>
        </div>
      </m3e-tab-panel>

      <!-- 推荐安装（预设包中尚未安装的） -->
      <m3e-tab-panel id="pkg-recommended">
        <div v-if="visitedPkgTabs.has('recommended')" v-show="activePkgTab === 'recommended'" class="pkg-tab-body">
          <div class="pkg-tab-summary">
            <span class="count-tag">{{ tf('pkgCountText', { count: availablePackages.length }) }}</span>
          </div>
          <div v-if="packagesLoading" class="pkg-loading">
            <m3e-loading-indicator></m3e-loading-indicator>
            <span>{{ t('pkgListLoading') }}</span>
          </div>
          <template v-else>
            <m3e-list v-if="availablePackages.length > 0" class="pkg-m3e-list">
              <m3e-list-item v-for="pkg in availablePackages" :key="pkg.name">
                <span slot="leading" class="material-symbols-rounded">extension</span>
                {{ pkg.name }}
                <span slot="supporting-text">{{ pkg.descZh }}</span>
                <div slot="trailing" class="item-actions">
                  <span v-if="referencedPackages.has(pkg.name)" class="pkg-ref-tag">{{ t('pkgReferencedHint') }}</span>
                  <m3e-button variant="filled" size="extra-small"
                    :disabled="installingSet.has(pkg.name.toLowerCase())" @click="requestInstall(pkg.name)">
                    <span slot="icon" class="material-symbols-rounded">download</span>
                    {{ installingSet.has(pkg.name.toLowerCase()) ? t('installing') : t('loadPkg') }}
                  </m3e-button>
                </div>
              </m3e-list-item>
            </m3e-list>
            <div v-else class="empty-category-hint">{{ t('pkgNoAvailable') }}</div>
          </template>
        </div>
      </m3e-tab-panel>

      <!-- 已安装 -->
      <m3e-tab-panel id="pkg-installed">
        <div v-if="visitedPkgTabs.has('installed')" v-show="activePkgTab === 'installed'" class="pkg-tab-body">
          <div class="pkg-tab-summary">
            <m3e-button variant="text" size="extra-small" @click="showBuiltin = !showBuiltin">
              <span slot="icon" class="material-symbols-rounded">{{ showBuiltin ? 'visibility_off' : 'visibility'
                }}</span>
              {{ showBuiltin ? t('pkgHideBuiltin') : t('pkgShowBuiltin') }}
            </m3e-button>
            <span class="count-tag">{{ tf('pkgCountText', { count: installedPackages.length }) }}</span>
          </div>
          <div v-if="packagesLoading" class="pkg-loading">
            <m3e-loading-indicator></m3e-loading-indicator>
            <span>{{ t('pkgListLoading') }}</span>
          </div>
          <template v-else>
            <m3e-list v-if="installedPackages.length > 0" class="pkg-m3e-list">
              <m3e-list-item v-for="pkg in installedPackages" :key="pkg.name">
                <span slot="leading" class="material-symbols-rounded">extension</span>
                {{ pkg.name }}
                <span slot="supporting-text">{{ pkg.descZh }}</span>
                <div slot="trailing" class="item-actions">
                  <m3e-button variant="outlined" size="extra-small" @click="handleUninstall(pkg.name)">
                    <span slot="icon" class="material-symbols-rounded">delete</span>
                    {{ t('uninstall') }}
                  </m3e-button>
                </div>
              </m3e-list-item>
            </m3e-list>
            <div v-else class="empty-category-hint">
              {{ hiddenInstalledCount > 0 ? t('pkgInstalledAllHidden') : t('pkgNoInstalled') }}
            </div>
          </template>
        </div>
      </m3e-tab-panel>
    </m3e-tabs>

    <!-- 安装确认（NFR-5.3）：包名、来源与风险提示 -->
    <m3e-dialog :open="!!pendingInstall" @cancel="pendingInstall = null" @closed="pendingInstall = null">
      <span slot="header" class="pkg-dialog-title-row">
        <span class="material-symbols-rounded pkg-dialog-icon">download</span>
        <span class="pkg-dialog-title">{{ t('pkgConfirmTitle') }}</span>
      </span>
      <p class="pkg-dialog-desc">{{ installTargetText }}</p>
      <p class="pkg-dialog-desc is-risk">{{ t('pkgConfirmRisk') }}</p>
      <div slot="actions" class="pkg-dialog-actions">
        <m3e-button variant="text" size="small" @click="pendingInstall = null">{{ t('cancel') }}</m3e-button>
        <m3e-button variant="filled" size="small" @click="handleConfirmInstall">{{ t('pkgConfirmInstall') }}
        </m3e-button>
      </div>
    </m3e-dialog>
  </m3e-content-pane>
</template>

<style scoped>
.package-manager-container {
  height: 100%;
  /* 与 REPL 终端卡片一致：surface 色卡片充满整个页面，留 12px 外边距与 10px 圆角；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制 */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 12px; /* CornerMedium，与其余主面板一致 */
  --m3e-content-pane-container-color: var(--surface-color);
  --m3e-content-pane-container-padding: 2rem;
}

/* 与设置界面一致：内容列居中（72rem 最大宽 + 左右自动外边距） */
.install-section {
  margin-bottom: 1.5rem;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.install-bar-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.pkg-icon-btn {
  margin-left: 4px;
}

.input-flex-grow {
  flex: 1;
  min-width: 0;
}

.install-error {
  margin: 6px 0 0;
  font-size: 0.8125rem;
  color: var(--error);
}

/* 页签容器：与设置界面一致的居中列宽 */
.pkg-tabs {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

/* density-3 只用来压紧页签条本身。--md-sys-density-scale 是会继承的 CSS 变量，
   而页签面板是 m3e-tabs 的子元素，不重置就会漏进面板：里面 32px 的 extra-small
   按钮会被压成 20px（图标 24px 塞不下），列表里的操作按钮高度因此不正常。 */
.pkg-tabs m3e-tab-panel {
  --md-sys-density-scale: 0;
}

.pkg-tab-body {
  display: flex;
  flex-direction: column;
  padding-top: 8px;
}

.pkg-tab-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 4px 4px;
}

/* 慢操作（扫描本机包列表）时的占位指示器，避免列表空着让人以为卡住 */
.pkg-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.count-tag {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

/* m3e-list 列表：行间距与卡片圆角统一由组件库绘制；已安装组 selected 高亮 */
.pkg-m3e-list {
  --m3e-list-item-container-shape: 24px;
}

.empty-category-hint {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.pkg-ref-tag {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* 安装确认弹窗 */
.pkg-dialog-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pkg-dialog-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.pkg-dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.pkg-dialog-desc {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.pkg-dialog-desc.is-risk {
  color: var(--error);
}

.pkg-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

</style>
