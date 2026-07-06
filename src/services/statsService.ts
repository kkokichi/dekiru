import { reflectionsRepository } from '@/repositories/reflectionsRepository';
import type { WeeklyStats } from '@/types/reflection';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 本来は Cloud Functions の onReflectionWrite トリガーで stats/weekly に非正規化する想定
 * （アーキテクチャ設計参照）だが、Blaze契約が済むまではクライアント側で都度計算する。
 * 件数が少ないうちは実用上問題ないが、データ量が増えたらCloud Functions移行を検討する。
 */
export const statsService = {
  async getWeeklyStats(uid: string): Promise<WeeklyStats> {
    const weekStart = getWeekStart(new Date());
    const done = await reflectionsRepository.listByFilter(uid, { statuses: ['done'] });
    const doneThisWeek = done.filter((r) => r.effect && r.effect.confirmedAt >= weekStart);
    const improvedCount = doneThisWeek.filter(
      (r) => r.effect?.result === 'improved' || r.effect?.result === 'slightly_improved',
    ).length;

    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      doneCount: doneThisWeek.length,
      improvedCount,
      improvementRate: doneThisWeek.length > 0 ? improvedCount / doneThisWeek.length : null,
    };
  },
};
