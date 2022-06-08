import * as http from 'http';
import {GameLoader} from '../database/GameLoader';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {Handler} from './Handler';
import {IContext} from './IHandler';
import * as querystring from 'querystring';

export class PlayerInput extends Handler {
  public static readonly INSTANCE = new PlayerInput();
  private constructor() {
    super();
  }

  public override post(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    const qs: string = req.url!.substring('/player/input?'.length);
    const queryParams = querystring.parse(qs);
    const playerId = (queryParams as any)['id'];
    const userId = (queryParams as any)['userId'];
    GameLoader.getInstance().getByPlayerId(playerId, (game) => {
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
    });
  }

  private processInput(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    ctx: IContext,
    player: Player,
    userId: string,
  ): void {
    let body = '';
    req.on('data', function(data) {
      body += data.toString();
    });
    req.once('end', function() {
      try {
        const entity = JSON.parse(body);
        player.process(entity);
        const playerBlockModel = Server.getPlayerBlock(player, userId);
        ctx.route.writeJson(res, Server.getPlayerModel(player, playerBlockModel));
      } catch (e) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
        });

        console.warn('Error processing input from player', e);
        const message = e instanceof Error ? e.message : String(e);
        res.write(JSON.stringify({message}));
        res.end();
      }
    });
  }
}
