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

    <!-- Package List View with Categorized Sections -->
    <div class="pkg-list-container">
      <!-- 1. Installed Packages Category -->
      <div class="pkg-category-section">
        <div class="list-section-title">
          <span>{{ t('installedSectionTitle') }}</span>
          <span class="count-tag">{{ installedPackages.length }} 个</span>
        </div>

        <div v-if="installedPackages.length > 0" class="pkg-list">
          <div v-for="pkg in installedPackages" :key="pkg.name" class="pkg-list-item is-installed">
            <div class="item-left">
              <div class="pkg-icon-wrapper">
                <span class="material-symbols-rounded pkg-icon">extension</span>
              </div>
              <div class="pkg-main-info">
                <div class="title-row">
                  <h3 class="pkg-title">{{ pkg.name }}</h3>
                  <span class="pkg-status-tag installed">
                    {{ t('installedTag') }}
                  </span>
                </div>
                <p class="pkg-desc">{{ pkg.descZh }}</p>
              </div>
            </div>

            <div class="item-right">
              <m3e-button variant="outlined" size="extra-small"
                @click="handleUninstall(pkg.name)">
                <span slot="icon" class="material-symbols-rounded">delete</span>
                {{ t('uninstall') }}
              </m3e-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-category-hint">
          <span>暂无已安装的扩展包</span>
        </div>
      </div>

      <!-- 2. Available Packages Category -->
      <div class="pkg-category-section">
        <div class="list-section-title">
          <span>{{ t('availableSectionTitle') }}</span>
          <span class="count-tag">{{ availablePackages.length }} 个</span>
        </div>

        <div v-if="availablePackages.length > 0" class="pkg-list">
          <div v-for="pkg in availablePackages" :key="pkg.name" class="pkg-list-item">
            <div class="item-left">
              <div class="pkg-icon-wrapper">
                <span class="material-symbols-rounded pkg-icon">extension</span>
              </div>
              <div class="pkg-main-info">
                <div class="title-row">
                  <h3 class="pkg-title">{{ pkg.name }}</h3>
                  <span class="pkg-status-tag available">
                    {{ t('availableTag') }}
                  </span>
                </div>
                <p class="pkg-desc">{{ pkg.descZh }}</p>
              </div>
            </div>

            <div class="item-right">
              <m3e-button variant="filled" size="extra-small" :disabled="installingSet.has(pkg.name.toLowerCase())"
                @click="handleInstall(pkg.name)">
                <span slot="icon" class="material-symbols-rounded">download</span>
                {{ installingSet.has(pkg.name.toLowerCase()) ? t('installing') : t('loadPkg') }}
              </m3e-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-category-hint">
          <span>暂无可载入的拓展包</span>
        </div>
      </div>
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

.install-section {
  margin-bottom: 2rem;
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
  gap: 1rem;
}

.list-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 0 4px;
}

.count-tag {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

.pkg-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pkg-list-item {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color-muted);
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  transition: all 0.15s ease;
}

.pkg-list-item:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(var(--shadow-rgb), 0.06);
}

.pkg-list-item.is-installed {
  background-color: var(--secondary-container);

  .pkg-icon-wrapper {
    background-color: var(--primary);

    .pkg-icon {
      color: var(--primary-container)
    }
  }
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.pkg-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .pkg-icon {
    font-size: 22px;
    color: var(--secondary-container);
  }
}


.pkg-main-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pkg-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  line-height: 1.2;
}

.pkg-status-tag {
  display: inline-block;
  font-size: 0.6875rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.pkg-status-tag.installed {
  background-color: var(--primary);
  color: var(--primary-container);

}

.pkg-status-tag.available {
  background-color: var(--tertiary-container);
  color: var(--tertiary);
}

.pkg-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.item-right {
  flex-shrink: 0;
}

</style>
