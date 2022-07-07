import {IDatabase, DbLoadCallback, IGameShortData} from './IDatabase';
import {Game, GameOptions, Score} from '../Game';
import {GameId, PlayerId, SpectatorId} from '../common/Types';
import {SerializedGame} from '../SerializedGame';

import sqlite3 = require('sqlite3');
import {User} from '../User';
import {Timer} from '../common/Timer';
const path = require('path');
const fs = require('fs');
const dbFolder = path.resolve(process.cwd(), './db');
const dbPath = path.resolve(dbFolder, 'game.db');

export const IN_MEMORY_SQLITE_PATH = ':memory:';

export class SQLite implements IDatabase {
  protected db: sqlite3.Database;

  constructor(private filename: string = dbPath, private throwQuietFailures: boolean = false) {
    if (filename !== IN_MEMORY_SQLITE_PATH) {
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder);
      }
    }
    this.db = new sqlite3.Database(filename);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\',createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), prop text, PRIMARY KEY (game_id, save_id))');
      this.db.run('CREATE TABLE IF NOT EXISTS \'users\'(\'id\'  varchar NOT NULL,\'name\'  varchar NOT NULL,\'password\'  varchar NOT NULL,\'prop\' varchar,\'createtime\'  timestamp DEFAULT (datetime(CURRENT_TIMESTAMP,\'localtime\')),PRIMARY KEY (\'id\'))');
      this.db.run('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), PRIMARY KEY (game_id))', (err3) => {
        if (err3) {
          reject(err3);
          return;
        }
        resolve();
      });
    });
  }

  getPlayerCount(gameId: GameId): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = ? LIMIT 1';

      this.db.get(sql, [gameId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row.players);
        } else {
          reject(new Error(`unknown error loadign player count for ${gameId}`));
        }
      });
    });
  }

  getGames(): Promise<Array<IGameShortData>> {
    return new Promise((resolve, reject) => {
      const sql: string = 'SELECT games.game_id,games.prop FROM games, (SELECT max(save_id) save_id, game_id FROM games  GROUP BY game_id) a WHERE games.game_id = a.game_id AND games.save_id = a.save_id ORDER BY createtime DESC';

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(new Error('Error in getGames: ' + err.message));
        } else {
          const allGames: Array<IGameShortData> = [];
          rows.forEach((row) => {
            allGames.push({gameId: row.game_id, shortData: row.prop !== undefined && row.prop !=='' ? JSON.parse(row.prop) : undefined});
          });
          resolve(allGames);
        }
      });
    });
  }

  loadCloneableGame(game_id: GameId): Promise<SerializedGame> {
    return new Promise((resolve, reject) => {
    // Retrieve first save from database
      this.db.get('SELECT game_id game_id, game game FROM games WHERE game_id = ? AND save_id = 0', [game_id], (err: Error | null, row: { game_id: GameId, game: any; }) => {
        if (err) {
          reject(err);
          return;
        }
        if (row?.game_id === undefined) {
          reject(new Error(`Game ${game_id} not found`));
          return;
        }

        try {
          const json = JSON.parse(row.game);
          resolve(json);
        } catch (exception) {
          console.error(`unable to load game ${game_id} at save point 0`, exception);
          const error = exception instanceof Error ? exception : new Error(String(exception));
          reject(error);
        }
      });
    });
  }

  saveGameResults(game_id: string, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.db.run('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [game_id, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err) => {
      if (err) {
        console.error('SQlite:saveGameResults', err.message);
        throw err;
      }
    });
  }

  getGame(game_id: string, cb: (err: Error | undefined, game?: SerializedGame) => void): void {
    // Retrieve last save from database
    this.db.get('SELECT game game   FROM games WHERE game_id = ? ORDER BY save_id DESC LIMIT 1', [game_id], (err: Error | null, row: { game: any, createtime: any; }) => {
      if (err) {
        return cb(err ?? undefined);
      }
      // Transform string to json
      const gameToRestore = JSON.parse(row.game);
      cb(undefined, gameToRestore);
    });
  }

  // TODO(kberg): throw an error if two game ids exist.
  getGameId(id: PlayerId | SpectatorId): Promise<GameId> {
    // Default sql is for player id;
    let sql: string = 'SELECT game_id from games, json_each(games.game, \'$.players\') e where json_extract(e.value, \'$.id\') = ?';
    if (id.charAt(0) === 's') {
      sql = 'SELECT game_id from games where json_extract(games.game, \'$.spectatorId\') = ?';
    } else if (id.charAt(0) === 'p') {
      throw new Error(`id ${id} is neither a player id or spectator id`);
    }
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err: Error | null, row: { gameId: any; }) => {
        if (err) {
          reject(err);
        }
        resolve(row.gameId);
      });
    });
  }

  public getSaveIds(gameId: GameId): Promise<Array<number>> {
    return new Promise((resolve, reject) => {
      const allSaveIds: Array<number> = [];
      const sql: string = 'SELECT distinct save_id FROM games WHERE game_id = ?';
      this.db.all(sql, [gameId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        if (rows) {
          rows.forEach((row) => {
            allSaveIds.push(row.save_id);
          });
        }
        resolve(allSaveIds);
      });
    });
  }

  getGameVersion(game_id: GameId, save_id: number): Promise<SerializedGame> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT game game FROM games WHERE game_id = ? and save_id = ?',
        [game_id, save_id],
        (err: Error | null, row: { game: any; }) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(row.game));
          }
        });
    });
  }

  getMaxSaveId(game_id: GameId, cb: DbLoadCallback<number>): void {
    this.db.get('SELECT MAX(save_id) AS save_id FROM games WHERE game_id = ?', [game_id], (err: Error | null, row: { save_id: number; }) => {
      if (err) {
        return cb(err ?? undefined, undefined);
      }
      cb(undefined, row.save_id);
    });
  }

  cleanSaves(game_id: GameId): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getMaxSaveId(game_id, ((err, save_id) => {
        if (err) {
          reject(new Error('SQLite: cleansaves0:' + err.message));
        }
        if (save_id === undefined) throw new Error('saveId is undefined for ' + game_id);
        // Purges isn't used yet
        // this.runQuietly('INSERT into purges (game_id, last_save_id) values (?, ?)', [game_id, save_id]);
        // DELETE all saves except initial and last one
        this.db.run('DELETE FROM games WHERE game_id = ? AND save_id < ? AND save_id > 0', [game_id, save_id], (err) => {
          if (err) console.warn('SQLite: cleansaves1: ', err.message);
          // Flag game as finished
          this.db.run('UPDATE games SET status = \'finished\' WHERE game_id = ?', [game_id], async (err) => {
            if (err) console.warn('SQLite: cleansaves2: ', err.message);
            resolve();
          });
        });
      }));
    });
  }

  async purgeUnfinishedGames(_maxGameDays: string | undefined = process.env.MAX_GAME_DAYS): Promise<void> {
    // Purge unfinished games older than MAX_GAME_DAYS days. If this .env variable is not present, unfinished games will not be purged.
    // if (maxGameDays) {
    //   const dateToSeconds = daysAgoToSeconds(maxGameDays, 0);
    //   return this.runQuietly(`DELETE FROM games WHERE created_time < ? and status = 'running'`, [dateToSeconds]);
    // } else {
    return Promise.resolve();
    // }
  }

  cleanGame(game_id: string): void {
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

  restoreGame(game_id: string, save_id: number, game: Game, playId: string): void {
    // Retrieve last save from database
    this.db.get('SELECT game game ,createtime createtime  FROM games WHERE game_id = ? AND save_id = ? LIMIT 1', [game_id, save_id], (err: Error | null, row: { game: any, createtime: any; }) => {
      if (err) {
        return console.error('restoreGame '+err.message);
      }
      if (row !== undefined && row.game !== undefined) {
        // Transform string to json
        const gameToRestore = JSON.parse(row.game);

        // Rebuild each objects
        const gamelog = game.gameLog;
        game.loadFromJSON(gameToRestore);
        game.updatetime = row.createtime;
        game.gameLog = gamelog;
        game.log('${0} undo turn', (b) => b.playerId(playId));
        // 会员回退时 以当前时间开始计时， 避免计时算到上一个人头上
        if (playId === 'manager') {
          Timer.newInstance().stop();
          game.activePlayer.timer.start();
        }
        console.log(`${playId} undo turn ${game_id}  ${save_id}`);
      }
      return true;
    });
  }

  async saveGame(game:Game): Promise<void> {
    const gameJSON = game.toJSON();
    const prop = game.toShortJSON();
    // Insert
    await this.runQuietly('INSERT INTO games(game_id, save_id, game, prop) VALUES(?, ?, ?, ?)', [game.id, game.lastSaveId, gameJSON, prop]);
  }

  deleteGameNbrSaves(game_id: GameId, rollbackCount: number): void {
    if (rollbackCount > 0) {
      this.db.run('DELETE FROM games WHERE rowid IN (SELECT rowid FROM games WHERE game_id = ? ORDER BY save_id DESC LIMIT ?)', [game_id, rollbackCount], function(err: Error | null) {
        if (err) {
          return console.warn(err.message);
        }
      });
    }
  }
  public stats(): Promise<{[key: string]: string | number}> {
    const size = this.filename === IN_MEMORY_SQLITE_PATH ? -1 : fs.statSync(this.filename).size;

    return Promise.resolve({
      type: 'SQLite',
      path: this.filename,
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
    this.db.all(sql, [], (err, rows) => {
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

  // Run the given SQL but do not return errors.
  runQuietly(sql: string, params: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        sql, params,
        (err: Error | null) => {
          if (err) {
            console.error(err);
            console.error('for sql: ' + sql);
            if (this.throwQuietFailures) {
              reject(err);
              return;
            }
          } else {
            resolve();
          }
        },
      );
    });
  }
}
