import { categoriesCollection, db } from '@/firebase/firestore';
import { DEFAULT_CATEGORIES } from '@/constants/reflections';
import type { Category } from '@/types/reflection';

const DEFAULT_COLORS = ['#2f6f4e', '#4c7fb0', '#b0864c', '#a15b8f', '#5c8f6f', '#9a9f92'];

export const categoriesRepository = {
  async list(uid: string): Promise<Category[]> {
    const snap = await categoriesCollection(uid).orderBy('order').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Category, 'id'>) }));
  },

  /** 新規ユーザーの初回サインイン時に、デフォルトカテゴリ6件を生成する */
  async createDefaultsIfMissing(uid: string): Promise<void> {
    const snap = await categoriesCollection(uid).limit(1).get();
    if (!snap.empty) return;

    const batch = db.batch();
    DEFAULT_CATEGORIES.forEach((name, index) => {
      const ref = categoriesCollection(uid).doc();
      batch.set(ref, {
        name,
        color: DEFAULT_COLORS[index] ?? '#9a9f92',
        order: index,
        isDefault: true,
      });
    });
    await batch.commit();
  },
};
