import * as http from 'http';
import * as paths from '../common/app/paths';

import {ApiCloneableGame} from './routes/ApiCloneableGame';
import {ApiGameLogs} from './routes/ApiGameLogs';
import {ApiGames} from './routes/ApiGames';
import {ApiGame} from './routes/ApiGame';
import {ApiGameHistory} from './routes/ApiGameHistory';
import {ApiPlayer} from './routes/ApiPlayer';
import {ApiStats} from './routes/ApiStats';
import {ApiMetrics} from './routes/ApiMetrics';
import {ApiSpectator} from './routes/ApiSpectator';
import {ApiWaitingFor} from './routes/ApiWaitingFor';
import {GameHandler} from './routes/Game';
import {GameLoader} from './database/GameLoader';
import {GamesOverview} from './routes/GamesOverview';
import {Context, IHandler} from './routes/IHandler';
import {Load} from './routes/Load';
import {LoadGame} from './routes/LoadGame';
import {Route} from './routes/Route';
import {PlayerInput} from './routes/PlayerInput';
import {ServeApp} from './routes/ServeApp';
import {ServeAsset} from './routes/ServeAsset';
import * as UserManager from './UserManager';
import {serverId, statsId} from './server-ids';
import {Reset} from './routes/Reset';

const handlers: Map<string, IHandler> = new Map(
  [
    ['', ServeApp.INSTANCE],
    [paths.ADMIN, ServeApp.INSTANCE],
    [paths.API_CLONEABLEGAME, ApiCloneableGame.INSTANCE],
    [paths.API_GAME, ApiGame.INSTANCE],
    [paths.API_GAME_HISTORY, ApiGameHistory.INSTANCE],
    [paths.API_GAME_LOGS, ApiGameLogs.INSTANCE],
    [paths.API_GAMES, ApiGames.INSTANCE],
    [paths.API_METRICS, ApiMetrics.INSTANCE],
    [paths.API_PLAYER, ApiPlayer.INSTANCE],
    [paths.API_STATS, ApiStats.INSTANCE],
    [paths.API_SPECTATOR, ApiSpectator.INSTANCE],
    [paths.API_WAITING_FOR, ApiWaitingFor.INSTANCE],
    [paths.CARDS, ServeApp.INSTANCE],
    ['favicon.ico', ServeAsset.INSTANCE],
    [paths.GAME, GameHandler.INSTANCE],
    [paths.GAMES_OVERVIEW, GamesOverview.INSTANCE],
    [paths.HELP, ServeApp.INSTANCE],
    [paths.LOAD, Load.INSTANCE],
    [paths.LOAD_GAME, LoadGame.INSTANCE],
    ['main.js', ServeAsset.INSTANCE],
    ['main.js.map', ServeAsset.INSTANCE],
    [paths.NEW_GAME, ServeApp.INSTANCE],
    [paths.PLAYER, ServeApp.INSTANCE],
    [paths.PLAYER_INPUT, PlayerInput.INSTANCE],
    [paths.RESET, Reset.INSTANCE],
    [paths.SPECTATOR, ServeApp.INSTANCE],
    ['styles.css', ServeAsset.INSTANCE],
    ['tailwindcss.css', ServeAsset.INSTANCE], // Ender: 我新加了Tailwind CSS用于生成样式，不会和之前的样式冲突
    ['sw.js', ServeAsset.INSTANCE],
    [paths.THE_END, ServeApp.INSTANCE],


    ['debug-ui', ServeApp.INSTANCE],
    ['login', ServeApp.INSTANCE],
    ['register', ServeApp.INSTANCE],
    ['mygames', ServeApp.INSTANCE],
    ['donate', ServeApp.INSTANCE],
    ['users', ServeApp.INSTANCE],
    ['ranks', ServeApp.INSTANCE], // 天梯排行榜
  ],
);

type IUserGetHandler = ( req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => void;
type IUserPostHandler = (body: string, req: http.IncomingMessage, res: http.ServerResponse, ctx: Context) => void;

const userGetHandler :Map<string, IUserGetHandler> = new Map(
  [
    ['api/mygames', UserManager.apiGetMyGames],
    ['api/isvip', UserManager.isvip],
    ['api/userrank', UserManager.getUserRank],
    ['api/userranks', UserManager.getUserRanks],
  ],
);

const userPostHandler :Map<string, IUserPostHandler> = new Map(
  [
    ['api/login', UserManager.login],
    ['player/resign', UserManager.resign],
    ['api/showHand', UserManager.showHand],
    ['api/sitDown', UserManager.sitDown],
    ['api/gameback', UserManager.apiGameBack],
    ['api/activateRank', UserManager.activateRank],
    ['player/endgame', UserManager.endGameByEvent],
    ['api/register', UserManager.register],

  ],
);

export function processRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  route: Route): void {
  console.log('req.url:', req.url);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  if (req.url === undefined) {
    route.notFound(req, res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.substring(1); // Remove leading '/'
  const ctx = {url, route, gameLoader: GameLoader.getInstance(), ids: {serverId, statsId}};
  const handler: IHandler | undefined = handlers.get(pathname);

  if (handler !== undefined) {
    handler.processRequest(req, res, ctx);
    return;
  } else if (req.method === 'GET' && pathname.startsWith('assets/')) {
    ServeAsset.INSTANCE.get(req, res, ctx);
    return;
  } else if (req.method === 'GET' ) {
    const uhandler: IUserGetHandler | undefined = userGetHandler.get(pathname);
    if (uhandler !== undefined) {
      try {
        uhandler(req, res, ctx);
      } catch (err) {
        if (err instanceof Error && err.name === 'UnexpectedInput') {
          console.warn('error ', pathname, err.message);
        } else {
          console.warn('error ', pathname, err);
        }
        res.writeHead(500);
        const message = err instanceof Error ? err.message : String(err);
        res.write('执行错误 : ' + message);
        res.end();
      }
      return;
    }
  } else if (req.method === 'POST' ) {
    const uhandler: IUserPostHandler | undefined = userPostHandler.get(pathname);
    if (uhandler !== undefined) {
      let body = '';
      req.on('data', function(data) {
        body += data.toString();
      });
      req.once('end', function() {
        try {
          const userReq:any = JSON.parse(body);
          uhandler(userReq, req, res, ctx);
        } catch (err) {
          if (err instanceof Error && err.name === 'UnexpectedInput') {
            console.warn('error '+pathname+ ',' + body + ',' + err.message);
          } else {
            console.warn('error '+pathname+ ',' + body + ',', err);
          }
          res.writeHead(500);
          const message = err instanceof Error ? err.message : String(err);
          res.write('执行错误 : ' + message);
          res.end();
        }
      });
      return;
    }
  }
  route.notFound(req, res);
}
