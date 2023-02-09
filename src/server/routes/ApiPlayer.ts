import {isPlayerId} from '../../common/Types';
import * as http from 'http';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {GameLoader} from '../database/GameLoader';

export class ApiPlayer extends Handler {
  public static readonly INSTANCE = new ApiPlayer();

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
    const game = await GameLoader.getInstance().getByParticipantId(playerId);
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
