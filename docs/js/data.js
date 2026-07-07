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
    practice: data.practice
      ? { ...data.practice, reportedAt: data.practice.reportedAt.toDate() }
      : null,
    effect: data.effect ? { ...data.effect, confirmedAt: data.effect.confirmedAt.toDate() } : null,
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
    practice: null,
    effect: null,
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

async function recordPractice(uid, id, practice, nextDueDate) {
  const update = {
    practice: {
      status: practice.status,
      reportedAt: firebase.firestore.Timestamp.fromDate(practice.reportedAt),
    },
    status: 'in_progress',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (practice.status === 'skipped' && nextDueDate) {
    update['improvement.dueDate'] = firebase.firestore.Timestamp.fromDate(nextDueDate);
  }
  await reflectionsCol(uid).doc(id).update(update);
}

async function confirmEffect(uid, id, effect) {
  await reflectionsCol(uid)
    .doc(id)
    .update({
      effect: { ...effect, confirmedAt: firebase.firestore.Timestamp.fromDate(effect.confirmedAt) },
      status: 'done',
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
  const weekStart = getWeekStart(new Date());
  const done = await listReflections(uid, { statuses: ['done'] });
  const doneThisWeek = done.filter((r) => r.effect && r.effect.confirmedAt >= weekStart);
  const improvedCount = doneThisWeek.filter(
    (r) => r.effect.result === 'improved' || r.effect.result === 'slightly_improved',
  ).length;
  return {
    doneCount: doneThisWeek.length,
    improvementRate: doneThisWeek.length > 0 ? improvedCount / doneThisWeek.length : null,
  };
}
