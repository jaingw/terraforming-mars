import {GameLoader} from '../database/GameLoader';
import {Database} from '../database/Database';
import * as responses from '../server/responses';
import {IPlayer} from '../IPlayer';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {OrOptions} from '../inputs/OrOptions';
import {UndoActionOption} from '../inputs/UndoActionOption';
import {isPlayerId} from '../../common/Types';
import {Request} from '../Request';
import {Response} from '../Response';
import {runId} from '../utils/server-ids';
import {AppError} from '../server/AppError';
import {statusCode} from '../../common/http/statusCode';
import {InputError} from '../inputs/InputError';
import {UnexpectedInput} from '../inputs/UnexpectedInput';
import {isIProjectCard} from '../cards/IProjectCard';
import {AppErrorResponse, INVALID_RUN_ID} from '../../common/app/AppErrorId';
import { RequestBody} from '../../common/inputs/InputResponse';

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

    const game = await ctx.gameLoader.getByPlayerId(playerId);
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

  private isWaitingForUndo(player: IPlayer, entity: RequestBody): boolean {
    const waitingFor = player.getWaitingFor();
    const input = entity.input;
    if (input.type === 'or' && waitingFor instanceof OrOptions) {
      return waitingFor.options[input.index] instanceof UndoActionOption;
    }
    return false;
  }

  private async performUndo(player: IPlayer): Promise<IPlayer> {
    try {
      player.undoing = true;
      const gameId = player.game.id;
      await Database.getInstance().restoreGame(gameId, player.game.lastSaveId, player.game, player.id);
      return player.game.getPlayerById(player.id);
    } catch (error) {
      console.error(error);
      player.undoing = false;
      return player;
    }
  }


  private processInput(req: Request, res: Response, ctx: Context, player: IPlayer, userId: string | null): Promise<void> {
    // TODO(kberg): Find a better place for this optimization.
    for (const card of player.tableau) {
      card.warnings.clear();
      if (isIProjectCard(card)) {
        card.additionalProjectCosts = undefined;
      }
    }
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (data) => {
        body += data.toString();
      });
      req.once('end', async () => {
        try {
          const entity = JSON.parse(body) as RequestBody;
          validateRunId(entity);
          let currentPlayer = player;
          
          if (this.isWaitingForUndo(player, entity)) {
            currentPlayer = await this.performUndo(player);
          } else {
            player.process(entity);
          }
          // 预热天梯缓存，保证同步的 ServerModel 能取到所有玩家的 rank
          await ctx.gameLoader.ensureUserRanksLoaded(currentPlayer.game.getAllPlayers());
          const playerBlockModel = Server.getPlayerBlock(currentPlayer, userId);
          responses.writeJson(res, ctx, Server.getPlayerModel(currentPlayer, playerBlockModel));
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
          const response: AppErrorResponse = {
            id: id,
            message: message,
          };
          res.write(JSON.stringify(response));
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
      throw new AppError(INVALID_RUN_ID, 'The server has restarted. Click OK to refresh this page.');
    }
  }
  // Clearing this out to be compatible with the input response processors.
  delete entity.runId;
}
