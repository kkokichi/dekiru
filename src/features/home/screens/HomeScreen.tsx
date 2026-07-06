import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ReflectionListCard } from '@/components/ReflectionListCard';
import { useCategories } from '@/features/reflections/hooks/useCategories';
import { useReflectionsList } from '@/features/reflections/hooks/useReflections';

import { useWeeklyStats } from '../hooks/useWeeklyStats';

export function HomeScreen() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: stats } = useWeeklyStats();
  const { data: unresolved = [], isLoading: unresolvedLoading } = useReflectionsList({
    statuses: ['planned', 'in_progress'],
  });
  const { data: recentFailures = [], isLoading: recentLoading } = useReflectionsList({
    statuses: ['recorded', 'analyzed'],
  });

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '未分類';

  const sortedUnresolved = [...unresolved].sort((a, b) => {
    const aDue = a.improvement?.dueDate.getTime() ?? Infinity;
    const bDue = b.improvement?.dueDate.getTime() ?? Infinity;
    return aDue - bDue;
  });

  return (
    <ScrollView
      className="flex-1 bg-bg dark:bg-bg-dark"
      contentContainerStyle={{ padding: 16, gap: 24 }}
    >
      <View>
        <Text className="text-[19px] font-bold text-ink dark:text-ink-dark">おかえりなさい</Text>
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 rounded-card border border-border bg-surface p-3.5 dark:border-border-dark dark:bg-surface-dark">
          <Text className="text-[26px] font-bold text-accent dark:text-accent-dark">
            {stats?.improvementRate != null ? `${Math.round(stats.improvementRate * 100)}%` : '—'}
          </Text>
          <Text className="mt-0.5 text-[11.5px] text-ink-secondary dark:text-ink-secondary-dark">
            今週の改善率
          </Text>
        </View>
        <View className="flex-1 rounded-card border border-border bg-surface p-3.5 dark:border-border-dark dark:bg-surface-dark">
          <Text className="text-[26px] font-bold text-accent dark:text-accent-dark">
            {stats?.doneCount ?? '—'}
          </Text>
          <Text className="mt-0.5 text-[11.5px] text-ink-secondary dark:text-ink-secondary-dark">
            今週完了した振り返り
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
          未対応の改善策
        </Text>
        {!unresolvedLoading && sortedUnresolved.length === 0 ? (
          <EmptyState message="未対応の改善策はありません" />
        ) : (
          <View className="gap-2.5">
            {sortedUnresolved.map((r) => (
              <ReflectionListCard
                key={r.id}
                reflection={r}
                categoryName={categoryName(r.categoryId)}
                onPress={(id) => router.push(`/reflection/${id}`)}
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-2.5">
        <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
          最近の失敗
        </Text>
        {!recentLoading && recentFailures.length === 0 ? (
          <EmptyState message="まだ振り返りがありません。右下の+から記録してみましょう" />
        ) : (
          <View className="gap-2.5">
            {recentFailures.slice(0, 3).map((r) => (
              <ReflectionListCard
                key={r.id}
                reflection={r}
                categoryName={categoryName(r.categoryId)}
                onPress={(id) => router.push(`/reflection/${id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
