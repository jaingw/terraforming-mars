/**
 * 测试专用 API（仅 TEST_API=true 时启用）
 *
 * POST /forceNormalRankEnd - 强制天梯游戏以正常结束(Phase.END)完成
 * POST /insertUserGameResult - 直接插入 user_game_results 测试数据
 * GET  /userGameStats/:userId - 获取用户游戏统计（用于测试验证）
 */

import {Hono} from 'hono';
import * as constants from '../../common/constants';
import {GameLoader} from '../database/GameLoader';
import {Database} from '../database/Database';
import {IPlayer} from '../IPlayer';
import {Phase} from '../../common/Phase';

const TEST_API_ENABLED = process.env.TEST_API === 'true';

const testRoutes = new Hono();

function setMarsTerraformed(game: any): void {
  (game as any).temperature = constants.MAX_TEMPERATURE;
  (game as any).oxygenLevel = constants.MAX_OXYGEN_LEVEL;
  while (game.board.getOceanSpaces().length < constants.MAX_OCEAN_TILES) {
    const player = game.getAllPlayers()[0];
    const space = game.board.getAvailableSpacesForOcean(player)[0];
    if (space !== undefined) {
      game.addOcean(player, space);
    } else {
      break;
    }
  }
}

testRoutes.post('/forceNormalRankEnd', async (c) => {
  if (!TEST_API_ENABLED) {
    return c.json({error: 'api/test/forceNormalRankEnd requires TEST_API=true'}, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const playerId = (body as any).playerId;
  if (playerId === undefined) {
    return c.json({error: 'Missing playerId'}, 404);
  }

  const game = await GameLoader.getInstance().getByPlayerId(playerId);
  if (game === undefined) {
    return c.json({error: 'Game not found'}, 404);
  }

  if (!game.isRankMode() || game.getAllPlayers().length < 2) {
    return c.json({error: 'Game must be rank mode with 2+ players'}, 404);
  }

  if (game.phase === Phase.END || game.phase === Phase.ABANDON || game.phase === Phase.TIMEOUT) {
    return c.json({ok: false, message: 'Game already ended'});
  }

  try {
    setMarsTerraformed(game);

    while (game.deferredActions.pop() !== undefined) {
      /* empty */
    }

    game.phase = Phase.PRODUCTION;
    const donePlayers = (game as any).donePlayers as Set<IPlayer>;
    donePlayers.clear();
    for (const player of game.getAllPlayers() as IPlayer[]) {
      donePlayers.add(player);
    }

    game.takeNextFinalGreeneryAction();

    GameLoader.getInstance().add(game);

    return c.json({ok: true, gameId: game.id, message: 'Triggered normal end'});
  } catch (err) {
    console.error('forceNormalRankEnd', err);
    return c.json({error: String(err instanceof Error ? err.message : err)}, 500);
  }
});

/**
 * POST /insertUserGameResult
 *
 * Directly inserts a row into user_game_results for testing stats.
 * Body: { userId, gameId, phase, corporation, playerScore, players, generations,
 *         createTime?, position, isRank, isTimeout? }
 */
testRoutes.post('/insertUserGameResult', async (c) => {
  if (!TEST_API_ENABLED) {
    return c.json({error: 'Requires TEST_API=true'}, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const {userId, gameId, phase, corporation, playerScore, players, generations, createTime, position, isRank, isTimeout} = body as any;

  if (!userId || !gameId) {
    return c.json({error: 'Missing userId or gameId'}, 400);
  }

  try {
    const score = {
      corporation: corporation || 'TestCorp',
      playerScore: playerScore ?? 50,
      player: 'TestPlayer',
      userId,
    };
    Database.getInstance().saveUserGameResult(
      userId,
      gameId,
      phase || Phase.END,
      score,
      players || 2,
      generations || 10,
      createTime || new Date().toISOString(),
      position || 1,
      isRank ?? false,
      undefined, // userRank — not needed for test data
      isTimeout ?? false,
    );
    return c.json({ok: true, gameId});
  } catch (err) {
    console.error('insertUserGameResult', err);
    return c.json({error: String(err instanceof Error ? err.message : err)}, 500);
  }
});

/**
 * GET /userGameStats/:userId
 *
 * Convenience endpoint to verify stats during testing.
 */
testRoutes.get('/userGameStats/:userId', async (c) => {
  if (!TEST_API_ENABLED) {
    return c.json({error: 'Requires TEST_API=true'}, 404);
  }

  const userId = c.req.param('userId');
  if (!userId) {
    return c.json({error: 'Missing userId'}, 400);
  }

  try {
    const stats = await Database.getInstance().getUserGameStats(userId);
    return c.json({userId, ...stats});
  } catch (err) {
    console.error('userGameStats', err);
    return c.json({error: String(err instanceof Error ? err.message : err)}, 500);
  }
});

export {testRoutes};
