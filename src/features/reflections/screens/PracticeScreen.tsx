import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { useAuth } from '@/providers/AuthProvider';
import { reflectionsRepository } from '@/repositories/reflectionsRepository';

import { useInvalidateReflections, useReflection } from '../hooks/useReflections';

export function PracticeScreen({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: reflection, isLoading } = useReflection(id);
  const invalidate = useInvalidateReflections();
  const [choosingNewDueDate, setChoosingNewDueDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !reflection || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
        <ActivityIndicator color="#2f6f4e" />
      </View>
    );
  }

  const markDone = async () => {
    setSubmitting(true);
    try {
      await reflectionsRepository.recordPractice(user.uid, id, {
        status: 'done',
        reportedAt: new Date(),
      });
      invalidate();
      router.replace(`/effect/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const markSkipped = async () => {
    setSubmitting(true);
    try {
      await reflectionsRepository.recordPractice(
        user.uid,
        id,
        { status: 'skipped', reportedAt: new Date() },
        newDueDate,
      );
      invalidate();
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-bg dark:bg-bg-dark"
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View className="gap-2">
        <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
          実践を記録する
        </Text>
        <Text className="text-[18px] font-bold text-ink dark:text-ink-dark">
          {reflection.improvement?.action}
        </Text>
      </View>

      {!choosingNewDueDate ? (
        <View className="gap-3">
          <Button label="実施した" onPress={markDone} loading={submitting} />
          <Button label="未実施" variant="secondary" onPress={() => setChoosingNewDueDate(true)} />
        </View>
      ) : (
        <View className="gap-4">
          <DateField label="新しい期限" value={newDueDate} onChange={setNewDueDate} />
          <Button label="この期限で保存する" onPress={markSkipped} loading={submitting} />
          <Button label="戻る" variant="ghost" onPress={() => setChoosingNewDueDate(false)} />
        </View>
      )}
    </ScrollView>
  );
}
