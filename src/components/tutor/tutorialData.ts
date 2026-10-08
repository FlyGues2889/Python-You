export interface TutorialTopic {
  id: string;
  title: string;
  stage: string;
  /** 'reference' = 参考手册：只渲染正文与表格（不出小节标题、不显示代码与贴士） */
  kind?: 'reference';
  summary: string;
  content: {
    overview: string;
    sections: {
      /** 参考手册（kind: 'reference'）只分段不出标题，故标题可选；两端渲染均按存在与否判断 */
      heading?: string;
      text: string;
      table?: {
        headers: string[];
        rows: string[][];
      };
      code?: string;
      notes?: string;
    }[];
    codeExample?: string;
    takeaways?: string[];
    tips?: string[];
  };
}

export interface TutorialStage {
  id: string;
  title: string;
  icon?: string;
  subcategories?: {
    id: string;
    title: string;
    topics: TutorialTopic[];
  }[];
  topics?: TutorialTopic[];
}

// 文章系列：学习页首页的五个入口，各系列下挂自己的阶段
export interface TutorialSeries {
  id: string;
  title: string;
  icon: string;
  summary: string;
  stages: TutorialStage[];
}

// 文章数据按系列分目录：data/<系列 id>/{index,stageN}.ts
import { pythonStages } from './data/python';
import { referenceStages } from './data/reference';
import { databaseStages } from './data/database';
import { scrapingStages } from './data/scraping';
import { webStages } from './data/web';
import { automationStages } from './data/automation';

// python 系列的阶段（保留旧名，供仅需该系列的调用方使用）
export const TUTORIAL_STAGES: TutorialStage[] = pythonStages;

export const TUTORIAL_SERIES: TutorialSeries[] = [
  {
    id: 'python',
    title: 'Python教程',
    icon: 'code',
    summary: 'Python 从零到进阶：语法、容器、控制流、函数与对象、标准库、数据可视化。',
    stages: TUTORIAL_STAGES,
  },
  {
    id: 'reference',
    title: 'Python 参考手册',
    icon: 'menu_book',
    summary: '写法速查：关键字、内建函数与异常、容器方法、标准库 API、命令行工具，按用途分类随查随用。',
    stages: referenceStages,
  },
  {
    id: 'database',
    title: '数据库',
    icon: 'database',
    summary: 'SQL 基础、常见数据库与 Python 连接方式。',
    stages: databaseStages,
  },
  {
    id: 'scraping',
    title: '爬虫和数据分析',
    icon: 'travel_explore',
    summary: '网络请求、网页解析、数据清洗与可视化分析。',
    stages: scrapingStages,
  },
  {
    id: 'web',
    title: 'Web',
    icon: 'language',
    summary: 'HTTP 基础、接口与前后端协作。',
    stages: webStages,
  },
  {
    id: 'automation',
    title: '自动化',
    icon: 'smart_toy',
    summary: '用脚本处理重复工作：文件、表格、定时任务。',
    stages: automationStages,
  },
];

export function getTutorialSeries(): TutorialSeries[] {
  return TUTORIAL_SERIES;
}

export function getSeriesById(seriesId: string | null): TutorialSeries | undefined {
  if (!seriesId) return undefined;
  return TUTORIAL_SERIES.find((series) => series.id === seriesId);
}

/** 主题 → 所属系列（搜索结果跳转用：拿到主题 id 后要知道进哪个系列） */
export function getSeriesByTopicId(topicId: string): TutorialSeries | undefined {
  return TUTORIAL_SERIES.find((series) =>
    series.stages.some((stage) =>
      stage.topics?.some((topic) => topic.id === topicId) ||
      stage.subcategories?.some((sub) => sub.topics.some((topic) => topic.id === topicId))
    )
  );
}

