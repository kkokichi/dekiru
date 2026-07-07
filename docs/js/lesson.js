let lessonReflectionId = null;

function openLessonEntry(id) {
  lessonReflectionId = id;
  navigate('lesson');
  renderLessonEntry(id);
}

async function renderLessonEntry(id) {
  const r = await getReflection(currentUser.uid, id);
  document.getElementById('lesson-action-text').textContent = r.improvement?.action ?? '';
  document.getElementById('lesson-input').value = r.lesson ?? '';
}

async function saveLessonAndAchieve() {
  const lesson = document.getElementById('lesson-input').value.trim();
  await markImprovementAchieved(currentUser.uid, lessonReflectionId, lesson);
  showToast('達成おめでとうございます！');
  openDetail(lessonReflectionId);
}
