import { cloudFunctions } from '@/firebase/functions';

export interface AiSuggestionResult {
  causeSupplement: string;
  improvements: string[];
  prevention: string;
  similarReflectionIds: string[];
}

/**
 * Cloud Functions側の generateSuggestion は工程13（AI機能追加）で実装・デプロイする。
 * それまでは呼び出しが失敗するため、呼び出し元でエラーを捕捉し
 * 「自分で入力する」への切り替えを促す。
 */
export async function requestAiSuggestion(reflectionId: string): Promise<AiSuggestionResult> {
  const callable = cloudFunctions.httpsCallable('generateSuggestion');
  const response = await callable({ reflectionId });
  return response.data as AiSuggestionResult;
}
