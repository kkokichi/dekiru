import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useMutation } from '@tanstack/react-query';

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

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async () => finalizeSignIn(await signInWithGoogle(), 'google'),
  });
}

export function useAppleSignIn() {
  return useMutation({
    mutationFn: async () => finalizeSignIn(await signInWithApple(), 'apple'),
  });
}

export function useEmailSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: EmailAuthFormValues) =>
      finalizeSignIn(await signInWithEmail(email, password), 'password'),
  });
}

export function useEmailSignUp() {
  return useMutation({
    mutationFn: async ({ email, password }: EmailAuthFormValues) =>
      finalizeSignIn(await signUpWithEmail(email, password), 'password'),
  });
}
