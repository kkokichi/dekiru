import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import {
  requestAiSuggestion,
  type AiSuggestionResult,
} from '@/features/reflections/services/aiSuggestionService';

interface Step3Props {
  reflectionId: string;
  onSaveSuggestion: (suggestion: AiSuggestionResult) => Promise<void>;
  onAdopt: (improvementText: string) => void;
  onSkip: () => void;
}

export function Step3AiSuggestion({ reflectionId, onSaveSuggestion, onAdopt, onSkip }: Step3Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AiSuggestionResult | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestAiSuggestion(reflectionId);
      setSuggestion(result);
      await onSaveSuggestion(result);
    } catch {
      setError(
        'AI提案を取得できませんでした。しばらくしてから再度お試しいただくか、自分で入力して進めてください。',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      {!suggestion && !loading && !error && (
        <View className="gap-4">
          <Text className="text-[13.5px] text-ink-secondary dark:text-ink-secondary-dark">
            AIが原因の補足・改善策・再発防止策を提案します。
          </Text>
          <Button label="AIに相談する" onPress={handleRequest} />
          <Button label="自分で入力する" variant="ghost" onPress={onSkip} />
        </View>
      )}

      {loading && (
        <View className="items-center gap-3 py-10">
          <ActivityIndicator color="#2f6f4e" />
          <Text className="text-[13px] text-ink-secondary dark:text-ink-secondary-dark">
            考えています…
          </Text>
        </View>
      )}

      {error && (
        <View className="gap-4">
          <Text className="text-center text-[13px] text-danger dark:text-danger-dark">{error}</Text>
          <Button label="自分で入力する" onPress={onSkip} />
        </View>
      )}

      {suggestion && (
        <View className="gap-3">
          <View className="rounded-2xl border border-accent-soft bg-accent-soft p-3.5 dark:border-accent-soft-dark dark:bg-accent-soft-dark">
            <Text className="mb-1 text-[12px] font-bold text-accent-strong dark:text-accent-strong-dark">
              原因の補足
            </Text>
            <Text className="text-[13px] text-ink dark:text-ink-dark">
              {suggestion.causeSupplement}
            </Text>
          </View>

          <View className="rounded-2xl border border-accent-soft bg-accent-soft p-3.5 dark:border-accent-soft-dark dark:bg-accent-soft-dark">
            <Text className="mb-2 text-[12px] font-bold text-accent-strong dark:text-accent-strong-dark">
              改善策の提案
            </Text>
            <View className="gap-2">
              {suggestion.improvements.map((text, index) => (
                <Pressable
                  key={index}
                  onPress={() => onAdopt(text)}
                  className="flex-row items-center justify-between rounded-xl bg-surface px-3 py-2.5 dark:bg-surface-dark"
                  style={{ minHeight: 44 }}
                >
                  <Text className="flex-1 pr-2 text-[13px] text-ink dark:text-ink-dark">
                    {text}
                  </Text>
                  <Text className="text-[12px] font-semibold text-accent dark:text-accent-dark">
                    採用する
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="rounded-2xl border border-accent-soft bg-accent-soft p-3.5 dark:border-accent-soft-dark dark:bg-accent-soft-dark">
            <Text className="mb-1 text-[12px] font-bold text-accent-strong dark:text-accent-strong-dark">
              再発防止策
            </Text>
            <Text className="text-[13px] text-ink dark:text-ink-dark">{suggestion.prevention}</Text>
          </View>

          <Button label="自分で入力する" variant="ghost" onPress={onSkip} />
        </View>
      )}
    </ScrollView>
  );
}
