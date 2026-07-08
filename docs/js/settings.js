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
  renderSettingsCategories();
  applyThemeSelection(localStorage.getItem('reflect-theme') || 'system');
}

// ── カテゴリ管理 ──
function renderSettingsCategories() {
  const el = document.getElementById('settings-category-list');
  el.innerHTML = categoriesCache
    .map(
      (c, i) => `
      <div class="category-row">
        <span class="category-dot" style="background: ${c.color}"></span>
        <span class="category-name">${escapeHtml(c.name)}</span>
        <span class="category-actions">
          <button type="button" onclick="moveCategory('${c.id}', -1)" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" onclick="moveCategory('${c.id}', 1)" ${i === categoriesCache.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" onclick="renameCategoryPrompt('${c.id}')">変更</button>
          <button type="button" class="danger" onclick="confirmDeleteCategory('${c.id}')">削除</button>
        </span>
      </div>`,
    )
    .join('');
}

async function addCategoryFromSettings() {
  const name = prompt('新しいカテゴリ名を入力してください');
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (categoriesCache.some((c) => c.name === trimmed)) return showToast('同じ名前のカテゴリがあります');
  await addCategory(currentUser.uid, trimmed);
  showToast(`カテゴリ「${trimmed}」を追加しました`);
  renderSettingsCategories();
}

async function renameCategoryPrompt(id) {
  const category = categoriesCache.find((c) => c.id === id);
  if (!category) return;
  const name = prompt('カテゴリ名を変更', category.name);
  if (!name || !name.trim() || name.trim() === category.name) return;
  await renameCategory(currentUser.uid, id, name.trim());
  showToast('カテゴリ名を変更しました');
  renderSettingsCategories();
}

async function moveCategory(id, delta) {
  await swapCategoryOrder(currentUser.uid, id, delta);
  renderSettingsCategories();
}

async function confirmDeleteCategory(id) {
  const category = categoriesCache.find((c) => c.id === id);
  if (!category) return;
  const used = await countReflectionsInCategory(currentUser.uid, id);
  const msg =
    used > 0
      ? `「${category.name}」は${used}件の振り返りで使われています。削除するとそれらのカテゴリは「未分類」と表示されます。削除しますか？`
      : `「${category.name}」を削除しますか？`;
  if (!confirm(msg)) return;
  await deleteCategory(currentUser.uid, id);
  showToast('カテゴリを削除しました');
  renderSettingsCategories();
}

// ── リマインダー ──
// 設定は端末のlocalStorageとFirestoreの両方に保存する。
// プッシュ通知（FCM）が使える場合はアプリを閉じていてもCloud Functionから届き、
// 使えない場合はアプリを開いている間だけ画面内タイマーで通知する
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
  saveReminderToServer(currentUser.uid, setting).catch((err) =>
    console.error('リマインダー設定の同期に失敗', err),
  );
  scheduleReminderTimer();
}

async function onReminderToggle(enabled) {
  if (enabled && 'Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  saveReminderSetting({ ...getReminderSetting(), enabled });
  document.getElementById('reminder-time-row').style.display = enabled ? 'flex' : 'none';
  if (!enabled) return;
  const push = await setupPushReminder();
  showToast(push ? 'プッシュ通知でお知らせします' : 'リマインダーを設定しました');
  if (push) {
    document.getElementById('reminder-note').textContent =
      'プッシュ通知が有効です。アプリを閉じていても指定時刻に通知が届きます。';
  }
}

function onReminderTimeChange(time) {
  if (!time) return;
  saveReminderSetting({ ...getReminderSetting(), time });
}

// アプリを閉じていても届くプッシュ通知（FCM）の登録。
// VAPIDキー未設定・非対応ブラウザ・通知拒否の場合はfalseを返し、画面内通知にフォールバック
async function setupPushReminder() {
  if (!FCM_VAPID_KEY) return false;
  try {
    if (!firebase.messaging.isSupported() || Notification.permission !== 'granted') return false;
    const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
    const token = await firebase
      .messaging()
      .getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) return false;
    await saveFcmToken(currentUser.uid, token);
    return true;
  } catch (err) {
    console.error('プッシュ通知の設定に失敗', err);
    return false;
  }
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
