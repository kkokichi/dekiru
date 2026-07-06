import { categoriesRepository } from '@/repositories/categoriesRepository';
import { usersRepository, type AuthProvider } from '@/repositories/usersRepository';

/**
 * 本来はCloud Functionsの onUserCreate トリガーで行う想定（アーキテクチャ設計参照）だが、
 * Cloud Functionsのデプロイには Blaze プラン契約が必要なため、契約判断が済むまでの
 * 暫定措置としてクライアント側で初回プロフィール・デフォルトカテゴリ作成を行う。
 * Blaze契約後は functions/src/triggers/onUserCreate.ts に移行し、ここは削除する。
 */
export const userOnboardingService = {
  async ensureInitialized(
    uid: string,
    info: { displayName: string; email: string; authProvider: AuthProvider },
  ): Promise<void> {
    const alreadyExists = await usersRepository.exists(uid);
    if (!alreadyExists) {
      await usersRepository.create(uid, info);
    }
    await categoriesRepository.createDefaultsIfMissing(uid);
  },
};
