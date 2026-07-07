let listStatusFilter = 'all';
let listCategoryFilter = 'all';
let listAllReflections = [];

const LIST_STATUS_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'recorded', label: '未分析' },
  { value: 'planned', label: '未対応' },
  { value: 'in_progress', label: '実践報告待ち' },
  { value: 'done', label: '完了' },
];

async function renderList() {
  listAllReflections = await listReflections(currentUser.uid);

  document.getElementById('list-status-chips').innerHTML = LIST_STATUS_FILTERS.map(
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

  renderListResults();
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
  const filtered = listAllReflections.filter((r) => {
    if (listCategoryFilter !== 'all' && r.categoryId !== listCategoryFilter) return false;
    if (listStatusFilter !== 'all' && r.status !== listStatusFilter) return false;
    if (query && !r.title.toLowerCase().includes(query)) return false;
    return true;
  });
  const el = document.getElementById('list-results');
  el.innerHTML =
    filtered.length === 0
      ? '<div class="empty-state">条件に一致する振り返りがありません</div>'
      : filtered.map(reflectionCardHtml).join('');
}
