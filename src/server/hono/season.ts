/**
 * 赛季相关 API 路由
 *
 * 挂载路径: /api/v2/season
 *
 * GET  /info       - 获取当前赛季信息
 * GET  /history    - 获取赛季历史快照
 * GET  /list       - 获取赛季列表
 * GET  /leaderboard - 获取赛季排行榜
 * POST /admin/reset - 管理员触发赛季重置
 */

import {Hono} from 'hono';
import {SeasonService} from '../services/SeasonService';
import {createSafeHandler, requireAdmin} from './middleware';

const seasonRoutes = new Hono();

seasonRoutes.get('/info', createSafeHandler(() => SeasonService.getSeasonInfo()));

seasonRoutes.get(
  '/history',
  createSafeHandler((c) => SeasonService.getSeasonHistory(c.req.query('seasonId') || '')),
);

seasonRoutes.get('/list', createSafeHandler(() => SeasonService.getSeasonList()));

seasonRoutes.get(
  '/leaderboard',
  createSafeHandler((c) => {
    const seasonId = c.req.query('seasonId') || '';
    const rawLimit = Number(c.req.query('limit') || 100);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, Math.floor(rawLimit)) : 100;
    return SeasonService.getSeasonLeaderboard(seasonId, limit);
  }),
);

seasonRoutes.post(
  '/admin/reset',
  requireAdmin,
  createSafeHandler(async (c) => {
    let payload: {expectedFromSeasonId?: string; dryRun?: boolean} = {};
    try {
      payload = await c.req.json();
    } catch {
      // 空body也是合法的
    }
    return SeasonService.triggerSeasonReset(payload);
  }),
);

export {seasonRoutes};
