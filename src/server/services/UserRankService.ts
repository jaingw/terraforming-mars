/**
 * UserRankService — 用户排名业务逻辑
 *
 * 从 UserCenter 中拆分出来的排名功能，职责更单一。
 */

import {Database} from '../database/Database';
import {GameLoader} from '../database/GameLoader';
import {getSeasonId} from '../../common/rank/SeasonManager';
import {UserRank} from '../../common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '../../common/rank/constants';
import {ServiceError} from './ServiceError';

export interface IUserRankResponse {
  userId: string;
  rankValue: number;
  mu: number;
  sigma: number;
  trueskill: number;
  points: number;
  seasonId: string;
}

export class UserRankService {
  static async getUserRank(userId: string | null, playerName: string | null): Promise<IUserRankResponse> {
    let resolvedUserId = userId;

    if (!resolvedUserId && playerName) {
      const user = GameLoader.getInstance().userNameMap.get(playerName);
      if (user !== undefined) {
        resolvedUserId = user.id;
      }
    }

    if (!resolvedUserId) {
      throw new ServiceError(404, 'not find user id or player name');
    }

    const currentSeasonData = await Database.getInstance().getCurrentSeason();
    const currentSeasonId = currentSeasonData?.seasonId || getSeasonId();

    let userRank: UserRank | undefined = GameLoader.getInstance().userRankMap.get(resolvedUserId);
    if (userRank === undefined) {
      userRank = new UserRank(
        resolvedUserId,
        DEFAULT_RANK_VALUE,
        DEFAULT_MU,
        DEFAULT_SIGMA,
        0,
        0,
        currentSeasonId,
      );
      Database.getInstance().addUserRank(userRank);
      GameLoader.getInstance().addOrUpdateUserRank(userRank);
    }

    return {
      userId: userRank.userId,
      rankValue: userRank.rankValue,
      mu: userRank.mu,
      sigma: userRank.sigma,
      trueskill: userRank.trueskill,
      points: userRank.points || 0,
      seasonId: userRank.seasonId || '',
    };
  }

  static async activateRank(userId: string): Promise<void> {
    if (!userId) {
      throw new ServiceError(400, 'Missing userId');
    }

    const currentSeasonData = await Database.getInstance().getCurrentSeason();
    const currentSeasonId = currentSeasonData?.seasonId || getSeasonId();

    let userRank = GameLoader.getInstance().userRankMap.get(userId);
    if (userRank === null || userRank === undefined) {
      userRank = new UserRank(
        userId,
        DEFAULT_RANK_VALUE,
        DEFAULT_MU,
        DEFAULT_SIGMA,
        0,
        0,
        currentSeasonId,
      );
      Database.getInstance().addUserRank(userRank);
      GameLoader.getInstance().addOrUpdateUserRank(userRank);
    }
  }
}
