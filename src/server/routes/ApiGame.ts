import * as http from 'http';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Server} from '../models/ServerModel';
import {GameLoader} from '../database/GameLoader';
import {Game} from '../Game';

export class ApiGame extends Handler {
  public static readonly INSTANCE = new ApiGame();
  private constructor() {
    super();
  }

  public override get(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    if (req.url === undefined) {
      console.warn('url not defined');
      ctx.route.notFound(req, res, 'url not defined');
      return Promise.resolve();
    }

    const gameId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId') || '';

    if (!gameId) {
      ctx.route.badRequest(req, res, 'missing id parameter');
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      GameLoader.getInstance().getGameById(gameId, (game: Game | undefined) => {
        if (game === undefined) {
          console.warn('game not found ' + gameId);
          ctx.route.notFound(req, res, 'game not found');
          resolve();
          return;
        }

        const model = Server.getSimpleGameModel(game, userId);
        ctx.route.writeJson(res, model);
        resolve();
      });
    });
  }
}
