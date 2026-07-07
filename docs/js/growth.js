async function renderGrowth() {
  const reflections = await listReflections(currentUser.uid);

  const doneList = reflections.filter((r) => r.status === 'done');
  document.getElementById('growth-streak').textContent = `${calcStreak(reflections)}日`;
  document.getElementById('growth-total').textContent = reflections.length;
  document.getElementById('growth-done').textContent = doneList.length;
  document.getElementById('growth-lessons').textContent = reflections.filter((r) => r.lesson).length;

  renderMonthlyChart(doneList);
  renderCategoryShare(reflections);
}

// ── 月ごとの改善数（直近6ヶ月・達成日ベース） ──
function renderMonthlyChart(doneList) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), count: 0 });
  }
  doneList.forEach((r) => {
    const at = r.achievedAt ?? r.updatedAt;
    const m = months.find((x) => x.year === at.getFullYear() && x.month === at.getMonth());
    if (m) m.count++;
  });

  const max = Math.max(...months.map((m) => m.count), 1);
  document.getElementById('growth-monthly').innerHTML = months
    .map(
      (m) => `
      <div class="growth-col">
        <div class="growth-col-value ${m.count === 0 ? 'muted' : ''}">${m.count}</div>
        <div class="growth-col-track">
          <div class="growth-col-bar" style="height: ${Math.round((m.count / max) * 100)}%"></div>
        </div>
        <div class="growth-col-label">${m.month + 1}月</div>
      </div>`,
    )
    .join('');
}

// ── カテゴリ別割合 ──
function renderCategoryShare(reflections) {
  const el = document.getElementById('growth-categories');
  if (reflections.length === 0) {
    el.innerHTML = '<div class="empty-state">まだ振り返りがありません</div>';
    return;
  }
  const counts = new Map();
  reflections.forEach((r) => counts.set(r.categoryId, (counts.get(r.categoryId) ?? 0) + 1));
  const rows = [...counts.entries()]
    .map(([categoryId, count]) => ({ name: categoryName(categoryId), count }))
    .sort((a, b) => b.count - a.count);
  const max = rows[0].count;

  el.innerHTML = rows
    .map(
      (row) => `
      <div class="growth-cat-row">
        <div class="growth-cat-name">${escapeHtml(row.name)}</div>
        <div class="growth-cat-track">
          <div class="growth-cat-bar" style="width: ${Math.round((row.count / max) * 100)}%"></div>
        </div>
        <div class="growth-cat-count">${row.count}<span class="growth-cat-pct">（${Math.round((row.count / reflections.length) * 100)}%）</span></div>
      </div>`,
    )
    .join('');
}
