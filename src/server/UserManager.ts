import {User} from './User';
import {Database} from './database/Database';
import {getDate, getDay} from './UserUtil';
import {GameLoader} from './database/GameLoader';
import {Server} from './models/ServerModel';
import {Context} from './routes/IHandler';
import * as crypto from 'crypto';
import {UserRank} from '../common/rank/RankManager';
import {RankTier} from '../common/rank/RankTier';
import {generateRandomId} from './utils/server-ids';
import {Request} from './Request';
import {Response} from './Response';
import {UnexpectedInput} from './inputs/UnexpectedInput';
import {UserCenter, ServiceError} from './services/UserCenter';
import {normalizeUserId} from '../common/utils/normalizeUserId';
import {Phase} from '../common/Phase';
import {writeApiFailure, writeApiSuccess} from './server/responses';
import {UserNameExistsError} from './database/IDatabase';
import {PLAYER_COLORS} from '../common/Color';
import {metadataToGameListItem} from './routes/ApiGames';

const colorNames: ReadonlyArray<string> = [
  ...PLAYER_COLORS,
  'grey',
  'you',
  '红色',
  '绿色',
  '黄色',
  '蓝色',
  '黑色',
  '紫色',
  '橙色',
  '粉色',
  '灰色',
];

function userRankToClientRank(userRank: UserRank) {
  return {
    rankValue: userRank.rankValue,
    mu: userRank.mu,
    sigma: userRank.sigma,
    trueskill: userRank.trueskill,
    points: userRank.points || 0,
    seasonId: userRank.seasonId || '',
  };
}

function withoutUserId<T extends {userId?: string}>(value: T): Omit<T, 'userId'> {
  const copy: T = {...value};
  delete copy.userId;
  return copy;
}

function notFound(req: Request, res: Response, msg: string = ''): void {
  if ( ! process.argv.includes('hide-not-found-warnings')) {
    console.warn('UserManager Process Error', req.method, req.url, msg);
  }
  res.writeHead(404);
  res.write(msg ? msg : 'Not found');
  res.end();
}

export async function apiGameBack(userReq:any, req: Request, res: Response): Promise<void> {
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

  const user = await GameLoader.getInstance().getUserById(userId);
  if (user === undefined || !user.canRollback() || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'Not find user ' + userId : !user.canRollback() ? '!user.canRollback()' : 'token过期');
    return;
  }
  const game = GameLoader.getInstance().getLoadedGame(gameId);

  if (game === undefined) {
    notFound(req, res, 'game is undefined');
    return;
  }
  console.log('user:'+ user.name +' rollback game ' + game.id);
  try {
    await game.rollback();
  } catch (error) {
    console.error('Rollback failed for game ' + game.id, error);
    writeApiFailure(res, 'Rollback failed', 500);
    return;
  }
  user.reduceRollbackNum();
  writeApiSuccess(res);
}

export async function apiGetMyGames(req: Request, res: Response, ctx: Context): Promise<void> {
  const userId = ctx.url.searchParams.get('id');
  if (userId === undefined || userId === null) {
    notFound(req, res, 'not find user id');
    return;
  }
  const user = await GameLoader.getInstance().getUserById(userId);

  if (user === undefined || !user.checkToken(userId)) {
    notFound(req, res, user === undefined ? 'user is undefined' : 'token过期');
    return;
  }
  const mygames: Array<any> = [];
  // “我的游戏”只需要最近的列表元数据，一次 SQL 返回最近 30 条，避免 1 + N 查询。
  const games = await Database.getInstance().getGamesByUserId(user.id, 30);
  for (const metadata of games) {
    const game = metadataToGameListItem(metadata);
    if (game !== undefined) {
      mygames.push(game);
    }
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

export async function login(userReq:any, _req: Request, res: Response): Promise<void> {
  const userName: string = userReq.userName.trim().toLowerCase();
  let password: string = userReq.password.trim().toLowerCase();
  if (userName === undefined || userName.length === 0) {
    throw new UnexpectedInput('UserName must not be empty');
  }
  const user = await GameLoader.getInstance().getUserByName(userName);
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
  // Persist token to database so it survives server restarts
  Database.getInstance().updateUserProp(user.id, user.getProp());
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({id: token, name: user.name}));
  res.end();
}

export async function register(userReq: any, _req: Request, res: Response): Promise<void> {
  const userId = generateRandomId('u');
  const userName: string = userReq.userName ? userReq.userName.trim().toLowerCase() : '';
  let password: string = userReq.password ? userReq.password.trim().toLowerCase() : '';
  if (userName === undefined || userName.length <= 1) {
    throw new Error('Please enter at least 2 characters for userName');
  }
  if (await GameLoader.getInstance().getUserByName(userName) !== undefined || colorNames.indexOf(userName) > -1) {
    throw new Error('User name already exists, please use another name');
  }
  if (password === undefined || password.length <= 2) {
    throw new Error('Please enter at least 3 characters for password');
  }
  password = crypto.createHash('md5').update( password ).digest('hex');
  try {
    await Database.getInstance().saveUser(userId, userName, password, '{}');
  } catch (err) {
    if (err instanceof UserNameExistsError) {
      throw new Error('User name already exists, please use another name');
    }
    throw err;
  }
  const user: User = new User(userName, password, userId);
  user.createtime = getDay();
  GameLoader.getInstance().cacheUser(user);
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({success: true}));
  res.end();
}


// 导出一个函数，用于判断用户是否为VIP
export async function isvip(req: Request, res: Response, ctx: Context): Promise<void> {
  let userId = ctx.url.searchParams.get('userId');
  if (userId === undefined || userId === '' || userId === null) {
    notFound(req, res, 'not find user id');
    return;
  }

  const user = await GameLoader.getInstance().getUserById(userId);
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
    writeApiFailure(res, 'Unable to execute', 500);
  }
}

export async function resign(userReq:any, req: Request, res: Response): Promise<void> {
  const userId: string = userReq.userId;
  const playerId: string = userReq.playerId;

  const game = await GameLoader.getInstance().getByPlayerId(playerId);
  if (game === undefined) {
    notFound(req, res);
    return;
  }
  const player = game.getAllPlayers().find((p) => p.id === playerId);
  if (player === undefined) {
    notFound(req, res);
    return;
  }
  const userPlayer = GameLoader.getUserByPlayer(player);
  const user = await GameLoader.getInstance().getUserById(userId);
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
  // 预热天梯缓存，保证同步的 ServerModel 能取到所有玩家的 rank
  await GameLoader.getInstance().ensureUserRanksLoaded(game.getAllPlayers());
  const playerBlockModel = Server.getPlayerBlock(player, userId);
  res.end(JSON.stringify(Server.getPlayerModel(player, playerBlockModel)));
}

export async function showHand(userReq:any, req: Request, res: Response): Promise<void> {
  const user = await GameLoader.getInstance().getUserById(userReq.userId);
  if (user === undefined || !user.checkToken(userReq.userId)) {
    notFound(req, res, user === undefined? 'user === undefined' : 'token过期');
    return;
  }
  if (userReq.showhandcards ) {
    user.showhandcards = true;
  } else {
    user.showhandcards = false;
  }

  writeApiSuccess(res);
}


//
export async function sitDown(userReq:any, req: Request, res: Response): Promise<void> {
  const userme = await GameLoader.getInstance().getUserById(userReq.userId);
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
  const userThat = await GameLoader.getInstance().getUserByName(player.name);
  if (userThat !== undefined ) {
    notFound(req, res, 'sitDown userThat !== undefined');
    return;
  }

  let haveSit = false;
  game.getAllPlayers().forEach( (p) => {
    if (p !== player && ((p.userId !== undefined && normalizeUserId(p.userId) === userme.id) || p.name === userme.name)) {
      writeApiFailure(res, '不能重复坐下，请使用你自己的游戏地址');
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
  writeApiSuccess(res);
}


//

// 天梯 用户激活排名的接口 — 委托给 UserCenter
export async function activateRank(userReq: any, _req: Request, res: Response): Promise<void> {
  await UserCenter.activateRank(userReq.userId);
  const rank = withoutUserId(await UserCenter.getUserRank(userReq.userId, null));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(rank));
  return;
}

// 获取用户排名 — 委托给 UserCenter
export async function getUserRank(req: Request, res: Response, ctx: Context): Promise<void> {
  const userId = ctx.url.searchParams.get('userId');
  const playerName = ctx.url.searchParams.get('playerName');
  try {
    const data = withoutUserId(await UserCenter.getUserRank(userId, playerName));
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(data));
    res.end();
  } catch (err) {
    if (err instanceof ServiceError) {
      notFound(req, res, err.message);
      return;
    }
    notFound(req, res, 'not find user id or player name');
  }
}

export async function getUserRanks(req: Request, res: Response, ctx: Context): Promise<void> {
  const limit = Math.min(100, Number(ctx.url.searchParams.get('limit')));
  try {
    const allUserRanks = await Database.getInstance().getUserRanks(limit);
    const resRanks: Array<{userName: String, userRank: ReturnType<typeof userRankToClientRank>, userTier: RankTier}> = [];
    for (const userRank of allUserRanks) {
      resRanks.push({userName: userRank.userName, userRank: userRankToClientRank(userRank), userTier: userRank.getTier()});
    }
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
}

// 天梯 由于超时或者所有玩家退出游戏，调用API
export async function endGameByEvent(userReq: any, req: Request, res: Response): Promise<void> {
  const userId: string = userReq.userId;
  const playerId: string = userReq.playerId;
  const game = await GameLoader.getInstance().getByPlayerId(playerId); // 多个请求时await
  if (game === undefined || GameLoader.getInstance().getLoadedGame(game.id) === undefined) {
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
  writeApiSuccess(res);
}

// 赛季 API 已迁移到 Hono (/api/v2/season/*)
// 业务逻辑统一在 UserCenter 中，参见 src/server/services/UserCenter.ts
