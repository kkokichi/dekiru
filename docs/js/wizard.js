// ── WIZARD STATE ──
let wizardStep = 1;
let wizardReflectionId = null;
let wizardCauses = [];
let wizardChecklist = [];
let wizardExisting = null; // 再開時に読み込んだ既存データ
let wizardQuickMode = false; // true: タイトル+感情だけで即保存し、分析は後回しにする

function openWizard(resumeId) {
  wizardReflectionId = resumeId || null;
  wizardExisting = null;
  wizardCauses = [];
  wizardChecklist = [];
  wizardQuickMode = false;
  navigate('wizard');
  document.getElementById('wizard-quick-hint').style.display = 'none';

  if (resumeId) {
    getReflection(currentUser.uid, resumeId).then((r) => {
      wizardExisting = r;
      wizardCauses = r.causes || [];
      goToWizardStep(r.status === 'recorded' ? 2 : 3);
    });
  } else {
    goToWizardStep(1);
  }
}

function openQuickWizard() {
  wizardReflectionId = null;
  wizardExisting = null;
  wizardCauses = [];
  wizardChecklist = [];
  wizardQuickMode = true;
  navigate('wizard');
  document.getElementById('wizard-quick-hint').style.display = 'block';
  goToWizardStep(1);
}

function closeWizard() {
  navigate(prevScreen === 'wizard' ? 'home' : prevScreen);
}

function goToWizardStep(step) {
  wizardStep = step;
  document.querySelectorAll('.wizard-step').forEach((el) => el.classList.remove('active'));
  document.getElementById('wizard-step-' + step).classList.add('active');
  document.querySelectorAll('.wizard-progress-seg').forEach((seg, i) => {
    seg.classList.toggle('active', i < step);
  });
  document.getElementById('wizard-step-label').textContent = `STEP ${step} / 3`;
  const titles = { 1: '基本情報', 2: '原因分析', 3: '改善策確定' };
  document.getElementById('wizard-title').textContent = titles[step];

  if (step === 1) renderWizardStep1();
  if (step === 2) renderWizardStep2();
  if (step === 3) renderWizardStep3();
}

// ── STEP 1: 基本情報 ──
let wizardEmotion = 3;
let wizardImportance = 'medium';

function renderWizardStep1() {
  const categoriesHtml = categoriesCache
    .map(
      (c) =>
        `<button type="button" class="chip" data-category="${c.id}" onclick="selectWizardCategory('${c.id}')">${escapeHtml(c.name)}</button>`,
    )
    .join('');
  document.getElementById('wizard-category-chips').innerHTML = categoriesHtml;

  wizardEmotion = wizardExisting?.emotion ?? 3;
  renderEmotionPicker();

  wizardImportance = wizardExisting?.importance ?? 'medium';
  updateChipSelection('wizard-importance-chips', wizardImportance);

  document.getElementById('wizard-title-input').value = wizardExisting?.title ?? '';
  document.getElementById('wizard-detail-input').value = wizardExisting?.detail ?? '';
  if (wizardExisting) {
    updateChipSelection('wizard-category-chips', wizardExisting.categoryId);
  }
}

function renderEmotionPicker() {
  const el = document.getElementById('wizard-emotion-picker');
  el.innerHTML = EMOTION_EMOJI.map(
    (emoji, i) =>
      `<button type="button" class="emo-dot emo-${i + 1} ${wizardEmotion === i + 1 ? 'selected' : ''}" onclick="selectWizardEmotion(${i + 1})">${emoji}</button>`,
  ).join('');
}

function selectWizardEmotion(level) {
  wizardEmotion = level;
  renderEmotionPicker();
}

function selectWizardCategory(id) {
  updateChipSelection('wizard-category-chips', id);
}

function updateChipSelection(containerId, value) {
  document.querySelectorAll(`#${containerId} .chip`).forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.category === value || chip.dataset.value === value);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#wizard-importance-chips .chip')) {
    wizardImportance = e.target.closest('.chip').dataset.value;
    updateChipSelection('wizard-importance-chips', wizardImportance);
  }
  if (e.target.closest('#wizard-priority-chips .chip')) {
    updateChipSelection('wizard-priority-chips', e.target.closest('.chip').dataset.value);
  }
});

async function submitWizardStep1() {
  const title = document.getElementById('wizard-title-input').value.trim();
  if (!title) return showToast('タイトルを入力してください');
  let categoryId = document.querySelector('#wizard-category-chips .chip.active')?.dataset.category;
  if (!categoryId && wizardQuickMode) categoryId = categoriesCache[categoriesCache.length - 1]?.id;
  if (!categoryId) return showToast('カテゴリを選択してください');

  const input = {
    title,
    detail: document.getElementById('wizard-detail-input').value.trim(),
    categoryId,
    emotion: wizardEmotion,
    importance: wizardImportance,
    occurredAt: new Date(),
  };

  const id = await createReflection(currentUser.uid, input);
  wizardReflectionId = id;

  if (wizardQuickMode) {
    showToast('記録しました。原因分析はいつでも詳細画面から続けられます');
    navigate('home');
    renderHome();
    return;
  }
  goToWizardStep(2);
}

// ── STEP 2: 原因分析 ──
function renderWizardStep2() {
  const html = CAUSES.map((cause) => {
    const active = wizardCauses.includes(cause) ? 'active' : '';
    return `<button type="button" class="chip ${active}" data-value="${cause}" onclick="toggleWizardCause('${cause}')">${CAUSE_LABELS[cause]}</button>`;
  }).join('');
  document.getElementById('wizard-cause-chips').innerHTML = html;
  document.getElementById('wizard-cause-other-row').style.display = wizardCauses.includes('other')
    ? 'block'
    : 'none';
  document.getElementById('wizard-cause-other-input').value = wizardExisting?.causeNote ?? '';
}

function toggleWizardCause(cause) {
  if (wizardCauses.includes(cause)) {
    wizardCauses = wizardCauses.filter((c) => c !== cause);
  } else {
    wizardCauses = [...wizardCauses, cause];
  }
  renderWizardStep2();
}

async function submitWizardStep2() {
  if (wizardCauses.length === 0) return showToast('原因を1つ以上選択してください');
  const note = document.getElementById('wizard-cause-other-input').value.trim();
  await updateCauses(currentUser.uid, wizardReflectionId, wizardCauses, note);
  goToWizardStep(3);
}

// ── STEP 3: 改善策確定 ──
function renderWizardStep3() {
  document.getElementById('wizard-action-input').value = wizardExisting?.improvement?.action ?? '';
  const due = wizardExisting?.improvement?.dueDate ?? new Date();
  document.getElementById('wizard-duedate-input').value = dateKey(due);
  const priority = wizardExisting?.improvement?.priority ?? 'medium';
  updateChipSelection('wizard-priority-chips', priority);
  wizardChecklist = wizardExisting?.improvement?.checklist ?? [];
  renderWizardChecklist();
}

function renderWizardChecklist() {
  document.getElementById('wizard-checklist-list').innerHTML = wizardChecklist
    .map(
      (item, i) => `
      <div class="checklist-item ${item.done ? 'done' : ''}" onclick="toggleWizardChecklistItem(${i})">
        <div class="checklist-box ${item.done ? 'checked' : ''}"></div>
        <span>${escapeHtml(item.text)}</span>
      </div>`,
    )
    .join('');
}

function toggleWizardChecklistItem(index) {
  wizardChecklist[index].done = !wizardChecklist[index].done;
  renderWizardChecklist();
}

function addWizardChecklistItem() {
  const input = document.getElementById('wizard-checklist-new-input');
  const text = input.value.trim();
  if (!text) return;
  wizardChecklist.push({ text, done: false });
  input.value = '';
  renderWizardChecklist();
}

async function submitWizardStep3() {
  const action = document.getElementById('wizard-action-input').value.trim();
  if (!action) return showToast('次回やることを入力してください');
  const dueDate = new Date(document.getElementById('wizard-duedate-input').value);
  const priority = document.querySelector('#wizard-priority-chips .chip.active')?.dataset.value || 'medium';

  await confirmImprovement(currentUser.uid, wizardReflectionId, {
    action,
    dueDate,
    priority,
    checklist: wizardChecklist,
  });
  showToast('改善策を保存しました');
  closeWizard();
  renderHome();
}
