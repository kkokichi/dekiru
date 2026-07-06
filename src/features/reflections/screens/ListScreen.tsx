import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ReflectionListCard } from '@/components/ReflectionListCard';
import type { ReflectionStatus } from '@/types/reflection';

import { useCategories } from '../hooks/useCategories';
import { useReflectionsList } from '../hooks/useReflections';

const STATUS_FILTERS: { value: ReflectionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'recorded', label: '未分析' },
  { value: 'planned', label: '未対応' },
  { value: 'in_progress', label: '実践報告待ち' },
  { value: 'done', label: '完了' },
];

export function ListScreen() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: reflections = [], isLoading } = useReflectionsList();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | 'all'>('all');
  const [status, setStatus] = useState<ReflectionStatus | 'all'>('all');

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '未分類';

  const filtered = useMemo(() => {
    return reflections.filter((r) => {
      if (categoryId !== 'all' && r.categoryId !== categoryId) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (query.trim() && !r.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [reflections, categoryId, status, query]);

  return (
    <View className="flex-1 bg-bg px-4 pt-3 dark:bg-bg-dark">
      <View className="mb-3 flex-row items-center gap-2 rounded-control bg-surface-sunken px-3.5 py-2.5 dark:bg-surface-sunken-dark">
        <Text className="text-ink-tertiary dark:text-ink-tertiary-dark">🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="振り返りを検索"
          placeholderTextColor="#9a9f92"
          className="flex-1 text-[14px] text-ink dark:text-ink-dark"
          accessibilityLabel="振り返りを検索"
        />
      </View>

      <View className="mb-2 flex-row flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setStatus(f.value)}
              className={`rounded-full px-3 py-1.5 ${
                active
                  ? 'bg-accent dark:bg-accent-dark'
                  : 'bg-surface-sunken dark:bg-surface-sunken-dark'
              }`}
              style={{ minHeight: 32 }}
            >
              <Text
                className={`text-[12px] font-medium ${
                  active ? 'text-white' : 'text-ink-secondary dark:text-ink-secondary-dark'
                }`}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mb-3 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => setCategoryId('all')}
          className={`rounded-full px-3 py-1.5 ${
            categoryId === 'all'
              ? 'bg-accent dark:bg-accent-dark'
              : 'bg-surface-sunken dark:bg-surface-sunken-dark'
          }`}
        >
          <Text
            className={`text-[12px] font-medium ${
              categoryId === 'all'
                ? 'text-white'
                : 'text-ink-secondary dark:text-ink-secondary-dark'
            }`}
          >
            全カテゴリ
          </Text>
        </Pressable>
        {categories.map((c) => {
          const active = categoryId === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCategoryId(c.id)}
              className={`rounded-full px-3 py-1.5 ${
                active
                  ? 'bg-accent dark:bg-accent-dark'
                  : 'bg-surface-sunken dark:bg-surface-sunken-dark'
              }`}
            >
              <Text
                className={`text-[12px] font-medium ${
                  active ? 'text-white' : 'text-ink-secondary dark:text-ink-secondary-dark'
                }`}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <ReflectionListCard
            reflection={item}
            categoryName={categoryName(item.categoryId)}
            onPress={(id) => router.push(`/reflection/${id}`)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? <EmptyState message="条件に一致する振り返りがありません" /> : null
        }
      />
    </View>
  );
}
