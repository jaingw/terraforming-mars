import {request} from '@/client/utils/request';
import {SeasonInfoResponse, SeasonList, LeaderboardResponse} from './types';

class SeasonService {
  async getSeasonInfo(): Promise<SeasonInfoResponse> {
    return request.get<SeasonInfoResponse>('/api/v2/season/info');
  }

  async getSeasonList(): Promise<SeasonList> {
    return request.get<SeasonList>('/api/v2/season/list');
  }

  async getLeaderboard(seasonId: string, limit: number): Promise<LeaderboardResponse> {
    return request.get<LeaderboardResponse>('/api/v2/season/leaderboard', {
      seasonId,
      limit,
    });
  }

  async resetSeason(serverId: string, options: {
    dryRun?: boolean;
    expectedFromSeasonId?: string;
  } = {}): Promise<any> {
    return request.post(`/api/v2/season/admin/reset?serverId=${serverId}`, options);
  }
}

export const seasonService = new SeasonService();
