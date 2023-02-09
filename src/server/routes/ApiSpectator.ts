import * as http from 'http';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {isSpectatorId} from '../../common/Types';
import {GameLoader} from '../database/GameLoader';
import {Game} from '../Game';

export class ApiSpectator extends Handler {
  public static readonly INSTANCE = new ApiSpectator();

  private constructor() {
    super();
  }

  public override async get(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    const id = ctx.url.searchParams.get('id');
    if (!id) {
      ctx.route.badRequest(req, res, 'invalid id');
      return Promise.resolve();
    }
    let game: Game | undefined;
    if (isSpectatorId(id)) {
      game = await GameLoader.getInstance().getByParticipantId(id);
    }
    if (game === undefined) {
      ctx.route.notFound(req, res);
      return;
    }
    ctx.route.notFound(req, res);
    // ctx.route.writeJson(res, Server.getSpectatorModel(game));
  }
}
