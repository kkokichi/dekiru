let checkinReflectionId = null;
let checkinDone = null;
let checkinReflection = null; // 選択日の記録済みチェックを参照するため保持

function openCheckin(id) {
  checkinReflectionId = id;
  activeReflectionId = id;
  checkinDone = null;
  navigate('checkin');
  renderCheckin(id);
}

async function renderCheckin(id) {
  const r = await getReflection(currentUser.uid, id);
  checkinReflection = r;
  document.getElementById('checkin-action-text').textContent = r.improvement?.action ?? '';

  // デフォルトは今日。未来の日は選べない
  const today = dateKey(new Date());
  const dateInput = document.getElementById('checkin-date-input');
  dateInput.value = today;
  dateInput.max = today;

  syncCheckinDateState();
}

// 選択した日に合わせて、記録済みヒントと理由欄の内容を切り替える
function syncCheckinDateState() {
  const date = document.getElementById('checkin-date-input').value;
  const existing = checkinReflection?.checkins.find((c) => c.date === date);
  const hintEl = document.getElementById('checkin-existing-hint');
  hintEl.style.display = existing ? 'block' : 'none';
  hintEl.textContent = existing
    ? `${formatShortDate(date)}はすでに「${existing.done ? '○ できた' : '✕ できなかった'}」で記録済みです。保存すると上書きされます。`
    : '';

  checkinDone = null;
  document.getElementById('checkin-choice-row').style.display = 'flex';
  document.getElementById('checkin-reason-row').style.display = 'none';
  document.getElementById('checkin-reason-input').value = existing?.reason ?? '';
}

function chooseCheckin(done) {
  checkinDone = done;
  document.getElementById('checkin-choice-row').style.display = 'none';
  document.getElementById('checkin-reason-row').style.display = 'block';
  document.getElementById('checkin-reason-label').textContent = done
    ? 'できた理由（任意）'
    : 'できなかった理由（任意）';
}

// ○✕を押し間違えた時に選択画面へ戻る（入力済みの理由は保持する）
function backToCheckinChoice() {
  checkinDone = null;
  document.getElementById('checkin-choice-row').style.display = 'flex';
  document.getElementById('checkin-reason-row').style.display = 'none';
}

async function saveCheckin() {
  const date = document.getElementById('checkin-date-input').value || dateKey(new Date());
  const reason = document.getElementById('checkin-reason-input').value.trim();
  await recordCheckin(currentUser.uid, checkinReflectionId, date, checkinDone, reason);
  showToast(`${formatShortDate(date)}のチェックを記録しました`);
  openDetail(checkinReflectionId);
}
