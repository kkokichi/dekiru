import { Text, View } from 'react-native';

import type { Importance, ReflectionStatus } from '@/types/reflection';

const STATUS_LABEL: Record<ReflectionStatus, string> = {
  recorded: '未分析',
  analyzed: '未対応',
  planned: '未対応',
  in_progress: '実践報告待ち',
  done: '完了',
};

const STATUS_CLASS: Record<ReflectionStatus, string> = {
  recorded: 'bg-surface-sunken dark:bg-surface-sunken-dark',
  analyzed: 'bg-accent-soft dark:bg-accent-soft-dark',
  planned: 'bg-accent-soft dark:bg-accent-soft-dark',
  in_progress: 'bg-danger/15',
  done: 'bg-surface-sunken dark:bg-surface-sunken-dark',
};

const STATUS_TEXT_CLASS: Record<ReflectionStatus, string> = {
  recorded: 'text-ink-secondary dark:text-ink-secondary-dark',
  analyzed: 'text-accent-strong dark:text-accent-strong-dark',
  planned: 'text-accent-strong dark:text-accent-strong-dark',
  in_progress: 'text-danger dark:text-danger-dark',
  done: 'text-ink-tertiary dark:text-ink-tertiary-dark',
};

export function StatusPill({ status }: { status: ReflectionStatus }) {
  return (
    <View className={`rounded-full px-2.5 py-0.5 ${STATUS_CLASS[status]}`}>
      <Text className={`text-[11.5px] font-semibold ${STATUS_TEXT_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const PRIORITY_LABEL: Record<Importance, string> = { low: '低', medium: '中', high: '高' };

export function PriorityPill({ priority }: { priority: Importance }) {
  const isHigh = priority === 'high';
  return (
    <View
      className={`rounded-full px-2.5 py-0.5 ${
        isHigh ? 'bg-danger/15' : 'bg-surface-sunken dark:bg-surface-sunken-dark'
      }`}
    >
      <Text
        className={`text-[11.5px] font-semibold ${
          isHigh
            ? 'text-danger dark:text-danger-dark'
            : 'text-ink-secondary dark:text-ink-secondary-dark'
        }`}
      >
        優先度: {PRIORITY_LABEL[priority]}
      </Text>
    </View>
  );
}

export function CategoryTag({ name }: { name: string }) {
  return (
    <View className="rounded-full bg-surface-sunken px-2.5 py-0.5 dark:bg-surface-sunken-dark">
      <Text className="text-[11.5px] text-ink-secondary dark:text-ink-secondary-dark">{name}</Text>
    </View>
  );
}
