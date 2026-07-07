import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

import { firebaseAuth } from '@/firebase/auth';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
  if (!webClientId) {
    throw new Error(
      'googleWebClientId が app.json の extra に設定されていません。Firebase ConsoleでGoogleサインインを有効化した後、Web用クライアントIDを設定してください。',
    );
  }
  GoogleSignin.configure({ webClientId });
  configured = true;
}

export async function signInWithGoogle() {
  ensureConfigured();
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') {
    return null; // ユーザーがキャンセルした場合
  }
  const { idToken } = response.data;
  if (!idToken) {
    throw new Error('Googleサインインからidトークンを取得できませんでした。');
  }
  const credential = auth.GoogleAuthProvider.credential(idToken);
  return firebaseAuth.signInWithCredential(credential);
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Googleでサインインしていない場合はエラーになるが無視してよい
  }
}
