let practiceReflectionId = null;

function openPractice(id) {
  practiceReflectionId = id;
  navigate('practice');
  renderPractice(id);
}

async function renderPractice(id) {
  const r = await getReflection(currentUser.uid, id);
  document.getElementById('practice-action-text').textContent = r.improvement?.action ?? '';
  document.getElementById('practice-choice-row').style.display = 'flex';
  document.getElementById('practice-due-date-row').style.display = 'none';
  document.getElementById('practice-new-due-input').value = dateKey(new Date());
}

async function markPracticeDone() {
  await recordPractice(currentUser.uid, practiceReflectionId, {
    status: 'done',
    reportedAt: new Date(),
  });
  openEffect(practiceReflectionId);
}

function showPracticeSkippedForm() {
  document.getElementById('practice-choice-row').style.display = 'none';
  document.getElementById('practice-due-date-row').style.display = 'block';
}

async function markPracticeSkipped() {
  const nextDueDate = new Date(document.getElementById('practice-new-due-input').value);
  await recordPractice(
    currentUser.uid,
    practiceReflectionId,
    { status: 'skipped', reportedAt: new Date() },
    nextDueDate,
  );
  showToast('期限を再設定しました');
  navigate('home');
  renderHome();
}
