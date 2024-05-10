import * as fs from 'fs';
import * as path from 'path';

import {GameIdLedger, IDatabase, IGameShortData} from './IDatabase';
import {IGame, Score} from '../IGame';
import {GameOptions} from '../game/GameOptions';
import {GameId, ParticipantId, PlayerId} from '../../common/Types';
import {SerializedGame} from '../SerializedGame';

import type * as sqlite3 from 'sqlite3';

import {User} from '../User';
import {Timer} from '../../common/Timer';
import {MultiMap} from 'mnemonist';
import {UserRank} from '../../common/rank/RankManager';
import {daysAgoToSeconds} from './utils';
import {Color} from '../../common/Color';
// import {Rating} from 'ts-trueskill';

export const IN_MEMORY_SQLITE_PATH = ':memory:';

export class SQLite implements IDatabase {
  private _db: sqlite3.Database | undefined;

  protected get db(): sqlite3.Database {
    if (this._db === undefined) {
      throw new Error('attempt to get db before initialize');
    }
    return this._db;
  }

  constructor(private filename: undefined | string = undefined, private throwQuietFailures: boolean = false) {
  }

  public async initialize(): Promise<void> {
    const {Database} = await import('sqlite3');
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
    await this.asyncRun('CREATE TABLE IF NOT EXISTS participants(game_id varchar, participant varchar, PRIMARY KEY (game_id, participant))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS \'users\'(\'id\'  varchar NOT NULL,\'name\'  varchar NOT NULL,\'password\'  varchar NOT NULL,\'prop\' varchar,\'createtime\'  timestamp DEFAULT (datetime(CURRENT_TIMESTAMP,\'localtime\')),PRIMARY KEY (\'id\'))');
    await this.asyncRun('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), PRIMARY KEY (game_id))');

    // 天梯 新增`user_rank`表记录用户的排名
    await this.asyncRun('CREATE TABLE IF NOT EXISTS user_rank (id varchar not null, rank_value integer default 0, mu double, sigma double, trueskill double default 1, PRIMARY KEY (id))');
    // 天梯 玩家数据表，用于保存段位的历史记录，和未来的数据分析 TODO: 将这两张表在PG中也加上
    await this.asyncRun('CREATE TABLE IF NOT EXISTS user_game_results (user_id varchar not null, game_id varchar not null, players integer, generations integer, createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), corporation text, position integer, player_score integer, rank_value integer, mu double, sigma double, trueskill double, is_rank integer, phase text, PRIMARY KEY (user_id, game_id))');
    await this.asyncRun(
      `CREATE TABLE IF NOT EXISTS completed_game(
      game_id varchar not null,
      completed_time timestamp not null default (strftime('%s', 'now')),
      PRIMARY KEY (game_id))`);
  }

  public async getPlayerCount(gameId: GameId): Promise<number> {
    const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = ? LIMIT 1';
    const row = await this.asyncGet(sql, [gameId]);
    if (row === undefined) {
      throw new Error(`bad game id ${gameId}`);
    }
    return row.players;
  }

  getGames(): Promise<Array<IGameShortData>> {
    return new Promise((resolve, reject) => {
      const sql: string = 'SELECT games.game_id,games.prop FROM games, (SELECT max(save_id) save_id, game_id FROM games  GROUP BY game_id) a WHERE games.game_id = a.game_id AND games.save_id = a.save_id ORDER BY createtime DESC';

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(new Error('Error in getGames: ' + err.message));
        } else {
          const allGames: Array<IGameShortData> = [];
          rows.forEach((row :any) => {
            allGames.push({gameId: row.game_id, shortData: row.prop !== undefined && row.prop !=='' ? JSON.parse(row.prop) : undefined});
          });
          resolve(allGames);
        }
      });
    });
  }

  saveGameResults(gameId: string, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.db.run('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [gameId, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err) => {
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
      throw new Error(`bad game id ${gameId}`);
    }
    return JSON.parse(row.game);
  }

  public async getGameId(participantId: ParticipantId): Promise<GameId> {
    // Default sql is for player id;
    let sql = 'SELECT game_id from games, json_each(games.game, \'$.players\') e where json_extract(e.value, \'$.id\') = ?';
    if (participantId.charAt(0) === 's') {
      sql = 'SELECT game_id from games where json_extract(games.game, \'$.spectatorId\') = ?';
    } else if (participantId.charAt(0) !== 'p') {
      throw new Error(`id ${participantId} is neither a player id or spectator id`);
    }

    const row: { game_id: any; } = await this.asyncGet(sql, [participantId]);
    if (row === undefined) {
      throw new Error(`No game id found for participant id ${participantId}`);
    }
    return row.game_id;
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
      await this.purgeUnfinishedGames();
    } catch (err) {
      console.error(`SQLite: cleanGame for ${gameId} ` + err);
    }
  }

  async markFinished(gameId: GameId): Promise<void> {
    const promise1 = this.asyncRun('INSERT into completed_game (game_id) values (?)', [gameId]);
    const promise2 = this.asyncRun('UPDATE games SET status = \'finished\' WHERE game_id = ?', [gameId]);
    await Promise.all([promise1, promise2]);
  }

  purgeUnfinishedGames(_maxGameDays: string | undefined = process.env.MAX_GAME_DAYS): Promise<Array<GameId>> {
    // Purge unfinished games older than MAX_GAME_DAYS days. If this .env variable is not present, unfinished games will not be purged.
    // if (maxGameDays) {
    //   const dateToSeconds = daysAgoToSeconds(maxGameDays, 0);
    //   return this.runQuietly(`DELETE FROM games WHERE created_time < ? and status = 'running'`, [dateToSeconds]);
    // } else {

    return Promise.resolve([]);
    // }
  }

  cleanGameAllSaves(game_id: string): void {
    // DELETE all saves
    this.db.run('DELETE FROM games WHERE game_id = ? ', [game_id], function(err: { message: any; }) {
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

  restoreGame(game_id: string, save_id: number, game: IGame, playId: string): Promise<void> {
    // Retrieve last save from database
    return new Promise((resolve, reject) => {
      this.db.get('SELECT game game ,createtime createtime  FROM games WHERE game_id = ? AND save_id = ? LIMIT 1', [game_id, save_id], (err: Error | null, row: { game: any, createtime: any; }) => {
        if (err) {
          console.error('restoreGame '+err.message);
          reject(err);
        }
        if (row !== undefined && row.game !== undefined) {
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
          resolve();
        }
      });
    });
  }

  async compressCompletedGames(compressCompletedGamesDays: string | undefined = process.env.COMPRESS_COMPLETED_GAMES_DAYS): Promise<void> {
    if (compressCompletedGamesDays === undefined) {
      return;
    }
    const dateToSeconds = daysAgoToSeconds(compressCompletedGamesDays, 0);
    const selectResult = await this.asyncAll('SELECT DISTINCT game_id FROM completed_game WHERE completed_time < ?', [dateToSeconds]);
    const gameIds = selectResult.map((row) => row.game_id);
    console.log(`${gameIds.length} completed games to be compressed.`);
    if (gameIds.length > 1000) {
      gameIds.length = 1000;
      console.log('Compressing 1000 games.');
    }
    for (const gameId of gameIds) {
      // This isn't using await because nothing really depends on it.
      this.compressCompletedGame(gameId);
    }
  }

  async compressCompletedGame(gameId: GameId): Promise<sqlite3.RunResult> {
    const maxSaveId = await this.getMaxSaveId(gameId);
    return this.asyncRun('DELETE FROM games WHERE game_id = ? AND save_id < ? AND save_id > 0', [gameId, maxSaveId])
      .then(() => {
        return this.asyncRun('DELETE FROM completed_games where game_id = ?', [gameId]);
      });
  }

  async saveGame(game: IGame): Promise<void> {
    const gameJSON = game.toJSON();
    const prop = game.toShortJSON();
    // Insert
    await this.runQuietly('INSERT INTO games(game_id, save_id, game, prop) VALUES(?, ?, ?, ?)', [game.id, game.lastSaveId, gameJSON, prop]);
    // Save IDs on the very first save for this game. That's when the incoming saveId is 0, and also
    // when the database operation was an insert. (We should figure out why multiple saves occur and
    // try to stop them. But that's for another day.)
    // if (game.lastSaveId === 0) {
    //   const participantIds: Array<ParticipantId> = game.getPlayers().map((p) => p.id);
    //   if (game.spectatorId) participantIds.push(game.spectatorId);
    //   try {
    //     await this.storeParticipants({gameId: game.id, participantIds: participantIds});
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }
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

  saveUser(id: string, name: string, password: string, prop: string): void {
    // Insert user
    this.db.run('INSERT INTO users(id, name, password, prop) VALUES(?, ?, ?, ?)', [id, name, password, prop], function(err: { message: any; }) {
      if (err) {
        return console.error(err);
      }
    });
  }

  getUsers(cb:(err: any, allUsers:Array<User>)=> void): void {
    const allUsers:Array<User> = [];
    const sql: string = 'SELECT distinct id, name, password, prop, createtime FROM users ';
    this.db.all(sql, [], (err :any, rows : [any]) => {
      if (rows) {
        rows.forEach((row) => {
          const user = Object.assign(new User('', '', ''), {id: row.id, name: row.name, password: row.password, createtime: row.createtime}, JSON.parse(row.prop) );
          if (user.donateNum === 0 && user.isvip() > 0) {
            user.donateNum = 1;
          }
          allUsers.push(user );
        });
        return cb(err, allUsers);
      }
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  refresh(): void {
    this.db.run('vacuum');
  }

  public async storeParticipants(entry: GameIdLedger): Promise<void> {
    // Sequence of '(?, ?)' pairs.
    const placeholders = entry.participantIds.map(() => '(?, ?)').join(', ');
    // Sequence of [game_id, id] pairs.
    const values: Array<GameId | ParticipantId> = entry.participantIds.map((participant) => [entry.gameId, participant]).flat();

    await this.asyncRun('INSERT INTO participants (game_id, participant) VALUES ' + placeholders, values);
  }

  public async getParticipants(): Promise<Array<GameIdLedger>> {
    const rows = await this.asyncAll('SELECT game_id, participant FROM participants');
    const multimap = new MultiMap<GameId, ParticipantId>();
    rows.forEach((row) => multimap.set(row.game_id, row.participant));
    const result: Array<GameIdLedger> = [];
    multimap.forEachAssociation((participantIds, gameId) => {
      result.push({gameId, participantIds});
    });
    return result;
  }

  protected asyncRun(sql: string, params?: any): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      // It is intentional that this is declared `function` and that the first
      // parameter is `this`.
      // See https://stackoverflow.com/questions/73523387/in-node-sqlite3-does-runs-first-callback-parameter-return-error
      function cb(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          // eslint-disable-next-line no-invalid-this
          resolve(this);
        }
      }

      if (params !== undefined) {
        this.db.run(sql, params, cb);
      } else {
        this.db.run(sql, cb);
      }
    });
  }

  protected asyncGet(sql: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, function(err: Error | null, row: any) {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  protected asyncAll(sql: string, params?: any): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, function(err, rows: Array<any>) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
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
    this.db.run('INSERT INTO user_rank(id, rank_value, mu, sigma, trueskill) VALUES(?, ?, ?, ?, ?)', [userRank.userId, userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill], function(err: { message: any; }) {
      if (err) {
        return console.error(err);
      }
    });
  }

  // 天梯，返回所有UserRank
  public async getUserRanks(limit:number | undefined = 0): Promise<Array<UserRank>> {
    const concatLimit: string = limit === 0 ? '' : ' limit ' + limit.toString();
    const sql: string = 'SELECT id, rank_value, mu, sigma, trueskill FROM user_rank   order by rank_value desc,trueskill desc' + concatLimit;
    const allUserRanks : Array<UserRank> = [];
    const rows = await this.asyncAll(sql);
    rows.forEach((row) => {
      const userRank = new UserRank(row.id, row.rank_value, row.mu, row.sigma, row.trueskill);
      allUserRanks.push(userRank);
    });
    return allUserRanks;
  }

  public async updateUserRank(userRank:UserRank): Promise<void> {
    await this.asyncRun('UPDATE user_rank SET rank_value = ?, mu = ?, sigma = ? , trueskill = ? WHERE id = ?', [userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill, userRank.userId]);
  }

  // @param position: 这局游戏第几名
  saveUserGameResult(user_id: string, game_id: string, phase: string, score: Score, players: number, generations: number, create_time: string, position: number, is_rank: boolean, user_rank: UserRank | undefined): void {
    const sql: string = user_rank !== undefined ?
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, rank_value, mu, sigma, trueskill, is_rank, phase) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' :
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, is_rank, phase) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params: any = user_rank !== undefined ?
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, user_rank.rankValue, user_rank.mu, user_rank.sigma, user_rank.trueskill, is_rank, phase] :
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, is_rank, phase];

    this.db.run(sql, params, (err) => {
      if (err) {
        console.error('SQlite:saveUserGameResult', err.message);
        throw err;
      }
    });
  }
}
