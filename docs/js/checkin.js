let checkinReflectionId = null;
let checkinDone = null;

function openCheckin(id) {
  checkinReflectionId = id;
  checkinDone = null;
  navigate('checkin');
  renderCheckin(id);
}

async function renderCheckin(id) {
  const r = await getReflection(currentUser.uid, id);
  document.getElementById('checkin-action-text').textContent = r.improvement?.action ?? '';

  const today = dateKey(new Date());
  const existing = r.checkins.find((c) => c.date === today);
  const hintEl = document.getElementById('checkin-existing-hint');
  hintEl.style.display = existing ? 'block' : 'none';
  hintEl.textContent = existing
    ? `今日はすでに「${existing.done ? '○ できた' : '✕ できなかった'}」で記録済みです。保存すると上書きされます。`
    : '';

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

async function saveCheckin() {
  const reason = document.getElementById('checkin-reason-input').value.trim();
  await recordCheckin(currentUser.uid, checkinReflectionId, dateKey(new Date()), checkinDone, reason);
  showToast('記録しました');
  openDetail(checkinReflectionId);
}
