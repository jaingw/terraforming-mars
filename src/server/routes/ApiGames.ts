import * as responses from './responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {GameLoader} from '../database/GameLoader';
import {State} from '../database/IGameLoader';
import * as UserUtil from '../UserUtil';
import {Request} from '../Request';
import {Response} from '../Response';

export class ApiGames extends Handler {
  public static readonly INSTANCE = new ApiGames();
  private constructor() {
    super({validateServerId: true});
  }

  public override get(req: Request, res: Response, ctx: Context): Promise<void> {
    const userId = ctx.url.searchParams.get('userId');
    if (userId === undefined || userId !== UserUtil.myId) {
      console.warn('Not me');
      responses.notFound(req, res, 'Not me');
      return Promise.resolve();
    }

    if (GameLoader.getInstance().state !== State.READY ) {
      console.warn('loading');
      responses.notFound(req, res, 'loading');
      return Promise.resolve();
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
    responses.writeJson(res, answer);
    return Promise.resolve();
  }
}
