import {IDatabase, DbLoadCallback} from './IDatabase';
import {Game, GameId, GameOptions, Score} from '../Game';
import {IGameData} from './IDatabase';
import {SerializedGame} from '../SerializedGame';

import sqlite3 = require('sqlite3');
import {User} from '../User';
const path = require('path');
const fs = require('fs');
const dbFolder = path.resolve(__dirname, '../../../db');
const dbPath = path.resolve(__dirname, '../../../db/game.db');

export class SQLite implements IDatabase {
  private db: sqlite3.Database;

  constructor() {
    // Create the table that will store every saves if not exists
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder);
    }
    this.db = new sqlite3.Database(dbPath);
    this.db.run('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\',createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), PRIMARY KEY (game_id, save_id))');
    this.db.run('CREATE TABLE IF NOT EXISTS \'users\'(\'id\'  varchar NOT NULL,\'name\'  varchar NOT NULL,\'password\'  varchar NOT NULL,\'prop\' varchar,\'createtime\'  timestamp DEFAULT (datetime(CURRENT_TIMESTAMP,\'localtime\')),PRIMARY KEY (\'id\'))');
    this.db.run('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp default (datetime(CURRENT_TIMESTAMP,\'localtime\')), PRIMARY KEY (game_id))');
  }

  getClonableGames(cb: (err: Error | undefined, allGames: Array<IGameData>) => void) {
    const allGames: Array<IGameData> = [];
    const sql = 'SELECT distinct game_id game_id, game FROM games WHERE  save_id = 0 order by game_id asc';

    this.db.all(sql, [], (err, rows) => {
      if (rows) {
        rows.forEach((row) => {
          const gameId: string = row.game_id;
          const playerCount: number = JSON.parse(row.game).players.length;
          const gameData: IGameData = {
            gameId,
            playerCount,
          };
          allGames.push(gameData);
        });
        return cb(err ?? undefined, allGames);
      }
    });
  }

  getGames(cb: (err: Error | undefined, allGames: Array<string>) => void) {
    const allGames: Array<string> = [];
    const sql: string = 'SELECT distinct game_id game_id FROM games ';
    this.db.all(sql, [], (err, rows) => {
      if (rows) {
        rows.forEach((row) => {
          allGames.push(row.game_id);
        });
        return cb(err ?? undefined, allGames);
      }
    });
  }

  restoreReferenceGame(game_id: GameId, game: Game, cb: (err: any) => void) {
    // Retrieve first save from database
    this.db.get('SELECT game_id game_id, game game FROM games WHERE game_id = ? AND save_id = 0', [game_id], (err: Error | null, row: { game_id: GameId, game: any; }) => {
      if (row.game_id === undefined) {
        return cb(new Error('Game not found'));
      }

      try {
        // Transform string to json
        const gameToRestore = JSON.parse(row.game);

        // Rebuild each objects
        game.loadFromJSON(gameToRestore);
      } catch (exception) {
        console.error(`unable to restore reference game ${game_id}`, exception);
        cb(exception);
        return;
      }

      return cb(err);
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

  getGameVersion(game_id: GameId, save_id: number, cb: DbLoadCallback<SerializedGame>): void {
    this.db.get('SELECT game game FROM games WHERE game_id = ? and save_id = ?', [game_id, save_id], (err: Error | null, row: { game: any; }) => {
      if (err) {
        return cb(err ?? undefined, undefined);
      }
      cb(undefined, JSON.parse(row.game));
    });
  }

  cleanSaves(game_id: GameId, save_id: number): void {
    // DELETE all saves except initial and last one
    this.db.run('DELETE FROM games WHERE game_id = ? AND save_id < ? AND save_id > 0', [game_id, save_id], function(err: Error | null) {
      if (err) {
        return console.warn(err.message);
      }
    });
    // Flag game as finished
    this.db.run('UPDATE games SET status = \'finished\' WHERE game_id = ?', [game_id], function(err: Error | null) {
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  purgeUnfinishedGames(): void {
    // Purge unfinished games older than MAX_GAME_DAYS days. If this .env variable is not present, unfinished games will not be purged.
    // if (process.env.MAX_GAME_DAYS) {
    //   this.db.run('DELETE FROM games WHERE created_time < strftime(\'%s\',date(\'now\', \'-? day\')) and status = \'running\'', [process.env.MAX_GAME_DAYS], function(err: Error | null) {
    //     if (err) {
    //       return console.warn(err.message);
    //     }
    //   });
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
        console.log(`${playId} undo turn ${game_id}  ${save_id}`);
      }
      return true;
    });
  }

  saveGameState(game_id: string, save_id: number, game: string): void {
    // Insert
    this.db.run('INSERT INTO games(game_id, save_id, game) VALUES(?, ?, ?)', [game_id, save_id, game], function(err: Error | null) {
      if (err) {
        // Should be a duplicate, does not matter
        console.log('saveGameState' + err);
        return;
      }
    });
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
          allUsers.push( Object.assign(new User('', '', ''), {id: row.id, name: row.name, password: row.password, createtime: row.createtime}, JSON.parse(row.prop) ));
        });
        return cb(err, allUsers);
      };
      if (err) {
        return console.warn(err.message);
      }
    });
  }

  refresh(): void {
    this.db.run('vacuum');
  }
}
