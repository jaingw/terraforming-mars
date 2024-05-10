import * as responses from './responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Server} from '../models/ServerModel';
import {GameLoader} from '../database/GameLoader';
import {Request} from '../Request';
import {Response} from '../Response';
import {IGame} from '../IGame';

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
    return new Promise((resolve) => {
      GameLoader.getInstance().getGameById(gameId, (game: IGame | undefined) => {
        if (game === undefined) {
          console.warn('game not found ' + gameId);
          responses.notFound(req, res, 'game not found');
          resolve();
          return;
        }

        const model = Server.getSimpleGameModel(game, userId);
        responses.writeJson(res, model);
        resolve();
      });
    });
  }
}
