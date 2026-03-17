import {Color} from '@/common/Color';
import {CardName} from '@/common/cards/CardName';
import {ColonyName} from '@/common/colonies/ColonyName';

export interface LoginResponse {
  id: string;
  name: string;
}

export interface VipCheckResponse {
  id: string;
  isvip: boolean;
}

export interface UserRankResponse {
  rankValue: number;
  mu: number;
  sigma: number;
  trueskill: number;
  points?: number;
  seasonId?: string;
}

export interface MyGamesResponse {
  mygames: GameInfo[];
  vipDate?: string;
  showhandcards: boolean;
}

export interface GameInfo {
  id: string;
  createtime: string;
  phase: string;
  players: Array<{
    id: string;
    name: string;
    color: Color;
  }>;
}

export interface SeasonInfo {
  seasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
}

export interface SeasonInfoResponse extends SeasonInfo {
  seasons: SeasonInfo[];
}

export interface SeasonList {
  currentSeasonId: string;
  previousSeasonId?: string;
}

export interface LeaderboardResponse {
  allUserRanks: any[];
  seasonId?: string;
  isCurrentSeason?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  createtime: string;
  isvip: number;
  rank: {
    rankValue: number;
    mu: number;
    sigma: number;
    trueskill: number;
    points: number;
    seasonId: string;
    tier: {
      name: string;
      measurement: string;
      maxStars: number;
      stars: number;
      value: number;
    };
  } | null;
  totalGames: number;
  gameStats: {
    allTime: GameStatsBlock;
    recent3Months: GameStatsBlock;
  } | null;
}

export interface GameStatsBlock {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  fleeCount: number;
  fleeRate: number;
  avgScore: number;
  avgPosition: number;
  totalRankGames: number;
  rankWins: number;
}

export interface UserStatsResponse {
  allTime: GameStatsBlock;
  recent3Months: GameStatsBlock;
}

export interface LoadGameResponse {
  id: string;
  players: Array<{id: string}>;
}
