import * as http from 'http';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Player} from '../Player';
import {isPlayerId} from '../../common/Types';
import {GameLoader} from '../database/GameLoader';
import {Game} from '../Game';

/**
 * Reloads the game from the last action.
 *
 * This may only be called by the active player. It reloads the game.
 * Now, given the current save behavior. The game isn't saved after every action.
 * I think it's saved after every action when undo is on. So, there's that.
 * But I forget when the game is saved in solo. Probably all will be well.
 *
 * Eventually, this will not be callable once cards are drawn.
 */
export class Reset extends Handler {
  public static readonly INSTANCE = new Reset();
  private constructor() {
    super();
  }

  public override async get(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    const userId = ctx.url.searchParams.get('userId');
    const playerId = ctx.url.searchParams.get('id');
    if (playerId === null) {
      ctx.route.badRequest(req, res, 'missing id parameter');
      return;
    }

    if (!isPlayerId(playerId)) {
      ctx.route.badRequest(req, res, 'invalid player id');
      return;
    }

    // This is the exact same code as in `ApiPlayer`. I bet it's not the only place.
    const game = await GameLoader.getInstance().getByPlayerId(playerId);
    if (game === undefined) {
      ctx.route.notFound(req, res);
      return;
    }

    // While prototyping, this is only available for solo games
    if (game.getPlayers().length > 1) {
      throw new Error('Reset is only available for solo games at the moment.');
    }

    let player: Player | undefined;
    try {
      player = game.getPlayerById(playerId);
      const userPlayer = GameLoader.getUserByPlayer(player);
      if (userPlayer !== undefined && userPlayer.id !== userId) {// 已注册并且不等于登录用户  不能体退
        ctx.route.badRequest(req, res, 'user not found');
        return;
      }

      const player2 = player;
      return new Promise((resolve) => {
        GameLoader.getInstance().getGameById(player2.game.id, (game: Game | undefined) => {
          if (game !== undefined) {
            const reloadedPlayer = game.getPlayerById(player2.id);
            game.inputsThisRound = 0;
            const playerBlockModel = Server.getPlayerBlock(player2, userId);
            ctx.route.writeJson(res, Server.getPlayerModel(reloadedPlayer, playerBlockModel));
            resolve();
            return;
          }

          if (game === undefined) {
            console.warn('game not found ' + player2.game.id);
            ctx.route.notFound(req, res, 'game not found');
            resolve();
            return;
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
    ctx.route.badRequest(req, res, 'Could not reset');
  }
}
