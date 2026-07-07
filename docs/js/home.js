async function renderHome() {
  const uid = currentUser.uid;

  const [stats, unresolved, recentFailures, allReflections] = await Promise.all([
    getWeeklyStats(uid),
    listReflections(uid, { statuses: ['planned', 'in_progress'] }),
    listReflections(uid, { statuses: ['recorded', 'analyzed'] }),
    listReflections(uid, {}),
  ]);

  renderHabitCalendar(allReflections);

  document.getElementById('home-improvement-rate').textContent =
    stats.improvementRate != null ? `${Math.round(stats.improvementRate * 100)}%` : '—';
  document.getElementById('home-done-count').textContent = stats.doneCount;

  const sorted = [...unresolved].sort((a, b) => {
    const aDue = a.improvement?.dueDate?.getTime() ?? Infinity;
    const bDue = b.improvement?.dueDate?.getTime() ?? Infinity;
    return aDue - bDue;
  });

  const unresolvedEl = document.getElementById('home-unresolved');
  unresolvedEl.innerHTML =
    sorted.length === 0
      ? '<div class="empty-state">未対応の改善策はありません</div>'
      : sorted.map(reflectionCardHtml).join('');

  const recentEl = document.getElementById('home-recent');
  const recentSlice = recentFailures.slice(0, 3);
  recentEl.innerHTML =
    recentSlice.length === 0
      ? '<div class="empty-state">まだ振り返りがありません。右下の+から記録してみましょう</div>'
      : recentSlice.map(reflectionCardHtml).join('');
}

function onAuthReady() {
  renderHome();
}

// ── 習慣カレンダー（●できた / ×できなかった / ・確認待ち） ──
const MARK_RANK = { pending: 0, fail: 1, success: 2 };

function calendarMarksFromReflections(reflections) {
  const marks = {};
  reflections.forEach((r) => {
    const dateStr = dateKey(r.occurredAt);
    let mark = 'pending';
    if (r.effect) {
      mark =
        r.effect.result === 'improved' || r.effect.result === 'slightly_improved' ? 'success' : 'fail';
    }
    if (!marks[dateStr] || MARK_RANK[mark] > MARK_RANK[marks[dateStr]]) {
      marks[dateStr] = mark;
    }
  });
  return marks;
}

function renderHabitCalendar(reflections) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 月曜始まり

  const monthReflections = reflections.filter(
    (r) => r.occurredAt.getFullYear() === year && r.occurredAt.getMonth() === month,
  );
  const marks = calendarMarksFromReflections(monthReflections);

  const MARK_SYMBOL = { success: '●', fail: '×', pending: '・' };
  const MARK_CLASS = { success: 'mark-success', fail: 'mark-fail', pending: 'mark-pending' };

  let html = `<div class="calendar-title">${year}年${month + 1}月</div><div class="calendar-grid">`;
  ['月', '火', '水', '木', '金', '土', '日'].forEach((d) => {
    html += `<div class="calendar-dow">${d}</div>`;
  });
  for (let i = 0; i < startOffset; i++) html += '<div class="calendar-cell empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = dateKey(new Date(year, month, day));
    const mark = marks[dateStr];
    const isToday = day === now.getDate();
    const symbol = mark ? MARK_SYMBOL[mark] : '';
    const cls = mark ? MARK_CLASS[mark] : '';
    html += `<div class="calendar-cell ${cls} ${isToday ? 'today' : ''}"><span class="calendar-daynum">${day}</span><span class="calendar-mark">${symbol}</span></div>`;
  }
  html += '</div>';
  document.getElementById('home-calendar').innerHTML = html;
}
