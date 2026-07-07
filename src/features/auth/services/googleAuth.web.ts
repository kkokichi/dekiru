import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { firebaseConfig } from '@/firebase/config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

export async function signOutFromGoogle() {
  // Web版はFirebase自体のセッションをsignOutすれば十分なため何もしない
}
