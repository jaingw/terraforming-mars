import * as responses from './responses';
import {isPlayerId} from '../../common/Types';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {GameLoader} from '../database/GameLoader';
import {Request} from '../Request';
import {Response} from '../Response';


export class ApiPlayer extends Handler {
  public static readonly INSTANCE = new ApiPlayer();

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
    const game = await GameLoader.getInstance().getByParticipantId(playerId);
    if (game === undefined) {
      responses.notFound(req, res);
      return;
    }
    ctx.ipTracker.addParticipant(playerId, ctx.ip);
    const player = game.getAllPlayers().find((player) => player.id === playerId);
    if (player === undefined) {
      responses.notFound(req, res);
      return;
    }

    const playerBlockModel = Server.getPlayerBlock(player, userId);
    responses.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
  }
}
