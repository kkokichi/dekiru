async function openExport() {
  navigate('export');
  const textarea = document.getElementById('export-text');
  textarea.value = '生成中…';
  textarea.value = await buildExportMarkdown();
}

async function buildExportMarkdown() {
  const reflections = await listReflections(currentUser.uid);
  const byId = new Map(reflections.map((r) => [r.id, r]));
  const done = reflections.filter((r) => r.status === 'done');
  const recur = reflections.filter((r) => r.recurrenceOf);
  const lessons = reflections.filter((r) => r.lesson);

  const lines = [];
  lines.push('# Reflect 振り返りデータ');
  lines.push('');
  lines.push(
    'これは失敗の振り返りアプリ「Reflect」のエクスポートです。以下のデータを分析して、' +
      '(1) 繰り返している失敗のパターン、(2) 原因の偏り、(3) 改善が定着しやすい/しにくい条件、' +
      '(4) 次に取り組むと効果が大きそうな改善策、を日本語で教えてください。',
  );
  lines.push('');
  lines.push(`エクスポート日: ${formatDate(new Date())}`);
  lines.push('');
  lines.push('## サマリー');
  lines.push(`- 振り返り: ${reflections.length}件（完了 ${done.length}件、再発 ${recur.length}件）`);
  lines.push(`- 教訓: ${lessons.length}件`);
  lines.push('');
  lines.push('## 振り返り一覧');

  const sorted = [...reflections].sort((a, b) => a.occurredAt - b.occurredAt);
  sorted.forEach((r, i) => {
    lines.push('');
    lines.push(`### ${i + 1}. ${r.title}`);
    lines.push(`- カテゴリ: ${categoryName(r.categoryId)} / 状態: ${STATUS_LABELS[r.status]}`);
    lines.push(`- 発生日: ${formatDate(r.occurredAt)} / 感情: ${EMOTION_EMOJI[r.emotion - 1]}（${r.emotion}/5）`);
    if (r.detail) lines.push(`- 詳細: ${r.detail}`);
    if (r.causes.length > 0) {
      const causes = r.causes.map((c) => CAUSE_LABELS[c]).join('、');
      lines.push(`- 原因: ${causes}${r.causeNote ? `（補足: ${r.causeNote}）` : ''}`);
    }
    if (r.improvement) {
      lines.push(`- 改善策: ${r.improvement.action}（目標日 ${formatDate(r.improvement.dueDate)}）`);
    }
    if (r.checkins.length > 0) {
      const doneDays = r.checkins.filter((c) => c.done).length;
      lines.push(`- 実践チェック: ○${doneDays}日 / ✕${r.checkins.length - doneDays}日`);
      r.checkins.forEach((c) => {
        lines.push(`  - ${c.date} ${c.done ? '○' : '✕'}${c.reason ? ` ${c.reason}` : ''}`);
      });
    }
    if (r.lesson) lines.push(`- 教訓: ${r.lesson}`);
    if (r.recurrenceOf) {
      lines.push(`- 再発元: ${byId.get(r.recurrenceOf)?.title ?? '（削除済み）'}`);
    }
  });
  lines.push('');
  return lines.join('\n');
}

async function copyExport() {
  const text = document.getElementById('export-text').value;
  try {
    await navigator.clipboard.writeText(text);
    showToast('コピーしました。AIに貼り付けて分析してもらいましょう');
  } catch (err) {
    // クリップボードAPIが使えない環境向けのフォールバック
    const textarea = document.getElementById('export-text');
    textarea.select();
    document.execCommand('copy');
    showToast('コピーしました');
  }
}

function downloadExport() {
  const text = document.getElementById('export-text').value;
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reflect-export-${dateKey(new Date())}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
