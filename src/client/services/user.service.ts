import {request} from '@/client/utils/request';
import {UserRankResponse, MyGamesResponse, UserProfile, UserStatsResponse} from './types';
import {UserRank} from '@/common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '@/common/rank/constants';
import {ApiResponse} from '@/common/http/ApiResponse';

class UserService {
  getMyGames(userId: string): Promise<MyGamesResponse> {
    return request.get<MyGamesResponse>('/api/mygames', {id: userId});
  }

  getUserRank(userId: string): Promise<UserRankResponse> {
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

  getUserProfile(identifier: string): Promise<UserProfile> {
    return request.get<UserProfile>(`/api/v2/user-profile/${encodeURIComponent(identifier)}`);
  }

  getUserStats(userId: string): Promise<UserStatsResponse> {
    return request.get<UserStatsResponse>(`/api/v2/user-stats/${userId}`);
  }

  updateShowHandCards(userId: string, showhandcards: boolean): Promise<ApiResponse> {
    return request.post<ApiResponse>('/api/showHand', {userId, showhandcards});
  }

  activateRank(userId: string): Promise<UserRankResponse> {
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

  sitDown(userId: string, playerId: string): Promise<ApiResponse> {
    return request.post<ApiResponse>('/api/sitDown', {userId, playerId});
  }
}

export const userService = new UserService();
