/**
 * User Profile API — /api/v2/user-profile
 *
 * Provides a public user profile endpoint that resolves users by ID or name.
 * Includes aggregated game stats (allTime + recent3Months).
 */

import {Hono} from 'hono';
import {GameLoader} from '../database/GameLoader';
import {Database} from '../database/Database';
import {User} from '../User';
import {UserRank} from '../../common/rank/RankManager';
import {IUserGameStats} from '../database/IDatabase';

export interface IUserProfileResponse {
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
  /** Total number of games (from in-memory game loader) */
  totalGames: number;
  /** Aggregated game stats from DB */
  gameStats: IUserGameStats | null;
}

async function buildProfileResponse(user: User): Promise<IUserProfileResponse> {
  const userRank: UserRank | undefined = GameLoader.getInstance().userRankMap.get(user.id);

  let rankData: IUserProfileResponse['rank'] = null;
  if (userRank) {
    const tier = userRank.getTier();
    rankData = {
      rankValue: userRank.rankValue,
      mu: userRank.mu,
      sigma: userRank.sigma,
      trueskill: userRank.trueskill,
      points: userRank.points || 0,
      seasonId: userRank.seasonId || '',
      tier: {
        name: tier.name,
        measurement: tier.measurement,
        maxStars: tier.maxStars,
        stars: tier.stars,
        value: tier.value,
      },
    };
  }

  let gameStats: IUserGameStats | null = null;
  try {
    gameStats = await Database.getInstance().getUserGameStats(user.id);
  } catch (err) {
    console.error('[userProfile] Failed to get game stats for', user.id, err);
  }

  const totalGames = gameStats?.allTime?.totalGames || 0;

  return {
    id: user.id,
    name: user.name,
    createtime: user.createtime || '',
    isvip: user.isvip(),
    rank: rankData,
    totalGames,
    gameStats,
  };
}

export const userProfileRoutes = new Hono();

/**
 * GET /api/v2/user-profile/:identifier
 *
 * Looks up a user by ID or name (case-insensitive).
 * The identifier is first tried as a user ID, then as a username.
 */
userProfileRoutes.get('/:identifier', async (c) => {
  const identifier = c.req.param('identifier');

  if (!identifier) {
    return c.json({error: 'Missing user identifier'}, 400);
  }

  // Try by ID first
  let user: User | undefined = GameLoader.getInstance().userIdMap.get(identifier);

  // Then try by name (userNameMap stores names in lowercase)
  if (!user) {
    user = GameLoader.getInstance().userNameMap.get(identifier.toLowerCase());
  }

  if (!user) {
    return c.json({error: 'User not found'}, 404);
  }

  return c.json(await buildProfileResponse(user));
});
