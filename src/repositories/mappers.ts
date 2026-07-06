import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import type { Reflection } from '@/types/reflection';

type RawReflection = Omit<
  Reflection,
  | 'id'
  | 'occurredAt'
  | 'createdAt'
  | 'updatedAt'
  | 'aiSuggestion'
  | 'improvement'
  | 'practice'
  | 'effect'
> & {
  occurredAt: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  aiSuggestion:
    | (Omit<NonNullable<Reflection['aiSuggestion']>, 'generatedAt'> & {
        generatedAt: FirebaseFirestoreTypes.Timestamp;
      })
    | null;
  improvement:
    | (Omit<NonNullable<Reflection['improvement']>, 'dueDate'> & {
        dueDate: FirebaseFirestoreTypes.Timestamp;
      })
    | null;
  practice:
    | (Omit<NonNullable<Reflection['practice']>, 'reportedAt'> & {
        reportedAt: FirebaseFirestoreTypes.Timestamp;
      })
    | null;
  effect:
    | (Omit<NonNullable<Reflection['effect']>, 'confirmedAt'> & {
        confirmedAt: FirebaseFirestoreTypes.Timestamp;
      })
    | null;
};

export function toReflection(doc: FirebaseFirestoreTypes.DocumentSnapshot): Reflection {
  const data = doc.data() as RawReflection;

  return {
    id: doc.id,
    ...data,
    occurredAt: data.occurredAt.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    aiSuggestion: data.aiSuggestion
      ? { ...data.aiSuggestion, generatedAt: data.aiSuggestion.generatedAt.toDate() }
      : null,
    improvement: data.improvement
      ? { ...data.improvement, dueDate: data.improvement.dueDate.toDate() }
      : null,
    practice: data.practice
      ? { ...data.practice, reportedAt: data.practice.reportedAt.toDate() }
      : null,
    effect: data.effect ? { ...data.effect, confirmedAt: data.effect.confirmedAt.toDate() } : null,
  };
}
