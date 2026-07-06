import { firebaseAuth } from '@/firebase/auth';

export async function signInWithEmail(email: string, password: string) {
  return firebaseAuth.signInWithEmailAndPassword(email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return firebaseAuth.createUserWithEmailAndPassword(email, password);
}
