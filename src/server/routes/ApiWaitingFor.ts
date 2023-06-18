import * as http from 'http';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Phase} from '../../common/Phase';
import {Player} from '../Player';
import {GameLoader} from '../database/GameLoader';
import {WaitingForModel} from '../../common/models/WaitingForModel';
import {isPlayerId, isSpectatorId} from '../../common/Types';
import {Game} from '../Game';

export class ApiWaitingFor extends Handler {
  public static readonly INSTANCE = new ApiWaitingFor();
  private constructor() {
    super();
  }

  private timeToGo(player: Player): boolean {
    return player.getWaitingFor() !== undefined || (player.game.phase === Phase.END || player.game.phase === Phase.ABANDON || player.game.phase === Phase.TIMEOUT);
  }

  // When player is undefined, caller is a spectator.
  private getPlayerWaitingForModel(player: Player, game: Game, gameAge: number, undoCount: number): WaitingForModel {
    if (this.timeToGo(player)) {
      // 由前端判断是否需要刷新
      return {result: 'GO'};
    } else if (game.gameAge !== gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH'};
    }
    return {result: 'WAIT'};
  }

  private getSpectatorWaitingForModel(game: Game, gameAge: number, undoCount: number): WaitingForModel {
    if (game.gameAge > gameAge || game.undoCount > undoCount) {
      return {result: 'REFRESH'};
    }
    return {result: 'WAIT'};
  }

  public override async get(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    const playerId = String(ctx.url.searchParams.get('id'));
    const gameAge = Number(ctx.url.searchParams.get('gameAge'));
    const undoCount = Number(ctx.url.searchParams.get('undoCount'));
    let game: Game | undefined;
    if (isSpectatorId(playerId) || isPlayerId(playerId)) {
      game = await GameLoader.getInstance().getByParticipantId(playerId);
    }
    if (game === undefined) {
      ctx.route.notFound(req, res, 'cannot find game for that player');
      return;
    }
    try {
      if (isPlayerId(playerId)) {
        const player = game.getAllPlayers().find((player) => player.id === playerId);
        if (player !== undefined) {
          ctx.route.writeJson(res, this.getPlayerWaitingForModel(player, game, gameAge, undoCount));
          return;
        }
      } else if (isSpectatorId(playerId)) {
        ctx.route.writeJson(res, this.getSpectatorWaitingForModel(game, gameAge, undoCount));
      }
      ctx.route.notFound(req, res, 'player not found');
    } catch (err) {
      // This is basically impossible since getPlayerById ensures that the player is on that game.
      console.warn(`unable to find player ${playerId}`, err);
      ctx.route.notFound(req, res, 'player not found');
    }
  }
}
