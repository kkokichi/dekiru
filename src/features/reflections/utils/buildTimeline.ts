import type { Reflection } from '@/types/reflection';

export interface TimelineStep {
  label: string;
  content: string | null;
  completed: boolean;
}

const EFFECT_LABEL: Record<NonNullable<Reflection['effect']>['result'], string> = {
  improved: '改善した',
  slightly_improved: '少し改善した',
  no_change: '変わらない',
  worsened: '悪化した',
};

export function buildTimeline(reflection: Reflection): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: '登録', content: reflection.detail || reflection.title, completed: true },
    {
      label: '原因分析',
      content: reflection.causes.length > 0 ? reflection.causes.join(' / ') : null,
      completed: reflection.causes.length > 0,
    },
    {
      label: 'AI提案',
      content: reflection.aiSuggestion ? reflection.aiSuggestion.improvements.join(' / ') : null,
      completed: !!reflection.aiSuggestion,
    },
    {
      label: '改善策',
      content: reflection.improvement
        ? `${reflection.improvement.action}（期限 ${reflection.improvement.dueDate.toLocaleDateString('ja-JP')}）`
        : null,
      completed: !!reflection.improvement,
    },
  ];

  const practiceCompleted = !!reflection.practice;
  const effectCompleted = !!reflection.effect;
  let doAndCheckContent: string | null = null;
  if (practiceCompleted && reflection.practice) {
    doAndCheckContent =
      reflection.practice.status === 'done' ? '実施した' : '未実施（期限を再設定）';
  }
  if (effectCompleted && reflection.effect) {
    doAndCheckContent = `${doAndCheckContent ?? ''} → ${EFFECT_LABEL[reflection.effect.result]}`;
  }

  steps.push({
    label: '実践・効果確認',
    content: doAndCheckContent,
    completed: effectCompleted,
  });

  return steps;
}
