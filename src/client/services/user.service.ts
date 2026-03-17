import {request} from '@/client/utils/request';
import {UserRankResponse, MyGamesResponse, UserProfile, UserStatsResponse} from './types';
import {UserRank} from '@/common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '@/common/rank/constants';

class UserService {
  async getMyGames(userId: string): Promise<MyGamesResponse> {
    return request.get<MyGamesResponse>('/api/mygames', {id: userId});
  }

  async getUserRank(userId: string): Promise<UserRankResponse> {
    return request.get<UserRankResponse>('/api/userrank', {userId});
  }

  getUserRankInstance(userId: string): Promise<UserRank> {
    return this.getUserRank(userId).then((data) => {
      if (data && data.rankValue >= 0) {
        return new UserRank(
          userId,
          data.rankValue,
          data.mu,
          data.sigma,
          data.trueskill,
          data.points || 0,
          data.seasonId || '',
        );
      }
      return new UserRank(userId, DEFAULT_RANK_VALUE, DEFAULT_MU, DEFAULT_SIGMA, 0);
    });
  }

  async getUserProfile(identifier: string): Promise<UserProfile> {
    return request.get<UserProfile>(`/api/v2/user-profile/${encodeURIComponent(identifier)}`);
  }

  async getUserStats(userId: string): Promise<UserStatsResponse> {
    return request.get<UserStatsResponse>(`/api/v2/user-stats/${userId}`);
  }

  async updateShowHandCards(userId: string, showhandcards: boolean): Promise<void> {
    return request.post('/api/showHand', {userId, showhandcards});
  }

  async activateRank(userId: string): Promise<UserRankResponse> {
    return request.post<UserRankResponse>('/api/activateRank', {userId});
  }

  activateRankInstance(userId: string): Promise<UserRank> {
    return this.activateRank(userId).then((data) => {
      return new UserRank(
        userId,
        data.rankValue,
        data.mu,
        data.sigma,
        data.trueskill,
        data.points || 0,
        data.seasonId || '',
      );
    });
  }

  async sitDown(userId: string, playerId: string): Promise<string> {
    return request.post('/api/sitDown', {userId, playerId});
  }
}

export const userService = new UserService();
