import * as http from 'http';
import {AsyncHandler} from './Handler';
import {IContext} from './IHandler';
import {Server} from '../models/ServerModel';
import {GameLoader} from '../database/GameLoader';
import {Game} from '../Game';

export class ApiGame extends AsyncHandler {
  public static readonly INSTANCE = new ApiGame();
  private constructor() {
    super();
  }

  public override async get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): Promise<void> {
    if (req.url === undefined) {
      console.warn('url not defined');
      ctx.route.notFound(req, res, 'url not defined');
      return;
    }

    const gameId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId') || '';

    if (!gameId) {
      ctx.route.notFound(req, res, 'id parameter missing');
      return;
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
