import {IDatabase, IGameShortData} from './IDatabase';
import {Game, Score} from '../Game';
import {GameOptions} from '../GameOptions';
import {GameId, PlayerId, SpectatorId} from '../../common/Types';
import {SerializedGame} from '../SerializedGame';
import {User} from '../User';
import {Timer} from '../../common/Timer';
import {Pool, ClientConfig} from 'pg';
import {daysAgoToSeconds} from './utils.ts';
import {GameIdLedger} from './IDatabase';

export class PostgreSQL implements IDatabase {
  protected client: Pool;
  private databaseName: string | undefined = undefined; // Use this only for stats.

  protected statistics = {
    saveCount: 0,
    saveErrorCount: 0,
    saveConflictUndoCount: 0,
    saveConflictNormalCount: 0,
  };

  constructor(
    config: ClientConfig = {
      connectionString: process.env.POSTGRES_HOST,
    }) {
    if (config.connectionString !== undefined && config.connectionString.startsWith('postgres')) {
      config.ssl = false;
    }

    if (config.database) {
      this.databaseName = config.database;
    } else if (config.connectionString) {
      try {
        // Remove leading / from pathname.
        this.databaseName = new URL(config.connectionString).pathname.replace(/^\//, '');
      } catch (e) {
        console.warn(e);
      }
    }
    // Configuration stats saved for
    this.client = new Pool(config);
  }

  public async initialize(): Promise<void> {
    await this.client.query('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\', createtime timestamp(0) default now(), prop text, PRIMARY KEY (game_id, save_id))');
    // 测试时开启下一行， 时间戳带毫秒
    // await this.client.query('CREATE TABLE IF NOT EXISTS games(game_id varchar, save_id integer, game text, status text default \'running\', createtime timestamp default now(), prop text, PRIMARY KEY (game_id, save_id))');
    await this.client.query('CREATE TABLE IF NOT EXISTS participants(game_id varchar, participants varchar[], PRIMARY KEY (game_id))');
    await this.client.query('CREATE TABLE IF NOT EXISTS game_results(game_id varchar not null, seed_game_id varchar, players integer, generations integer, game_options text, scores text,createtime timestamp(0) default now(), PRIMARY KEY (game_id))');


    await this.client.query('CREATE INDEX IF NOT EXISTS games_i1 on games(save_id)');
    await this.client.query('CREATE INDEX IF NOT EXISTS games_i2 on games(createtime)');
    await this.client.query('CREATE INDEX IF NOT EXISTS participants_idx_ids on participants USING GIN (participants)');

    await this.client.query('CREATE TABLE IF NOT EXISTS users(id varchar not null, name varchar not null, password varchar not null, prop varchar, createtime timestamp(0) default now(), PRIMARY KEY (id))');
  }

  public async getPlayerCount(game_id: GameId): Promise<number> {
    const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = $1 LIMIT 1';

    const res = await this.client.query(sql, [game_id]);
    if (res.rows.length === 0) {
      throw new Error(`no rows found for game id ${game_id}`);
    }
    return res.rows[0].players;
  }

  public async getGames(): Promise<Array<IGameShortData>> {
    const sql: string = 'SELECT games.game_id,games.prop FROM games, (SELECT max(save_id) save_id, game_id FROM games  GROUP BY game_id) a WHERE games.game_id = a.game_id AND games.save_id = a.save_id ORDER BY createtime DESC';
    const res = await this.client.query(sql);
    return res.rows.map((row) => ({gameId: row.game_id, shortData: row.prop !== undefined && row.prop !=='' ? JSON.parse(row.prop) : undefined}));
  }

  public loadCloneableGame(game_id: GameId): Promise<SerializedGame> {
    return this.getGameVersion(game_id, 0);
  }

  public async getGame(game_id: GameId): Promise<SerializedGame> {
    // Retrieve last save from database
    const res = await this.client.query('SELECT game game FROM games WHERE game_id = $1 ORDER BY save_id DESC LIMIT 1', [game_id]);
    if (res.rows.length === 0 || res.rows[0] === undefined) {
      throw new Error(`Game ${game_id} not found`);
    }
    const json = JSON.parse(res.rows[0].game);
    return json;
  }

  public async getGameId(id: string): Promise<GameId> {
    try {
      const res = await this.client.query('select game_id from participants where $1 = ANY(participants)', [id]);
      if (res.rowCount === 0) {
        throw new Error(`Game for player id ${id} not found`);
      }
      return res.rows[0].game_id;
    } catch (err) {
      console.error('PostgreSQL:getGameId', err);
      throw err;
    }
  }

  public async getSaveIds(gameId: GameId): Promise<Array<number>> {
    const res = await this.client.query('SELECT distinct save_id FROM games WHERE game_id = $1', [gameId]);
    const allSaveIds: Array<number> = [];
    res.rows.forEach((row) => {
      allSaveIds.push(row.save_id);
    });
    return Promise.resolve(allSaveIds);
  }

  async getGameVersion(game_id: GameId, save_id: number): Promise<SerializedGame> {
    const res = await this.client.query('SELECT game game FROM games WHERE game_id = $1 and save_id = $2', [game_id, save_id]);
    if (res.rowCount === 0) {
      throw new Error(`Game ${game_id} not found at save_id ${save_id}`);
    }
    return JSON.parse(res.rows[0].game);
  }

  saveGameResults(game_id: GameId, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.client.query('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [game_id, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err) => {
      if (err) {
        console.error('PostgreSQL:saveGameResults', err);
        throw err;
      }
    });
  }

  async getMaxSaveId(game_id: GameId): Promise<number> {
    const res = await this.client.query('SELECT MAX(save_id) as save_id FROM games WHERE game_id = $1', [game_id]);
    return res.rows[0].save_id;
  }

  throwIf(err: any, condition: string) {
    if (err) {
      console.error('PostgreSQL', condition, err);
      throw err;
    }
  }

  async cleanGame(game_id: GameId): Promise<void> {
    const maxSaveId = await this.getMaxSaveId(game_id);
    console.log('maxSaveId ' +maxSaveId);
    // DELETE all saves except initial and last one
    await this.client.query('DELETE FROM games WHERE game_id = $1 AND save_id < $2 AND save_id > 0', [game_id, maxSaveId]);
    // Flag game as finished
    await this.client.query('UPDATE games SET status = \'finished\' WHERE game_id = $1', [game_id]);
    // Purge after setting the status as finished so it does not delete the game.
    // const delete3 = this.purgeUnfinishedGames();
    // await Promise.all([delete1, delete2]);
  }

  // Purge unfinished games older than MAX_GAME_DAYS days. If this environment variable is absent, it uses the default of 10 days.
  async purgeUnfinishedGames(maxGameDays: string | undefined = process.env.MAX_GAME_DAYS): Promise<void> {
    const dateToSeconds = daysAgoToSeconds(maxGameDays, 10);
    const selectResult = await this.client.query('SELECT DISTINCT game_id FROM games WHERE created_time < to_timestamp($1)', [dateToSeconds]);
    const gameIds = selectResult.rows.slice(0, 1000).map((row) => row.game_id);
    console.log(`${gameIds.length} games to be purged.`);
    if (gameIds.length > 1000) {
      gameIds.length = 1000;
    }
    console.log('Truncated purge to 1000 games.');
    // https://github.com/brianc/node-postgres/wiki/FAQ#11-how-do-i-build-a-where-foo-in--query-to-find-rows-matching-an-array-of-values
    const deleteGamesResult = await this.client.query('DELETE FROM games WHERE game_id = ANY($1)', [gameIds]);
    console.log(`Purged ${deleteGamesResult.rowCount} rows from games`);
  }

  cleanGameAllSaves(game_id: string): void {
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

  async restoreGame(game_id: string, save_id: number, game: Game, playId: string): Promise<void> {
    // Retrieve last save from database
    logForUndo(game_id, 'restore to', save_id);
    const res = await this.client.query('SELECT game game ,createtime createtime  FROM games WHERE game_id = $1 AND save_id = $2 ORDER BY save_id DESC LIMIT 1', [game_id, save_id]);
    // if (err) {
    //   return console.error('PostgreSQL:restoreGame', err);
    // }
    if (res.rows.length === 0) {
      console.error('PostgreSQL:restoreGame', 'Game not found');
      return Promise.resolve();
    }

    // Transform string to json
    const gameToRestore = JSON.parse(res.rows[0].game);

    // Rebuild each objects
    const gamelog = game.gameLog;
    logForUndo(game.id, 'restored to', game.lastSaveId, 'from', save_id);
    game.loadFromJSON(gameToRestore);
    game.gameLog = gamelog;
    game.log('${0} undo turn', (b) => b.playerId(playId));

    // 会员回退时 以当前时间开始计时， 避免计时算到上一个人头上
    if (playId === 'manager') {
      Timer.newInstance().stop();
      game.activePlayer.timer.start();
    }
    console.log(`${playId} undo turn ${game_id}  ${save_id}`);
    return Promise.resolve();
  }

  async saveGame(game: Game): Promise<void> {
    try {
      const gameJSON = game.toJSON();
      const prop = game.toShortJSON();
      this.statistics.saveCount++;
      if (game.gameOptions.undoOption) logForUndo(game.id, 'start save', game.lastSaveId);
      // Holding onto a value avoids certain race conditions where saveGame is called twice in a row.
      // const thisSaveId = game.lastSaveId;
      // xmax = 0 is described at https://stackoverflow.com/questions/39058213/postgresql-upsert-differentiate-inserted-and-updated-rows-using-system-columns-x
      const res = await this.client.query(
        `INSERT INTO games (game_id, save_id, game, prop)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (game_id, save_id) DO UPDATE SET game = $3
        RETURNING (xmax = 0) AS inserted`,
        [game.id, game.lastSaveId, gameJSON, prop]);


      let inserted = true;
      try {
        inserted = res.rows[0].inserted;
      } catch (err) {
        console.error(err);
      }
      if (inserted === false) {
        if (game.gameOptions.undoOption) {
          this.statistics.saveConflictUndoCount++;
        } else {
          this.statistics.saveConflictNormalCount++;
        }
      }
      // Save IDs on the very first save for this game. That's when the incoming saveId is 0, and also
      // when the database operation was an insert. (We should figure out why multiple saves occur and
      // try to stop them. But that's for another day.)
      // if (inserted === true && thisSaveId === 0) {
      //   const participantIds: Array<PlayerId | SpectatorId> = game.getPlayers().map((p) => p.id);
      //   if (game.spectatorId) participantIds.push(game.spectatorId);
      //   await this.storeParticipants({gameId: game.id, participantIds: participantIds});
      // }

      if (game.gameOptions.undoOption) logForUndo(game.id, 'increment save id, now', game.lastSaveId);
    } catch (err) {
      this.statistics.saveErrorCount++;
      console.error('PostgreSQL:saveGame' + game.id, err);
    }
  }

  async deleteGameNbrSaves(game_id: GameId, rollbackCount: number): Promise<void> {
    if (rollbackCount <= 0) {
      console.error(`invalid rollback count for ${game_id}: ${rollbackCount}`);
      // Should this be an error?
      return;
    }
    logForUndo(game_id, 'deleting', rollbackCount, 'saves');
    const first = await this.getSaveIds(game_id);
    const res = await this.client.query('DELETE FROM games WHERE ctid IN (SELECT ctid FROM games WHERE game_id = $1 ORDER BY save_id DESC LIMIT $2)', [game_id, rollbackCount]);
    logForUndo(game_id, 'deleted', res?.rowCount, 'rows');
    const second = await this.getSaveIds(game_id);
    const difference = first.filter((x) => !second.includes(x));
    logForUndo(game_id, 'second', second);
    logForUndo(game_id, 'Rollback difference', difference);
  }

  public async storeParticipants(entry: GameIdLedger): Promise<void> {
    await this.client.query('INSERT INTO participants (game_id, participants) VALUES($1, $2)', [entry.gameId, entry.participantIds]);
  }

  public async getParticipants(): Promise<Array<{gameId: GameId, participantIds: Array<PlayerId | SpectatorId>}>> {
    const res = await this.client.query('select game_id, participants from participants');
    return res.rows.map((row) => {
      return {gameId: row.game_id as GameId, participantIds: row.participants as Array<PlayerId | SpectatorId>};
    });
  }
  saveUser(id: string, name: string, password: string, prop: string): void {
    // Insert user
    this.client.query('INSERT INTO users(id, name, password, prop) VALUES($1, $2, $3, $4)', [id, name, password, prop], function(err:any ) {
      if (err) {
        return console.error('saveUser' + id, err);
      }
    });
  }
  getUsers(cb: (err: any, allUsers: Array<User>) => void): void {
    const allUsers:Array<User> = [];
    const sql: string = 'SELECT distinct id, name, password, prop, createtime FROM users ';
    this.client.query(sql, [], (err, res) => {
      if (res && res.rows.length > 0) {
        res.rows.forEach((row) => {
          const user = Object.assign(new User('', '', ''), {id: row.id, name: row.name, password: row.password, createtime: row.createtime}, JSON.parse(row.prop) );
          if (user.donateNum === 0 && user.isvip() > 0) {
            user.donateNum = 1;
          }
          allUsers.push(user );
        });
        return cb(err, allUsers);
      }
      if (err) {
        return console.warn('getUsers', err);
      }
    });
  }

  public async stats(): Promise<{[key: string]: string | number}> {
    const map: {[key: string]: string | number}= {
      'type': 'POSTGRESQL',
      'pool-total-count': this.client.totalCount,
      'pool-idle-count': this.client.idleCount,
      'pool-waiting-count': this.client.waitingCount,
      'save-count': this.statistics.saveCount,
      'save-error-count': this.statistics.saveErrorCount,
      'save-conflict-normal-count': this.statistics.saveConflictNormalCount,
      'save-conflict-undo-count': this.statistics.saveConflictUndoCount,
    };

    // TODO(kberg): return row counts
    const result = await this.client.query(`
    SELECT
      pg_size_pretty(pg_total_relation_size('games')) as game_size,
      pg_size_pretty(pg_total_relation_size('game_results')) as game_result_size,
      pg_size_pretty(pg_total_relation_size('participants')) as participants_size,
      pg_size_pretty(pg_database_size($1)) as db_size
    `, [this.databaseName]);

    map['size-bytes-games'] = result.rows[0].game_size;
    map['size-bytes-game-results'] = result.rows[0].game_result_size;
    map['size-bytes-participants'] = result.rows[0].participants;
    map['size-bytes-database'] = result.rows[0].db_size;
    return map;
  }

  refresh(): void {

  }
}

function logForUndo(_gameId: string, ..._message: any[]) {
  // console.error(['TRACKING:', gameId, ...message]);
}
