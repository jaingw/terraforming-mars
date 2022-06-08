require('dotenv').config();
require('console-stamp')(
  console,
  {format: ':date(yyyy-mm-dd HH:MM:ss Z)'},
);

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';

import {ApiCloneableGame} from './routes/ApiCloneableGame';
import {ApiGameLogs} from './routes/ApiGameLogs';
import {ApiGames} from './routes/ApiGames';
import {ApiGame} from './routes/ApiGame';
import {ApiPlayer} from './routes/ApiPlayer';
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
import * as UserManager from './UserManager';
import {ServeApp} from './routes/ServeApp';
import {ServeAsset} from './routes/ServeAsset';
import {generateRandomId} from './UserUtil';

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION', err);
});

export const serverId = process.env.SERVER_ID || generateRandomId('');

const route = new Route();

const handlers: Map<string, IHandler> = new Map(
  [
    ['/', ServeApp.INSTANCE],
    ['/api/cloneablegame', ApiCloneableGame.INSTANCE],
    ['/api/game', ApiGame.INSTANCE],
    ['/api/game/logs', ApiGameLogs.INSTANCE],
    ['/api/games', ApiGames.INSTANCE],
    ['/api/player', ApiPlayer.INSTANCE],
    ['/api/spectator', ApiSpectator.INSTANCE],
    ['/api/waitingfor', ApiWaitingFor.INSTANCE],
    ['/cards', ServeApp.INSTANCE],
    ['/favicon.ico', ServeAsset.INSTANCE],
    ['/game', GameHandler.INSTANCE],
    ['/games-overview', GamesOverview.INSTANCE],
    ['/help', ServeApp.INSTANCE],
    ['/load', Load.INSTANCE],
    ['/load_game', LoadGame.INSTANCE],
    ['/main.js', ServeAsset.INSTANCE],
    ['/main.js.map', ServeAsset.INSTANCE],

    ['/new-game', ServeApp.INSTANCE],
    ['/player', ServeApp.INSTANCE],
    ['/player/input', PlayerInput.INSTANCE],
    ['/solo', ServeApp.INSTANCE],
    ['/spectator', ServeApp.INSTANCE],
    ['/styles.css', ServeAsset.INSTANCE],
    ['/sw.js', ServeAsset.INSTANCE],
    ['/the-end', ServeApp.INSTANCE],


    ['/debug-ui', ServeApp.INSTANCE],
    ['/login', ServeApp.INSTANCE],
    ['/register', ServeApp.INSTANCE],
    ['/mygames', ServeApp.INSTANCE],
    ['/donate', ServeApp.INSTANCE],
    ['/users', ServeApp.INSTANCE],
  ],
);

function processRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  if (req.url === undefined) {
    route.notFound(req, res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const ctx = {url, route, serverId, gameLoader: GameLoader.getInstance()};
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
      UserManager.isvip(req, res);
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

function requestHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  try {
    processRequest(req, res);
  } catch (error) {
    route.internalServerError(req, res, error);
  }
}

let server: http.Server | https.Server;

// If they've set up https
if (process.env.KEY_PATH && process.env.CERT_PATH) {
  const httpsHowto =
    'https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/';
  if (!fs.existsSync(process.env.KEY_PATH)) {
    console.error(
      'TLS KEY_PATH is set in .env, but cannot find key! Check out ' +
      httpsHowto,
    );
  } else if (!fs.existsSync(process.env.CERT_PATH)) {
    console.error(
      'TLS CERT_PATH is set in .env, but cannot find cert! Check out' +
      httpsHowto,
    );
  }
  const options = {
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH),
  };
  server = https.createServer(options, requestHandler);
} else {
  server = http.createServer(requestHandler);
}

GameLoader.getInstance().start(() => {
  console.log('Starting server on port ' + (process.env.PORT || 8081));

  console.log('version 0.X');

  server.listen(process.env.PORT || 8081);

  console.log('\nThe secret serverId for this server is \x1b[1m' + serverId + '\x1b[0m. Use it to access the following administrative routes:\n');
  console.log('* Overview of existing games: /games-overview?serverId=' + serverId);
  console.log('* API for game IDs: /api/games?serverId=' + serverId + '\n');
});
