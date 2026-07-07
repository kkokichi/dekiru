// ── AUTH STATE ──
let currentUser = null;

function switchAuthTab(tab) {
  document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('auth-tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('login-form').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'flex' : 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').textContent = '';
}

function authErrorMessage(err) {
  console.error('Firebase error:', err.code, err.message);
  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています。';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/weak-password':
      return 'パスワードは8文字以上で入力してください。';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません。';
    case 'auth/operation-not-allowed':
      return 'メール/パスワード認証が無効です。Firebaseコンソールで有効にしてください。';
    case 'auth/network-request-failed':
      return 'ネットワークエラーです。接続を確認してください。';
    case 'permission-denied':
      return 'データベースへの権限がありません。';
    default:
      return `エラーが発生しました（${err.code || err.message}）。もう一度お試しください。`;
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = e.target.querySelector('.auth-submit');
  errEl.textContent = '';
  btn.disabled = true;
  auth
    .signInWithEmailAndPassword(email, password)
    .catch((err) => {
      errEl.textContent = authErrorMessage(err);
    })
    .finally(() => {
      btn.disabled = false;
    });
}

function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl = document.getElementById('signup-error');
  const btn = e.target.querySelector('.auth-submit');
  errEl.textContent = '';
  btn.disabled = true;
  auth
    .createUserWithEmailAndPassword(email, password)
    .catch((err) => {
      errEl.textContent = authErrorMessage(err);
    })
    .finally(() => {
      btn.disabled = false;
    });
}

function handleLogout() {
  auth.signOut();
}

// ── AUTH STATE OBSERVER ──
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    await ensureUserInitialized(user.uid, {
      displayName: user.displayName || '',
      email: user.email || '',
      authProvider: 'password',
    });
    await loadCategories(user.uid);
    if (currentScreen === 'auth') navigate('home');
    if (typeof onAuthReady === 'function') onAuthReady();
  } else {
    navigate('auth');
  }
});
