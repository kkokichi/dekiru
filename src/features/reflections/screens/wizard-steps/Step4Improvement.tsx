import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ChecklistItem } from '@/components/ChecklistItem';
import { ChoiceChips } from '@/components/ChoiceChips';
import { DateField } from '@/components/DateField';
import { Input } from '@/components/Input';
import { improvementSchema, type ImprovementFormValues } from '@/features/reflections/schemas';

interface Step4Props {
  defaultValues: ImprovementFormValues;
  onSubmit: (values: ImprovementFormValues) => void;
  submitting: boolean;
}

export function Step4Improvement({ defaultValues, onSubmit, submitting }: Step4Props) {
  const [newItemText, setNewItemText] = useState('');
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImprovementFormValues>({ resolver: zodResolver(improvementSchema), defaultValues });

  const checklist = watch('checklist');

  const addChecklistItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setValue('checklist', [...checklist, { text, done: false }]);
    setNewItemText('');
  };

  const toggleChecklistItem = (index: number) => {
    setValue(
      'checklist',
      checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="action"
        render={({ field }) => (
          <Input
            label="次回やること"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="例: 会議前に発言メモを3行作る"
            error={errors.action?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="dueDate"
        render={({ field }) => (
          <DateField label="期限" value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <ChoiceChips
            label="優先度"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
            ]}
          />
        )}
      />

      <View className="gap-2">
        <Text className="text-[12.5px] font-semibold text-ink-secondary dark:text-ink-secondary-dark">
          チェックリスト（任意）
        </Text>
        {checklist.map((item, index) => (
          <ChecklistItem
            key={index}
            text={item.text}
            done={item.done}
            onToggle={() => toggleChecklistItem(index)}
          />
        ))}
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              label=""
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="項目を追加"
            />
          </View>
          <Button label="追加" variant="secondary" fullWidth={false} onPress={addChecklistItem} />
        </View>
      </View>

      <Button label="改善策を保存" onPress={handleSubmit(onSubmit)} loading={submitting} />
    </ScrollView>
  );
}
