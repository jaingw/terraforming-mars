/**
 * UserCenter — 用户相关的业务逻辑服务层
 *
 * 作为各子服务的聚合入口，保持向后兼容。
 * 具体实现委托给各个专用服务：
 * - SeasonService: 赛季相关
 * - UserRankService: 用户排名相关
 */

// 重新导出错误类型（兼容性）
export {ServiceError} from './ServiceError';

// 重新导出类型（兼容性）
export type {
  ISeasonInfoResponse,
  ISeasonSnapshotEntry,
  ISeasonHistoryResponse,
  ISeasonListResponse,
  ISeasonLeaderboardEntry,
  ISeasonLeaderboardResponse,
  ISeasonResetRequest,
} from './SeasonService';

export type {IUserRankResponse} from './UserRankService';

// 导入服务
import {SeasonService} from './SeasonService';
import {UserRankService} from './UserRankService';

// 导入类型用于方法签名
import type {
  ISeasonInfoResponse,
  ISeasonHistoryResponse,
  ISeasonListResponse,
  ISeasonLeaderboardResponse,
  ISeasonResetRequest,
} from './SeasonService';

import type {IUserRankResponse} from './UserRankService';

// ========== UserCenter 聚合层（委托给各子服务） ==========

export class UserCenter {
  // ===== 赛季相关 =====
  static getSeasonInfo(): Promise<ISeasonInfoResponse> {
    return SeasonService.getSeasonInfo();
  }

  static getSeasonHistory(seasonId: string): Promise<ISeasonHistoryResponse> {
    return SeasonService.getSeasonHistory(seasonId);
  }

  static getSeasonList(now?: Date): Promise<ISeasonListResponse> {
    return SeasonService.getSeasonList(now);
  }

  static getSeasonLeaderboard(seasonId: string, limit?: number): Promise<ISeasonLeaderboardResponse> {
    return SeasonService.getSeasonLeaderboard(seasonId, limit);
  }

  static triggerSeasonReset(payload: ISeasonResetRequest) {
    return SeasonService.triggerSeasonReset(payload);
  }

  // ===== 用户排名相关 =====
  static getUserRank(userId: string | null, playerName: string | null): Promise<IUserRankResponse> {
    return UserRankService.getUserRank(userId, playerName);
  }

  static activateRank(userId: string): Promise<void> {
    return UserRankService.activateRank(userId);
  }
}
