// Capacitorのビルド前に、静的サイト本体（docs/）をwww/へコピーする。
// www/はコピー先の生成物なので.gitignore対象。
//
// 注意: fs.cpSync(..., {recursive:true}) はWindowsで非ASCIIパス（このプロジェクトの
// 「デスクトップ」「サイト作成」等の日本語パス）の場合にネイティブクラッシュする既知の
// 不具合があるため使わず、readdirSync/copyFileSyncで手動再帰コピーする。
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const root = path.resolve(__dirname, '..');
const wwwDir = path.join(root, 'www');

fs.rmSync(wwwDir, { recursive: true, force: true });
fs.mkdirSync(wwwDir, { recursive: true });
copyRecursive(path.join(root, 'docs'), wwwDir);

console.log('www/ を更新しました。');
