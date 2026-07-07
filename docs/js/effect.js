let effectReflectionId = null;

const EFFECT_OPTIONS = [
  { value: 'improved', label: '改善した' },
  { value: 'slightly_improved', label: '少し改善した' },
  { value: 'no_change', label: '変わらない' },
  { value: 'worsened', label: '悪化した' },
];

function openEffect(id) {
  effectReflectionId = id;
  navigate('effect');
  renderEffect(id);
}

async function renderEffect(id) {
  const r = await getReflection(currentUser.uid, id);
  document.getElementById('effect-question').textContent = `「${r.improvement?.action ?? ''}」の効果はどうでしたか？`;
  document.getElementById('effect-options').innerHTML = EFFECT_OPTIONS.map(
    (o) => `<button type="button" class="effect-option" onclick="chooseEffect('${o.value}')">${o.label}</button>`,
  ).join('');
}

async function chooseEffect(result) {
  await confirmEffect(currentUser.uid, effectReflectionId, { result, confirmedAt: new Date() });
  showToast('記録しました');
  openDetail(effectReflectionId);
}
