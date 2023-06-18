import * as http from 'http';
import {GameLoader} from '../database/GameLoader';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {isPlayerId} from '../../common/Types';

export class PlayerInput extends Handler {
  public static readonly INSTANCE = new PlayerInput();
  private constructor() {
    super();
  }

  public override async post(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    const playerId = ctx.url.searchParams.get('id');
    const userId = ctx.url.searchParams.get('userId');
    if (playerId === null || playerId === undefined) {
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

  private processInput(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context, player: Player, userId: string | null): Promise<void> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (data) => {
        body += data.toString();
      });
      req.once('end', () => {
        try {
          const entity = JSON.parse(body);
          player.process(entity);
          const playerBlockModel = Server.getPlayerBlock(player, userId);
          ctx.route.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
          resolve();
        } catch (e) {
          // TODO(kberg): use standard Route API, though that changes the output.
          res.writeHead(400, {
            'Content-Type': 'application/json',
          });
          if (e instanceof Error && e.name === 'UnexpectedInput') {
            console.warn('Error processing input from player.'+player.id+': ' + body + ',' + e.message);
          } else {
            console.warn('Error processing input from player.'+player.id+': ' + body + ',', e);
          }
          const message = e instanceof Error ? e.message : String(e);
          res.write(JSON.stringify({message}));
          res.end();
          resolve();
        }
      });
    });
  }
}


