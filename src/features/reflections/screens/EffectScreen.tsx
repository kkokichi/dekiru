import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { reflectionsRepository } from '@/repositories/reflectionsRepository';
import type { Effect } from '@/types/reflection';

import { useInvalidateReflections, useReflection } from '../hooks/useReflections';

const OPTIONS: { value: Effect['result']; label: string }[] = [
  { value: 'improved', label: '改善した' },
  { value: 'slightly_improved', label: '少し改善した' },
  { value: 'no_change', label: '変わらない' },
  { value: 'worsened', label: '悪化した' },
];

export function EffectScreen({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: reflection, isLoading } = useReflection(id);
  const invalidate = useInvalidateReflections();
  const [submittingValue, setSubmittingValue] = useState<Effect['result'] | null>(null);

  if (isLoading || !reflection || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
        <ActivityIndicator color="#2f6f4e" />
      </View>
    );
  }

  const choose = async (result: Effect['result']) => {
    setSubmittingValue(result);
    try {
      await reflectionsRepository.confirmEffect(user.uid, id, { result, confirmedAt: new Date() });
      invalidate();
      router.replace(`/reflection/${id}`);
    } finally {
      setSubmittingValue(null);
    }
  };

  return (
    <View className="flex-1 bg-bg px-5 py-6 dark:bg-bg-dark">
      <Text className="mb-1 text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
        効果確認
      </Text>
      <Text className="mb-6 text-[18px] font-bold text-ink dark:text-ink-dark">
        「{reflection.improvement?.action}」の効果はどうでしたか？
      </Text>

      <View className="gap-3">
        {OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => choose(option.value)}
            disabled={submittingValue !== null}
            className="items-center justify-center rounded-full border border-border bg-surface py-3.5 dark:border-border-dark dark:bg-surface-dark"
            style={{ minHeight: 48 }}
          >
            {submittingValue === option.value ? (
              <ActivityIndicator color="#2f6f4e" />
            ) : (
              <Text className="text-[14.5px] font-semibold text-ink dark:text-ink-dark">
                {option.label}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
