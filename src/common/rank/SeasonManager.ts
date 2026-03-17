// 赛季管理器
// 每2个月为一个赛季，在下一个月1号0点刷新
// S1: 1-2月, S2: 3-4月, S3: 5-6月, S4: 7-8月, S5: 9-10月, S6: 11-12月

import {DEFAULT_SIGMA} from './constants';

// 赛季积分奖励
export const SEASON_POINTS_REWARDS: Record<number, number> = {
  1: 100, // 第一名
  2: 75, // 第二名
  3: 60, // 第三名
  4: 45, // 第四名
  5: 40, // 第五名
  6: 35, // 第六名
  7: 30, // 第七名
  8: 25, // 第八名
  9: 20, // 第九名
  10: 20, // 第十名
};
export const SEASON_POINTS_TOP_TEN = 20; // 前十
export const SEASON_POINTS_TOP_HUNDRED = 10; // 前一百
export const SEASON_POINTS_DEFAULT = 2; // 其他玩家

// 胜者积分奖励配置（根据玩家人数）
export const WINNER_POINTS_SMALL_GAME = 1; // 2-3人局
export const WINNER_POINTS_LARGE_GAME = 2; // 4-5人局

export function getWinnerPointsReward(playerCount: number): number {
  if (playerCount <= 3) return WINNER_POINTS_SMALL_GAME;
  return WINNER_POINTS_LARGE_GAME;
}

// 赛季软重置参数：保留60%的旧分数
export const SEASON_MU_RETENTION = 0.6;
export const SEASON_SIGMA_RETENTION = 0.6;

export interface ISeasonInfo {
  seasonId: string; // 格式: "2026-S1"
  seasonName: string; // 格式: "Season 1 (Jan-Feb 2026)"
  startDate: Date;
  endDate: Date; // 赛季结束时间（下一个赛季开始时间）
}

/**
 * 根据日期获取赛季编号 (1-6)
 */
export function getSeasonNumber(date: Date): number {
  const month = date.getMonth() + 1; // 1-12
  return Math.ceil(month / 2); // 1-6
}

/**
 * 获取赛季ID，格式: "2026-S1"
 */
export function getSeasonId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const seasonNum = getSeasonNumber(date);
  return `${year}-S${seasonNum}`;
}

/**
 * 获取指定赛季的上一个赛季ID
 */
export function getPreviousSeasonId(seasonId: string): string {
  const match = seasonId.match(/^(\d{4})-S([1-6])$/);
  if (match === null) {
    return seasonId;
  }
  const year = Number(match[1]);
  const seasonNumber = Number(match[2]);
  if (seasonNumber > 1) {
    return `${year}-S${seasonNumber - 1}`;
  }
  return `${year - 1}-S6`;
}

/**
 * 获取指定赛季的下一个赛季ID
 */
export function getNextSeasonId(seasonId: string): string {
  const match = seasonId.match(/^(\d{4})-S([1-6])$/);
  if (match === null) {
    return seasonId;
  }
  const year = Number(match[1]);
  const seasonNumber = Number(match[2]);
  if (seasonNumber < 6) {
    return `${year}-S${seasonNumber + 1}`;
  }
  return `${year + 1}-S1`;
}

/**
 * 获取赛季信息
 */
export function getSeasonInfo(date: Date = new Date()): ISeasonInfo {
  const year = date.getFullYear();
  const seasonNum = getSeasonNumber(date);
  const startMonth = (seasonNum - 1) * 2; // 0-indexed: 0,2,4,6,8,10
  const endMonth = startMonth + 2;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonthName = monthNames[startMonth];
  const endMonthName = monthNames[startMonth + 1];

  let endYear = year;
  let endMonthActual = endMonth;
  if (endMonth > 11) {
    endYear = year + 1;
    endMonthActual = 0;
  }

  return {
    seasonId: `${year}-S${seasonNum}`,
    seasonName: `Season ${seasonNum} (${startMonthName}-${endMonthName} ${year})`,
    startDate: new Date(year, startMonth, 1, 0, 0, 0),
    endDate: new Date(endYear, endMonthActual, 1, 0, 0, 0),
  };
}

/**
 * 判断是否需要重置赛季
 * @param lastSeasonId 上一次记录的赛季ID
 * @param currentDate 当前日期
 */
export function shouldResetSeason(lastSeasonId: string | undefined, currentDate: Date = new Date()): boolean {
  if (lastSeasonId === undefined) return false; // 首次无需重置
  const currentSeasonId = getSeasonId(currentDate);
  return currentSeasonId !== lastSeasonId;
}

/**
 * 赛季软重置：计算新的mu和sigma
 * 参考LoL等游戏的赛季重置机制，保留一部分旧分数
 */
export function softResetMu(oldMu: number): number {
  // 赛季重置后保留玩家的技能均值，延续长期实力
  return oldMu;
}

export function softResetSigma(_oldSigma: number): number {
  // 重置不确定性到初始值，让新赛季更快重新校准匹配
  return DEFAULT_SIGMA;
}

/**
 * 根据赛季ID计算赛季的开始日期
 */
export function nowFromSeasonId(seasonId: string): Date {
  const match = seasonId.match(/^(\d{4})-S([1-6])$/);
  if (match === null) {
    return new Date();
  }
  const year = Number(match[1]);
  const seasonNumber = Number(match[2]);
  const month = (seasonNumber - 1) * 2;
  return new Date(year, month, 1, 0, 0, 0);
}

/**
 * 根据赛季排名获取积分奖励
 */
export function getSeasonPointsReward(position: number): number {
  if (position <= 0) {
    return SEASON_POINTS_DEFAULT;
  }
  if (position in SEASON_POINTS_REWARDS) {
    return SEASON_POINTS_REWARDS[position];
  }
  if (position <= 10) {
    return SEASON_POINTS_TOP_TEN;
  }
  if (position <= 100) {
    return SEASON_POINTS_TOP_HUNDRED;
  }
  return SEASON_POINTS_DEFAULT;
}
