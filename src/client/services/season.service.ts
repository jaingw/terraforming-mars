import {request} from '@/client/utils/request';
import {SeasonInfoResponse, SeasonList, LeaderboardResponse} from './types';

class SeasonService {
  getSeasonInfo(): Promise<SeasonInfoResponse> {
    return request.get<SeasonInfoResponse>('/api/v2/season/info');
  }

  getSeasonList(): Promise<SeasonList> {
    return request.get<SeasonList>('/api/v2/season/list');
  }

  getLeaderboard(seasonId: string, limit: number): Promise<LeaderboardResponse> {
    return request.get<LeaderboardResponse>('/api/v2/season/leaderboard', {
      seasonId,
      limit,
    });
  }

  resetSeason(serverId: string, options: {
    dryRun?: boolean;
    expectedFromSeasonId?: string;
  } = {}): Promise<any> {
    return request.post(`/api/v2/season/admin/reset?serverId=${serverId}`, options);
  }
}

export const seasonService = new SeasonService();
