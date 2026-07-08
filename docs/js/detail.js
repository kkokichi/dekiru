async function renderDetail(id) {
  const r = await getReflection(currentUser.uid, id);
  if (!r) return;

  document.getElementById('detail-title').textContent = r.title;
  document.getElementById('detail-category').textContent = categoryName(r.categoryId);
  document.getElementById('detail-status').textContent = STATUS_LABELS[r.status];
  document.getElementById('detail-status').className = `pill ${STATUS_CLASS[r.status]}`;

  const priorityEl = document.getElementById('detail-priority');
  if (r.improvement) {
    priorityEl.style.display = 'inline-flex';
    priorityEl.textContent = `優先度: ${r.improvement.priority === 'high' ? '高' : r.improvement.priority === 'low' ? '低' : '中'}`;
  } else {
    priorityEl.style.display = 'none';
  }

  const recEl = document.getElementById('detail-recurrence');
  if (r.recurrenceOf) {
    const original = await getReflection(currentUser.uid, r.recurrenceOf);
    recEl.style.display = 'block';
    recEl.textContent = `⟳ 「${original?.title ?? '削除済み'}」の再発`;
    recEl.onclick = original ? () => openDetail(original.id) : null;
  } else {
    recEl.style.display = 'none';
    recEl.onclick = null;
  }

  document.getElementById('detail-timeline').innerHTML = buildTimelineHtml(r);
  document.getElementById('detail-lesson').innerHTML = r.lesson
    ? `<div class="section-title" style="margin-top: 24px">教訓</div><div class="card lesson-card">${escapeHtml(r.lesson)}</div>`
    : '';
  document.getElementById('detail-checkin-history').innerHTML = buildCheckinHistoryHtml(r);

  const actionBtn = document.getElementById('detail-action-btn');
  const achieveBtn = document.getElementById('detail-achieve-btn');
  const overdueHint = document.getElementById('detail-overdue-hint');
  achieveBtn.style.display = 'none';
  overdueHint.style.display = 'none';
  if (r.status === 'recorded' || r.status === 'analyzed') {
    actionBtn.style.display = 'block';
    actionBtn.textContent = '続きを入力する';
    actionBtn.onclick = () => openWizard(r.id);
  } else if (r.status === 'planned' || r.status === 'in_progress') {
    const checkedToday = r.checkins.some((c) => c.date === dateKey(new Date()));
    actionBtn.style.display = 'block';
    actionBtn.textContent = checkedToday ? '今日の記録を修正する' : '今日を記録する';
    actionBtn.onclick = () => openCheckin(r.id);
    if (r.status === 'in_progress') {
      achieveBtn.style.display = 'block';
      achieveBtn.textContent = '達成として完了にする';
      achieveBtn.onclick = () => openLessonEntry(r.id);
    }
    const due = r.improvement?.dueDate;
    if (due && dateKey(due) < dateKey(new Date())) {
      overdueHint.style.display = 'block';
      overdueHint.textContent = `目標日（${formatShortDate(due)}）を過ぎました。習慣にできていれば「達成として完了」にしましょう。もう少し続けたい場合はこのままチェックを続けてOKです。`;
    }
  } else if (r.status === 'done') {
    actionBtn.style.display = 'none';
    achieveBtn.style.display = 'block';
    achieveBtn.textContent = r.lesson ? '教訓を編集する' : '教訓を残す';
    achieveBtn.onclick = () => openLessonEntry(r.id);
  } else {
    actionBtn.style.display = 'none';
  }
}

async function confirmDeleteReflection() {
  if (
    !confirm('この振り返りを削除しますか？チェック履歴や教訓もあわせて削除され、元に戻せません。')
  )
    return;
  await deleteReflection(currentUser.uid, activeReflectionId);
  activeReflectionId = null; // goBack()が削除済みの詳細を再表示しないように
  showToast('振り返りを削除しました');
  goBack();
}

async function confirmDeleteCheckin(id, date) {
  if (!confirm(`${formatShortDate(date)}のチェックを削除しますか？`)) return;
  await deleteCheckin(currentUser.uid, id, date);
  showToast('チェックを削除しました');
  renderDetail(id);
}

function buildCheckinHistoryHtml(r) {
  if (r.checkins.length === 0) return '';
  const rows = [...r.checkins]
    .reverse()
    .map(
      (c) => `
      <div class="checkin-row">
        <span class="checkin-mark ${c.done ? 'mark-success' : 'mark-fail'}">${c.done ? '○' : '✕'}</span>
        <div class="checkin-row-body">
          <div class="checkin-date">${formatShortDate(c.date)}</div>
          ${c.reason ? `<div class="checkin-reason">${escapeHtml(c.reason)}</div>` : ''}
        </div>
        <button type="button" class="checkin-delete" onclick="confirmDeleteCheckin('${r.id}', '${c.date}')">
          削除
        </button>
      </div>`,
    )
    .join('');
  return `<div class="section-title" style="margin-top: 24px">チェック履歴</div><div class="card">${rows}</div>`;
}

function buildTimelineHtml(r) {
  const steps = [
    { label: '登録', content: r.detail || r.title, completed: true },
    {
      label: '原因分析',
      content: r.causes.length ? r.causes.map((c) => CAUSE_LABELS[c]).join(' / ') : null,
      completed: r.causes.length > 0,
    },
    {
      label: '改善策',
      content: r.improvement
        ? `${r.improvement.action}（目標日 ${formatDate(r.improvement.dueDate)}）`
        : null,
      completed: !!r.improvement,
    },
  ];

  let checkinSummary = null;
  if (r.checkins.length > 0) {
    const doneCount = r.checkins.filter((c) => c.done).length;
    checkinSummary = `○ ${doneCount}日 / ✕ ${r.checkins.length - doneCount}日`;
    if (r.achievedAt) checkinSummary += '（達成として完了）';
  }
  steps.push({ label: '継続チェック', content: checkinSummary, completed: r.checkins.length > 0 });

  return steps
    .map(
      (s, i) => `
    <div class="tl-item">
      <div class="tl-dotcol">
        <div class="tl-dot ${s.completed ? 'on' : ''}"></div>
        ${i < steps.length - 1 ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-body">
        <div class="tl-label">${s.label}</div>
        <div class="tl-content ${s.content ? '' : 'muted'}">${s.content ? escapeHtml(s.content) : 'まだ記録がありません'}</div>
      </div>
    </div>`,
    )
    .join('');
}
