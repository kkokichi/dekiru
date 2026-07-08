// ── 週次レビュー（今週の○✕まとめ・先週比・書いた理由の振り返り） ──

function openWeeklyReview() {
  navigate('review');
  renderWeeklyReview();
}

async function renderWeeklyReview() {
  const all = await listReflections(currentUser.uid);

  const weekStart = getWeekStart(new Date());
  const weekStartKey = dateKey(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartKey = dateKey(lastWeekStart);

  document.getElementById('review-range').textContent =
    `${formatShortDate(weekStart)} 〜 ${formatShortDate(weekEnd)}`;

  let done = 0;
  let fail = 0;
  let lastDone = 0;
  let lastTotal = 0;
  const perAction = [];
  const reasons = [];
  all.forEach((r) => {
    let aDone = 0;
    let aFail = 0;
    r.checkins.forEach((c) => {
      if (c.date >= weekStartKey) {
        if (c.done) {
          done++;
          aDone++;
        } else {
          fail++;
          aFail++;
        }
        if (c.reason) reasons.push({ r, c });
      } else if (c.date >= lastWeekStartKey) {
        lastTotal++;
        if (c.done) lastDone++;
      }
    });
    if (aDone + aFail > 0) perAction.push({ r, aDone, aFail });
  });

  const total = done + fail;
  const rate = total > 0 ? done / total : null;
  const lastRate = lastTotal > 0 ? lastDone / lastTotal : null;
  document.getElementById('review-rate').textContent =
    rate != null ? `${Math.round(rate * 100)}%` : '—';
  document.getElementById('review-done').textContent = done;
  document.getElementById('review-fail').textContent = fail;

  const diffEl = document.getElementById('review-rate-diff');
  if (rate != null && lastRate != null) {
    const diff = Math.round((rate - lastRate) * 100);
    diffEl.textContent = diff > 0 ? `+${diff}pt` : diff < 0 ? `${diff}pt` : '±0pt';
  } else {
    diffEl.textContent = '—';
  }

  perAction.sort((a, b) => b.aDone + b.aFail - (a.aDone + a.aFail));
  document.getElementById('review-actions').innerHTML =
    perAction.length === 0
      ? '<div class="empty-state">今週のチェック記録はまだありません</div>'
      : perAction
          .map(
            ({ r, aDone, aFail }) => `
        <div class="reflection-card" onclick="openDetail('${r.id}')">
          <div class="reflection-body">
            <div class="reflection-title">${escapeHtml(r.improvement?.action ?? r.title)}</div>
            <div class="reflection-meta">
              <span class="pill status-accent">○ ${aDone}日</span>
              <span class="pill ${aFail > 0 ? 'status-warn' : 'status-neutral'}">✕ ${aFail}日</span>
              <span class="tag-category">${escapeHtml(categoryName(r.categoryId))}</span>
            </div>
          </div>
        </div>`,
          )
          .join('');

  reasons.sort((a, b) => b.c.date.localeCompare(a.c.date));
  document.getElementById('review-reasons').innerHTML =
    reasons.length === 0
      ? '<div class="empty-state">今週はまだ理由が書かれていません。○✕と一緒に理由を残すと振り返りやすくなります</div>'
      : `<div class="card">${reasons
          .map(
            ({ r, c }) => `
        <div class="checkin-row">
          <span class="checkin-mark ${c.done ? 'mark-success' : 'mark-fail'}">${c.done ? '○' : '✕'}</span>
          <div class="checkin-row-body">
            <div class="checkin-date">${formatShortDate(c.date)} ・ ${escapeHtml(r.improvement?.action ?? r.title)}</div>
            <div class="checkin-reason">${escapeHtml(c.reason)}</div>
          </div>
        </div>`,
          )
          .join('')}</div>`;
}
