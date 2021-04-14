import * as http from 'http';
import {Game} from '../Game';
import {Handler} from './Handler';
import {IContext} from './IHandler';
import {Server} from '../models/ServerModel';
import * as querystring from 'querystring';
import {GameLoader} from '../database/GameLoader';

export class ApiGame extends Handler {
  public static readonly INSTANCE = new ApiGame();
  private constructor() {
    super();
  }

  public get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    if (req.url === undefined) {
      console.warn('url not defined');
      ctx.route.notFound(req, res, 'url not defined');
      return;
    }

    const qs: string = req.url!.substring('/api/game?'.length);
    const queryParams = querystring.parse(qs);
    const gameId = (queryParams as any)['id'];
    const userId = (queryParams as any)['userId'];

    if (!gameId) {
      ctx.route.notFound(req, res, 'id parameter missing');
      return;
    }
    GameLoader.getInstance().getGameById(gameId, (game: Game | undefined) => {
      if (game === undefined) {
        console.warn('game not found ' + gameId);
        ctx.route.notFound(req, res, 'game not found');
        return;
      }

      const model = Server.getGameModel(game, userId);
      ctx.route.writeJson(res, model);
    });
  }
}
