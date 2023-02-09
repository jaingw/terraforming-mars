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
import {IHandler} from './routes/IHandler';
import {Load} from './routes/Load';
import {LoadGame} from './routes/LoadGame';
import {Route} from './routes/Route';
import {PlayerInput} from './routes/PlayerInput';
import {ServeApp} from './routes/ServeApp';
import {ServeAsset} from './routes/ServeAsset';
import * as UserManager from './UserManager';
import {serverId, statsId} from './server-ids';

const handlers: Map<string, IHandler> = new Map(
  [
    ['/', ServeApp.INSTANCE],
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
    ['/favicon.ico', ServeAsset.INSTANCE],
    [paths.GAME, GameHandler.INSTANCE],
    [paths.GAMES_OVERVIEW, GamesOverview.INSTANCE],
    [paths.HELP, ServeApp.INSTANCE],
    [paths.LOAD, Load.INSTANCE],
    [paths.LOAD_GAME, LoadGame.INSTANCE],
    ['/main.js', ServeAsset.INSTANCE],
    ['/main.js.map', ServeAsset.INSTANCE],
    [paths.NEW_GAME, ServeApp.INSTANCE],
    [paths.PLAYER, ServeApp.INSTANCE],
    [paths.PLAYER_INPUT, PlayerInput.INSTANCE],
    [paths.SPECTATOR, ServeApp.INSTANCE],
    ['/styles.css', ServeAsset.INSTANCE],
    ['/sw.js', ServeAsset.INSTANCE],
    [paths.THE_END, ServeApp.INSTANCE],


    ['/debug-ui', ServeApp.INSTANCE],
    ['/login', ServeApp.INSTANCE],
    ['/register', ServeApp.INSTANCE],
    ['/mygames', ServeApp.INSTANCE],
    ['/donate', ServeApp.INSTANCE],
    ['/users', ServeApp.INSTANCE],
  ],
);

export function processRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  route: Route): void {
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  if (req.url === undefined) {
    route.notFound(req, res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const ctx = {url, route, gameLoader: GameLoader.getInstance(), ids: {serverId, statsId}};
  const handler: IHandler | undefined = handlers.get(url.pathname);

  if (handler !== undefined) {
    handler.processRequest(req, res, ctx);
    return;
  }

  switch (req.method) {
  case 'GET':
    switch (url.pathname) {
    case '/api/mygames':
      UserManager.apiGetMyGames(req, res);
      break;
    case '/api/isvip':
      UserManager.isvip(req, res, ctx);
      break;
    default:
      if (url.pathname.startsWith('/assets/')) {
        ServeAsset.INSTANCE.get(req, res, ctx);
      } else {
        route.notFound(req, res);
      }
    }
    break;
  case 'POST':
    if ( req.url.indexOf('/api/login') === 0) {
      UserManager.login(req, res);
    } else if (req.url.indexOf('/player/resign') === 0) {
      UserManager.resign(req, res);
    } else if (req.url.indexOf('/api/showHand') === 0) {
      UserManager.showHand(req, res);
    } else if (req.url.indexOf('/api/sitDown') === 0) {
      UserManager.sitDown(req, res);
    } else if (req.url.indexOf('/api/gameback') === 0) {
      UserManager.apiGameBack(req, res);
    }
    break;
  case 'PUT':
    if (url.pathname === '/api/register') {
      UserManager.register(req, res);
    }
    break;
  default:
    route.notFound(req, res);
  }
}
