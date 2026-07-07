function renderSettings() {
  document.getElementById('settings-name').textContent =
    currentUser.displayName || currentUser.email || 'ユーザー';
  // 表示名がない場合は名前欄にメールが出るので、メール欄は重複表示しない
  document.getElementById('settings-email').textContent = currentUser.displayName
    ? currentUser.email || ''
    : '';
  applyThemeSelection(localStorage.getItem('reflect-theme') || 'system');
}

function applyThemeSelection(theme) {
  document.querySelectorAll('#settings-theme-options .theme-option').forEach((opt) => {
    opt.querySelector('.check').style.visibility = opt.dataset.theme === theme ? 'visible' : 'hidden';
  });
  document.documentElement.setAttribute('data-theme', theme === 'system' ? '' : theme);
}

async function changeTheme(theme) {
  localStorage.setItem('reflect-theme', theme);
  applyThemeSelection(theme);
  if (currentUser) await updateThemeSetting(currentUser.uid, theme);
}

function confirmDeleteAccount() {
  if (!confirm('アカウントを削除しますか？すべての振り返りデータが完全に削除され、元に戻せません。')) return;
  deleteAccount();
}

async function deleteAccount() {
  try {
    await deleteAllUserData(currentUser.uid);
    await currentUser.delete();
  } catch (err) {
    console.error(err);
    alert('アカウントを削除できませんでした。再度ログインしてからもう一度お試しください。');
  }
}
