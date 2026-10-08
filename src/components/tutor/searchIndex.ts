// 教程内容搜索索引：主题（标题 + 摘要）与「函数 / 方法 / API」条目。
//
// API 条目直接从各主题的表格里派生 —— 参考手册与各系列的速查表本来就是「名称 + 说明」
// 两列结构，手写一份索引副本必然与正文漂移（改了表忘了改索引），所以按表头判断类型、
// 按行提取名称。表格里的名称有两种排布：
//   1) 名称在首列（如 `split(sep)`、`json.loads(s)`、`-c cmd`）；
//   2) 首列是中文分类、第二列是逗号分隔的名称清单（如内建函数表的「数值计算 | abs, divmod, …」），
//      这时把清单拆成多个条目，说明取最后一列。
import { TUTORIAL_SERIES, type TutorialTopic } from './tutorialData';

export type ApiKind = 'function' | 'method' | 'module' | 'keyword' | 'exception' | 'command' | 'api';

export interface ApiEntry {
  name: string;
  kind: ApiKind;
  /** 表格里该行的说明（最后一列） */
  detail: string;
  topicId: string;
  topicTitle: string;
  seriesTitle: string;
}

export interface TopicEntry {
  topicId: string;
  title: string;
  summary: string;
  seriesTitle: string;
  stageTitle: string;
}

export interface SearchResults {
  topics: TopicEntry[];
  apis: ApiEntry[];
  total: number;
}

/** 表头 → 条目类型（表头写的什么，条目就是什么） */
const kindFromHeader = (header: string): ApiKind => {
  if (header.includes('方法')) return 'method';
  if (header.includes('函数')) return 'function';
  if (header.includes('关键字')) return 'keyword';
  if (header.includes('异常')) return 'exception';
  if (header.includes('模块')) return 'module';
  if (header.includes('命令') || header.includes('子命令') || header.includes('开关')) return 'command';
  return 'api';
};

// 名称候选：ASCII 标识符 / 签名 / 命令行开关样式，且不含中文（中文首列是分类，不是名称）
const NAME_LIKE = /^[\w.[\](){}'"<>=+\-*/%:,!?|&^~@ ]{1,42}$/;
const looksLikeName = (s: string) => NAME_LIKE.test(s) && /[A-Za-z_]/.test(s) && !/[一-鿿]/.test(s);

// 逗号分隔清单里的单个名称（abs / math.sin / False）
const TOKEN_LIKE = /^[A-Za-z_][\w.]*$/;

const splitNameList = (cell: string): string[] => {
  const tokens = cell.split(',').map((t) => t.trim()).filter(Boolean);
  if (tokens.length < 2) return [];
  // 要求全部元素都是裸名称：混进说明文字（含空格、中文）时整行放弃
  return tokens.every((t) => TOKEN_LIKE.test(t)) ? tokens : [];
};

interface Index {
  apis: ApiEntry[];
  topics: TopicEntry[];
}

const buildIndex = (): Index => {
  const apis: ApiEntry[] = [];
  const topics: TopicEntry[] = [];
  const seen = new Set<string>();

  const addApi = (name: string, kind: ApiKind, detail: string, topic: TopicEntry) => {
    const key = topic.topicId + '|' + name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    apis.push({
      name,
      kind,
      detail,
      topicId: topic.topicId,
      topicTitle: topic.title,
      seriesTitle: topic.seriesTitle,
    });
  };

  for (const series of TUTORIAL_SERIES) {
    for (const stage of series.stages) {
      const topicList: TutorialTopic[] = [...(stage.topics || [])];
      for (const sub of stage.subcategories || []) topicList.push(...sub.topics);

      for (const topic of topicList) {
        const entry: TopicEntry = {
          topicId: topic.id,
          title: topic.title,
          summary: topic.summary,
          seriesTitle: series.title,
          stageTitle: stage.title,
        };
        topics.push(entry);

        for (const section of topic.content.sections) {
          const table = section.table;
          if (!table || table.rows.length === 0) continue;
          const kind = kindFromHeader(table.headers[0] || '');
          for (const row of table.rows) {
            const first = (row[0] || '').trim();
            const detail = (row[row.length - 1] || '').trim();
            if (looksLikeName(first)) {
              addApi(first, kind, detail, entry);
              continue;
            }
            // 中文分类 + 逗号分隔名称清单（内建函数 / 关键字这类表）
            const tokens = splitNameList((row[1] || '').trim());
            for (const token of tokens) addApi(token, kind, detail, entry);
          }
        }
      }
    }
  }
  return { apis, topics };
};

const INDEX = buildIndex();

/** 名称命中：完全相等 → 前缀 → 包含，越靠前越优先；再短的优先 */
const nameScore = (name: string, q: string): number => {
  const lower = name.toLowerCase();
  if (lower === q) return 0;
  if (lower.startsWith(q)) return 1;
  if (lower.includes(q)) return 2;
  return -1;
};

export const searchTutor = (query: string, limit = 80): SearchResults => {
  const q = query.trim().toLowerCase();
  if (!q) return { topics: [], apis: [], total: 0 };

  const apis = INDEX.apis
    .map((e) => ({ e, score: nameScore(e.name, q) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.e.name.length - b.e.name.length)
    .slice(0, limit)
    .map((x) => x.e);

  const topics = INDEX.topics
    .map((t) => {
      const title = t.title.toLowerCase();
      let score = title.includes(q) ? (title.startsWith(q) ? 0 : 1) : -1;
      if (score < 0 && t.summary.toLowerCase().includes(q)) score = 2;
      // 系列名 / 阶段名命中排在最后：搜「数据库」「参考手册」能列出整册
      if (score < 0 && (t.seriesTitle.toLowerCase().includes(q) || t.stageTitle.toLowerCase().includes(q))) {
        score = 3;
      }
      return { t, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.t.title.length - b.t.title.length)
    .slice(0, limit)
    .map((x) => x.t);

  return { topics, apis, total: apis.length + topics.length };
};

/** 供调试与验证：索引规模 */
export const searchIndexSize = () => ({ apis: INDEX.apis.length, topics: INDEX.topics.length });
