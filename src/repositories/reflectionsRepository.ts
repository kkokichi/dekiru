import { docExists, FieldValue, reflectionsCollection, Timestamp } from '@/firebase/firestore';
import type {
  Cause,
  Effect,
  Importance,
  Improvement,
  Practice,
  Reflection,
  ReflectionStatus,
} from '@/types/reflection';

import { toReflection } from './mappers';

export interface NewReflectionInput {
  title: string;
  detail: string;
  categoryId: string;
  emotion: 1 | 2 | 3 | 4 | 5;
  importance: Importance;
  occurredAt: Date;
}

export interface ReflectionFilter {
  categoryId?: string;
  statuses?: ReflectionStatus[];
}

export const reflectionsRepository = {
  async create(uid: string, input: NewReflectionInput): Promise<string> {
    const ref = await reflectionsCollection(uid).add({
      ...input,
      occurredAt: Timestamp.fromDate(input.occurredAt),
      causes: [],
      causeNote: null,
      aiSuggestion: null,
      improvement: null,
      practice: null,
      effect: null,
      status: 'recorded' satisfies ReflectionStatus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async updateCauses(
    uid: string,
    id: string,
    causes: Cause[],
    causeNote: string | null,
  ): Promise<void> {
    await reflectionsCollection(uid)
      .doc(id)
      .update({
        causes,
        causeNote,
        status: 'analyzed' satisfies ReflectionStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
  },

  async saveAiSuggestion(
    uid: string,
    id: string,
    suggestion: {
      causeSupplement: string;
      improvements: string[];
      prevention: string;
      similarReflectionIds: string[];
    },
  ): Promise<void> {
    await reflectionsCollection(uid)
      .doc(id)
      .update({
        aiSuggestion: { ...suggestion, generatedAt: Timestamp.now() },
        updatedAt: FieldValue.serverTimestamp(),
      });
  },

  async confirmImprovement(uid: string, id: string, improvement: Improvement): Promise<void> {
    await reflectionsCollection(uid)
      .doc(id)
      .update({
        improvement: { ...improvement, dueDate: Timestamp.fromDate(improvement.dueDate) },
        status: 'planned' satisfies ReflectionStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
  },

  async recordPractice(
    uid: string,
    id: string,
    practice: Practice,
    nextDueDate?: Date,
  ): Promise<void> {
    const update: Record<string, unknown> = {
      practice: { ...practice, reportedAt: Timestamp.fromDate(practice.reportedAt) },
      status: 'in_progress' satisfies ReflectionStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (practice.status === 'skipped' && nextDueDate) {
      update['improvement.dueDate'] = Timestamp.fromDate(nextDueDate);
    }
    await reflectionsCollection(uid).doc(id).update(update);
  },

  async confirmEffect(uid: string, id: string, effect: Effect): Promise<void> {
    await reflectionsCollection(uid)
      .doc(id)
      .update({
        effect: { ...effect, confirmedAt: Timestamp.fromDate(effect.confirmedAt) },
        status: 'done' satisfies ReflectionStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
  },

  async getById(uid: string, id: string): Promise<Reflection | null> {
    const doc = await reflectionsCollection(uid).doc(id).get();
    if (!docExists(doc)) return null;
    return toReflection(doc);
  },

  async listByFilter(uid: string, filter: ReflectionFilter = {}): Promise<Reflection[]> {
    // ネイティブ(RNFirebase)とWeb(firebase compat)で型が異なるため、
    // ここでは意図的にanyを使いチェーン可能なクエリビルダーとして扱う。
    let query: any = reflectionsCollection(uid);
    if (filter.categoryId) {
      query = query.where('categoryId', '==', filter.categoryId);
    }
    if (filter.statuses && filter.statuses.length > 0) {
      query = query.where('status', 'in', filter.statuses);
    }
    query = query.orderBy('updatedAt', 'desc');
    const snap = await query.get();
    return snap.docs.map(toReflection);
  },
};
