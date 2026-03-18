/**
 * User Stats API — /api/v2/user-stats
 *
 * Provides aggregated game statistics for a user,
 * including all-time and last 3 months.
 */

import {Hono} from 'hono';
import {Database} from '../database/Database';
import {GameLoader} from '../database/GameLoader';
import {requireRouteParam} from './middleware';

export const userStatsRoutes = new Hono();

/**
 * GET /api/v2/user-stats/:userId
 *
 * Returns game stats (win/loss/flee rate, averages) for the given user.
 * Provides both all-time and recent (last 3 months) aggregations.
 */
userStatsRoutes.get('/:userId', async (c) => {
  const userId = requireRouteParam(c, 'userId');

  // Verify user exists
  const user = GameLoader.getInstance().userIdMap.get(userId);
  if (!user) {
    return c.json({error: 'User not found'}, 404);
  }

  try {
    const stats = await Database.getInstance().getUserGameStats(userId);
    return c.json({
      userId,
      userName: user.name,
      ...stats,
    });
  } catch (err: any) {
    console.error('[userStats] Failed to get stats for', userId, err);
    return c.json({error: 'Failed to fetch user stats'}, 500);
  }
});
