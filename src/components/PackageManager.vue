<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { pythonRunner } from '../utils/pythonRunner';
import { ConsoleOutput, FSItem } from '../types';
import { useI18n } from '../utils/i18n';
import PageHeader from './PageHeader.vue';
import { syncWorkspacePackages, saveInstalledPackages } from '../utils/packageUtils';

const props = defineProps<{
  workspaceFiles?: FSItem[];
}>();

const emit = defineEmits<{
  (e: 'add-console-output', output: ConsoleOutput): void;
}>();

const { t } = useI18n();
const customPackageName = ref('');
const filterQuery = ref('');
const installingSet = ref<Set<string>>(new Set());

const installedSet = ref<Set<string>>(new Set(['numpy']));

const syncPackages = () => {
  const allInstalled = syncWorkspacePackages(props.workspaceFiles || []);
  installedSet.value = new Set(allInstalled);
};

onMounted(() => {
  syncPackages();
});

watch(
  () => props.workspaceFiles,
  () => {
    syncPackages();
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

const installedPackages = computed(() => {
  return allPackages.value.filter((pkg) => pkg.installed && matchesQuery(pkg));
});

const availablePackages = computed(() => {
  return allPackages.value.filter((pkg) => !pkg.installed && matchesQuery(pkg));
});

const handleInstall = async (pkgName: string) => {
  const cleanName = pkgName.trim().toLowerCase();
  if (!cleanName || installingSet.value.has(cleanName)) return;

  installingSet.value.add(cleanName);
  const ok = await pythonRunner.loadPackage(cleanName, (out) => {
    emit('add-console-output', out);
  });

  if (ok) {
    installedSet.value.add(cleanName);
    saveInstalledPackages(Array.from(installedSet.value));
  }
  installingSet.value.delete(cleanName);
  customPackageName.value = '';
};

const handleUninstall = (pkgName: string) => {
  const cleanName = pkgName.trim();
  if (!cleanName) return;
  installedSet.value.delete(cleanName);
  saveInstalledPackages(Array.from(installedSet.value));
  emit('add-console-output', {
    type: 'system',
    text: `[Pip] 已卸载包: ${cleanName}`,
    timestamp: new Date().toLocaleTimeString()
  });
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
              @input="filterQuery = customPackageName" @keydown.enter.prevent="handleInstall(customPackageName)" />
          </m3e-search-bar>
        </div>
        <m3e-button variant="filled" size="small" :disabled="installingSet.has(customPackageName.trim().toLowerCase()) || !customPackageName.trim()"
          @click="handleInstall(customPackageName)">
          <span slot="icon" class="material-symbols-rounded">download</span>
          {{ installingSet.has(customPackageName.trim().toLowerCase()) ? t('installing') : t('installPkg') }}
        </m3e-button>
      </div>
    </div>

    <!-- Package List View with Categorized Sections（与设置界面一致的卡片分组） -->
    <div class="pkg-list-container">
      <!-- 1. Installed Packages Category -->
      <m3e-card variant="outlined">
        <div slot="header" class="pkg-card-header">
          <h4 class="pkg-card-title">{{ t('installedSectionTitle') }}</h4>
          <span class="count-tag">{{ installedPackages.length }} 个</span>
        </div>

        <m3e-list v-if="installedPackages.length > 0" slot="content" class="pkg-m3e-list">
          <m3e-list-item v-for="pkg in installedPackages" :key="pkg.name" selected>
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
        <div v-else slot="content" class="empty-category-hint">
          <span>暂无已安装的扩展包</span>
        </div>
      </m3e-card>

      <!-- 2. Available Packages Category -->
      <m3e-card variant="outlined">
        <div slot="header" class="pkg-card-header">
          <h4 class="pkg-card-title">{{ t('availableSectionTitle') }}</h4>
          <span class="count-tag">{{ availablePackages.length }} 个</span>
        </div>

        <m3e-list v-if="availablePackages.length > 0" slot="content" class="pkg-m3e-list">
          <m3e-list-item v-for="pkg in availablePackages" :key="pkg.name">
            <span slot="leading" class="material-symbols-rounded">extension</span>
            {{ pkg.name }}
            <span slot="supporting-text">{{ pkg.descZh }}</span>
            <div slot="trailing" class="item-actions">
              <m3e-button variant="filled" size="extra-small"
                :disabled="installingSet.has(pkg.name.toLowerCase())" @click="handleInstall(pkg.name)">
                <span slot="icon" class="material-symbols-rounded">download</span>
                {{ installingSet.has(pkg.name.toLowerCase()) ? t('installing') : t('loadPkg') }}
              </m3e-button>
            </div>
          </m3e-list-item>
        </m3e-list>
        <div v-else slot="content" class="empty-category-hint">
          <span>暂无可载入的拓展包</span>
        </div>
      </m3e-card>
    </div>
  </m3e-content-pane>
</template>

<style scoped>
.package-manager-container {
  height: 100%;
  /* 与 REPL 终端卡片一致：surface 色卡片充满整个页面，留 12px 外边距与 10px 圆角；
     背景/圆角/内边距由 m3e-content-pane 的 shadow 内元素绘制，经变量控制 */
  margin: 0 12px 12px;
  --m3e-content-pane-container-shape: 10px;
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

.input-flex-grow {
  flex: 1;
  min-width: 0;
}

.pkg-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

/* 分组卡片：与设置界面同款圆角与内边距 */
.pkg-list-container m3e-card {
  --m3e-card-shape: 20px;
  --m3e-card-padding: 1rem;
}

.pkg-card-header {
  h4 {
    line-height: 2.4rem;
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pkg-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0;
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

</style>
