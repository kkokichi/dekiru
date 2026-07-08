import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';

initializeApp();

const APP_URL = 'https://kkokichi.github.io/dekiru/';

// JSTの現在時刻をHH:MM文字列で返す
function jstHM(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${String(jst.getUTCHours()).padStart(2, '0')}:${String(jst.getUTCMinutes()).padStart(2, '0')}`;
}

// 15分ごとに起動し、直近15分の間にリマインダー時刻（JST）を迎えたユーザーへ
// プッシュ通知を送る。設定はアプリ側がusers/{uid}.settings.reminderに保存している
export const sendReminderPush = onSchedule(
  { schedule: 'every 15 minutes', region: 'asia-northeast1' },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const windowEnd = jstHM(now);
    const windowStart = jstHM(new Date(now.getTime() - 15 * 60 * 1000));

    const snap = await db.collection('users').where('settings.reminder.enabled', '==', true).get();
    for (const doc of snap.docs) {
      const data = doc.data();
      const time: string | undefined = data.settings?.reminder?.time;
      const tokens: string[] = data.fcmTokens ?? [];
      if (!time || tokens.length === 0) continue;
      // 日付をまたぐ窓（例: 23:50〜00:05）にも対応
      const inWindow =
        windowStart <= windowEnd
          ? time > windowStart && time <= windowEnd
          : time > windowStart || time <= windowEnd;
      if (!inWindow) continue;

      const res = await getMessaging().sendEachForMulticast({
        tokens,
        notification: { title: 'Reflect', body: '今日のチェックを記録しましょう' },
        webpush: { fcmOptions: { link: APP_URL } },
      });

      // 失効したトークンは掃除する
      const invalid = tokens.filter((_, i) => {
        const code = res.responses[i].error?.code;
        return (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        );
      });
      if (invalid.length > 0) {
        await doc.ref.update({
          fcmTokens: tokens.filter((t) => !invalid.includes(t)),
        });
      }
      logger.info(`reminder sent to ${doc.id}: ok=${res.successCount} ng=${res.failureCount}`);
    }
  },
);
