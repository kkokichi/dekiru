import { Text, View } from 'react-native';

import type { TimelineStep } from '@/features/reflections/utils/buildTimeline';

export function PdcaTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((step, index) => (
        <View key={step.label} className="flex-row gap-3">
          <View className="items-center">
            <View
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                step.completed ? 'bg-accent dark:bg-accent-dark' : 'bg-border dark:bg-border-dark'
              }`}
            />
            {index < steps.length - 1 && (
              <View
                className="w-px flex-1 bg-border dark:bg-border-dark"
                style={{ minHeight: 28 }}
              />
            )}
          </View>
          <View className="flex-1 pb-4">
            <Text className="text-[11.5px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
              {step.label}
            </Text>
            <Text
              className={`mt-0.5 text-[13.5px] ${
                step.content
                  ? 'text-ink dark:text-ink-dark'
                  : 'text-ink-tertiary dark:text-ink-tertiary-dark'
              }`}
            >
              {step.content ?? 'まだ記録がありません'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
