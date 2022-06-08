import {IDatabase, DbLoadCallback, IGameShortData} from './IDatabase';
import {Game, GameOptions, Score} from '../Game';
import {GameId} from '../common/Types';
import {IGameData} from '../common/game/IGameData';
import {SerializedGame} from '../SerializedGame';

import {Pool, ClientConfig, QueryResult} from 'pg';
import {Timer} from '../Timer';

export class PostgreSQL implements IDatabase {
  private client: Pool;

  constructor() {
    const config: ClientConfig = {
      connectionString: process.env.POSTGRES_HOST,
    };
    if (config.connectionString !== undefined && config.connectionString.startsWith('postgres')) {
      config.ssl = false;
    }
    this.client = new Pool(config);
    this.client.query('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\', createtime timestamp(0) default now(), prop text, PRIMARY KEY (game_id, save_id))', (err) => {
      if (err) {
        throw err;
      }
    });
    this.client.query('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp(0) default now(), PRIMARY KEY (game_id))', (err) => {
      if (err) {
        throw err;
      }
    });
    this.client.query('CREATE TABLE IF NOT EXISTS users(id varchar not null, name varchar not null, password varchar not null, prop varchar, createtime timestamp(0) default now(), PRIMARY KEY (id))', (err) => {
      if (err) {
        throw err;
      }
    });

    this.client.query('CREATE INDEX IF NOT EXISTS games_i1 on games(save_id)', (err) => {
      if (err) {
        throw err;
      }
    });
    this.client.query('CREATE INDEX IF NOT EXISTS games_i2 on games(createtime )', (err) => {
      if (err) {
        throw err;
      }
    });
  }

  async initialize(): Promise<void> {

  }

  getClonableGames(cb: (err: Error | undefined, allGames: Array<IGameData>) => void) {
    const allGames: Array<IGameData> = [];
    const sql = 'SELECT distinct game_id game_id ,game FROM games WHERE save_id = 0 order by game_id asc';

    this.client.query(sql, (err, res) => {
      if (err) {
        console.error('PostgreSQL:getClonableGames', err);
        cb(err, []);
        return;
      }
      for (const row of res.rows) {
        const gameId: GameId = row.game_id;
        const playerCount: number = JSON.parse(row.game).players.length;
        const gameData: IGameData = {
          gameId,
          playerCount,
        };
        allGames.push(gameData);
      }
      cb(undefined, allGames);
    });
  }

  getClonableGameByGameId(game_id: GameId, cb: (err: Error | undefined, gameData: IGameData | undefined) => void) {
    const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = $1 LIMIT 1';

    this.client.query(sql, [game_id], (err, res) => {
      if (err) {
        console.error('PostgreSQL:getClonableGameByGameId', err);
        cb(err, undefined);
        return;
      }
      if (res.rows.length === 0) {
        cb(undefined, undefined);
        return;
      }
      cb(undefined, {
        gameId: res.rows[0].game_id,
        playerCount: res.rows[0].players,
      });
    });
  }

  getGames(cb: (err: Error | undefined, allGames: Array<IGameShortData>) => void) {
    const allGames: Array<IGameShortData> = [];
    const sql: string = 'select  games.game_id game_id,games.save_id save_id , games.prop prop  from games' +
        ' join  (SELECT   game_id game_id,max(save_id) save_id  FROM games group by game_id) as gt on gt.game_id = games.game_id and gt.save_id = games.save_id';
    this.client.query(sql, (err, res) => {
      if (err) {
        console.error('PostgreSQL:getGames', err);
        cb(err, []);
        return;
      }
      for (const row of res.rows) {
        allGames.push({gameId: row.game_id, shortData: row.prop !== undefined && row.prop !=='' ? JSON.parse(row.prop) : undefined});
      }
      cb(undefined, allGames);
    });
  }

  restoreReferenceGame(game_id: GameId, game: Game, cb: (err: any) => void) {
    // Retrieve first save from database
    this.client.query('SELECT game_id game_id, game game FROM games WHERE game_id = $1 AND save_id = 0', [game_id], (err: Error | undefined, res) => {
      if (err) {
        console.error('PostgreSQL:restoreReferenceGame', err);
        return cb(err);
      }
      if (res.rows.length === 0) {
        return cb(new Error('Game not found'));
      }
      try {
        // Transform string to json
        const gameToRestore = JSON.parse(res.rows[0].game);

        // Rebuild each objects
        game.loadFromJSON(gameToRestore);
      } catch (exception) {
        console.error(`Unable to restore game ${game_id}`, exception);
        cb(exception);
        return;
      }
      return cb(undefined);
    });
  }

  getGame(game_id: GameId, cb: (err: Error | undefined, game?: SerializedGame) => void): void {
    // Retrieve last save from database
    this.client.query('SELECT game game FROM games WHERE game_id = $1 ORDER BY save_id DESC LIMIT 1', [game_id], (err, res) => {
      if (err) {
        console.error('PostgreSQL:getGame', err);
        return cb(err);
      }
      if (res.rows.length === 0) {
        return cb(new Error('Game not found'));
      }
      cb(undefined, JSON.parse(res.rows[0].game));
    });
  }

  // TODO(kberg): throw an error if two game ids exist.
  getGameId(playerId: string, cb: (err: Error | undefined, gameId?: GameId) => void): void {
    const sql =
      `SELECT game_id
      FROM games, json_array_elements(CAST(game AS JSON)->'players') AS e
      WHERE save_id = 0 AND e->>'id' = $1`;

    this.client.query(sql, [playerId], (err: Error | null, res: QueryResult<any>) => {
      if (err) {
        console.error('PostgreSQL:getGameId', err);
        return cb(err ?? undefined);
      }
      if (res.rowCount === 0) {
        return cb(new Error('Game not found'));
      }
      const gameId = res.rows[0].game_id;
      cb(undefined, gameId);
    });
  }

  getGameVersion(game_id: GameId, save_id: number, cb: DbLoadCallback<SerializedGame>): void {
    this.client.query('SELECT game game FROM games WHERE game_id = $1 and save_id = $2', [game_id, save_id], (err: Error | null, res: QueryResult<any>) => {
      if (err) {
        console.error('PostgreSQL:getGameVersion', err);
        return cb(err, undefined);
      }
      cb(undefined, JSON.parse(res.rows[0].game));
    });
  }

  saveGameResults(game_id: GameId, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.client.query('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [game_id, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err) => {
      if (err) {
        console.error('PostgreSQL:saveGameResults', err);
        throw err;
      }
    });
  }

  getMaxSaveId(game_id: GameId, cb: DbLoadCallback<number>): void {
    this.client.query('SELECT MAX(save_id) as save_id FROM games WHERE game_id = $1', [game_id], (err: Error | null, res: QueryResult<any>) => {
      if (err) {
        return cb(err ?? undefined, undefined);
      }
      cb(undefined, res.rows[0].save_id);
    });
  }

  throwIf(err: any, condition: string) {
    if (err) {
      console.error('PostgreSQL', condition, err);
      throw err;
    }
  }

  cleanSaves(game_id: GameId): void {
    this.getMaxSaveId(game_id, ((err, save_id) => {
      this.throwIf(err, 'cleanSaves0');
      if (save_id === undefined) throw new Error('saveId is undefined for ' + game_id);
      // DELETE all saves except initial and last one
      this.client.query('DELETE FROM games WHERE game_id = $1 AND save_id < $2 AND save_id > 0', [game_id, save_id], (err) => {
        this.throwIf(err, 'cleanSaves1');
        // Flag game as finished
        this.client.query('UPDATE games SET status = \'finished\' WHERE game_id = $1', [game_id], (err2) => {
          this.throwIf(err2, 'cleanSaves2');
          // Purge after setting the status as finished so it does not delete the game.
          // this.purgeUnfinishedGames();
        });
      });
    }));
  }

  // Purge unfinished games older than MAX_GAME_DAYS days. If this environment variable is absent, it uses the default of 10 days.
  purgeUnfinishedGames(): void {
    // const envDays = parseInt(process.env.MAX_GAME_DAYS || '');
    // const days = Number.isInteger(envDays) ? envDays : 10;
    // this.client.query('DELETE FROM games WHERE createtime < now() - interval \'1 day\' * $1', [days], function(err?: Error, res?: QueryResult<any>) {
    //   if (res) {
    //     console.log(`Purged ${res.rowCount} rows`);
    //   }
    //   if (err) {
    //     return console.warn(err.message);
    //   }
    // });
  }

  cleanGame(game_id: string): void {
    // DELETE all saves
    this.client.query('DELETE FROM games WHERE game_id = $1 ', [game_id], function(err: { message: any; }) {
      if (err) {
        return console.warn('cleanGame '+game_id, err);
      }
    });
  }

  cleanGameSave(game_id: string, save_id: number): void {
    // DELETE one  save  by save id
    this.client.query('DELETE FROM games WHERE game_id = $1 AND save_id = $2', [game_id, save_id], function(err: { message: any; }) {
      if (err) {
        return console.warn('cleanGameSave '+game_id, err);
      }
    });
  }

  restoreGame(game_id: string, save_id: number, game: Game, playId: string): void {
    // Retrieve last save from database
    this.client.query('SELECT game game ,createtime createtime  FROM games WHERE game_id = $1 AND save_id = $2 ORDER BY save_id DESC LIMIT 1', [game_id, save_id], (err, res) => {
      if (err) {
        return console.error('PostgreSQL:restoreGame', err);
      }
      if (res.rows.length === 0) {
        console.error('PostgreSQL:restoreGame', 'Game not found');
        return;
      }

      // Transform string to json
      const gameToRestore = JSON.parse(res.rows[0].game);

      // Rebuild each objects
      const gamelog = game.gameLog;
      game.loadFromJSON(gameToRestore);
      game.gameLog = gamelog;
      game.log('${0} undo turn', (b) => b.playerId(playId));

      // 会员回退时 以当前时间开始计时， 避免计时算到上一个人头上
      if (playId === 'manager') {
        Timer.newInstance().stop();
        game.activePlayer.timer.start();
      }
      console.log(`${playId} undo turn ${game_id}  ${save_id}`);
    });
  }

  saveGameState(game_id: string, save_id: number, game: string, gameShortDate: string = '{}'): void {
    // Insert
    this.client.query('INSERT INTO games(game_id, save_id, game, prop) VALUES($1, $2, $3, $4)', [game_id, save_id, game, gameShortDate], (err) => {
      if (err) {
        // Should be a duplicate, does not matter
        return;
      }
    });
  }

  deleteGameNbrSaves(game_id: GameId, rollbackCount: number): void {
    if (rollbackCount > 0) {
      this.client.query('DELETE FROM games WHERE ctid IN (SELECT ctid FROM games WHERE game_id = $1 ORDER BY save_id DESC LIMIT $2)', [game_id, rollbackCount], (err) => {
        if (err) {
          return console.warn('deleteGameNbrSaves '+game_id, err);
        }
      });
    }
  }
  saveUser(_id: string, _name: string, _password: string, _prop: string): void {
    throw new Error('Method not implemented.');
  }
  getUsers(_cb: (err: any, allUsers: import('../User').User[]) => void): void {
    throw new Error('Method not implemented.');
  }
  refresh(): void {

  }
}
