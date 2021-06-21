
import * as http from 'http';
import * as querystring from 'querystring';
import {User} from './User';
import {Database} from './database/Database';
import {getDate, getDay} from './UserUtil';
import {GameLoader} from './database/GameLoader';
import {generateRandomId} from './UserUtil';
import {Server} from './models/ServerModel';
import {PlayerBlockModel} from './models/PlayerModel';

const colorNames = ['Blue', 'Red', 'Yellow', 'Green', 'Black', 'Purple', 'You', 'blue', 'red', 'yellow', 'green', 'black', 'purple', 'you'];

function notFound(req: http.IncomingMessage, res: http.ServerResponse): void {
  if ( ! process.argv.includes('hide-not-found-warnings')) {
    console.warn('Not found', req.method, req.url);
  }
  res.writeHead(404);
  res.write('Not found');
  res.end();
}

export function apiGameBack(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.url === undefined) {
    console.warn('url not defined');
    notFound(req, res);
    return;
  }
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq:any = JSON.parse(body);
      const gameId = userReq['id'];
      const userId = userReq['userId'];
      if (gameId === undefined || gameId === '') {
        console.warn('didn\'t find game id');
        notFound(req, res);
        return;
      }

      if (userId === undefined || userId === '') {
        console.warn('didn\'t find user id');
        notFound(req, res);
        return;
      }

      const user = GameLoader.getInstance().userIdMap.get(userId);
      if (user === undefined || !user.canRollback()) {
        console.warn('didn\'t find user ');
        notFound(req, res);
        return;
      }
      const game = GameLoader.getInstance().games.get(gameId);

      if (game === undefined) {
        console.warn('game is undefined');
        notFound(req, res);
        return;
      }
      console.log('user:'+ user.name +' rollback game ' + game.id);
      game.rollback();
      user.reduceRollbackNum();
      res.write('success');
      res.end();
    } catch (err) {
      console.warn('error rollback', err);
      res.writeHead(500);
      res.write('Unable to rollback: ' + err.message);
      res.end();
    }
  });
}

export function apiGetMyGames(req: http.IncomingMessage, res: http.ServerResponse): void {
  const routeRegExp: RegExp = /^\/api\/mygames\?id\=([0-9abcdef]+).*?$/i;

  if (req.url === undefined) {
    console.warn('url not defined');
    notFound(req, res);
    return;
  }

  if (!routeRegExp.test(req.url)) {
    console.warn('no match with regexp');
    notFound(req, res);
    return;
  }

  const matches = req.url.match(routeRegExp);

  if (matches === null || matches[1] === undefined) {
    console.warn('didn\'t find user id');
    notFound(req, res);
    return;
  }

  const userId: string = matches[1];

  const user = GameLoader.getInstance().userIdMap.get(userId);

  if (user === undefined) {
    console.warn('user is undefined');
    notFound(req, res);
    return;
  }
  const gameids = GameLoader.getInstance().usersToGames.get(user.id);
  const mygames: Array<any> = [];
  if (gameids !== undefined && gameids.length > 0) {
    gameids.forEach((id) => {
      const game = GameLoader.getInstance().games.get(id);
      if (game !== undefined) {
        mygames.push({
          activePlayer: game.activePlayer.color,
          id: game.id,
          phase: game.phase,
          players: game.getAllPlayers().map((player) => {
            return {
              id: player.id,
              name: player.name,
              color: player.color,
            };
          }),
          createtime: game.createtime?.slice(5, 16),
          updatetime: game.updatetime?.slice(5, 16),
          gameAge: game.gameAge,
          saveId: game.lastSaveId,
        });
      }
    });
  }
  mygames.sort((a: any, b: any) => {
    return a.updatetime > b.updatetime ? -1 : (a.updatetime === b.updatetime ? 0 : 1);
  });
  const data = {mygames: mygames, vipDate: ''};
  if (user.isvip()) {
    data.vipDate = user.vipDate;
  }
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
}


export function login(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq = JSON.parse(body);
      const userName: string = userReq.userName.trim().toLowerCase();
      const password: string = userReq.password.trim().toLowerCase();
      if (userName === undefined || userName.length === 0) {
        throw new Error('UserName must not be empty ');
      }
      const user = GameLoader.getInstance().userNameMap.get(userName);
      if (user === undefined) {
        throw new Error('User not exists ');
      }
      if (password === undefined || password.length <= 2) {
        throw new Error('Password must not be empty and  be longer than 2');
      }
      if (password !== user.password.trim().toLowerCase()) {
        throw new Error('Password error');
      }
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify({id: user.id, name: user.name}));
    } catch (err) {
      console.warn('error login', err);
      res.writeHead(500);
      res.write('Unable to login: ' + err.message);
    }
    res.end();
  });
}

export function register(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq = JSON.parse(body);
      const userId = generateRandomId('');
      const userName: string = userReq.userName ? userReq.userName.trim().toLowerCase() : '';
      const password: string = userReq.password ? userReq.password.trim().toLowerCase() : '';
      if (userName === undefined || userName.length <= 1) {
        throw new Error('UserName must not be empty and  be longer than 1');
      }
      if (GameLoader.getInstance().userNameMap.get(userName) !== undefined || colorNames.indexOf(userName) > -1) {
        throw new Error('User name already exists, please use another name ');
      }
      if (password === undefined || password.length <= 2) {
        throw new Error('Password must not be empty and  be longer than 2');
      }
      Database.getInstance().saveUser(userId, userName, password, '{}');
      const user: User = new User(userName, password, userId);
      user.createtime = getDay();
      GameLoader.getInstance().userNameMap.set(userName, user);
      GameLoader.getInstance().userIdMap.set(userId, user);
      res.setHeader('Content-Type', 'application/json');
      res.write('success');
    } catch (err) {
      console.warn('error register user', err);
      res.writeHead(500);
      res.write('Unable to register user: ' + err.message);
    }
    res.end();
  });
}


export function isvip(req: http.IncomingMessage, res: http.ServerResponse): void {
  const qs: string = req.url!.substring('/api/isvip?'.length);
  const queryParams = querystring.parse(qs);
  const userId = (queryParams as any)['userId'];

  if (userId === undefined || userId === '') {
    console.warn('didn\'t find user id');
    notFound(req, res);
    return;
  }

  const user = GameLoader.getInstance().userIdMap.get(userId);
  if (user === undefined ) {
    console.warn('didn\'t find user ');
    notFound(req, res);
    return;
  }
  user.accessDate = getDate();
  try {
    res.setHeader('Content-Type', 'application/json');
    if ( user.isvip()) {
      res.write('success');
    } else {
      res.write('error');
    }
    res.end();
  } catch (err) {
    console.warn('error execute', err);
    res.writeHead(500);
    res.write('Unable to execute');
    res.end();
  }
}

export function resign(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq = JSON.parse(body);
      const userId: string = userReq.userId;
      const playerId: string = userReq.playerId;

      const game = GameLoader.getInstance().playerToGame.get(playerId);
      if (game === undefined || GameLoader.getInstance().games.get(game.id) === undefined) {
        notFound(req, res);
        return;
      }
      const player = game.getAllPlayers().find((p) => p.id === playerId);
      if (player === undefined) {
        notFound(req, res);
        return;
      }
      const userPlayer = GameLoader.getUserByPlayer(player);
      const user = GameLoader.getInstance().userIdMap.get(userId);
      if (user === undefined || !user.isvip()) {
        notFound(req, res);
        return;
      }
      if (userPlayer !== undefined && userPlayer.id !== userId) {// 已注册并且不等于登录用户  不能体退
        notFound(req, res);
        return;
      }
      game.exitPlayer(player);
      res.setHeader('Content-Type', 'application/json');
      const playerBlockModel : PlayerBlockModel ={
        block: false,
        isme: true,
        showhandcards: user.showhandcards,
      };
      res.end(JSON.stringify(Server.getPlayerModel(player, playerBlockModel)));
    } catch (err) {
      console.warn('error resign', err);
      console.warn('error resign:', body);
      res.writeHead(500);
      res.write('Unable to resign: ' + err.message);
      res.end();
    }
  });
}

export function showHand(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq:any = JSON.parse(body);
      const user = GameLoader.getInstance().userIdMap.get(userReq.userId);
      if (user === undefined) {
        notFound(req, res);
        return;
      }
      if (userReq.showhandcards ) {
        user.showhandcards = true;
      } else {
        user.showhandcards = false;
      }

      res.setHeader('Content-Type', 'application/json');
      res.write('success');
      res.end();
    } catch (err) {
      console.warn('error update', err);
      res.writeHead(500);
      res.write('Unable to update: ' + err.message);
      res.end();
    }
  });
}

export function sitDown(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';
  req.on('data', function(data) {
    body += data.toString();
  });
  req.once('end', function() {
    try {
      const userReq:any = JSON.parse(body);
      const userme = GameLoader.getInstance().userIdMap.get(userReq.userId);
      if (userme === undefined) {
        notFound(req, res);
        return;
      }
      if (userReq.playerId === undefined) {
        notFound(req, res);
        return;
      }
      GameLoader.getInstance().getByPlayerId(userReq.playerId, (game) => {
        if (game === undefined) {
          console.warn('sitDown game undefined');
          notFound(req, res);
          return;
        }
        const player = game.getAllPlayers().find((player) => player.id === userReq.playerId);
        if (player === undefined || player.userId !== undefined) {
          console.warn('sitDown player === undefined || player.userId !== undefined');
          notFound(req, res);
          return;
        }

        // 已经属于其他用户
        const userThat = GameLoader.getInstance().userNameMap.get(player.name);
        if (userThat !== undefined ) {
          console.warn('sitDown userThat !== undefined');
          notFound(req, res);
          return;
        }

        let haveSit = false;
        game.getAllPlayers().forEach( (p) => {
          if (p !== player && ( p.userId === userme.id || p.name === userme.name)) {
            // res.setHeader('Content-Type', 'application/json');
            res.write('不能重复坐下，请使用你自己的游戏地址');
            res.end();
            haveSit = true;
            return;
          }
        });
        if (haveSit ) {
          return;
        }
        player.name = userme.name;
        player.userId = userme.id;
        game.log('${0} sit down', (b) => b.player(player));
        GameLoader.getInstance().add(game);
        res.write('success');
        res.end();
      });
    } catch (err) {
      console.warn('error update', err);
      res.writeHead(500);
      res.write('Unable to update: ' + err.message);
      res.end();
    }
  });
}


