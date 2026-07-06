import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CategoryTag, PriorityPill, StatusPill } from '@/components/pills';
import { PdcaTimeline } from '@/components/PdcaTimeline';

import { useCategories } from '../hooks/useCategories';
import { useReflection } from '../hooks/useReflections';
import { buildTimeline } from '../utils/buildTimeline';

export function DetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: reflection, isLoading } = useReflection(id);
  const { data: categories = [] } = useCategories();

  if (isLoading || !reflection) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
        <ActivityIndicator color="#2f6f4e" />
      </View>
    );
  }

  const categoryName = categories.find((c) => c.id === reflection.categoryId)?.name ?? '未分類';
  const timeline = buildTimeline(reflection);

  return (
    <ScrollView
      className="flex-1 bg-bg dark:bg-bg-dark"
      contentContainerStyle={{ padding: 16, gap: 20 }}
    >
      <View className="gap-2">
        <Text className="text-[20px] font-bold text-ink dark:text-ink-dark">
          {reflection.title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-1.5">
          <CategoryTag name={categoryName} />
          <StatusPill status={reflection.status} />
          {reflection.improvement ? (
            <PriorityPill priority={reflection.improvement.priority} />
          ) : null}
        </View>
      </View>

      <PdcaTimeline steps={timeline} />

      {(reflection.status === 'recorded' || reflection.status === 'analyzed') && (
        <Button label="続きを入力する" onPress={() => router.push(`/wizard?id=${reflection.id}`)} />
      )}

      {(reflection.status === 'planned' || reflection.status === 'in_progress') && (
        <Button label="実践を記録する" onPress={() => router.push(`/practice/${reflection.id}`)} />
      )}
    </ScrollView>
  );
}
