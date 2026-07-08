// FCMのバックグラウンド通知を受け取るService Worker。
// アプリを閉じている間のプッシュ通知はここ経由で表示される
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: 'dekiru-8a0f3',
  appId: '1:891598669343:web:4f1b78fa45c54cf22a372a',
  storageBucket: 'dekiru-8a0f3.firebasestorage.app',
  apiKey: 'AIzaSyBOqM1Xx6WOZGEQBQ4F1T6m_nJOlNhb5EI',
  authDomain: 'dekiru-8a0f3.firebaseapp.com',
  messagingSenderId: '891598669343',
});

// notificationペイロード付きのメッセージはSDKが自動で通知を表示する
firebase.messaging();
