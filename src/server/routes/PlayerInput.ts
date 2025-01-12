import {GameLoader} from '../database/GameLoader';
import * as responses from '../server/responses';
import {IPlayer} from '../IPlayer';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {isPlayerId} from '../../common/Types';
import {Request} from '../Request';
import {Response} from '../Response';
import {runId} from '../utils/server-ids';
import {AppError} from '../server/AppError';
import {statusCode} from '../../common/http/statusCode';
import {InputError} from '../inputs/InputError';
import {UnexpectedInput} from '../inputs/UnexpectedInput';

export class PlayerInput extends Handler {
  public static readonly INSTANCE = new PlayerInput();

  public override async post(req: Request, res: Response, ctx: Context): Promise<void> {
    const playerId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId');
    if (playerId === null || playerId === undefined) {
      responses.badRequest(req, res, 'missing id parameter');
      return;
    }

    if (!isPlayerId(playerId)) {
      responses.badRequest(req, res, 'invalid player id');
      return;
    }

    ctx.ipTracker.addParticipant(playerId, ctx.ip);

    const game = await GameLoader.getInstance().getByParticipantId(playerId);
    if (game === undefined) {
      responses.notFound(req, res);
      return;
    }
    const player = game.getAllPlayers().find((p) => p.id === playerId);
    if (player === undefined) {
      responses.notFound(req, res);
      return;
    }
    const user = GameLoader.getUserByPlayer(player);
    if (user !== undefined && !user.checkToken(userId)) {
      responses.notFound(req, res);
      return;
    }
    return this.processInput(req, res, ctx, player, userId);
  }

  private processInput(req: Request, res: Response, _ctx: Context, player: IPlayer, userId: string | null): Promise<void> {
    // TODO(kberg): Find a better place for this optimization.
    player.tableau.forEach((card) => card.warnings.clear());
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (data) => {
        body += data.toString();
      });
      req.once('end', () => {
        try {
          const entity = JSON.parse(body);
          validateRunId(entity);
          player.process(entity);
          const playerBlockModel = Server.getPlayerBlock(player, userId);
          responses.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
          resolve();
        } catch (e :any ) {
          // TODO(kberg): use responses.ts, though that changes the output.
          res.writeHead(statusCode.badRequest, {
            'Content-Type': 'application/json',
          });
          if ( e instanceof UnexpectedInput || (e as Error).name === 'UnexpectedInput' || e instanceof AppError || e instanceof InputError) {
            console.warn('Error processing input from player.'+player.id+': ' + body + ',' + e.message);
          } else {
            console.warn('Error processing input from player.'+player.id+': ' + body + ',', e);
          }
          const id = e instanceof AppError ? e.id : undefined;
          const message = e instanceof Error ? e.message : String(e);
          res.write(JSON.stringify({id: id, message: message}));
          res.end();
          resolve();
        }
      });
    });
  }
}
function validateRunId(entity: any) {
  if (entity.runId !== undefined && runId !== undefined) {
    if (entity.runId !== runId) {
      throw new AppError('#invalid-run-id', 'The server has restarted. Click OK to refresh this page.');
    }
  }
  // Clearing this out to be compatible with the input response processors.
  delete entity.runId;
}

