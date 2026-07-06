import type { CAUSES } from '@/constants/reflections';

export type ReflectionStatus = 'recorded' | 'analyzed' | 'planned' | 'in_progress' | 'done';

export type Cause = (typeof CAUSES)[number];

export type Importance = 'low' | 'medium' | 'high';

export interface AiSuggestion {
  causeSupplement: string;
  improvements: string[];
  prevention: string;
  similarReflectionIds: string[];
  generatedAt: Date;
}

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface Improvement {
  action: string;
  dueDate: Date;
  priority: Importance;
  checklist: ChecklistItem[];
}

export interface Practice {
  status: 'done' | 'skipped';
  reportedAt: Date;
}

export interface Effect {
  result: 'improved' | 'slightly_improved' | 'no_change' | 'worsened';
  confirmedAt: Date;
}

export interface Reflection {
  id: string;
  title: string;
  detail: string;
  categoryId: string;
  emotion: 1 | 2 | 3 | 4 | 5;
  importance: Importance;
  occurredAt: Date;
  causes: Cause[];
  causeNote: string | null;
  aiSuggestion: AiSuggestion | null;
  improvement: Improvement | null;
  practice: Practice | null;
  effect: Effect | null;
  status: ReflectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 一覧・ホームのカード表示に必要な最小限のフィールドのみを持つ軽量型 */
export type ReflectionSummary = Pick<
  Reflection,
  'id' | 'title' | 'categoryId' | 'emotion' | 'status' | 'occurredAt'
> & {
  dueDate: Date | null;
  priority: Importance | null;
};

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  doneCount: number;
  improvedCount: number;
  improvementRate: number | null;
}
