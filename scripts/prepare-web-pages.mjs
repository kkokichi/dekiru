// `npx expo export --platform web` の出力(dist/)に、GitHub Pages配信に必要な
// 追加ファイル(Safariのホーム画面追加対応・SPAフォールバック・.nojekyll)を付与し、docs/へコピーする。
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'dist');

if (!existsSync(distDir)) {
  console.error('dist/ が見つかりません。先に `npx expo export --platform web` を実行してください。');
  process.exit(1);
}

const indexPath = join(distDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const headInjection = `
    <!-- Safari: ホーム画面に追加してWebアプリ(スタンドアロン)として開くための設定 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Reflect">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#faf9f7" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#14160f" media="(prefers-color-scheme: dark)">
    <link rel="apple-touch-icon" href="/dekiru/apple-touch-icon.png">
    <link rel="manifest" href="/dekiru/manifest.json">
`;

if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace('<title>Reflect</title>', `<title>Reflect</title>\n${headInjection}`);
  writeFileSync(indexPath, html);
}

copyFileSync(join(root, 'assets', 'icon.png'), join(distDir, 'apple-touch-icon.png'));

writeFileSync(
  join(distDir, 'manifest.json'),
  JSON.stringify(
    {
      name: 'Reflect',
      short_name: 'Reflect',
      start_url: '/dekiru/',
      scope: '/dekiru/',
      display: 'standalone',
      background_color: '#faf9f7',
      theme_color: '#2f6f4e',
      icons: [{ src: '/dekiru/apple-touch-icon.png', sizes: '1024x1024', type: 'image/png' }],
    },
    null,
    2,
  ) + '\n',
);

// SPAフォールバック: GitHub Pagesは静的ホストのため、直接アクセスされた深いURLは
// 404.htmlが返されるが、その中身をindex.htmlと同じにしてクライアント側ルーティングに委ねる
copyFileSync(indexPath, join(distDir, '404.html'));

// _expo/ (アンダースコア始まり)フォルダがJekyllに無視されないようにする
writeFileSync(join(distDir, '.nojekyll'), '');

console.log('dist/ の後処理が完了しました。');
console.log('続けて次を実行して docs/ に反映してください:');
console.log('  rm -rf docs && cp -r dist docs');
