import * as http from 'http';
import {Server} from '../models/ServerModel';
import {AsyncHandler} from './Handler';
import {IContext} from './IHandler';
import {GameLoader} from '../database/GameLoader';

export class ApiPlayer extends AsyncHandler {
  public static readonly INSTANCE = new ApiPlayer();

  private constructor() {
    super();
  }

  public override async get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): Promise<void> {
    const userId = ctx.url.searchParams.get('userId');
    const playerId = ctx.url.searchParams.get('id');
    const game = await GameLoader.getInstance().getByParticipantId(playerId as string);
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
  }
}
