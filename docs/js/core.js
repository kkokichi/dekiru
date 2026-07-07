// ── STATE ──
let currentScreen = 'auth';
let prevScreen = 'home';
let activeReflectionId = null; // detail/practice/effect/wizard(再開)が参照する対象ID

// ── iOS Safari対策 ──
// キーボードが開くとiOSはフォーカス中の入力欄を見せるためにページ全体を
// 押し上げる。#appの高さを可視領域（visualViewport）に合わせて縮めることで
// 「押し上げる理由」自体をなくし、入力欄は画面内スクロールで見せる。
// ただしvisualViewportはツールバーの伸縮などキーボード以外でも変化するため、
// キーボードが開いている時（可視領域が大きく縮んだ時）だけ高さを固定し、
// それ以外はCSSの100dvhに任せる（固定したままだと下端に隙間ができて浮く）
// アプリの高さはCSSのdvhではなくJSの実測値を正とする。
// Safariはツールバーの伸縮で見える高さが変わり、dvhとfixedボディの
// 組み合わせでは下端に隙間ができる（浮く）端末があるため
const setAppHeight = () => {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
};
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
setAppHeight();

if (window.visualViewport) {
  const syncViewportHeight = () => {
    const keyboardOpen = window.innerHeight - window.visualViewport.height > 60;
    document.getElementById('app').style.height = keyboardOpen
      ? `${window.visualViewport.height}px`
      : '';
    setAppHeight();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  window.visualViewport.addEventListener('resize', syncViewportHeight);
  window.visualViewport.addEventListener('scroll', syncViewportHeight);
}
// キーボード表示後、入力欄が隠れていたら画面内スクロールで見せる
document.addEventListener('focusin', (e) => {
  if (e.target.matches('input, textarea')) {
    setTimeout(() => e.target.scrollIntoView({ block: 'center' }), 300);
  }
});
document.addEventListener(
  'blur',
  (e) => {
    if (e.target.matches('input, textarea')) {
      setTimeout(() => window.scrollTo(0, 0), 50);
    }
  },
  true,
);

// ── NAVIGATION ──
const TAB_SCREENS = ['home', 'growth', 'list', 'settings'];

function navigate(screen) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
  document.getElementById(screen).classList.add('active');
  const navEl = document.getElementById('nav-' + screen);
  if (navEl) navEl.classList.add('active');
  prevScreen = currentScreen;
  currentScreen = screen;
  const el = document.getElementById(screen);
  if (el) el.scrollTop = 0;
  document.querySelector('.tabbar').style.display = TAB_SCREENS.includes(screen) ? 'flex' : 'none';
}

function goBack() {
  if (prevScreen === 'detail' && activeReflectionId) {
    openDetail(activeReflectionId);
  } else if (TAB_SCREENS.includes(prevScreen)) {
    navigate(prevScreen);
    if (prevScreen === 'home') renderHome();
    if (prevScreen === 'growth') renderGrowth();
    if (prevScreen === 'list') renderList();
  } else {
    navigate('home');
    renderHome();
  }
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── FORMAT HELPERS ──
function formatDate(date) {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(date) {
  return `${formatDate(date)} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
}

// ローカル日付のYYYY-MM-DDキー。toISOString()はUTC変換で日付がずれるため使わない
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 「7月7日（月）」形式。DateまたはYYYY-MM-DD文字列を受け取る
function formatShortDate(dateOrKey) {
  const date = typeof dateOrKey === 'string' ? new Date(`${dateOrKey}T00:00:00`) : dateOrKey;
  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日（${dow}）`;
}

const EMOTION_EMOJI = ['😞', '🙁', '😐', '🙂', '😄'];

const CAUSE_LABELS = {
  time: '時間不足',
  preparation: '準備不足',
  knowledge: '知識不足',
  judgement: '判断ミス',
  communication: 'コミュニケーション不足',
  other: 'その他',
};

const STATUS_LABELS = {
  recorded: '未分析',
  analyzed: '分析途中',
  planned: '未対応',
  in_progress: '継続中',
  done: '完了',
};

const STATUS_CLASS = {
  recorded: 'status-neutral',
  analyzed: 'status-accent',
  planned: 'status-accent',
  in_progress: 'status-accent',
  done: 'status-neutral',
};

// ── 共有UIヘルパー ──
function reflectionCardHtml(r) {
  const priorityHtml = r.improvement
    ? `<span class="pill ${r.improvement.priority === 'high' ? 'pill-warn' : 'pill-neutral'}">優先度: ${r.improvement.priority === 'high' ? '高' : r.improvement.priority === 'low' ? '低' : '中'}</span>`
    : '';
  return `
    <div class="reflection-card" onclick="openDetail('${r.id}')">
      <div class="reflection-emo">${EMOTION_EMOJI[r.emotion - 1]}</div>
      <div class="reflection-body">
        <div class="reflection-title">${escapeHtml(r.title)}</div>
        <div class="reflection-meta">
          <span class="tag-category">${escapeHtml(categoryName(r.categoryId))}</span>
          <span class="pill ${STATUS_CLASS[r.status]}">${STATUS_LABELS[r.status]}</span>
          ${priorityHtml}
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function openDetail(id) {
  activeReflectionId = id;
  navigate('detail');
  renderDetail(id);
}
