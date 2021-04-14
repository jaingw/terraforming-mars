import * as http from 'http';
import {Handler} from './Handler';
import {IContext} from './IHandler';
import {GameLoader} from '../database/GameLoader';
import {State} from '../database/IGameLoader';
import * as querystring from 'querystring';
import * as UserUtil from '../UserUtil';

export class ApiGames extends Handler {
  public static readonly INSTANCE = new ApiGames();
  private constructor() {
    super({validateServerId: true});
  }

  public get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    const queryParams = querystring.parse(req.url!.replace(/^.*\?/, ''));
    if (queryParams.userId === undefined || queryParams.userId !== UserUtil.myId) {
      console.warn('Not me');
      ctx.route.notFound(req, res, 'Not me');
      return;
    }

    if (GameLoader.getInstance().state !== State.READY ) {
      console.warn('loading');
      ctx.route.notFound(req, res, 'loading');
      return;
    }
    const answer: Array<any> = [];
    const games = GameLoader.getInstance().games;
    for (const key of Array.from(games.keys())) {
      const game = games.get(key);
      if (game !== undefined) {
        answer.push({
          activePlayer: game.activePlayer.color,
          id: game.id,
          phase: game.phase,
          players: game.getAllPlayers().map((player) => {
            return {
              id: player.id,
              name: player.name,
              color: player.exited? 'gray' : player.color,
            };
          }),
          createtime: game.createtime?.slice(0, 16),
          updatetime: game.updatetime?.slice(0, 16),
          gameAge: game.gameAge,
          saveId: game.lastSaveId,
        });
      }
    }
    answer.sort((a: any, b: any) => {
      return a.updatetime > b.updatetime ? -1 : (a.updatetime === b.updatetime ? 0 : 1);
    });
    ctx.route.writeJson(res, answer);
  }
}
