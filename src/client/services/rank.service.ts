import {request} from '@/client/utils/request';
import {LeaderboardResponse} from './types';

class RankService {
  async getLeaderboard(limit: number): Promise<LeaderboardResponse> {
    return request.get<LeaderboardResponse>('/api/userranks', {limit});
  }

  async checkUserRankByPlayerName(playerName: string): Promise<boolean> {
    try {
      await request.get('/api/userrank', {playerName});
      return true;
    } catch {
      return false;
    }
  }
}

export const rankService = new RankService();
