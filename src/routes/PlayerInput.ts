import * as http from 'http';
import {GameLoader} from '../database/GameLoader';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {AsyncHandler} from './Handler';
import {IContext} from './IHandler';

export class PlayerInput extends AsyncHandler {
  public static readonly INSTANCE = new PlayerInput();
  private constructor() {
    super();
  }

  public override async post(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): Promise<void> {
    const playerId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId');

    if (playerId === null || playerId === undefined) {
      ctx.route.badRequest(req, res, 'must provide player id');
      return;
    }

    const game = await GameLoader.getInstance().getByParticipantId(playerId);
    if (game === undefined) {
      ctx.route.notFound(req, res);
      return;
    }
    const player = game.getAllPlayers().find((p) => p.id === playerId);
    if (player === undefined) {
      ctx.route.notFound(req, res);
      return;
    }
    const user = GameLoader.getUserByPlayer(player);
    if (user !== undefined && user.id !== userId) {
      ctx.route.notFound(req, res);
      return;
    }
    this.processInput(req, res, ctx, player, userId);
  }

  private processInput(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: IContext,
    player: Player,
    userId: string | null,
  ): Promise<void> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', async (data) => {
        body += data.toString();
      });
      req.once('end', async () => {
        try {
          const entity = JSON.parse(body);
          player.process(entity);
          const playerBlockModel = Server.getPlayerBlock(player, userId);
          ctx.route.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
          resolve();
        } catch (e) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
          });

          console.warn('Error processing input from player', e);
          const message = e instanceof Error ? e.message : String(e);
          res.write(JSON.stringify({message}));
          res.end();
          resolve();
        }
      });
    });
  }
}
