require('dotenv').config();
require('console-stamp')(
  console,
  {format: ':date(yyyy-mm-dd HH:MM:ss Z)'},
);

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as querystring from 'querystring';
import * as zlib from 'zlib';

import {BoardName} from './boards/BoardName';
import {BufferCache} from './server/BufferCache';
import {Game, LoadState} from './Game';
import {GameLoader, State} from './database/GameLoader';
import {GameLogs} from './routes/GameLogs';
import {Route} from './routes/Route';
import {Player} from './Player';
import {Database} from './database/Database';
import {Server} from './server/ServerModel';
import * as UserManager from './UserManager';
import * as UserUtil from './UserUtil';

// import {Cloner} from './src/database/Cloner';

const serverId = process.env.SERVER_ID;

const route = new Route();
const gameLogs = new GameLogs();
// const assetCacheMaxAge = process.env.ASSET_CACHE_MAX_AGE || 0;
const fileCache = new BufferCache();

const isProduction = process.env.NODE_ENV === 'production';

// prime the cache and compress styles.css
const styles = fs.readFileSync('build/styles.css');
fileCache.set('styles.css', styles);
zlib.gzip(styles, function(err, compressed) {
  if (err !== null) {
    console.warn('error compressing styles', err);
    return;
  }
  fileCache.set('styles.css.gz', compressed);
});

function processRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.url === undefined) {
    route.notFound(req, res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  switch (req.method) {
  case 'GET':
    switch (url.pathname) {
    case '/games-overview':
      if (!isServerIdValid(req)) {
        route.notAuthorized(req, res);
        return;
      } else {
        serveApp(req, res);
      }
      break;

    case '/':
    case '/new-game':
    case '/solo':
    case '/game':
    case '/player':
    case '/the-end':
    case '/load':
    case '/debug-ui':
    case '/help':
    case '/login':
    case '/register':
    case '/mygames':
    case '/donate':
      serveApp(req, res);
      break;

    case '/api/player':
      apiGetPlayer(req, res);
      break;

    case '/api/waitingfor':
      apiGetWaitingFor(req, res);
      break;

    case '/styles.css':
    case '/favicon.ico':
    case '/main.js':
    case '/main.js.map':
      serveAsset(req, res);
      break;

    case '/api/games':
      apiGetGames(req, res);
      break;
    case '/api/mygames':
      UserManager.apiGetMyGames(req, res);
      break;
    case '/api/gameback':
      UserManager.apiGameBack(req, res);
      break;
    case '/api/isvip':
      UserManager.isvip(req, res);
      break;


    case '/api/game':
      apiGetGame(req, res);
      break;

    case '/api/clonablegames':
      getClonableGames(res);
      break;

    default:
      if (url.pathname.startsWith('/assets/')) {
        serveAsset(req, res);
      } else if (gameLogs.canHandle(req.url)) {
        gameLogs.handle(req, res);
      } else {
        route.notFound(req, res);
      }
    }
    break;

  case 'PUT':
    switch (url.pathname) {
    case '/game':
      createGame(req, res);
      break;

    case '/load':
      loadGame(req, res);
      break;

    case '/register':
      UserManager.register(req, res);
      break;

    default:
      route.notFound(req, res);
    }
    break;

  case 'POST':
    if ( req.url.indexOf('/login') === 0) {
      UserManager.login(req, res);
    } else if (req.url.indexOf('/player/resign') === 0) {
      UserManager.resign(req, res);
    } else if (req.url.indexOf('/player/input?id=') === 0) {
      const qs: string = req.url.substring('/player/input?'.length);
      const queryParams = querystring.parse(qs);
      const playerId = (queryParams as any)['id'];
      const userId = (queryParams as any)['userId'];
      GameLoader.getInstance().getByPlayerId(playerId, (game) => {
        if (game === undefined) {
          route.notFound(req, res);
          return;
        }
        const player = game.getAllPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
          route.notFound(req, res);
          return;
        }
        const user = GameLoader.getInstance().userNameMap.get(player.name);
        if (user !== undefined && user.id !== userId) {
          route.notFound(req, res);
          return;
        }
        processInput(req, res, player, game);
      });
    } else {
      route.notFound(req, res);
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

export function generateRandomId(): string {
  let id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  while (id.length < 12) {
    id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  }
  return id;
}

function processInput(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  player: Player,
  game: Game,
): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const entity = JSON.parse(body);
      player.process(entity);
      res.setHeader('Content-Type', 'application/json');
      res.write(getPlayerModelJSON(player, game, false));
      res.end();
    } catch (err) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
      });
      console.warn('Error processing input from player', err);
      res.write(
        JSON.stringify({
          message: err.message,
        }),
      );
      res.end();
    }
  });
}

function getClonableGames(res: http.ServerResponse): void {
  Database.getInstance().getClonableGames(function(err, allGames) {
    if (err) {
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(allGames));
    res.end();
  });
}

function apiGetGames(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  if (!isServerIdValid(req)) {
    route.notAuthorized(req, res);
    return;
  }
  const queryParams = querystring.parse(req.url!.replace(/^.*\?/, ''));
  if (queryParams.userId === undefined || queryParams.userId !== UserUtil.myId) {
    console.warn('Not me');
    route.notFound(req, res);
    return;
  }

  if (GameLoader.getInstance().state !== State.READY ) {
    console.warn('loading');
    route.notFound(req, res);
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
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(answer));
  res.end();
}

function loadGame(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const gameReq = JSON.parse(body);

      const game_id = gameReq.game_id;
      const rollbackCount = gameReq.rollbackCount;
      if (rollbackCount > 0) {
      }
      GameLoader.getInstance().getGameById(game_id, (game) => {
        if (game === undefined) {
          console.warn(`unable to find ${game_id} in database`);
          route.notFound(req, res);
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.write(getGameModelJSON(game));
        res.end();
      });
    } catch (error) {
      route.internalServerError(req, res, error);
    }
  });
}

function apiGetGame(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.url === undefined) {
    console.warn('url not defined');
    route.notFound(req, res);
    return;
  }

  const qs: string = req.url!.substring('/api/game?'.length);
  const queryParams = querystring.parse(qs);
  const gameId = (queryParams as any)['id'];
  const userId = (queryParams as any)['userId'];

  GameLoader.getInstance().getGameById(gameId, (game: Game | undefined) => {
    if (game === undefined) {
      console.warn('game is undefined');
      route.notFound(req, res);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.write(getGameModelJSON(game, userId));
    res.end();
  });
}

function apiGetWaitingFor(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const qs: string = req.url!.substring('/api/waitingfor?'.length);
  const queryParams = querystring.parse(qs);
  const playerId = (queryParams as any)['id'];
  const prevGameAge = parseInt((queryParams as any)['prev-game-age']);
  GameLoader.getInstance().getByPlayerId(playerId, (game) => {
    if (game === undefined) {
      route.notFound(req, res);
      return;
    }
    const player = game.getAllPlayers().find((player) => player.id === playerId);
    if (player === undefined) {
      route.notFound(req, res);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(Server.getWaitingForModel(player, prevGameAge)));
  });
}

function apiGetPlayer(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const qs = req.url!.substring('/api/player?'.length);
  const queryParams = querystring.parse(qs);
  const playerId = (queryParams as any)['id'];
  const userId = (queryParams as any)['userId'];
  GameLoader.getInstance().getByPlayerId(playerId as string, (game) => {
    if (game === undefined) {
      route.notFound(req, res);
      return;
    }
    const player = game.getAllPlayers().find((player) => player.id === playerId);
    if (player === undefined) {
      route.notFound(req, res);
      return;
    }
    let block = false;
    const user = GameLoader.getInstance().userNameMap.get(player.name);
    if (user !== undefined && user.id !== userId) {
      block = true;
    }
    res.setHeader('Content-Type', 'application/json');
    res.write(getPlayerModelJSON(player, game, block));
    res.end();
  });
}

function createGame(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const gameReq = JSON.parse(body);
      const gameId = generateRandomId();
      const players = gameReq.players.map((obj: any) => {
        return new Player(
          obj.name,
          obj.color,
          obj.beginner,
          Number(obj.handicap), // For some reason handicap is coming up a string.
          generateRandomId(),
        );
      });
      let firstPlayerIdx: number = 0;
      for (let i = 0; i < gameReq.players.length; i++) {
        if (gameReq.players[i].first === true) {
          firstPlayerIdx = i;
          break;
        }
      }

      if (gameReq.board === 'random') {
        const boards = Object.values(BoardName);
        gameReq.board = boards[Math.floor(Math.random() * boards.length)];
      }

      const gameOptions = {
        boardName: gameReq.board,
        clonedGamedId: gameReq.clonedGamedId,

        undoOption: gameReq.undoOption,
        showTimers: gameReq.showTimers,
        fastModeOption: gameReq.fastModeOption,
        showOtherPlayersVP: gameReq.showOtherPlayersVP,

        corporateEra: gameReq.corporateEra,
        venusNextExtension: gameReq.venusNext,
        coloniesExtension: gameReq.colonies,
        preludeExtension: gameReq.prelude,
        turmoilExtension: gameReq.turmoil,
        aresExtension: gameReq.aresExtension,
        aresHazards: true, // Not a runtime option.
        politicalAgendasExtension: gameReq.politicalAgendasExtension,
        moonExpansion: gameReq.moonExpansion,
        promoCardsOption: gameReq.promoCardsOption,
        communityCardsOption: gameReq.communityCardsOption,
        solarPhaseOption: gameReq.solarPhaseOption,
        removeNegativeGlobalEventsOption:
          gameReq.removeNegativeGlobalEventsOption,
        includeVenusMA: gameReq.includeVenusMA,

        draftVariant: gameReq.draftVariant,
        initialDraftVariant: gameReq.initialDraft,
        startingCorporations: gameReq.startingCorporations,
        shuffleMapOption: gameReq.shuffleMapOption,
        randomMA: gameReq.randomMA,
        soloTR: gameReq.soloTR,
        customCorporationsList: gameReq.customCorporationsList,
        cardsBlackList: gameReq.cardsBlackList,
        customColoniesList: gameReq.customColoniesList,
        heatFor: gameReq.heatFor,
        breakthrough: gameReq.breakthrough,
        requiresVenusTrackCompletion: gameReq.requiresVenusTrackCompletion,
        requiresMoonTrackCompletion: gameReq.requiresMoonTrackCompletion,
      };

      const seed = Math.random();
      const game = Game.newInstance(gameId, players, players[firstPlayerIdx], gameOptions, seed, false);
      game.loadState = LoadState.LOADED;
      GameLoader.getInstance().add(game);
      res.setHeader('Content-Type', 'application/json');
      res.write(getGameModelJSON(game, gameReq.userId));
      res.end();
    } catch (error) {
      route.internalServerError(req, res, error);
    }
  });
}

export function getPlayerModelJSON(player: Player, game: Game, block: boolean): string {
  const model = Server.getPlayerModel(player, game, block);
  return JSON.stringify(model);
}

function getGameModelJSON(game: Game, userId : string = ''): string {
  const model = Server.getGameModel(game, userId);
  return JSON.stringify(model);
}

function isServerIdValid(req: http.IncomingMessage): boolean {
  const queryParams = querystring.parse(req.url!.replace(/^.*\?/, ''));
  if (
    queryParams.serverId === undefined ||
    queryParams.serverId !== serverId
  ) {
    console.warn('No or invalid serverId given');
    return false;
  }
  return true;
}

function serveApp(req: http.IncomingMessage, res: http.ServerResponse): void {
  req.url = '/assets/index.html';
  serveAsset(req, res);
}

function serveAsset(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.url === undefined) {
    route.internalServerError(req, res, new Error('no url on request'));
    return;
  }

  let contentEncoding: string | undefined;
  let contentType: string | undefined;
  let file: string | undefined;

  if (req.url.startsWith('/styles.css')) {
    const compressed = fileCache.get('styles.css.gz');
    contentType = 'text/css';
    file = 'styles.css';
    if (compressed !== undefined && Route.supportsEncoding(req, 'gzip')) {
      contentEncoding = 'gzip';
      file += '.gz';
    }
  } else if (req.url.startsWith('/assets/index.html')) {
    contentType = 'text/html; charset=utf-8';
    file = req.url.substring(1);
  } else if (req.url === '/favicon.ico') {
    contentType = 'image/x-icon';
    file = 'assets/favicon.ico';
  } else if (req.url.startsWith('/main.js')) {
    contentType = 'text/javascript';
    if (req.url.startsWith('/main.js.map')) {
      file = '/main.js.map';
    } else {
      file = '/main.js';
    }

    file = `build${file}`;
  } else if (req.url === '/assets/Prototype.ttf' || req.url === '/assets/futureforces.ttf' || req.url === '/assets/BattleStar.ttf') {
    contentType = 'font/ttf';
    file = req.url.substring(1);
  } else if (req.url.endsWith('.png') || req.url.endsWith('.jpg')) {
    const assetsRoot = path.resolve('./assets');
    const reqFile = path.resolve(path.normalize(req.url).slice(1));

    // Disallow to go outside of assets directory
    if (reqFile.startsWith(assetsRoot) === false) {
      return route.notFound(req, res);
    }
    contentType = req.url.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    file = reqFile;
  } else {
    return route.notFound(req, res);
  }
  // asset caching
  const buffer = fileCache.get(file);
  if (buffer !== undefined) {
    if (req.headers['if-none-match'] === buffer.hash) {
      route.notModified(res);
      return;
    }
    // res.setHeader('Cache-Control', 'must-revalidate');
    // res.setHeader('ETag', buffer.hash);
  } else if (isProduction === false && req.url !== '/main.js' && req.url !== '/main.js.map') {
    // res.setHeader("Cache-Control", "max-age=" + assetCacheMaxAge);
  }

  if (contentType !== undefined) {
    res.setHeader('Content-Type', contentType);
  }

  if (contentEncoding !== undefined) {
    res.setHeader('Content-Encoding', contentEncoding);
  }

  if (buffer !== undefined) {
    res.setHeader('Content-Length', buffer.buffer.length);
    res.end(buffer.buffer);
    return;
  }

  const finalFile = file;

  fs.readFile(finalFile, function(err, data) {
    if (err) {
      return route.internalServerError(req, res, err);
    }
    res.setHeader('Content-Length', data.length);
    res.end(data);
    // only production caches resources
    if (isProduction === true) {
      fileCache.set(finalFile, data);
    }
  });
}

GameLoader.getInstance().start(() => {
  console.log('Starting server on port ' + (process.env.PORT || 8081));

  console.log('version 0.X');

  server.listen(process.env.PORT || 8081);

  console.log('\nThe secret serverId for this server is \x1b[1m' + serverId + '\x1b[0m. Use it to access the following administrative routes:\n');
  console.log('* Overview of existing games: /games-overview?serverId=' + serverId);
  console.log('* API for game IDs: /api/games?serverId=' + serverId + '\n');
});
