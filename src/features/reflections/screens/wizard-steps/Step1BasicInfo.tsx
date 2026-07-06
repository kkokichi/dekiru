import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/ChoiceChips';
import { DateField } from '@/components/DateField';
import { EmotionPicker } from '@/components/EmotionPicker';
import { Input } from '@/components/Input';
import { useCategories } from '@/features/reflections/hooks/useCategories';
import { basicInfoSchema, type BasicInfoFormValues } from '@/features/reflections/schemas';

interface Step1Props {
  defaultValues: BasicInfoFormValues;
  onSubmit: (values: BasicInfoFormValues) => void;
  submitting: boolean;
}

export function Step1BasicInfo({ defaultValues, onSubmit, submitting }: Step1Props) {
  const { data: categories = [] } = useCategories();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({ resolver: zodResolver(basicInfoSchema), defaultValues });

  return (
    <ScrollView
      contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="タイトル"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="例: 会議で発言できなかった"
            error={errors.title?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="detail"
        render={({ field }) => (
          <Input
            label="詳細"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="状況を詳しく書いてみましょう"
            multiline
            error={errors.detail?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <ChoiceChips
            label="カテゴリ"
            value={field.value || null}
            onChange={field.onChange}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        )}
      />
      <Controller
        control={control}
        name="emotion"
        render={({ field }) => (
          <View className="gap-1.5">
            <EmotionPicker value={field.value} onChange={field.onChange} />
          </View>
        )}
      />
      <Controller
        control={control}
        name="importance"
        render={({ field }) => (
          <ChoiceChips
            label="重要度"
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
      <Controller
        control={control}
        name="occurredAt"
        render={({ field }) => (
          <DateField
            label="発生日時"
            value={field.value}
            onChange={field.onChange}
            mode="datetime"
          />
        )}
      />
      <Button label="次へ" onPress={handleSubmit(onSubmit)} loading={submitting} />
    </ScrollView>
  );
}
