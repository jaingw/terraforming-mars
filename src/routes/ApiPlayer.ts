import * as http from 'http';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {IContext} from './IHandler';
import * as querystring from 'querystring';
import {GameLoader} from '../database/GameLoader';

export class ApiPlayer extends Handler {
  public static readonly INSTANCE = new ApiPlayer();

  private constructor() {
    super();
  }

  public get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    const qs = req.url!.substring('/api/player?'.length);
    const queryParams = querystring.parse(qs);
    const playerId = (queryParams as any)['id'];
    const userId = (queryParams as any)['userId'];
    GameLoader.getInstance().getByPlayerId(playerId as string, (game) => {
      if (game === undefined) {
        ctx.route.notFound(req, res);
        return;
      }
      const player = game.getAllPlayers().find((player) => player.id === playerId);
      if (player === undefined) {
        ctx.route.notFound(req, res);
        return;
      }

      const playerBlockModel = Server.getPlayerBlock(player, userId);
      ctx.route.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
    });
  }
}
