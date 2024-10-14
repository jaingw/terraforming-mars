import * as responses from '../server/responses';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {IPlayer} from '../IPlayer';
import {isPlayerId} from '../../common/Types';
import {GameLoader} from '../database/GameLoader';
import {Request} from '../Request';
import {Response} from '../Response';
import {IGame} from '../IGame';

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

  public override async get(req: Request, res: Response, ctx: Context): Promise<void> {
    const userId = ctx.url.searchParams.get('userId');
    const playerId = ctx.url.searchParams.get('id');
    if (playerId === null) {
      responses.badRequest(req, res, 'missing id parameter');
      return;
    }

    if (!isPlayerId(playerId)) {
      responses.badRequest(req, res, 'invalid player id');
      return;
    }

    // This is the exact same code as in `ApiPlayer`. I bet it's not the only place.
    const game = await GameLoader.getInstance().getByPlayerId(playerId);
    if (game === undefined) {
      responses.notFound(req, res);
      return;
    }

    // While prototyping, this is only available for solo games
    if (game.getPlayers().length > 1) {
      throw new Error('Reset is only available for solo games at the moment.');
    }

    let player: IPlayer | undefined;
    try {
      player = game.getPlayerById(playerId);
      const userPlayer = GameLoader.getUserByPlayer(player);
      if (userPlayer !== undefined && !userPlayer.checkToken(userId)) {// 已注册并且不等于登录用户  不能体退
        responses.badRequest(req, res, 'user not found');
        return;
      }

      const player2 = player;
      return new Promise((resolve) => {
        GameLoader.getInstance().getGameById(player2.game.id, (game: IGame | undefined) => {
          if (game !== undefined) {
            const reloadedPlayer = game.getPlayerById(player2.id);
            game.inputsThisRound = 0;
            const playerBlockModel = Server.getPlayerBlock(player2, userId);
            responses.writeJson(res, Server.getPlayerModel(reloadedPlayer, playerBlockModel));
            resolve();
            return;
          }

          if (game === undefined) {
            console.warn('game not found ' + player2.game.id);
            responses.notFound(req, res, 'game not found');
            resolve();
            return;
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
    responses.badRequest(req, res, 'Could not reset');
  }
}
