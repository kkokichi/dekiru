import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { userOnboardingService } from '@/services/userOnboardingService';

import { signInWithApple } from '../services/appleAuth';
import { signInWithEmail, signUpWithEmail } from '../services/emailAuth';
import { signInWithGoogle } from '../services/googleAuth';
import type { EmailAuthFormValues } from '../schemas';
import type { AuthProvider } from '@/repositories/usersRepository';

async function finalizeSignIn(
  result: FirebaseAuthTypes.UserCredential | null,
  fallbackProvider: AuthProvider,
) {
  if (!result) return; // ユーザーがキャンセルした場合
  const { user } = result;
  await userOnboardingService.ensureInitialized(user.uid, {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    authProvider: fallbackProvider,
  });
}

/** サインイン成功時、明示的にホームへ遷移する（authステートの変化を受動的に待つだけだと、
 * すでに /(auth)/login にいる画面では index.tsx の自動リダイレクトが再評価されないため）*/
function useNavigateHomeOnSuccess() {
  const router = useRouter();
  return () => router.replace('/(tabs)/home');
}

export function useGoogleSignIn() {
  const navigateHome = useNavigateHomeOnSuccess();
  return useMutation({
    mutationFn: async () => finalizeSignIn(await signInWithGoogle(), 'google'),
    onSuccess: navigateHome,
  });
}

export function useAppleSignIn() {
  const navigateHome = useNavigateHomeOnSuccess();
  return useMutation({
    mutationFn: async () => finalizeSignIn(await signInWithApple(), 'apple'),
    onSuccess: navigateHome,
  });
}

export function useEmailSignIn() {
  const navigateHome = useNavigateHomeOnSuccess();
  return useMutation({
    mutationFn: async ({ email, password }: EmailAuthFormValues) =>
      finalizeSignIn(await signInWithEmail(email, password), 'password'),
    onSuccess: navigateHome,
  });
}

export function useEmailSignUp() {
  const navigateHome = useNavigateHomeOnSuccess();
  return useMutation({
    mutationFn: async ({ email, password }: EmailAuthFormValues) =>
      finalizeSignIn(await signUpWithEmail(email, password), 'password'),
    onSuccess: navigateHome,
  });
}
