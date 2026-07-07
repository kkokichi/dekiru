import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/AuthProvider';
import { reflectionsRepository } from '@/repositories/reflectionsRepository';
import type { AiSuggestionResult } from '@/features/reflections/services/aiSuggestionService';
import type { BasicInfoFormValues, ImprovementFormValues } from '@/features/reflections/schemas';
import type { Cause } from '@/types/reflection';

import { useInvalidateReflections, useReflection } from '../hooks/useReflections';
import { Step1BasicInfo } from './wizard-steps/Step1BasicInfo';
import { Step2Causes } from './wizard-steps/Step2Causes';
import { Step3AiSuggestion } from './wizard-steps/Step3AiSuggestion';
import { Step4Improvement } from './wizard-steps/Step4Improvement';

type WizardStep = 1 | 2 | 3 | 4;

interface WizardScreenProps {
  resumeId?: string;
}

const STEP_LABEL: Record<WizardStep, string> = {
  1: '基本情報',
  2: '原因分析',
  3: 'AI提案',
  4: '改善策確定',
};

export function WizardScreen({ resumeId }: WizardScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: existing, isLoading: loadingExisting } = useReflection(resumeId);
  const invalidate = useInvalidateReflections();

  const [step, setStep] = useState<WizardStep>(resumeId ? 2 : 1);
  const [reflectionId, setReflectionId] = useState<string | null>(resumeId ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [adoptedAction, setAdoptedAction] = useState<string | null>(null);

  if (resumeId && loadingExisting) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
        <ActivityIndicator color="#2f6f4e" />
      </View>
    );
  }

  const handleStep1Submit = async (values: BasicInfoFormValues) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const id = await reflectionsRepository.create(user.uid, values);
      setReflectionId(id);
      invalidate();
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = async (causes: Cause[], note: string) => {
    if (!user || !reflectionId) return;
    setSubmitting(true);
    try {
      await reflectionsRepository.updateCauses(user.uid, reflectionId, causes, note || null);
      invalidate();
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSuggestion = async (suggestion: AiSuggestionResult) => {
    if (!user || !reflectionId) return;
    await reflectionsRepository.saveAiSuggestion(user.uid, reflectionId, suggestion);
    invalidate();
  };

  const handleAdopt = (text: string) => {
    setAdoptedAction(text);
    setStep(4);
  };

  const handleStep4Submit = async (values: ImprovementFormValues) => {
    if (!user || !reflectionId) return;
    setSubmitting(true);
    try {
      await reflectionsRepository.confirmImprovement(user.uid, reflectionId, values);
      invalidate();
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-5 dark:bg-bg-dark" style={{ paddingTop: insets.top + 12 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 flex-row gap-1.5">
          {([1, 2, 3, 4] as WizardStep[]).map((s) => (
            <View
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? 'bg-accent dark:bg-accent-dark' : 'bg-border dark:bg-border-dark'
              }`}
            />
          ))}
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="ml-4 p-1"
        >
          <Text className="text-[20px] text-ink-tertiary dark:text-ink-tertiary-dark">×</Text>
        </Pressable>
      </View>

      <Text className="mb-1 text-[11.5px] font-semibold text-ink-tertiary dark:text-ink-tertiary-dark">
        STEP {step} / 4
      </Text>
      <Text className="mb-5 text-[18px] font-bold text-ink dark:text-ink-dark">
        {STEP_LABEL[step]}
      </Text>

      {step === 1 && (
        <Step1BasicInfo
          defaultValues={{
            title: existing?.title ?? '',
            detail: existing?.detail ?? '',
            categoryId: existing?.categoryId ?? '',
            emotion: existing?.emotion ?? 3,
            importance: existing?.importance ?? 'medium',
            occurredAt: existing?.occurredAt ?? new Date(),
          }}
          onSubmit={handleStep1Submit}
          submitting={submitting}
        />
      )}

      {step === 2 && (
        <Step2Causes
          defaultCauses={existing?.causes ?? []}
          defaultNote={existing?.causeNote ?? ''}
          onSubmit={handleStep2Submit}
          submitting={submitting}
        />
      )}

      {step === 3 && reflectionId && (
        <Step3AiSuggestion
          reflectionId={reflectionId}
          onSaveSuggestion={handleSaveSuggestion}
          onAdopt={handleAdopt}
          onSkip={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step4Improvement
          defaultValues={{
            action: adoptedAction ?? existing?.improvement?.action ?? '',
            dueDate: existing?.improvement?.dueDate ?? new Date(),
            priority: existing?.improvement?.priority ?? 'medium',
            checklist: existing?.improvement?.checklist ?? [],
          }}
          onSubmit={handleStep4Submit}
          submitting={submitting}
        />
      )}
    </View>
  );
}
