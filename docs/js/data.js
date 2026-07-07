// ── 定数 ──
const CAUSES = ['time', 'preparation', 'knowledge', 'judgement', 'communication', 'other'];
const DEFAULT_CATEGORIES = ['仕事', '勉強', '健康', '人間関係', '趣味', 'その他'];
const DEFAULT_CATEGORY_COLORS = ['#2f6f4e', '#4c7fb0', '#b0864c', '#a15b8f', '#5c8f6f', '#9a9f92'];
const AI_SUGGESTION_DAILY_LIMIT = 5;

// キャッシュ（画面間で使い回す。Firestoreの読み取り回数を減らす）
let categoriesCache = [];

// ── Firestore参照ヘルパー ──
function userDocRef(uid) {
  return db.collection('users').doc(uid);
}
function reflectionsCol(uid) {
  return userDocRef(uid).collection('reflections');
}
function categoriesCol(uid) {
  return userDocRef(uid).collection('categories');
}

// ── users ──
async function ensureUserInitialized(uid, profile) {
  const snap = await userDocRef(uid).get();
  if (!snap.exists) {
    await userDocRef(uid).set({
      ...profile,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      aiUsage: { date: '', count: 0 },
      settings: { theme: 'system' },
    });
  }
  await ensureDefaultCategories(uid);
}

async function ensureDefaultCategories(uid) {
  const snap = await categoriesCol(uid).limit(1).get();
  if (!snap.empty) return;
  const batch = db.batch();
  DEFAULT_CATEGORIES.forEach((name, i) => {
    const ref = categoriesCol(uid).doc();
    batch.set(ref, { name, color: DEFAULT_CATEGORY_COLORS[i], order: i, isDefault: true });
  });
  await batch.commit();
}

async function loadCategories(uid) {
  const snap = await categoriesCol(uid).orderBy('order').get();
  categoriesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return categoriesCache;
}

function categoryName(categoryId) {
  return categoriesCache.find((c) => c.id === categoryId)?.name ?? '未分類';
}

async function updateThemeSetting(uid, theme) {
  await userDocRef(uid).update({ 'settings.theme': theme });
}

async function deleteAllUserData(uid) {
  const [reflectionsSnap, categoriesSnap] = await Promise.all([
    reflectionsCol(uid).get(),
    categoriesCol(uid).get(),
  ]);
  const batch = db.batch();
  reflectionsSnap.docs.forEach((d) => batch.delete(d.ref));
  categoriesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(userDocRef(uid));
  await batch.commit();
}

// ── reflections ──
function toReflection(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    occurredAt: data.occurredAt.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    aiSuggestion: data.aiSuggestion
      ? { ...data.aiSuggestion, generatedAt: data.aiSuggestion.generatedAt.toDate() }
      : null,
    improvement: data.improvement
      ? { ...data.improvement, dueDate: data.improvement.dueDate.toDate() }
      : null,
    checkins: (data.checkins || []).map((c) => ({ ...c, recordedAt: c.recordedAt.toDate() })),
    achievedAt: data.achievedAt ? data.achievedAt.toDate() : null,
  };
}

async function createReflection(uid, input) {
  const ref = await reflectionsCol(uid).add({
    ...input,
    occurredAt: firebase.firestore.Timestamp.fromDate(input.occurredAt),
    causes: [],
    causeNote: null,
    aiSuggestion: null,
    improvement: null,
    checkins: [],
    achievedAt: null,
    status: 'recorded',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function updateCauses(uid, id, causes, causeNote) {
  await reflectionsCol(uid)
    .doc(id)
    .update({
      causes,
      causeNote: causeNote || null,
      status: 'analyzed',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

async function saveAiSuggestion(uid, id, suggestion) {
  await reflectionsCol(uid)
    .doc(id)
    .update({
      aiSuggestion: { ...suggestion, generatedAt: firebase.firestore.Timestamp.now() },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

async function confirmImprovement(uid, id, improvement) {
  await reflectionsCol(uid)
    .doc(id)
    .update({
      improvement: {
        ...improvement,
        dueDate: firebase.firestore.Timestamp.fromDate(improvement.dueDate),
      },
      status: 'planned',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

// 「次失敗しないためには」の行動を実行できたかを1日1件、○✕＋理由で記録する。
// 同じ日にもう一度記録すると上書きになる。
async function recordCheckin(uid, id, date, done, reason) {
  const ref = reflectionsCol(uid).doc(id);
  const snap = await ref.get();
  const data = snap.data();
  const entry = { date, done, reason: reason || null, recordedAt: firebase.firestore.Timestamp.now() };
  const checkins = [...(data.checkins || []).filter((c) => c.date !== date), entry].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  await ref.update({
    checkins,
    status: data.status === 'planned' ? 'in_progress' : data.status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function markImprovementAchieved(uid, id) {
  await reflectionsCol(uid)
    .doc(id)
    .update({
      status: 'done',
      achievedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

async function getReflection(uid, id) {
  const doc = await reflectionsCol(uid).doc(id).get();
  if (!doc.exists) return null;
  return toReflection(doc);
}

async function listReflections(uid, filter = {}) {
  let query = reflectionsCol(uid);
  if (filter.categoryId) query = query.where('categoryId', '==', filter.categoryId);
  if (filter.statuses) query = query.where('status', 'in', filter.statuses);
  query = query.orderBy('updatedAt', 'desc');
  const snap = await query.get();
  return snap.docs.map(toReflection);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getWeeklyStats(uid) {
  const weekStartKey = dateKey(getWeekStart(new Date()));
  const active = await listReflections(uid, { statuses: ['planned', 'in_progress', 'done'] });
  let checkinCount = 0;
  let doneCount = 0;
  active.forEach((r) => {
    r.checkins.forEach((c) => {
      if (c.date >= weekStartKey) {
        checkinCount++;
        if (c.done) doneCount++;
      }
    });
  });
  return {
    checkinCount,
    checkinRate: checkinCount > 0 ? doneCount / checkinCount : null,
  };
}
