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

  document.getElementById('detail-timeline').innerHTML = buildTimelineHtml(r);

  const actionBtn = document.getElementById('detail-action-btn');
  if (r.status === 'recorded' || r.status === 'analyzed') {
    actionBtn.style.display = 'block';
    actionBtn.textContent = '続きを入力する';
    actionBtn.onclick = () => openWizard(r.id);
  } else if (r.status === 'planned' || r.status === 'in_progress') {
    actionBtn.style.display = 'block';
    actionBtn.textContent = '実践を記録する';
    actionBtn.onclick = () => openPractice(r.id);
  } else {
    actionBtn.style.display = 'none';
  }
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
      label: 'AI提案',
      content: r.aiSuggestion ? r.aiSuggestion.improvements.join(' / ') : null,
      completed: !!r.aiSuggestion,
    },
    {
      label: '改善策',
      content: r.improvement ? `${r.improvement.action}（期限 ${formatDate(r.improvement.dueDate)}）` : null,
      completed: !!r.improvement,
    },
  ];

  let doAndCheck = null;
  if (r.practice) doAndCheck = r.practice.status === 'done' ? '実施した' : '未実施（期限を再設定）';
  if (r.effect) doAndCheck = `${doAndCheck ?? ''} → ${EFFECT_LABELS[r.effect.result]}`;
  steps.push({ label: '実践・効果確認', content: doAndCheck, completed: !!r.effect });

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
