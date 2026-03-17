/**
 * SeasonService — 赛季相关业务逻辑
 *
 * 从 UserCenter 中拆分出来的赛季功能，职责更单一。
 */

import {Database} from '../database/Database';
import {GameLoader} from '../database/GameLoader';
import {
  getSeasonId,
  getSeasonInfo as getSeasonInfoFn,
  ISeasonInfo,
  getPreviousSeasonId,
  nowFromSeasonId,
} from '../../common/rank/SeasonManager';
import {UserRank} from '../../common/rank/RankManager';
import {RankTier} from '../../common/rank/RankTier';
import {runSeasonReset, ISeasonResetResult} from '../rank/SeasonResetHandler';
import {ServiceError} from './ServiceError';

export interface ISeasonInfoResponse {
  seasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  seasons: Array<{seasonId: string; seasonName: string; startDate: string; endDate: string}>;
}

export interface ISeasonSnapshotEntry {
  userId: string;
  rankValue: number;
  mu: number;
  sigma: number;
  trueskill: number;
  pointsEarned: number;
  finalPosition: number;
  userName: string;
}

export interface ISeasonHistoryResponse {
  seasonId: string;
  snapshots: Array<ISeasonSnapshotEntry>;
}

export interface ISeasonListResponse {
  currentSeasonId: string;
  previousSeasonId: string;
}

export interface ISeasonLeaderboardEntry {
  userName: string;
  userTier: RankTier;
  rankValue: number;
  trueskill: number;
  seasonId: string;
  finalPosition?: number;
  pointsEarned?: number;
}

export interface ISeasonLeaderboardResponse {
  seasonId: string;
  isCurrentSeason: boolean;
  allUserRanks: Array<ISeasonLeaderboardEntry>;
}

export interface ISeasonResetRequest {
  expectedFromSeasonId?: string;
  dryRun?: boolean;
}

export class SeasonService {
  private static async getAllSeasons(): Promise<
    Array<{seasonId: string; seasonName: string; startDate: string; endDate: string}>
    > {
    const db = Database.getInstance();
    const currentSeason = await db.getCurrentSeason();
    const seasonsMap = new Map<string, {seasonId: string; seasonName: string; startDate: string; endDate: string}>();

    if (currentSeason) {
      seasonsMap.set(currentSeason.seasonId, {
        seasonId: currentSeason.seasonId,
        seasonName: currentSeason.seasonName,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate,
      });
    }

    const dbSeasons = await db.getAvailableSeasons();
    for (const seasonId of dbSeasons) {
      if (seasonsMap.has(seasonId)) {
        continue;
      }
      const savedSeason = await db.getSeason(seasonId);
      if (savedSeason) {
        seasonsMap.set(seasonId, savedSeason);
      } else {
        const seasonInfo = getSeasonInfoFn(nowFromSeasonId(seasonId));
        seasonsMap.set(seasonId, {
          seasonId,
          seasonName: seasonInfo.seasonName,
          startDate: seasonInfo.startDate.toISOString(),
          endDate: seasonInfo.endDate.toISOString(),
        });
      }
    }

    const seasons = Array.from(seasonsMap.values());
    seasons.sort((a, b) => a.seasonId.localeCompare(b.seasonId));
    return seasons;
  }

  static async getSeasonInfo(): Promise<ISeasonInfoResponse> {
    const currentSeason = await Database.getInstance().getCurrentSeason();
    const seasons = await this.getAllSeasons();

    if (currentSeason) {
      return {
        seasonId: currentSeason.seasonId,
        seasonName: currentSeason.seasonName,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate,
        seasons,
      };
    }

    const now = new Date();
    const seasonInfo: ISeasonInfo = getSeasonInfoFn(now);
    const currentSeasonId = getSeasonId(now);

    return {
      seasonId: currentSeasonId,
      seasonName: seasonInfo.seasonName,
      startDate: seasonInfo.startDate.toISOString(),
      endDate: seasonInfo.endDate.toISOString(),
      seasons,
    };
  }

  static async getSeasonHistory(seasonId: string): Promise<ISeasonHistoryResponse> {
    if (!seasonId) {
      throw new ServiceError(400, 'Missing seasonId parameter');
    }

    const snapshots = await Database.getInstance().getSeasonSnapshots(seasonId);
    const result: Array<ISeasonSnapshotEntry> = snapshots.map((s) => {
      const user = GameLoader.getInstance().userIdMap.get(s.userId);
      return {
        ...s,
        userName: user?.name || 'Unknown',
      };
    });

    return {seasonId, snapshots: result};
  }

  static async getSeasonList(now: Date = new Date()): Promise<ISeasonListResponse> {
    const currentSeason = await Database.getInstance().getCurrentSeason();
    let currentSeasonId: string;
    if (currentSeason) {
      currentSeasonId = currentSeason.seasonId;
    } else {
      currentSeasonId = getSeasonId(now);
    }
    return {
      currentSeasonId,
      previousSeasonId: getPreviousSeasonId(currentSeasonId),
    };
  }

  static async getSeasonLeaderboard(
    seasonId: string,
    limit = 100,
  ): Promise<ISeasonLeaderboardResponse> {
    if (!seasonId) {
      throw new ServiceError(400, 'Missing seasonId parameter');
    }

    const currentSeasonData = await Database.getInstance().getCurrentSeason();
    const currentSeasonId = currentSeasonData?.seasonId || getSeasonId();

    if (seasonId === currentSeasonId) {
      const allUserRanks = await Database.getInstance().getUserRanks(Math.min(100, limit));
      const rankList = Array.isArray(allUserRanks) ? allUserRanks : [];
      const entries = rankList.map((userRank) => {
        const user = GameLoader.getInstance().userIdMap.get(userRank.userId);
        return {
          userName: user?.name || 'Unknown',
          userTier: userRank.getTier(),
          rankValue: userRank.rankValue,
          trueskill: userRank.trueskill,
          seasonId: userRank.seasonId || currentSeasonId,
        };
      });
      return {
        seasonId,
        isCurrentSeason: true,
        allUserRanks: entries,
      };
    }

    const snapshots = await Database.getInstance().getSeasonSnapshots(seasonId);
    const entries = snapshots.slice(0, Math.min(100, limit)).map((snapshot) => {
      const user = GameLoader.getInstance().userIdMap.get(snapshot.userId);
      const userRank = new UserRank(
        snapshot.userId,
        snapshot.rankValue,
        snapshot.mu,
        snapshot.sigma,
        snapshot.trueskill,
        0,
        seasonId,
      );
      return {
        userName: user?.name || 'Unknown',
        userTier: userRank.getTier(),
        rankValue: snapshot.rankValue,
        trueskill: snapshot.trueskill,
        seasonId,
        finalPosition: snapshot.finalPosition,
        pointsEarned: snapshot.pointsEarned,
      };
    });

    return {
      seasonId,
      isCurrentSeason: false,
      allUserRanks: entries,
    };
  }

  static async triggerSeasonReset(payload: ISeasonResetRequest): Promise<ISeasonResetResult> {
    return await runSeasonReset({
      expectedFromSeasonId: payload.expectedFromSeasonId,
      dryRun: payload.dryRun === true,
      triggeredBy: 'admin',
    });
  }
}
