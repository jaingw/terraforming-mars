import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Phase} from '../../common/Phase';
import {IPlayer} from '../IPlayer';
import {GameLoader} from '../database/GameLoader';
import {WaitingForModel} from '../../common/models/WaitingForModel';
import {IGame} from '../IGame';
import {isPlayerId, isSpectatorId} from '../../common/Types';
import {Request} from '../Request';
import {Response} from '../Response';

export class ApiWaitingFor extends Handler {
  public static readonly INSTANCE = new ApiWaitingFor();
  private constructor() {
    super();
  }

  private timeToGo(player: IPlayer): boolean {
    return player.getWaitingFor() !== undefined || (player.game.phase === Phase.END || player.game.phase === Phase.ABANDON || player.game.phase === Phase.TIMEOUT);
  }

  // When player is undefined, caller is a spectator.
  private getPlayerWaitingForModel(player: IPlayer, game: IGame, gameAge: number, undoCount: number): WaitingForModel {
    if (this.timeToGo(player)) {
      // 由前端判断是否需要刷新
      return {result: 'GO'};
    } else if (game.gameAge !== gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH'};
    }
    return {result: 'WAIT'};
  }

  private getSpectatorWaitingForModel(game: IGame, gameAge: number, undoCount: number): WaitingForModel {
    if (game.gameAge > gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH'};
    }
    return {result: 'WAIT'};
  }

  public override async get(req: Request, res: Response, ctx: Context): Promise<void> {
    const id = String(ctx.url.searchParams.get('id'));
    const gameAge = Number(ctx.url.searchParams.get('gameAge'));
    const undoCount = Number(ctx.url.searchParams.get('undoCount'));
    let game: IGame | undefined;
    if (isSpectatorId(id) || isPlayerId(id)) {
      game = await GameLoader.getInstance().getByParticipantId(id);
    }
    if (game === undefined) {
      responses.notFound(req, res, 'cannot find game for that player');
      return;
    }
    try {
      if (isPlayerId(id)) {
        ctx.ipTracker.addParticipant(id, ctx.ip);
        const player = game.getAllPlayers().find((player) => player.id === id);
        if (player !== undefined) {
          responses.writeJson(res, this.getPlayerWaitingForModel(player, game, gameAge, undoCount));
          return;
        }
      } else if (isSpectatorId(id)) {
        responses.writeJson(res, this.getSpectatorWaitingForModel(game, gameAge, undoCount));
        return;
      }
      responses.notFound(req, res, 'player not found');
    } catch (err) {
      // This is basically impossible since getPlayerById ensures that the player is on that game.
      console.warn(`unable to find player ${id}`, err);
      responses.notFound(req, res, 'player not found');
    }
  }
}
