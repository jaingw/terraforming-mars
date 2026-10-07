import fs from 'fs';
import path from 'path';
import BetterSqlite3 = require('better-sqlite3');

import {GameNotFoundError, IDatabase, IGameMetadata, UserNameExistsError} from './IDatabase';
import {IGame, Score} from '../IGame';
import {GameOptions} from '../game/GameOptions';
import {GameId, PlayerId} from '../../common/Types';
import {SerializedGame} from '../SerializedGame';
import {User} from '../User';
import {Timer} from '../../common/Timer';
import {UserRank} from '../../common/rank/RankManager';
import {Color} from '../../common/Color';
import {Session, SessionId} from '../auth/Session';
import {toID} from '../../common/utils/utils';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
// import {Rating} from 'ts-trueskill';

export const IN_MEMORY_SQLITE_PATH = ':memory:';

// 生成单局参与者索引，只包含 playerId/spectatorId，不混入账号 userId。
function getParticipantIds(game: IGame): Array<string> {
  const participantIds = new Set<string>(game.getAllPlayers().map(toID));
  if (game.spectatorId !== undefined) {
    participantIds.add(game.spectatorId);
  }
  return Array.from(participantIds);
}

// 生成账号维度索引，供“我的游戏”按 userId 直接查询最近游戏列表。
function getUserIds(game: IGame): Array<string> {
  const userIds = new Set<string>();
  for (const player of game.getAllPlayers()) {
    if (player.userId !== undefined && player.userId !== '') {
      userIds.add(normalizeUserId(player.userId));
    }
  }
  return Array.from(userIds);
}

// 单条用户懒加载时复用这里反序列化，保持旧 prop 字段兼容。
function deserializeUser(row: any): User {
  const prop = typeof row.prop === 'string' && row.prop !== '' ? JSON.parse(row.prop) : (row.prop ?? {});
  const user = Object.assign(new User('', '', ''), {id: row.id, name: row.name, password: row.password, createtime: row.createtime}, prop);
  if (user.donateNum === 0 && user.isvip() > 0) {
    user.donateNum = 1;
  }
  return user;
}

export class SQLite implements IDatabase {
  private _db: BetterSqlite3.Database | undefined;

  protected get db(): any {
    if (this._db === undefined) {
      throw new Error('attempt to get db before initialize');
    }
    return this._db;
  }

  constructor(private filename: undefined | string = undefined, private throwQuietFailures: boolean = false) {
  }

  public async initialize(): Promise<void> {
    const Database = require('better-sqlite3') as typeof import('better-sqlite3');
    const dbFolder = path.resolve(process.cwd(), './db');
    const dbPath = path.resolve(dbFolder, 'game.db');
    if (this.filename === undefined) {
      this.filename = dbPath;
    }
    if (this.filename !== IN_MEMORY_SQLITE_PATH) {
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder);
      }
    }
    this._db = new Database(String(this.filename));
    console.log('initialize');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\',createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), prop text, PRIMARY KEY (game_id, save_id))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS game(game_id varchar NOT NULL, log text NOT NULL default \'\', options text NOT NULL default \'\', participants text, userids text, prop text, status text default \'running\' NOT NULL, created_time timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')) NOT NULL, updated_time timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')) NOT NULL, PRIMARY KEY (game_id))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS participants(game_id varchar, participant varchar, PRIMARY KEY (game_id, participant))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS session(session_id varchar, data text, expiration_time integer, PRIMARY KEY (session_id))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS \'users\'(\'id\' varchar NOT NULL,\'name\' varchar NOT NULL,\'password\' varchar NOT NULL,\'prop\' varchar,\'createtime\' timestamp DEFAULT (datetime(CURRENT_TIMESTAMP,\'localtime\')),PRIMARY KEY (\'id\'))');
    await this.asyncRun('CREATE UNIQUE INDEX IF NOT EXISTS users_name_lower_unique_idx ON users(lower(name))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), PRIMARY KEY (game_id))');
    await this.asyncRun('ALTER TABLE games ADD COLUMN players integer').catch(() => {});
    await this.asyncRun('ALTER TABLE game ADD COLUMN participants text').catch(() => {});
    await this.asyncRun('ALTER TABLE game ADD COLUMN userids text').catch(() => {});
    await this.asyncRun('ALTER TABLE game ADD COLUMN prop text').catch(() => {});
    await this.asyncRun('ALTER TABLE game ADD COLUMN updated_time timestamp').catch(() => {});
    // 不再使用 trigger 自动维护 updated_time；启动时清理旧环境可能遗留的 trigger。
    await this.asyncRun('DROP TRIGGER IF EXISTS game_updated_time_trigger');
    // 列表按更新时间排序，SQLite 的数组字段用 JSON text + json_each 查询。
    await this.asyncRun('CREATE INDEX IF NOT EXISTS game_i1 on game(updated_time)');

    // 天梯 新增`user_rank`表记录用户的排名
    await this.asyncRun('CREATE TABLE IF NOT EXISTS user_rank (id varchar not null, rank_value integer default 0, mu double, sigma double, trueskill double default 1, PRIMARY KEY (id))');
    // 天梯 玩家数据表，用于保存段位的历史记录，和未来的数据分析 TODO: 将这两张表在PG中也加上
    await this.asyncRun('CREATE TABLE IF NOT EXISTS user_game_results (user_id varchar not null, game_id varchar not null, players integer, generations integer, createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), corporation text, position integer, player_score integer, rank_value integer, mu double, sigma double, trueskill double, is_rank integer, phase text, is_timeout integer default 0, PRIMARY KEY (user_id, game_id))');
    // Migrate: add is_timeout column if missing
    await this.asyncRun('ALTER TABLE user_game_results ADD COLUMN is_timeout integer default 0').catch(() => {});
    await this.asyncRun('DROP TABLE IF EXISTS purges');

    // 赛季快照表：保存每个赛季结束时的用户排名快照
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS user_rank_seasons (
      user_id varchar not null,
      season_id varchar not null,
      rank_value integer default 0,
      mu double,
      sigma double,
      trueskill double,
      points_earned integer default 0,
      final_position integer,
      createtime timestamp default (datetime(CURRENT_TIMESTAMP,'localtime')),
      PRIMARY KEY (user_id, season_id))`);
    // 当前赛季信息表（只存储一个当前赛季）
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS current_season (
      season_id varchar not null,
      season_name varchar,
      start_date timestamp default (datetime(CURRENT_TIMESTAMP,'localtime')),
      end_date timestamp)`);

    // 所有赛季元数据表
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS seasons (
      season_id varchar not null PRIMARY KEY,
      season_name varchar,
      start_date timestamp,
      end_date timestamp)`);

    // 兼容性：为已有的 user_rank 表添加 points 和 season_id 列
    try {
      await this.asyncRun('ALTER TABLE user_rank ADD COLUMN points integer default 0');
    } catch (_) {/* 列已存在则忽略 */}
    try {
      await this.asyncRun('ALTER TABLE user_rank ADD COLUMN season_id varchar');
    } catch (_) {/* 列已存在则忽略 */}
  }

  public async getPlayerCount(gameId: GameId): Promise<number> {
    const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = ? LIMIT 1';
    const row = await this.asyncGet(sql, [gameId]);
    if (row === undefined) {
      throw new Error(`bad game id ${gameId}`);
    }
    return row.players;
  }

  public async getGameIds(): Promise<Array<GameId>> {
    const rows = await this.asyncAll('SELECT distinct game_id FROM games');
    return rows.map((row) => row.game_id);
  }

  // 游戏大厅只读 game 表上的轻量元数据，避免启动或列表接口加载完整存档。
  public async getGames(): Promise<Array<IGameMetadata>> {
    const rows = await this.asyncAll('SELECT game_id, participants, userids, prop, updated_time FROM game ORDER BY updated_time DESC LIMIT 100');
    return rows.map((row) => ({
      gameId: row.game_id,
      participants: row.participants ? JSON.parse(row.participants) : [],
      userids: row.userids ? JSON.parse(row.userids) : [],
      shortData: row.prop !== undefined && row.prop !== '' ? JSON.parse(row.prop) : undefined,
      updatedTime: row.updated_time,
    }));
  }

  // playerId/spectatorId 只对应一个当前游戏，返回单个 gameId 即可。
  public async getGameIdByParticipant(participantId: string): Promise<GameId | undefined> {
    const row = await this.asyncGet(
      `SELECT game_id
       FROM game
       WHERE EXISTS (
         SELECT 1 FROM json_each(game.participants) WHERE value = ?
       )
       ORDER BY updated_time DESC
       LIMIT 1`,
      [participantId],
    );
    return row?.game_id;
  }

  // 账号可能对应多个历史游戏，直接返回最近 N 条 metadata，避免 1 + N 查询。
  public async getGamesByUserId(userId: string, limit: number = 30): Promise<Array<IGameMetadata>> {
    const rows = await this.asyncAll(
      `SELECT game_id, participants, userids, prop, updated_time
       FROM game
       WHERE EXISTS (
         SELECT 1 FROM json_each(game.userids) WHERE value = ?
       )
       ORDER BY updated_time DESC
       LIMIT ?`,
      [normalizeUserId(userId), limit],
    );
    return rows.map((row) => ({
      gameId: row.game_id,
      participants: row.participants ? JSON.parse(row.participants) : [],
      userids: row.userids ? JSON.parse(row.userids) : [],
      shortData: row.prop !== undefined && row.prop !== '' ? JSON.parse(row.prop) : undefined,
      updatedTime: row.updated_time,
    }));
  }

  saveGameResults(gameId: string, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.db.run('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [gameId, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err: any) => {
      if (err) {
        console.error('SQlite:saveGameResults', err.message);
        throw err;
      }
    });
  }

  public async getGame(gameId: GameId): Promise<SerializedGame> {
    // Retrieve last save from database
    const row: { game: any; } = await this.asyncGet('SELECT game game FROM games WHERE game_id = ? ORDER BY save_id DESC LIMIT 1', [gameId]);
    if (row === undefined) {
      throw new GameNotFoundError(gameId);
    }
    return JSON.parse(row.game);
  }

  public async getSaveIds(gameId: GameId): Promise<Array<number>> {
    const rows = await this.asyncAll('SELECT distinct save_id FROM games WHERE game_id = ?', [gameId]);
    return rows.map((row) => row.save_id);
  }

  public async getGameVersion(gameId: GameId, saveId: number): Promise<SerializedGame> {
    const sql = 'SELECT game_id, game FROM games WHERE game_id = ? and save_id = ?';
    const row: { game_id: GameId, game: any; } = await this.asyncGet(sql, [gameId, saveId]);
    if (row === undefined || row.game_id === undefined || row.game === undefined) {
      throw new Error(`Game ${gameId} not found`);
    }
    return JSON.parse(row.game);
  }

  async getMaxSaveId(gameId: GameId): Promise<number> {
    const row: { save_id: any; } = await this.asyncGet('SELECT MAX(save_id) AS save_id FROM games WHERE game_id = ?', [gameId]);
    if (row === undefined) {
      throw new Error(`bad game id ${gameId}`);
    }
    return row.save_id;
  }

  async cleanGame(gameId: GameId): Promise<void> {
    try {
      const saveId = await this.getMaxSaveId(gameId);
      // Purges isn't used yet
      // await this.asyncRun('INSERT into purges (game_id, last_save_id) values (?, ?)', [gameId, save_id]);
      // DELETE all saves except initial and last one
      await this.asyncRun('DELETE FROM games WHERE game_id = ? AND save_id < ? AND save_id > 0', [gameId, saveId]);
      await this.asyncRun('UPDATE games SET status = \'finished\' WHERE game_id = ?', [gameId]);
      await this.asyncRun('UPDATE game SET status = \'finished\' WHERE game_id = ?', [gameId]);
      await this.purgeUnfinishedGames();
    } catch (err) {
      console.error(`SQLite: cleanGame for ${gameId} ` + err);
    }
  }

  async markFinished(gameId: GameId): Promise<void> {
    await Promise.all([
      this.asyncRun('UPDATE games SET status = \'finished\' WHERE game_id = ?', [gameId]),
      this.asyncRun('UPDATE game SET status = \'finished\' WHERE game_id = ?', [gameId]),
    ]);
  }

  // 按 game 表状态清理早于 dayAgo 的未完结游戏。
  purgeUnfinishedGames(dayAgo?: string): Promise<Array<GameId>> {
    if (dayAgo === undefined) {
      return Promise.resolve([]);
    }
    return this.asyncAll(
      `SELECT game_id
       FROM game
       WHERE status = ?
       AND updated_time < ?
       ORDER BY updated_time ASC
       LIMIT 1000`,
      ['running', dayAgo],
    ).then(async (rows) => {
      const gameIds = rows.map((row) => row.game_id as GameId);
      if (gameIds.length === 0) {
        return [];
      }
      const placeholders = gameIds.map(() => '?').join(', ');
      await this.asyncRun(`DELETE FROM participants WHERE game_id IN (${placeholders})`, gameIds);
      await this.asyncRun(`DELETE FROM games WHERE game_id IN (${placeholders})`, gameIds);
      await this.asyncRun(`DELETE FROM game WHERE game_id IN (${placeholders})`, gameIds);
      return gameIds;
    });
  }

  cleanGameAllSaves(game_id: string): void {
    // DELETE all saves
    this.db.run('DELETE FROM games WHERE game_id = ? ', [game_id], function(err: { message: any; }) {
      if (err) {
        return console.warn(err.message);
      }
    });
    this.db.run('DELETE FROM participants WHERE game_id = ? ', [game_id], function(err: { message: any; }) {
      if (err) {
        return console.warn(err.message);
      }
    });
    this.db.run('DELETE FROM game WHERE game_id = ? ', [game_id], function(err: { message: any; }) {
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  cleanGameSave(game_id: string, save_id: number): void {
    // DELETE one  save  by save id
    this.db.run('DELETE FROM games WHERE game_id = ? AND save_id = ?', [game_id, save_id], function(err: { message: any; }) {
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  restoreGame(game_id: string, save_id: number, game: IGame, playId: string): Promise<IGame> {
    // Retrieve last save from database
    return new Promise((resolve, reject) => {
      this.db.get('SELECT game game ,createtime createtime  FROM games WHERE game_id = ? AND save_id = ? LIMIT 1', [game_id, save_id], (err: Error | null, row: { game: any, createtime: any; }) => {
        if (err) {
          console.error('restoreGame '+err.message);
          reject(err);
          return;
        }
        if (row === undefined || row.game === undefined) {
          console.error('restoreGame save_id ' + save_id + ' not found for game ' + game_id + ' — rollback skipped');
          resolve(game);
          return;
        }
        // Transform string to json
        const gameToRestore = JSON.parse(row.game);

        // Rebuild each objects
        const gamelog = game.gameLog;
        game.loadFromJSON(gameToRestore, true);
        game.updatetime = row.createtime;
        game.gameLog = gamelog;
        game.undoCount ++;
        // 会员回退时 以当前时间开始计时， 避免计时算到上一个人头上
        if (playId === 'manager') {
          game.log('${0} undo turn', (b) => b.playerColor(playId as Color));
          Timer.newInstance().stop();
          game.activePlayer.timer.start();
        } else {
          game.log('${0} undo turn', (b) => b.player(game.getPlayerById(playId as PlayerId)));
        }
        console.log(`${playId} undo turn ${game_id}  ${save_id}`);
        resolve(game);
      });
    });
  }

  async saveGame(game: IGame): Promise<void> {
    const gameJSON = JSON.stringify(game.serialize());
    const metadataProp = game.toShortJSON();
    // participants/userids 分开存，分别服务 playerId 查询和账号维度列表查询。
    const participantIds = getParticipantIds(game);
    const userIds = getUserIds(game);
    const playerCount = game.players.length;
    await this.runQuietly(
      'INSERT INTO games(game_id, save_id, game, players) VALUES(?, ?, ?, ?)',
      [game.id, game.lastSaveId, gameJSON, playerCount],
    );
    await this.runQuietly(
      `INSERT INTO game(game_id, participants, userids, prop, updated_time)
       VALUES(?, ?, ?, ?, datetime(CURRENT_TIMESTAMP, 'localtime'))
       ON CONFLICT(game_id)
       DO UPDATE SET
         participants = excluded.participants,
         userids = excluded.userids,
         prop = excluded.prop,
         updated_time = datetime(CURRENT_TIMESTAMP, 'localtime')`,
      [game.id, JSON.stringify(participantIds), JSON.stringify(userIds), metadataProp],
    );
    game.lastSaveId++;
  }

  deleteGameNbrSaves(gameId: GameId, rollbackCount: number): Promise<void> {
    if (rollbackCount <= 0) {
      console.error(`invalid rollback count for ${gameId}: ${rollbackCount}`);
      // Should this be an error?
      return Promise.resolve();
    }
    return this.runQuietly('DELETE FROM games WHERE rowid IN (SELECT rowid FROM games WHERE game_id = ? ORDER BY save_id DESC LIMIT ?)', [gameId, rollbackCount]);
  }

  public stats(): Promise<{[key: string]: string | number}> {
    const size = this.filename === IN_MEMORY_SQLITE_PATH ? -1 : fs.statSync(String(this.filename)).size;

    return Promise.resolve({
      type: 'SQLite',
      path: String(this.filename),
      size_bytes: size,
    });
  }

  async saveUser(id: string, name: string, password: string, prop: string): Promise<void> {
    try {
      await this.asyncRun('INSERT INTO users(id, name, password, prop) VALUES(?, ?, ?, ?)', [id, name, password, prop]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('users_name_lower_unique_idx') || message.includes('users.name')) {
        throw new UserNameExistsError(name);
      }
      throw err;
    }
  }

  updateUserProp(id: string, prop: string): void {
    this.db.run('UPDATE users SET prop = ? WHERE id = ?', [prop, id], function(err: { message: any; }) {
      if (err) {
        return console.error('SQLite:updateUserProp', err.message);
      }
    });
  }

  getUsers(cb:(err: any, allUsers:Array<User>)=> void): void {
    const allUsers:Array<User> = [];
    const sql: string = 'SELECT distinct id, name, password, prop, createtime FROM users ';
    this.db.all(sql, [], (err :any, rows : [any]) => {
      if (rows) {
        rows.forEach((row) => {
          allUsers.push(deserializeUser(row));
        });
        return cb(err, allUsers);
      }
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  // 按 userId 单查用户，供 GameLoader 懒加载使用，避免启动时全量加载 users。
  async getUser(id: string): Promise<User | undefined> {
    const row = await this.asyncGet('SELECT id, name, password, prop, createtime FROM users WHERE id = ? LIMIT 1', [normalizeUserId(id)]);
    return row === undefined ? undefined : deserializeUser(row);
  }

  // 按用户名单查用户，供登录等路径懒加载使用。
  async getUserByName(name: string): Promise<User | undefined> {
    const row = await this.asyncGet('SELECT id, name, password, prop, createtime FROM users WHERE lower(name) = lower(?) LIMIT 1', [name]);
    return row === undefined ? undefined : deserializeUser(row);
  }

  refresh(): void {
    this.db.run('vacuum');
  }

  public async createSession(session: Session): Promise<void> {
    await this.asyncRun('INSERT INTO session (session_id, data, expiration_time) VALUES (?, ?, ?)', [session.id, JSON.stringify(session.data), session.expirationTimeMillis]);
  }

  public async deleteSession(sessionId: SessionId): Promise<void> {
    await this.asyncRun('DELETE FROM session WHERE session_id = ?', [sessionId]);
  }

  public async getSessions(): Promise<Array<Session>> {
    const rows = await this.asyncAll('SELECT session_id, data, expiration_time FROM session WHERE expiration_time > ?', [Date.now()]);
    return rows.map((row) => ({
      id: row.session_id,
      data: JSON.parse(row.data),
      expirationTimeMillis: row.expiration_time,
    }));
  }


  protected asyncRun(sql: string, params?: any): Promise<BetterSqlite3.RunResult> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params !== undefined ? stmt.run(params) : stmt.run();
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  protected asyncGet(sql: string, params?: any): Promise<any> {
    try {
      const stmt = this.db.prepare(sql);
      const row = params !== undefined ? stmt.get(params) : stmt.get();
      return Promise.resolve(row);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  protected asyncAll(sql: string, params?: any): Promise<Array<any>> {
    try {
      const stmt = this.db.prepare(sql);
      const rows = params !== undefined ? stmt.all(params) : stmt.all();
      return Promise.resolve(rows as Array<any>);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Run the given SQL but do not return errors.
  protected async runQuietly(sql: string, params: any): Promise<void> {
    try {
      await this.asyncRun(sql, params);
    } catch (err) {
      console.error(err);
      console.error('for sql: ' + sql);
      if (this.throwQuietFailures) {
        throw err;
      }
    }
  }

  addUserRank(userRank: UserRank): void {
    console.log('db:addUserRank', userRank);
    this.db.run('INSERT INTO user_rank(id, rank_value, mu, sigma, trueskill, points, season_id) VALUES(?, ?, ?, ?, ?, ?, ?)', [userRank.userId, userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill, userRank.points || 0, userRank.seasonId || ''], function(err: { message: any; }) {
      if (err) {
        return console.error(err);
      }
    });
  }

  // 按 userId 单查排名，避免启动时全量加载 user_rank。
  public async getUserRank(userId: string): Promise<UserRank | undefined> {
    const row = await this.asyncGet('SELECT id, rank_value, mu, sigma, trueskill, points, season_id FROM user_rank WHERE id = ? LIMIT 1', [normalizeUserId(userId)]);
    if (row === undefined) {
      return undefined;
    }
    return new UserRank(row.id, row.rank_value, row.mu, row.sigma, row.trueskill, row.points || 0, row.season_id || '');
  }

  // 天梯，返回所有UserRank
  public async getUserRanks(limit:number | undefined = 0, seasonId?: string): Promise<Array<UserRank>> {
    const params: Array<number | string> = [];
    let sql = `SELECT user_rank.id, COALESCE(users.name, 'Unknown') AS user_name, rank_value, mu, sigma, trueskill, points, season_id
               FROM user_rank
               LEFT JOIN users ON users.id = user_rank.id`;
    if (seasonId !== undefined && seasonId !== '') {
      sql += ' WHERE user_rank.season_id = ?';
      params.push(seasonId);
    }
    sql += ' order by user_rank.rank_value desc,user_rank.trueskill desc';
    if (limit !== 0) {
      sql += ' limit ?';
      params.push(limit);
    }
    const allUserRanks : Array<UserRank> = [];
    const rows = await this.asyncAll(sql, params);
    rows.forEach((row) => {
      const userRank = new UserRank(row.id, row.rank_value, row.mu, row.sigma, row.trueskill, row.points || 0, row.season_id || '', row.user_name);
      allUserRanks.push(userRank);
    });
    return allUserRanks;
  }

  public async updateUserRank(userRank:UserRank): Promise<void> {
    await this.asyncRun('UPDATE user_rank SET rank_value = ?, mu = ?, sigma = ?, trueskill = ?, points = ?, season_id = ? WHERE id = ?', [userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill, userRank.points || 0, userRank.seasonId || '', userRank.userId]);
  }

  // @param position: 这局游戏第几名
  saveUserGameResult(user_id: string, game_id: string, phase: string, score: Score, players: number, generations: number, create_time: string, position: number, is_rank: boolean, user_rank: UserRank | undefined, is_timeout: boolean = false): void {
    const sql: string = user_rank !== undefined ?
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, rank_value, mu, sigma, trueskill, is_rank, phase, is_timeout) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' :
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, is_rank, phase, is_timeout) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params: any = user_rank !== undefined ?
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, user_rank.rankValue, user_rank.mu, user_rank.sigma, user_rank.trueskill, is_rank?1:0, phase, is_timeout?1:0] :
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, is_rank?1:0, phase, is_timeout?1:0];

    this.db.run(sql, params, (err: any) => {
      if (err) {
        console.error('SQlite:saveUserGameResult', err.message);
        throw err;
      }
    });
  }

  async getUserGameStats(userId: string): Promise<import('./IDatabase').IUserGameStats> {
    const buildStatsQuery = (dateFilter: string) => `
      SELECT
        COUNT(*) as total_games,
        SUM(CASE WHEN is_timeout = 0 THEN 1 ELSE 0 END) as non_timeout_games,
        SUM(CASE WHEN position = 1 AND is_timeout = 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN position > 1 AND is_timeout = 0 THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN is_timeout = 1 THEN 1 ELSE 0 END) as flee_count,
        COALESCE(AVG(player_score), 0) as avg_score,
        COALESCE(AVG(position), 0) as avg_position,
        SUM(CASE WHEN is_rank = 1 THEN 1 ELSE 0 END) as total_rank_games,
        SUM(CASE WHEN is_rank = 1 AND position = 1 THEN 1 ELSE 0 END) as rank_wins
      FROM user_game_results
      WHERE user_id = ? ${dateFilter}
    `;

    const allTimeRow: any = await this.asyncGet(buildStatsQuery(''), [userId]);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentRow: any = await this.asyncGet(
      buildStatsQuery('AND createtime >= ?'),
      [userId, threeMonthsAgo.toISOString()],
    );

    const mapRow = (row: any): import('./IDatabase').IUserGameStatsBlock => {
      const totalGames = parseInt(row?.total_games) || 0;
      const nonTimeoutGames = parseInt(row?.non_timeout_games) || 0;
      const wins = parseInt(row?.wins) || 0;
      const fleeCount = parseInt(row?.flee_count) || 0;
      return {
        totalGames,
        wins,
        losses: parseInt(row?.losses) || 0,
        winRate: nonTimeoutGames > 0 ? Math.round((wins / nonTimeoutGames) * 10000) / 100 : 0,
        fleeCount,
        fleeRate: totalGames > 0 ? Math.round((fleeCount / totalGames) * 10000) / 100 : 0,
        avgScore: Math.round(parseFloat(row?.avg_score || '0') * 100) / 100,
        avgPosition: Math.round(parseFloat(row?.avg_position || '0') * 100) / 100,
        totalRankGames: parseInt(row?.total_rank_games) || 0,
        rankWins: parseInt(row?.rank_wins) || 0,
      };
    };

    return {
      allTime: mapRow(allTimeRow),
      recent3Months: mapRow(recentRow),
    };
  }

  // 赛季相关方法
  public async saveUserRankSeasonSnapshot(userId: string, seasonId: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number): Promise<void> {
    await this.asyncRun(
      `INSERT OR IGNORE INTO user_rank_seasons (user_id, season_id, rank_value, mu, sigma, trueskill, points_earned, final_position)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, seasonId, rankValue, mu, sigma, trueskill, pointsEarned, finalPosition],
    );
  }

  public async getUserRankSeasonSnapshots(seasonId: string, limit?: number): Promise<Array<{userId: string, userName: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number}>> {
    const params: Array<string | number> = [seasonId];
    let sql = `SELECT user_rank_seasons.user_id, COALESCE(users.name, 'Unknown') AS user_name, rank_value, mu, sigma, trueskill, points_earned, final_position
               FROM user_rank_seasons
               LEFT JOIN users ON users.id = user_rank_seasons.user_id
               WHERE season_id = ?
               ORDER BY final_position ASC`;
    if (limit !== undefined && limit > 0) {
      params.push(limit);
      sql += ' LIMIT ?';
    }
    const rows = await this.asyncAll(sql, params);
    return rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      rankValue: row.rank_value,
      mu: row.mu,
      sigma: row.sigma,
      trueskill: row.trueskill,
      pointsEarned: row.points_earned,
      finalPosition: row.final_position,
    }));
  }

  public async getAvailableSeasons(): Promise<Array<string>> {
    const rows = await this.asyncAll('SELECT DISTINCT season_id FROM user_rank_seasons ORDER BY season_id DESC', []);
    return rows.map((row) => row.season_id);
  }

  public async updateUserPoints(userId: string, points: number): Promise<void> {
    await this.asyncRun('UPDATE user_rank SET points = ? WHERE id = ?', [points, userId]);
  }

  public async setCurrentSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void> {
    // 先删除旧记录，再插入新记录（确保只有一条当前赛季记录）
    await this.asyncRun('DELETE FROM current_season');
    await this.asyncRun(
      'INSERT INTO current_season (season_id, season_name, start_date, end_date) VALUES (?, ?, ?, ?)',
      [seasonId, seasonName, startDate.toISOString(), endDate.toISOString()],
    );
  }

  public async getCurrentSeason(): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined> {
    const rows = await this.asyncAll('SELECT season_id, season_name, start_date, end_date FROM current_season', []);
    if (rows.length === 0) {
      return undefined;
    }
    return {
      seasonId: rows[0].season_id,
      seasonName: rows[0].season_name,
      startDate: rows[0].start_date,
      endDate: rows[0].end_date,
    };
  }

  public async saveSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void> {
    await this.asyncRun(
      `INSERT INTO seasons (season_id, season_name, start_date, end_date) VALUES (?, ?, ?, ?)
       ON CONFLICT(season_id) DO UPDATE SET season_name = excluded.season_name, start_date = excluded.start_date, end_date = excluded.end_date`,
      [seasonId, seasonName, startDate.toISOString(), endDate.toISOString()],
    );
  }

  public async getSeason(seasonId: string): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined> {
    const rows = await this.asyncAll('SELECT season_id, season_name, start_date, end_date FROM seasons WHERE season_id = ?', [seasonId]);
    if (rows.length === 0) {
      return undefined;
    }
    return {
      seasonId: rows[0].season_id,
      seasonName: rows[0].season_name,
      startDate: rows[0].start_date,
      endDate: rows[0].end_date,
    };
  }
}
