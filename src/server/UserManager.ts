import {User} from './User';
import {Database} from './database/Database';
import {getDate, getDay} from './UserUtil';
import {GameLoader} from './database/GameLoader';
import {Server} from './models/ServerModel';
import {PlayerBlockModel} from '../common/models/PlayerModel';
import {Context} from './routes/IHandler';
import * as crypto from 'crypto';
import {UserRank} from '../common/rank/RankManager';
import {RankTier} from '../common/rank/RankTier';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '../common/rank/constants';
import {generateRandomId} from './utils/server-ids';
import {Request} from './Request';
import {Response} from './Response';
import {UnexpectedInput} from './inputs/UnexpectedInput';
import {Phase} from '../common/Phase';

const colorNames = ['blue', 'red', 'yellow', 'green', 'black', 'purple', 'you', '红色', '绿色', '黄色', '蓝色', '黑色', '紫色'];
function notFound(req: Request, res: Response, msg: string = ''): void {
  if ( ! process.argv.includes('hide-not-found-warnings')) {
    console.warn('UserManager Process Error', req.method, req.url, msg);
  }
  res.writeHead(404);
  res.write(msg ? msg : 'Not found');
  res.end();
}


export function apiGameBack(userReq:any, req: Request, res: Response): void {
  const gameId = userReq['id'];
  const userId = userReq['userId'];
  if (gameId === undefined || gameId === '') {
    notFound(req, res, 'Not find game id ' + gameId);
    return;
  }

  if (userId === undefined || userId === '') {
    notFound(req, res, 'Not find user id ' + userId);
    return;
  }

  const user = GameLoader.getInstance().userIdMap.get(userId);
  if (user === undefined || !user.canRollback() || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'Not find user ' + userId : !user.canRollback() ? '!user.canRollback()' : 'token过期');
    return;
  }
  const game = GameLoader.getInstance().games.get(gameId);

  if (game === undefined) {
    notFound(req, res, 'game is undefined');
    return;
  }
  console.log('user:'+ user.name +' rollback game ' + game.id);
  game.rollback();
  user.reduceRollbackNum();
  res.write('success');
  res.end();
}

export function apiGetMyGames(req: Request, res: Response, ctx: Context): void {
  const userId = ctx.url.searchParams.get('id');
  if (userId === undefined || userId === null) {
    notFound(req, res, 'not find user id');
    return;
  }
  const user = GameLoader.getInstance().userIdMap.get(userId);

  if (user === undefined || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'user is undefined' : 'token过期');
    return;
  }
  const gameids = GameLoader.getInstance().usersToGames.get(user.id);
  const mygames: Array<any> = [];
  if (gameids !== undefined && gameids.size > 0) {
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
  const data = {mygames: mygames, vipDate: '', showhandcards: user.showhandcards};
  if (user.isvip()) {
    data.vipDate = user.vipDate;
  }
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(data));
  res.end();
}

export function login(userReq:any, _req: Request, res: Response): Promise<void> {
  const userName: string = userReq.userName.trim().toLowerCase();
  let password: string = userReq.password.trim().toLowerCase();
  if (userName === undefined || userName.length === 0) {
    throw new UnexpectedInput('UserName must not be empty');
  }
  const user = GameLoader.getInstance().userNameMap.get(userName);
  if (user === undefined) {
    throw new UnexpectedInput('User not exists or Password error');
  }
  if (password === undefined || password.length <= 2) {
    throw new UnexpectedInput('Password must not be empty and  be longer than 2');
  }
  password = crypto.createHash('md5').update( password ).digest('hex');
  if (password !== user.password.trim().toLowerCase()) {
    throw new UnexpectedInput('User not exists or Password error');
  }
  const token = user.addToken();
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({id: token, name: user.name}));
  res.end();
  return Promise.resolve();
}

export function register(userReq: any, _req: Request, res: Response): void {
  const userId = generateRandomId('u');
  const userName: string = userReq.userName ? userReq.userName.trim().toLowerCase() : '';
  let password: string = userReq.password ? userReq.password.trim().toLowerCase() : '';
  if (userName === undefined || userName.length <= 1) {
    throw new Error('Please enter at least 2 characters for userName');
  }
  if (GameLoader.getInstance().userNameMap.get(userName) !== undefined || colorNames.indexOf(userName) > -1) {
    throw new Error('User name already exists, please use another name');
  }
  if (password === undefined || password.length <= 2) {
    throw new Error('Please enter at least 3 characters for password');
  }
  password = crypto.createHash('md5').update( password ).digest('hex');
  Database.getInstance().saveUser(userId, userName, password, '{}');
  const user: User = new User(userName, password, userId);
  user.createtime = getDay();
  GameLoader.getInstance().userNameMap.set(userName, user);
  GameLoader.getInstance().userIdMap.set(userId, user);
  res.setHeader('Content-Type', 'application/json');
  res.write('success');
  res.end();
  return;
}


export function isvip(req: Request, res: Response, ctx: Context): void {
  let userId = ctx.url.searchParams.get('userId');
  if (userId === undefined || userId === '' || userId === null) {
    notFound(req, res, 'not find user id');
    return;
  }

  const user = GameLoader.getInstance().userIdMap.get(userId);
  if (user === undefined || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'not find user' : 'token过期');
    return;
  }
  if (userId === user.id) {
    userId = user.addToken();
  }
  const accessDate = getDate();
  if (accessDate !== user.accessDate) {
    user.accessDate = getDate();
  }
  try {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({id: userId, isvip: user.isvip()}));
    res.end();
  } catch (err) {
    console.warn('error execute', err);
    res.writeHead(500);
    res.write('Unable to execute');
    res.end();
  }
}

export function resign(userReq:any, req: Request, res: Response): void {
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
  if (user === undefined || !user.isvip() || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'user === undefined' : !user.isvip() ? '!user.isvip() ' : 'token过期');
    return;
  }
  if (userPlayer !== undefined && userPlayer.id !== user.id) {// 已注册并且不等于登录用户  不能体退
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
}

export function showHand(userReq:any, req: Request, res: Response): Promise<void> {
  const user = GameLoader.getInstance().userIdMap.get(userReq.userId);
  if (user === undefined || !user.checkToken(userReq.userId)) {
    notFound(req, res, user === undefined? 'user === undefined' : 'token过期');
    return Promise.resolve();
  }
  if (userReq.showhandcards ) {
    user.showhandcards = true;
  } else {
    user.showhandcards = false;
  }

  res.setHeader('Content-Type', 'application/json');
  res.write('success');
  res.end();
  return Promise.resolve();
}


//
export async function sitDown(userReq:any, req: Request, res: Response): Promise<void> {
  const userme = GameLoader.getInstance().userIdMap.get(userReq.userId);
  if (userme === undefined || !userme.checkToken(userReq.userId)) {
    notFound(req, res, userme === undefined ? 'userme === undefined' : 'token过期');
    return;
  }
  if (userReq.playerId === undefined) {
    notFound(req, res);
    return;
  }
  const game = await GameLoader.getInstance().getByPlayerId(userReq.playerId);
  if (game === undefined) {
    notFound(req, res, 'sitDown game undefined');
    return;
  }
  const player = game.getAllPlayers().find((player) => player.id === userReq.playerId);
  if (player === undefined || player.userId !== undefined) {
    notFound(req, res, `sitDown ${player === undefined} || ${player?.userId}`);
    return;
  }

  // 已经属于其他用户
  const userThat = GameLoader.getInstance().userNameMap.get(player.name);
  if (userThat !== undefined ) {
    notFound(req, res, 'sitDown userThat !== undefined');
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
  // res.setHeader('Content-Type', 'application/json');
  res.write('success');
  res.end();
}


//

// 天梯 用户激活排名的接口
export function activateRank(userReq: any, _req: Request, res: Response): void {
  const userId = userReq.userId;
  const rankValue = DEFAULT_RANK_VALUE;
  const mu = DEFAULT_MU;
  const sigma = DEFAULT_SIGMA;
  let userRank = GameLoader.getInstance().userRankMap.get(userId);
  if (userRank === null) {
    userRank = new UserRank(userId, rankValue, mu, sigma, 0);
    Database.getInstance().addUserRank(userRank);
    GameLoader.getInstance().addOrUpdateUserRank(userRank);
  }
  res.setHeader('Content-Type', 'application/json');
  res.write('success');
  res.end();
  return;
}

export function getUserRank(req: Request, res: Response, ctx: Context): void {
  let userRank: UserRank | undefined;
  let userId = ctx.url.searchParams.get('userId');
  const playerName = ctx.url.searchParams.get('playerName');
  if (!userId && playerName !== undefined && playerName !== '' && playerName !== null) {
    // 如果没传userId 就用playerName得到userId
    const user = GameLoader.getInstance().userNameMap.get(playerName);
    if (user !==undefined) {
      userId = user.id;
    }
  }
  if (userId ) {
    userRank = GameLoader.getInstance().userRankMap.get(userId);
    if (userRank === undefined ) {
      userRank = new UserRank(userId, DEFAULT_RANK_VALUE, DEFAULT_MU, DEFAULT_SIGMA, 0);
      Database.getInstance().addUserRank(userRank);
      GameLoader.getInstance().addOrUpdateUserRank(userRank);
    }
    const data = {userId: userRank.userId, rankValue: userRank.rankValue, mu: userRank.mu, sigma: userRank.sigma, trueskill: userRank.trueskill};

    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(data));
    res.end();
  } else {
    notFound(req, res, 'not find user id or player name');
    return;
  }
}

export function getUserRanks(req: Request, res: Response, ctx: Context): void {
  const limit = Math.min(100, Number(ctx.url.searchParams.get('limit')));
  Database.getInstance().getUserRanks(limit).then( (allUserRanks:Array<UserRank> ) => {
    try {
      const resRanks: Array<{userName: String, userRank: UserRank, userTier: RankTier}> = [];
      allUserRanks.forEach((userRank) => {
        const user = GameLoader.getInstance().userIdMap.get(userRank.userId);
        if (user !== undefined) {
          resRanks.push({userName: user.name, userRank: userRank, userTier: userRank.getTier()});
        }
      });
      if (resRanks.length === 0) {
        notFound(req, res);
        return;
      }
      const data = {allUserRanks: resRanks};
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(data));
      res.end();
    } catch (err) {
      if (err instanceof Error && err.name === 'UnexpectedInput') {
        console.warn('error ', getUserRanks, ',', limit, ',', err.message);
      } else {
        console.warn('error ', getUserRanks, ',', limit, ',', err);
      }
      res.writeHead(500);
      const message = err instanceof Error ? err.message : String(err);
      res.write('执行错误 : ' + message);
      res.end();
    }
  }).catch((err) => {
    console.error('getUserRanks', err);
  });
}

// 天梯 由于超时或者所有玩家退出游戏，调用API
export async function endGameByEvent(userReq: any, req: Request, res: Response): Promise<void> {
  const userId: string = userReq.userId;
  const playerId: string = userReq.playerId;
  const game = await GameLoader.getInstance().getByPlayerId(playerId); // 多个请求时await
  if (game === undefined || GameLoader.getInstance().games.get(game.id) === undefined) {
    notFound(req, res);
    return;
  }
  if (game.phase !== Phase.END && game.phase !== Phase.TIMEOUT && game.phase !== Phase.ABANDON) {
    console.log('endGameByEvent from userId', userId, game.phase);
    game.checkRankModeEndGame(playerId).then(() => {
      console.log('endGameByEvent success from', userId);
    }).catch((err) => {
      console.error('endGameByEvent', err);
    });
  }
  res.setHeader('Content-Type', 'application/json');
  res.end();
}
