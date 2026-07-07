function renderSettings() {
  document.getElementById('settings-name').textContent =
    currentUser.displayName || currentUser.email || 'ユーザー';
  // 表示名がない場合は名前欄にメールが出るので、メール欄は重複表示しない
  document.getElementById('settings-email').textContent = currentUser.displayName
    ? currentUser.email || ''
    : '';
  const reminder = getReminderSetting();
  document.getElementById('reminder-toggle').checked = reminder.enabled;
  document.getElementById('reminder-time').value = reminder.time;
  document.getElementById('reminder-time-row').style.display = reminder.enabled ? 'flex' : 'none';
  applyThemeSelection(localStorage.getItem('reflect-theme') || 'system');
}

// ── リマインダー ──
// 設定は端末ごと（localStorage）。通知はアプリを開いている間のみ発火する。
// アプリを閉じていても届くプッシュ通知はFCM等のサーバ設定が必要なため将来対応
const REMINDER_KEY = 'reflect-reminder';
let reminderTimerId = null;

function getReminderSetting() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY)) ?? { enabled: false, time: '21:00' };
  } catch {
    return { enabled: false, time: '21:00' };
  }
}

function saveReminderSetting(setting) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(setting));
  scheduleReminderTimer();
}

async function onReminderToggle(enabled) {
  if (enabled && 'Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  saveReminderSetting({ ...getReminderSetting(), enabled });
  document.getElementById('reminder-time-row').style.display = enabled ? 'flex' : 'none';
  if (enabled) showToast('リマインダーを設定しました');
}

function onReminderTimeChange(time) {
  if (!time) return;
  saveReminderSetting({ ...getReminderSetting(), time });
}

function scheduleReminderTimer() {
  if (reminderTimerId) clearTimeout(reminderTimerId);
  reminderTimerId = null;
  const reminder = getReminderSetting();
  if (!reminder.enabled) return;
  const [h, m] = reminder.time.split(':').map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  reminderTimerId = setTimeout(() => {
    fireReminder();
    scheduleReminderTimer(); // 翌日分を再セット
  }, next.getTime() - Date.now());
}

function fireReminder() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Reflect', { body: '今日のチェックを記録しましょう', icon: 'icons/icon.png' });
  }
  if (currentScreen === 'home') renderHome();
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
