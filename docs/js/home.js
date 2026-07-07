async function renderHome() {
  const uid = currentUser.uid;

  const [stats, unresolved, recentFailures] = await Promise.all([
    getWeeklyStats(uid),
    listReflections(uid, { statuses: ['planned', 'in_progress'] }),
    listReflections(uid, { statuses: ['recorded', 'analyzed'] }),
  ]);

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
