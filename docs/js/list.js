let listViewMode = 'reflections'; // 'reflections' | 'lessons'
let listStatusFilter = 'all';
let listCategoryFilter = 'all';
let listDateFilter = 'all';
let listAllReflections = [];

const LIST_STATUS_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'recorded', label: '未分析' },
  { value: 'planned', label: '未対応' },
  { value: 'in_progress', label: '継続中' },
  { value: 'done', label: '完了' },
];

// 「未分析」は原因分析まで入れて中断したもの（analyzed）も含める
const STATUS_FILTER_MATCH = {
  recorded: ['recorded', 'analyzed'],
  planned: ['planned'],
  in_progress: ['in_progress'],
  done: ['done'],
};

const LIST_DATE_FILTERS = [
  { value: 'all', label: '全期間' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: '3months', label: '過去3ヶ月' },
];

// 絞り込みの起点日。全期間はnull
function dateFilterStart(value) {
  const now = new Date();
  if (value === 'today') {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (value === 'week') return getWeekStart(now);
  if (value === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (value === '3months') {
    const d = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
}

async function renderList() {
  listAllReflections = await listReflections(currentUser.uid);

  document.getElementById('list-view-reflections').classList.toggle('active', listViewMode === 'reflections');
  document.getElementById('list-view-lessons').classList.toggle('active', listViewMode === 'lessons');
  document.getElementById('list-search-input').placeholder =
    listViewMode === 'lessons' ? '教訓を検索' : '振り返りを検索';

  const statusChipsEl = document.getElementById('list-status-chips');
  statusChipsEl.style.display = listViewMode === 'lessons' ? 'none' : 'flex';
  statusChipsEl.innerHTML = LIST_STATUS_FILTERS.map(
    (f) =>
      `<button type="button" class="chip-filter ${listStatusFilter === f.value ? 'active' : ''}" onclick="setListStatusFilter('${f.value}')">${f.label}</button>`,
  ).join('');

  const categoryChips = [
    `<button type="button" class="chip-filter ${listCategoryFilter === 'all' ? 'active' : ''}" onclick="setListCategoryFilter('all')">全カテゴリ</button>`,
    ...categoriesCache.map(
      (c) =>
        `<button type="button" class="chip-filter ${listCategoryFilter === c.id ? 'active' : ''}" onclick="setListCategoryFilter('${c.id}')">${escapeHtml(c.name)}</button>`,
    ),
  ];
  document.getElementById('list-category-chips').innerHTML = categoryChips.join('');

  document.getElementById('list-date-chips').innerHTML = LIST_DATE_FILTERS.map(
    (f) =>
      `<button type="button" class="chip-filter ${listDateFilter === f.value ? 'active' : ''}" onclick="setListDateFilter('${f.value}')">${f.label}</button>`,
  ).join('');

  renderListResults();
}

function setListDateFilter(value) {
  listDateFilter = value;
  renderList();
}

function setListViewMode(mode) {
  listViewMode = mode;
  renderList();
}

// 統計カードなど他画面から、フィルタを指定して一覧を開く
function openListFiltered(opts = {}) {
  listViewMode = opts.view ?? 'reflections';
  listStatusFilter = opts.status ?? 'all';
  listCategoryFilter = opts.category ?? 'all';
  listDateFilter = opts.date ?? 'all';
  document.getElementById('list-search-input').value = '';
  navigate('list');
  renderList();
}

function setListStatusFilter(value) {
  listStatusFilter = value;
  renderList();
}

function setListCategoryFilter(value) {
  listCategoryFilter = value;
  renderList();
}

function renderListResults() {
  const query = document.getElementById('list-search-input').value.trim().toLowerCase();
  const dateStart = dateFilterStart(listDateFilter);
  const el = document.getElementById('list-results');

  if (listViewMode === 'lessons') {
    const lessons = listAllReflections.filter((r) => {
      if (!r.lesson) return false;
      if (listCategoryFilter !== 'all' && r.categoryId !== listCategoryFilter) return false;
      if (dateStart && (r.achievedAt ?? r.occurredAt) < dateStart) return false;
      if (query && !r.lesson.toLowerCase().includes(query) && !r.title.toLowerCase().includes(query))
        return false;
      return true;
    });
    el.innerHTML =
      lessons.length === 0
        ? '<div class="empty-state">まだ教訓がありません。改善策を達成すると、学んだことをここに残せます</div>'
        : lessons.map(lessonCardHtml).join('');
    return;
  }

  const filtered = listAllReflections.filter((r) => {
    if (listCategoryFilter !== 'all' && r.categoryId !== listCategoryFilter) return false;
    if (listStatusFilter !== 'all' && !STATUS_FILTER_MATCH[listStatusFilter].includes(r.status))
      return false;
    if (dateStart && r.occurredAt < dateStart) return false;
    if (query && !r.title.toLowerCase().includes(query)) return false;
    return true;
  });
  el.innerHTML =
    filtered.length === 0
      ? '<div class="empty-state">条件に一致する振り返りがありません</div>'
      : filtered.map(reflectionCardHtml).join('');
}

function lessonCardHtml(r) {
  return `
    <div class="reflection-card" onclick="openDetail('${r.id}')">
      <div class="reflection-body">
        <div class="lesson-text">${escapeHtml(r.lesson)}</div>
        <div class="reflection-meta">
          <span class="tag-category">${escapeHtml(categoryName(r.categoryId))}</span>
          <span class="lesson-source">${escapeHtml(r.title)}${r.achievedAt ? ` ・ ${formatDate(r.achievedAt)}` : ''}</span>
        </div>
      </div>
    </div>
  `;
}
