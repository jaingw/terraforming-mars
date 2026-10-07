// 赛季重置处理器
// 在服务器启动时检查是否需要重置赛季，并在需要时执行重置。
//
// ============ 调用链路（三层）============
//
//   server.ts（服务器启动）
//     └─► checkAndResetSeason()                         // 自动：判断是否需要重置
//           └─► runSeasonReset({triggeredBy:'auto'})    // 公共入口：加锁 + 解析赛季 id
//                 └─► performSeasonReset(...)           // 执行体：真正改排名数据
//
//   SeasonService.ts（admin 手动触发 /season/admin/reset）
//     └─► runSeasonReset({triggeredBy:'admin', ...})
//           └─► performSeasonReset(...)
//
// 即：自动路径与 admin 路径最终都汇入同一个执行体 performSeasonReset，
//     区别只在入口的判断逻辑与传入的 triggeredBy / 赛季 id。
//
// ============ 各方法职责 ============
//
// - checkAndResetSeason(): 决策 + 自动触发（server 启动时调用，无参，不返回结果）。
//     读当前赛季与全量排名，判断“是否需要重置”；顺带处理“首次启用赛季”
//     （所有用户 seasonId 都为空时，统一设为当前赛季并落库）；条件满足且过
//     shouldResetSeason 门槛后，触发 runSeasonReset。自身不改排名数据。
//
// - runSeasonReset(options): 对外公共入口（自动 + admin 共用）。负责并发锁
//     isSeasonResetRunning、解析 previousSeasonId/newSeasonId（admin 触发时推进到
//     下一赛季），再委托 performSeasonReset 执行。
//
// - performSeasonReset(previousSeasonId, newSeasonId, dryRun, triggeredBy):
//     纯执行体（不对外）。按给定赛季 id 取全量排名 → 排序 → 过滤出待重置用户 →
//     保存赛季快照 + 发放赛季积分 + 软重置 rankValue/mu/sigma/trueskill + 更新
//     seasonId → 写库并刷新内存缓存 → 更新 current_season / seasons。
//     支持 dryRun：只返回预览、不落库。

import {Database} from '../database/Database';
import {GameLoader} from '../database/GameLoader';
import {UserRank} from '../../common/rank/RankManager';
import {DEFAULT_RANK_VALUE} from '../../common/rank/constants';
import {RankTiers} from '../../common/rank/RankTiers';
import {
  getSeasonInfo,
  getSeasonPointsReward,
  getPreviousSeasonId,
  getNextSeasonId,
  nowFromSeasonId,
  softResetMu,
  softResetSigma,
} from '../../common/rank/SeasonManager';
import {SeasonService} from '../services/SeasonService';

export interface ISeasonResetOptions {
  expectedFromSeasonId?: string;
  dryRun?: boolean;
  triggeredBy?: 'auto' | 'admin';
}

export interface ISeasonResetPlayerPreview {
  userId: string;
  position: number;
  oldRankValue: number;
  newRankValue: number;
  oldMu: number;
  newMu: number;
  oldSigma: number;
  newSigma: number;
  pointsEarned: number;
}

export interface ISeasonResetResult {
  status: 'skipped' | 'dry-run' | 'completed';
  reason?: string;
  fromSeasonId: string;
  toSeasonId: string;
  playerCount: number;
  preview: Array<ISeasonResetPlayerPreview>;
  triggeredBy: 'auto' | 'admin';
}

let isSeasonResetRunning = false;

/**
 * 自动入口：检查并触发赛季重置（server 启动时调用，也可定期调用）。
 * 只做判断与触发，不改排名数据；真正的重置由 runSeasonReset → performSeasonReset 完成。
 */
export async function checkAndResetSeason(): Promise<void> {
  const now = new Date();
  const currentSeason = await Database.getInstance().getCurrentSeason();
  const currentSeasonId = await SeasonService.resolveCurrentSeasonId(now);
  const seasonName = currentSeason?.seasonName || getSeasonInfo(now)?.seasonName;
  const gameLoader = GameLoader.getInstance();
  // 全量读取数据库排名，不能依赖懒加载缓存（缓存只含本进程访问过的用户）。
  const userRanks = await Database.getInstance().getUserRanks();

  // 检查是否有任何用户的 seasonId 需要更新（即赛季已经变化）
  let needsReset = false;
  let previousSeasonId: string | undefined;

  for (const userRank of userRanks) {
    if (userRank.seasonId && userRank.seasonId !== currentSeasonId) {
      needsReset = true;
      previousSeasonId = userRank.seasonId;
      break;
    }
  }

  // 如果没有用户有 seasonId，说明是首次启用赛季系统，为所有用户设置当前赛季
  if (!needsReset) {
    let hasAnySeasonId = false;
    for (const userRank of userRanks) {
      if (userRank.seasonId && userRank.seasonId.length > 0) {
        hasAnySeasonId = true;
        break;
      }
    }
    if (!hasAnySeasonId && userRanks.length > 0) {
      console.log(`[Season] First-time season setup. Setting all users to season ${currentSeasonId}`);
      const seasonInfo = getSeasonInfo(now);
      for (const userRank of userRanks) {
        userRank.seasonId = currentSeasonId;
        await Database.getInstance().updateUserRank(userRank);
        // 只刷新已在缓存中的用户，不新增，避免把懒加载缓存撑成全量。
        gameLoader.addOrUpdateUserRank(userRank, true);
      }
      await Database.getInstance().setCurrentSeason(
        currentSeasonId,
        seasonInfo.seasonName,
        seasonInfo.startDate,
        seasonInfo.endDate,
      );
      await Database.getInstance().saveSeason(
        currentSeasonId,
        seasonInfo.seasonName,
        seasonInfo.startDate,
        seasonInfo.endDate,
      );
      return;
    }
    console.log(`[Season] Current season: ${currentSeasonId} (${seasonName}). No reset needed.`);
    return;
  }

  if (!await SeasonService.shouldResetSeason(previousSeasonId, now)) {
    console.log(`[Season] No season reset needed. Current: ${currentSeasonId}, Previous: ${previousSeasonId}`);
    return;
  }

  const result = await runSeasonReset({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectedFromSeasonId: previousSeasonId!,
    dryRun: false,
    triggeredBy: 'auto',
  });
  console.log('[Season] Auto season reset result:', result.status, result.reason || '');
}

/**
 * 对外公共入口（自动 + admin 手动共用，支持 dry-run）。
 * 负责并发锁与解析 previousSeasonId/newSeasonId，再委托 performSeasonReset 执行。
 * 先使用 current_season 作为当前赛季来源；如果缺失，再按当前时间推导。
 */
export async function runSeasonReset(options: ISeasonResetOptions = {}): Promise<ISeasonResetResult> {
  if (isSeasonResetRunning) {
    throw new Error('Season reset is already running');
  }
  isSeasonResetRunning = true;
  try {
    const now = new Date();
    const currentSeasonId = await SeasonService.resolveCurrentSeasonId(now);
    const previousSeasonId = options.expectedFromSeasonId || getPreviousSeasonId(currentSeasonId);
    const dryRun = options.dryRun === true;
    const triggeredBy = options.triggeredBy || 'admin';
    // When admin triggers, move to next season instead of staying in current season
    const newSeasonId = triggeredBy === 'admin' && options.expectedFromSeasonId ?
      getNextSeasonId(previousSeasonId) :
      currentSeasonId;
    return await performSeasonReset(previousSeasonId, newSeasonId, dryRun, triggeredBy);
  } finally {
    isSeasonResetRunning = false;
  }
}

/**
 * 执行体（内部，仅由 runSeasonReset 调用；支持 dry-run）。
 * 1. 对所有用户按排名排序
 * 2. 保存赛季快照
 * 3. 发放积分
 * 4. 软重置分数并更新 seasonId
 */
async function performSeasonReset(
  previousSeasonId: string,
  newSeasonId: string,
  dryRun: boolean,
  triggeredBy: 'auto' | 'admin',
): Promise<ISeasonResetResult> {
  const gameLoader = GameLoader.getInstance();
  const db = Database.getInstance();

  // 1. 获取所有用户排名（全量，来自数据库而不是懒加载缓存），按 rankValue 降序、trueskill 降序排序
  const allRanks = await db.getUserRanks();

  allRanks.sort((a, b) => {
    if (b.rankValue !== a.rankValue) {
      return b.rankValue - a.rankValue;
    }
    return b.trueskill - a.trueskill;
  });

  // 新赛季元数据统一从 SeasonManager 推导，保持与 seasonId 的双月规则一致。
  const seasonInfo = getSeasonInfo(nowFromSeasonId(newSeasonId));
  const startDate = seasonInfo.startDate;
  const endDate = seasonInfo.endDate;
  const seasonName = seasonInfo.seasonName;

  console.log(`[Season] Season reset triggered! Previous: ${previousSeasonId} -> Current: ${newSeasonId}`);
  console.log(`[Season] ${seasonName}, triggeredBy=${triggeredBy}, dryRun=${dryRun}`);
  console.log(`[Season] Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);

  // 需要重置的用户：seasonId 为空或等于 previousSeasonId 的用户
  // 排除已经在 newSeasonId 的用户
  const ranksToReset = allRanks.filter((rank) => {
    const seasonId = rank.seasonId;
    if (!seasonId || seasonId.length === 0) {
      return true;
    }
    if (seasonId === newSeasonId) {
      return false;
    }
    return seasonId === previousSeasonId;
  });
  const playersInNewSeason = allRanks.filter((rank) => rank.seasonId === newSeasonId);

  if (ranksToReset.length === 0) {
    console.log(`[Season] No players found in season ${previousSeasonId}. All players are already in ${newSeasonId} or have no season ID.`);
    return {
      status: 'skipped',
      reason: `No players found in season ${previousSeasonId}. All players are already in ${newSeasonId} or have no season ID.`,
      fromSeasonId: previousSeasonId,
      toSeasonId: newSeasonId,
      playerCount: allRanks.length,
      preview: [],
      triggeredBy,
    };
  }

  if (playersInNewSeason.length > 0) {
    console.log(`[Season] Warning: ${playersInNewSeason.length} players are already in season ${newSeasonId}, they will be skipped.`);
  }

  console.log(`[Season] Processing ${ranksToReset.length} players for season reset (skipping ${playersInNewSeason.length} players already in new season)`);

  const preview = buildResetPreview(ranksToReset, 20);
  if (dryRun) {
    return {
      status: 'dry-run',
      fromSeasonId: previousSeasonId,
      toSeasonId: newSeasonId,
      playerCount: ranksToReset.length,
      preview,
      triggeredBy,
    };
  }

  // 更新上一个赛季的结束时间为新赛季的开始时间
  const previousSeason = await db.getCurrentSeason();
  if (previousSeason && previousSeason.seasonId === previousSeasonId) {
    const prevStartDate = new Date(previousSeason.startDate);
    await db.saveSeason(previousSeasonId, previousSeason.seasonName, prevStartDate, startDate);
    console.log(`[Season] Updated previous season ${previousSeasonId} end date to ${startDate.toISOString()}`);
  } else {
    // 尝试从 seasons 表获取
    const savedPrevSeason = await db.getSeason(previousSeasonId);
    if (savedPrevSeason) {
      const prevStartDate = new Date(savedPrevSeason.startDate);
      await db.saveSeason(previousSeasonId, savedPrevSeason.seasonName, prevStartDate, startDate);
      console.log(`[Season] Updated previous season ${previousSeasonId} end date to ${startDate.toISOString()}`);
    }
  }

  // 2 & 3. 保存快照并发放积分
  for (let i = 0; i < ranksToReset.length; i++) {
    const userRank = ranksToReset[i];
    const position = i + 1; // 1-indexed
    const pointsEarned = getSeasonPointsReward(position);

    // 保存赛季快照
    await db.saveUserRankSeasonSnapshot(
      userRank.userId,
      previousSeasonId,
      userRank.rankValue,
      userRank.mu,
      userRank.sigma,
      userRank.trueskill,
      pointsEarned,
      position,
    );

    // 累加积分
    userRank.points = (userRank.points || 0) + pointsEarned;

    console.log(`[Season] Player ${userRank.userId}: position=${position}, points_earned=${pointsEarned}, total_points=${userRank.points}`);

    // 4. 软重置排名
    userRank.rankValue = computeSeasonResetRankValue(userRank);
    // TrueSkill 保留一部分
    userRank.mu = softResetMu(userRank.mu);
    userRank.sigma = softResetSigma(userRank.sigma);
    userRank.trueskill = userRank.mu - 3 * userRank.sigma;
    // 更新赛季ID
    userRank.seasonId = newSeasonId;

    // 保存到数据库（updateUserRank 已包含 points 字段更新）
    await db.updateUserRank(userRank);

    // 只刷新已在缓存中的用户，不新增，避免把懒加载缓存撑成全量。
    gameLoader.addOrUpdateUserRank(userRank, true);
  }

  // 更新当前赛季信息
  await db.setCurrentSeason(newSeasonId, seasonName, startDate, endDate);
  // 同时保存到 seasons 表
  await db.saveSeason(newSeasonId, seasonName, startDate, endDate);

  console.log(`[Season] Season reset complete. ${ranksToReset.length} players processed.`);
  console.log(`[Season] Current season updated to: ${newSeasonId} (${seasonName})`);
  return {
    status: 'completed',
    fromSeasonId: previousSeasonId,
    toSeasonId: newSeasonId,
    playerCount: ranksToReset.length,
    preview,
    triggeredBy,
  };
}

function buildResetPreview(allRanks: Array<UserRank>, limit: number): Array<ISeasonResetPlayerPreview> {
  return allRanks.slice(0, limit).map((rank, index) => {
    const newRankValue = computeSeasonResetRankValue(rank);
    const newMu = softResetMu(rank.mu);
    const newSigma = softResetSigma(rank.sigma);
    return {
      userId: rank.userId,
      position: index + 1,
      oldRankValue: rank.rankValue,
      newRankValue,
      oldMu: rank.mu,
      newMu,
      oldSigma: rank.sigma,
      newSigma,
      pointsEarned: getSeasonPointsReward(index + 1),
    };
  });
}

function computeSeasonResetRankValue(userRank: UserRank): number {
  const tierName = userRank.getTier().name;
  const tierIndex = RankTiers.findIndex((tier) => tier.name === tierName);
  if (tierIndex <= 0) {
    return DEFAULT_RANK_VALUE;
  }
  return DEFAULT_RANK_VALUE + tierIndex;
}
