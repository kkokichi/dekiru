let lessonReflectionId = null;
let lessonEditingDone = false; // true: 完了済みの教訓を編集中（達成日時は変更しない）

function openLessonEntry(id) {
  lessonReflectionId = id;
  activeReflectionId = id;
  navigate('lesson');
  renderLessonEntry(id);
}

async function renderLessonEntry(id) {
  const r = await getReflection(currentUser.uid, id);
  lessonEditingDone = r.status === 'done';
  document.getElementById('lesson-eyebrow').textContent = lessonEditingDone
    ? '教訓の編集'
    : '達成おめでとうございます 🎉';
  document.getElementById('lesson-action-text').textContent = r.improvement?.action ?? '';
  document.getElementById('lesson-input').value = r.lesson ?? '';
  document.getElementById('lesson-submit-btn').textContent = lessonEditingDone
    ? '保存する'
    : '完了する';
}

async function saveLessonAndAchieve() {
  const lesson = document.getElementById('lesson-input').value.trim();
  if (lessonEditingDone) {
    await updateLesson(currentUser.uid, lessonReflectionId, lesson);
    showToast('教訓を保存しました');
  } else {
    await markImprovementAchieved(currentUser.uid, lessonReflectionId, lesson);
    showToast('達成おめでとうございます！');
  }
  openDetail(lessonReflectionId);
}
