async function renderHome() {
  const uid = currentUser.uid;

  const [stats, unresolved, recentFailures, allReflections] = await Promise.all([
    getWeeklyStats(uid),
    listReflections(uid, { statuses: ['planned', 'in_progress'] }),
    listReflections(uid, { statuses: ['recorded', 'analyzed'] }),
    listReflections(uid, {}),
  ]);

  renderHabitCalendar(allReflections);

  const streak = calcStreak(allReflections);
  document.getElementById('home-streak').textContent = streak > 0 ? `${streak}日` : '—';
  document.getElementById('home-improvement-rate').textContent =
    stats.checkinRate != null ? `${Math.round(stats.checkinRate * 100)}%` : '—';
  document.getElementById('home-done-count').textContent = stats.checkinCount;

  // 未チェックを先に、次に目標日が近い順
  const today = dateKey(new Date());
  const sorted = [...unresolved].sort((a, b) => {
    const aChecked = a.checkins.some((c) => c.date === today) ? 1 : 0;
    const bChecked = b.checkins.some((c) => c.date === today) ? 1 : 0;
    if (aChecked !== bChecked) return aChecked - bChecked;
    const aDue = a.improvement?.dueDate?.getTime() ?? Infinity;
    const bDue = b.improvement?.dueDate?.getTime() ?? Infinity;
    return aDue - bDue;
  });
  const todayEl = document.getElementById('home-today-checkins');
  todayEl.innerHTML =
    sorted.length === 0
      ? '<div class="empty-state">継続中の改善策はありません</div>'
      : sorted.map((r) => todayCheckinCardHtml(r, today)).join('');

  renderReminderBanner(sorted, today);

  const recentEl = document.getElementById('home-recent');
  const recentSlice = recentFailures.slice(0, 3);
  recentEl.innerHTML =
    recentSlice.length === 0
      ? '<div class="empty-state">まだ振り返りがありません。右下の+から記録してみましょう</div>'
      : recentSlice.map(reflectionCardHtml).join('');
}

function onAuthReady() {
  renderHome();
  scheduleReminderTimer();
}

// リマインダー時刻を過ぎても未チェックの改善策があれば、ホームに知らせる
function renderReminderBanner(activeReflections, today) {
  const banner = document.getElementById('home-reminder-banner');
  const reminder = getReminderSetting();
  const now = new Date();
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const uncheckedCount = activeReflections.filter(
    (r) => !r.checkins.some((c) => c.date === today),
  ).length;
  if (reminder.enabled && nowHM >= reminder.time && uncheckedCount > 0) {
    banner.style.display = 'block';
    banner.textContent = `⏰ 今日のチェックがまだ${uncheckedCount}件あります`;
  } else {
    banner.style.display = 'none';
  }
}

function todayCheckinCardHtml(r, today) {
  const checked = r.checkins.find((c) => c.date === today);
  const statusHtml = checked
    ? `<span class="pill ${checked.done ? 'status-accent' : 'status-warn'}">${checked.done ? '○ 記録済み' : '✕ 記録済み'}</span>`
    : '<span class="pill status-neutral">未記録</span>';
  const due = r.improvement?.dueDate;
  const overdue = due && dateKey(due) < today;
  const dueHtml = due
    ? `<span class="pill ${overdue ? 'pill-warn' : 'pill-neutral'}">目標日 ${formatShortDate(due)}${overdue ? '・達成を確認' : ''}</span>`
    : '';
  return `
    <div class="reflection-card" onclick="openCheckin('${r.id}')">
      <div class="reflection-body">
        <div class="reflection-title">${escapeHtml(r.improvement?.action ?? r.title)}</div>
        <div class="reflection-meta">
          <span class="tag-category">${escapeHtml(categoryName(r.categoryId))}</span>
          ${statusHtml}
          ${dueHtml}
        </div>
      </div>
    </div>`;
}

// チェックを記録した日が今日（または昨日）から何日連続しているか。
// 今日まだ記録していなくても、昨日まで続いていれば連続は途切れていない扱いにする
function calcStreak(reflections) {
  const days = new Set();
  reflections.forEach((r) => r.checkins.forEach((c) => days.add(c.date)));
  const d = new Date();
  if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── 習慣カレンダー（●できた / ×できなかった） ──
const MARK_RANK = { fail: 0, success: 1 };
let calendarMonthOffset = 0; // 0=当月、-1=先月…（未来には進めない）
let calendarReflections = [];

function shiftCalendarMonth(delta) {
  calendarMonthOffset = Math.min(0, calendarMonthOffset + delta);
  drawHabitCalendar();
}

function calendarMarksFromCheckins(checkins) {
  const marks = {};
  checkins.forEach((c) => {
    const mark = c.done ? 'success' : 'fail';
    if (!marks[c.date] || MARK_RANK[mark] > MARK_RANK[marks[c.date]]) {
      marks[c.date] = mark;
    }
  });
  return marks;
}

function renderHabitCalendar(reflections) {
  calendarReflections = reflections;
  calendarMonthOffset = 0;
  drawHabitCalendar();
}

function drawHabitCalendar() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = base.getDay() === 0 ? 6 : base.getDay() - 1; // 月曜始まり
  const isCurrentMonth = calendarMonthOffset === 0;

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthCheckins = calendarReflections
    .flatMap((r) => r.checkins)
    .filter((c) => c.date.startsWith(monthPrefix));
  const marks = calendarMarksFromCheckins(monthCheckins);

  const MARK_SYMBOL = { success: '●', fail: '×' };
  const MARK_CLASS = { success: 'mark-success', fail: 'mark-fail' };

  let html = `
    <div class="calendar-header">
      <button type="button" class="calendar-nav" onclick="shiftCalendarMonth(-1)">‹</button>
      <div class="calendar-title">${year}年${month + 1}月</div>
      <button type="button" class="calendar-nav" onclick="shiftCalendarMonth(1)" ${isCurrentMonth ? 'disabled' : ''}>›</button>
    </div><div class="calendar-grid">`;
  ['月', '火', '水', '木', '金', '土', '日'].forEach((d) => {
    html += `<div class="calendar-dow">${d}</div>`;
  });
  for (let i = 0; i < startOffset; i++) html += '<div class="calendar-cell empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = dateKey(new Date(year, month, day));
    const mark = marks[dateStr];
    const isToday = isCurrentMonth && day === now.getDate();
    const symbol = mark ? MARK_SYMBOL[mark] : '';
    const cls = mark ? MARK_CLASS[mark] : '';
    html += `<div class="calendar-cell ${cls} ${isToday ? 'today' : ''}"><span class="calendar-daynum">${day}</span><span class="calendar-mark">${symbol}</span></div>`;
  }
  html += '</div>';
  document.getElementById('home-calendar').innerHTML = html;
}
