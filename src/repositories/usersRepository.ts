import firestore from '@react-native-firebase/firestore';

import { userDoc } from '@/firebase/firestore';

export type AuthProvider = 'google' | 'apple' | 'password';

export interface UserProfile {
  displayName: string;
  email: string;
  authProvider: AuthProvider;
  aiUsage: { date: string; count: number };
  settings: { theme: 'system' | 'light' | 'dark' };
}

export const usersRepository = {
  async exists(uid: string): Promise<boolean> {
    const snap = await userDoc(uid).get();
    return snap.exists();
  },

  async create(
    uid: string,
    data: { displayName: string; email: string; authProvider: AuthProvider },
  ): Promise<void> {
    await userDoc(uid).set({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      aiUsage: { date: '', count: 0 },
      settings: { theme: 'system' },
    });
  },

  async updateTheme(uid: string, theme: 'system' | 'light' | 'dark'): Promise<void> {
    await userDoc(uid).update({ 'settings.theme': theme });
  },

  /** アカウント削除確認用に、users/{uid} 配下の全サブコレクションを削除する */
  async deleteAllData(uid: string): Promise<void> {
    const batch = firestore().batch();
    const [reflectionsSnap, categoriesSnap] = await Promise.all([
      userDoc(uid).collection('reflections').get(),
      userDoc(uid).collection('categories').get(),
    ]);
    reflectionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    categoriesSnap.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(userDoc(uid));
    await batch.commit();
  },
};
