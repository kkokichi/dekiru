// ── FIREBASE INIT ──
// Firebase Web SDK (compat) はブラウザでもCapacitorのWKWebViewでもそのまま動く。
// Firestoreのアクセス制御はセキュリティルール側で行うため、ここに書くAPIキー等は
// 公開されて問題ない識別子（秘密情報ではない）。
const firebaseConfig = {
  projectId: 'dekiru-8a0f3',
  appId: '1:891598669343:web:4f1b78fa45c54cf22a372a',
  storageBucket: 'dekiru-8a0f3.firebasestorage.app',
  apiKey: 'AIzaSyBOqM1Xx6WOZGEQBQ4F1T6m_nJOlNhb5EI',
  authDomain: 'dekiru-8a0f3.firebaseapp.com',
  messagingSenderId: '891598669343',
  measurementId: 'G-ED70Q6RLHR',
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const cloudFunctions = firebase.functions();
