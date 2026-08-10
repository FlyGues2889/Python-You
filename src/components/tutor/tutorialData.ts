export interface TutorialTopic {
  id: string;
  title: string;
  stage: string;
  summary: string;
  content: {
    overview: string;
    sections: {
      heading: string;
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

import { stage1 } from './data/stage1';
import { stage2 } from './data/stage2';
import { stage3 } from './data/stage3';
import { stage4 } from './data/stage4';
import { stage5 } from './data/stage5';
import { stage6 } from './data/stage6';
import { cmdHelp } from './data/cmdHelp';

export const TUTORIAL_STAGES: TutorialStage[] = [
  stage1,
  stage2,
  stage3,
  stage4,
  stage5,
  stage6,
  cmdHelp,
];

// 扁平化所有主题，用于全局搜索与上下篇导航
export function getAllTutorialTopics(): TutorialTopic[] {
  const topics: TutorialTopic[] = [];
  for (const stage of TUTORIAL_STAGES) {
    if (stage.topics) {
      topics.push(...stage.topics);
    }
    if (stage.subcategories) {
      for (const sub of stage.subcategories) {
        topics.push(...sub.topics);
      }
    }
  }
  return topics;
}

export function getLocalizedTutorialStages(): TutorialStage[] {
  return TUTORIAL_STAGES;
}
