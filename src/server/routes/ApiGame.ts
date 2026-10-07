import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Server} from '../models/ServerModel';
import {Request} from '../Request';
import {Response} from '../Response';

/**
 * Returns a light view of a game.
 */
export class ApiGame extends Handler {
  public static readonly INSTANCE = new ApiGame();
  private constructor() {
    super();
  }

  public override get(req: Request, res: Response, ctx: Context): Promise<void> {
    if (req.url === undefined) {
      console.warn('url not defined');
      responses.notFound(req, res, 'url not defined');
      return Promise.resolve();
    }

    const gameId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId') || '';

    if (!gameId) {
      responses.badRequest(req, res, 'missing id parameter');
      return Promise.resolve();
    }
    return ctx.gameLoader.getGame(gameId).then((game) => {
      if (game === undefined) {
        console.warn('game not found ' + gameId);
        responses.notFound(req, res, 'game not found');
        return;
      }
      const model = Server.getSimpleGameModel(game, userId);
      responses.writeJson(res, ctx, model);
    });
  }
}
