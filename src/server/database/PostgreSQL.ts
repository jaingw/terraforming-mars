import pg from 'pg';
import {GameNotFoundError, IDatabase, IGameMetadata, UserNameExistsError} from './IDatabase';
import {IGame, Score} from '../IGame';
import {GameOptions} from '../game/GameOptions';
import {GameId, PlayerId} from '../../common/Types';
import {SerializedGame} from '../SerializedGame';
import {User} from '../User';
import {Timer} from '../../common/Timer';
import {stringToNumber} from './utils';
import {UserRank} from '../../common/rank/RankManager';
import {Color} from '../../common/Color';
import {toID} from '../../common/utils/utils';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
type StoredSerializedGame = Omit<SerializedGame, 'gameOptions' | 'gameLog'>;
// import {Rating} from 'ts-trueskill';

export const POSTGRESQL_TABLES = ['game', 'games', 'game_results'] as const;

const POSTGRES_TRIM_COUNT = stringToNumber(process.env.POSTGRES_TRIM_COUNT, 0);

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

export class PostgreSQL implements IDatabase {
  private databaseName: string | undefined = undefined; // Use this only for stats.
  protected trimCount = POSTGRES_TRIM_COUNT;

  protected statistics = {
    saveCount: 0,
    saveErrorCount: 0,
    saveConflictUndoCount: 0,
    saveConflictNormalCount: 0,
  };
  private _client: pg.Pool | undefined;

  protected get client(): pg.Pool {
    if (this._client === undefined) {
      throw new Error('attempt to get client before initialized');
    }
    return this._client;
  }

  private async transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.client.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('PostgreSQL:rollback failed', rollbackErr);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  constructor(
    private config: pg.ClientConfig = {
      connectionString: process.env.POSTGRES_HOST,
    }) {
    if (config.connectionString?.startsWith('postgres')) {
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
  }

  public async initialize(): Promise<void> {
    this._client = new pg.Pool(this.config);

    //  createtime timestamp 时间戳带毫秒  createtime timestamp(0) 去掉毫秒
    const sql = `
    CREATE TABLE IF NOT EXISTS games(
      game_id varchar,
      save_id integer,
      game text,
      status text default 'running',
      createtime timestamp(0) default now(),
      prop jsonb,
      PRIMARY KEY (game_id, save_id));

    /* A single game, storing the log and the options. Normalizing out some of the game state. */
    CREATE TABLE IF NOT EXISTS game(
      game_id varchar NOT NULL,
      log text NOT NULL,
      options text NOT NULL,
      participants varchar[],
      userids varchar[],
      prop jsonb,
      status text default 'running' NOT NULL,
      created_time timestamp default now() NOT NULL,
      updated_time timestamp default now() NOT NULL,
      PRIMARY KEY (game_id));

    CREATE TABLE IF NOT EXISTS game_results(
      game_id varchar not null,
      seed_game_id varchar,
      players integer,
      generations integer,
      game_options text,
      scores text,
      createtime timestamp(0) default now(),
      PRIMARY KEY (game_id));



    CREATE INDEX IF NOT EXISTS games_i1 on games(save_id);
    CREATE INDEX IF NOT EXISTS games_i2 on games(createtime);

    -- 异步索引创建不能在事务中运行
    -- CREATE INDEX CONCURRENTLY IF NOT EXISTS game_i1 on game(updated_time);
    -- CREATE INDEX CONCURRENTLY IF NOT EXISTS game_participants_i1 on game USING GIN (participants);
    -- CREATE INDEX CONCURRENTLY IF NOT EXISTS game_userids_i1 on game USING GIN (userids);
    -- CREATE INDEX CONCURRENTLY IF NOT EXISTS game_running_updated_time_idx ON game(updated_time) WHERE status = 'running';

    `;
    await this.client.query(sql);
    await this.client.query('CREATE TABLE IF NOT EXISTS users(id varchar not null, name varchar not null, password varchar not null, prop jsonb, createtime timestamp(0) default now(), PRIMARY KEY (id))');
    await this.client.query('CREATE UNIQUE INDEX IF NOT EXISTS users_name_lower_unique_idx ON users (lower(name))');

    // 天梯 新增`user_rank`表记录用户的排名
    await this.client.query('CREATE TABLE IF NOT EXISTS user_rank (id varchar not null, rank_value integer default 0, mu float4, sigma float4,trueskill float4, PRIMARY KEY (id))');
    // 天梯 玩家数据表，用于保存段位的历史记录，和未来的数据分析 TODO: 未来如果做分析的话加上index
    await this.client.query('CREATE TABLE IF NOT EXISTS user_game_results (user_id varchar not null, game_id varchar not null, players integer, generations integer, createtime timestamp(0) default now(), corporation text, position integer, player_score integer, rank_value integer, mu float4, sigma float4,trueskill float4, is_rank integer, phase text, is_timeout integer default 0, PRIMARY KEY (user_id, game_id))');
    // Migrate: add is_timeout column if missing (backward-compatible)
    await this.client.query('ALTER TABLE user_game_results ADD COLUMN IF NOT EXISTS is_timeout integer default 0').catch(() => {});

    // 赛季快照表：保存每个赛季结束时的用户排名快照
    await this.client.query(`CREATE TABLE IF NOT EXISTS user_rank_seasons (
      user_id varchar not null,
      season_id varchar not null,
      rank_value integer default 0,
      mu float4,
      sigma float4,
      trueskill float4,
      points_earned integer default 0,
      final_position integer,
      createtime timestamp(0) default now(),
      PRIMARY KEY (user_id, season_id))`);

    // 当前赛季信息表（只存储一个当前赛季）
    await this.client.query(`CREATE TABLE IF NOT EXISTS current_season (
      season_id varchar not null,
      season_name varchar,
      start_date timestamp(0) default now(),
      end_date timestamp(0))`);

    // 所有赛季元数据表
    await this.client.query(`CREATE TABLE IF NOT EXISTS seasons (
      season_id varchar not null PRIMARY KEY,
      season_name varchar,
      start_date timestamp(0),
      end_date timestamp(0))`);

    // 兼容性：为已有的 user_rank 表添加 points 和 season_id 列
    try {
      await this.client.query('ALTER TABLE user_rank ADD COLUMN IF NOT EXISTS points integer default 0');
      await this.client.query('ALTER TABLE user_rank ADD COLUMN IF NOT EXISTS season_id varchar');
    } catch (err) {
      console.warn('ALTER TABLE user_rank (may already exist):', err);
    }
  }

  public async getPlayerCount(gameId: GameId): Promise<number> {
    const sql = 'SELECT players FROM games WHERE save_id = 0 AND game_id = $1 LIMIT 1';

    const res = await this.client.query(sql, [gameId]);
    if (res.rows.length === 0) {
      throw new Error(`no rows found for game id ${gameId}`);
    }
    return res.rows[0].players;
  }

  // 游戏大厅只读 game 表上的轻量元数据，避免启动或列表接口加载完整存档。
  public async getGames(): Promise<Array<IGameMetadata>> {
    const res = await this.client.query('SELECT game_id, participants, userids, prop, updated_time FROM game ORDER BY updated_time DESC LIMIT 500');
    return res.rows.map((row) => ({
      gameId: row.game_id,
      participants: row.participants ?? [],
      userids: row.userids ?? [],
      shortData: typeof row.prop === 'string' && row.prop !== '' ? JSON.parse(row.prop) : (row.prop ?? undefined),
      updatedTime: row.updated_time,
    }));
  }

  // playerId/spectatorId 只对应一个当前游戏，返回单个 gameId 即可。
  public async getGameIdByParticipant(participantId: string): Promise<GameId | undefined> {
    const res = await this.client.query(
      'SELECT game_id FROM game WHERE participants @> ARRAY[$1]::varchar[] ORDER BY updated_time DESC LIMIT 1',
      [participantId],
    );
    return res.rows[0]?.game_id;
  }

  // 账号可能对应多个历史游戏，直接返回最近 N 条 metadata，避免 1 + N 查询。
  public async getGamesByUserId(userId: string, limit: number = 30): Promise<Array<IGameMetadata>> {
    const res = await this.client.query(
      `SELECT game_id, participants, userids, prop, updated_time
       FROM game
       WHERE userids @> ARRAY[$1]::varchar[]
       ORDER BY updated_time DESC
       LIMIT $2`,
      [normalizeUserId(userId), limit],
    );
    return res.rows.map((row) => ({
      gameId: row.game_id,
      participants: row.participants ?? [],
      userids: row.userids ?? [],
      shortData: typeof row.prop === 'string' && row.prop !== '' ? JSON.parse(row.prop) : (row.prop ?? undefined),
      updatedTime: row.updated_time,
    }));
  }

  private compose(game: string, log: string, options: string): SerializedGame {
    const stored: StoredSerializedGame = JSON.parse(game);
    // TODO(kberg): Remove the outer join, and the else of this conditional by 2025-01-01
    if (log !== null && options !== null) {
      const gameLog = JSON.parse(log);
      const gameOptions = JSON.parse(options);
      return {...stored, gameOptions, gameLog};
    } else {
      return stored as SerializedGame;
    }
  }

  public async getSaveIds(gameId: GameId): Promise<Array<number>> {
    const res = await this.client.query('SELECT DISTINCT save_id FROM games WHERE game_id = $1', [gameId]);
    const allSaveIds: Array<number> = [];
    res.rows.forEach((row) => {
      allSaveIds.push(row.save_id);
    });
    return Promise.resolve(allSaveIds);
  }

  public async getGame(gameId: GameId): Promise<SerializedGame> {
    // Retrieve last save from database
    const res = await this.client.query(
      `SELECT
        games.game as game,
        game.log as log,
        game.options as options
      FROM games
      LEFT JOIN game on game.game_id = games.game_id
      WHERE games.game_id = $1
      ORDER BY save_id DESC
      LIMIT 1`,
      [gameId],
    );
    if (res.rows.length === 0 || res.rows[0] === undefined) {
      throw new GameNotFoundError(gameId);
    }
    const row = res.rows[0];
    return this.compose(row.game, row.log, row.options);
  }

  async getGameVersion(gameId: GameId, saveId: number): Promise<SerializedGame> {
    const res = await this.client.query(
      `SELECT
        games.game as game,
        game.log as log,
        game.options as options
      FROM games
      LEFT JOIN game on game.game_id = games.game_id
      WHERE games.game_id = $1
      AND games.save_id = $2`,
      [gameId, saveId],
    );

    if (res.rowCount === 0) {
      throw new Error(`Game ${gameId} not found at save_id ${saveId}`);
    }
    const row = res.rows[0];
    return this.compose(row.game, row.log, row.options);
  }

  saveGameResults(gameId: GameId, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void {
    this.client.query('INSERT INTO game_results (game_id, seed_game_id, players, generations, game_options, scores) VALUES($1, $2, $3, $4, $5, $6)', [gameId, gameOptions.clonedGamedId, players, generations, JSON.stringify(gameOptions), JSON.stringify(scores)], (err) => {
      if (err) {
        console.error('PostgreSQL:saveGameResults', err);
        throw err;
      }
    });
  }

  async getMaxSaveId(gameId: GameId): Promise<number> {
    const res = await this.client.query('SELECT MAX(save_id) as save_id FROM games WHERE game_id = $1', [gameId]);
    return res.rows[0].save_id;
  }

  throwIf(err: any, condition: string) {
    if (err) {
      console.error('PostgreSQL', condition, err);
      throw err;
    }
  }

  async cleanGame(gameId: GameId): Promise<void> {
    const maxSaveId = await this.getMaxSaveId(gameId);
    console.log(`maxSaveId: ${maxSaveId}, game_id:${gameId}  `);
    // DELETE all saves except initial and last one
    await this.client.query('DELETE FROM games WHERE game_id = $1 AND save_id < $2 AND save_id > 0', [gameId, maxSaveId]);
    // Flag game as finished
    await this.client.query('UPDATE games SET status = \'finished\' WHERE game_id = $1', [gameId]);
    await this.client.query('UPDATE game SET status = \'finished\' WHERE game_id = $1', [gameId]);
    // Purge after setting the status as finished so it does not delete the game.
    // const delete3 = this.purgeUnfinishedGames();
    // await Promise.all([delete1, delete2]);
  }
  async markFinished(gameId: GameId): Promise<void> {
    const promise1 = this.client.query('UPDATE games SET status = \'finished\' WHERE game_id = $1', [gameId]);
    const promise3 = this.client.query('UPDATE game SET status = \'finished\' WHERE game_id = $1', [gameId]);
    await Promise.all([promise1, promise3]);
  }

  private async deleteGamesAndMetadata(client: pg.PoolClient, gameIds: ReadonlyArray<string>): Promise<number | null> {
    const deleteGamesResult = await client.query('DELETE FROM games WHERE game_id = ANY($1)', [gameIds]);
    await client.query('DELETE FROM game WHERE game_id = ANY($1)', [gameIds]);
    return deleteGamesResult.rowCount;
  }

  // 按 game 表状态清理早于 dayAgo 的未完结游戏。
  async purgeUnfinishedGames(dayAgo?: string): Promise<Array<GameId>> {
    if (dayAgo === undefined) {
      return [];
    }
    const selectResult = await this.client.query(
      `SELECT game_id
       FROM game
       WHERE status = 'running'
       AND updated_time < $1::timestamp
       ORDER BY updated_time ASC
       LIMIT 1000`,
      [dayAgo],
    );
    let gameIds = selectResult.rows.map((row) => row.game_id);
    if (gameIds.length > 1000) {
      console.log('Truncated purge to 1000 games.');
      gameIds = gameIds.slice(0, 1000);
    } else {
      console.log(`${gameIds.length} games to be purged.`);
    }

    if (gameIds.length > 0) {
      console.log(`cleanGame game   ${gameIds} .`);
      const deletedRows = await this.transaction((client) => this.deleteGamesAndMetadata(client, gameIds));
      console.log(`Purged ${deletedRows} rows from games`);
    }
    return gameIds;
  }

  cleanGameAllSaves(game_id: string): void {
    void this.transaction((client) => this.deleteGamesAndMetadata(client, [game_id])).catch((err) => {
      console.warn('cleanGame '+game_id, err);
    });
  }

  async cleanGameSave(game_id: string, save_id: number): Promise<void> {
    // DELETE one  save  by save id
    await this.client.query('DELETE FROM games WHERE game_id = $1 AND save_id = $2', [game_id, save_id], function(err: { message: any; }) {
      if (err) {
        return console.warn('cleanGameSave '+game_id, err);
      }
    });
  }
  async restoreGame(gameId: GameId, save_id: number, game: IGame, playId: string): Promise<IGame> {
    let serializedGame: SerializedGame;
    try {
      serializedGame = await this.getGameVersion(gameId, save_id);
    } catch (err) {
      console.error(`PostgreSQL:restoreGame save_id ${save_id} not found for game ${gameId} — rollback skipped: ${err}`);
      return game;
    }
    if (serializedGame === undefined) {
      console.error(`PostgreSQL:restoreGame Game not found ${gameId}`);
      return game;
    }
    if (serializedGame.lastSaveId !== save_id) {
      console.error(`PostgreSQL:restoreGame saveId not equal ${gameId} ${save_id} ${serializedGame.lastSaveId} `);
    }


    // Rebuild each objects
    const gamelog = game.gameLog;
    game.loadFromJSON(serializedGame, true);
    game.gameLog = gamelog;
    // 这里undoCount取得是数据库中的值+1，对于连续的 一动-撤回-一动-撤回， 只会计算一次，但是没啥影响
    game.undoCount ++;
    // 会员回退时 以当前时间开始计时， 避免计时算到上一个人头上
    if (playId === 'manager') {
      game.log('${0} undo turn', (b) => b.playerColor(playId as Color));
      Timer.newInstance().stop();
      game.activePlayer.timer.start();
    } else {
      game.log('${0} undo turn', (b) => b.player(game.getPlayerById(playId as PlayerId)));
    }
    console.log(`${playId} undo turn ${gameId}  ${save_id}`);
    return game;
  }


  async saveGame(game: IGame): Promise<void> {
    try {
      const serialized = game.serialize();
      const options = JSON.stringify(serialized.gameOptions);
      const log = JSON.stringify(serialized.gameLog);

      const storedSerialized: StoredSerializedGame = {...serialized};
      (storedSerialized as any).gameLog = [];
      (storedSerialized as any).gameOptions = {};
      const gameJSON = JSON.stringify(storedSerialized);
      const prop = game.toShortJSON();
      // participants/userids 分开存，分别服务 playerId 查询和账号维度列表查询。
      const participantIds = getParticipantIds(game);
      const userIds = getUserIds(game);
      this.statistics.saveCount++;
      const res = await this.transaction(async (client) => {
        // xmax = 0 is described at https://stackoverflow.com/questions/39058213/postgresql-upsert-differentiate-inserted-and-updated-rows-using-system-columns-x
        const saveResult = await client.query(
          `INSERT INTO games (game_id, save_id, game)
          VALUES ($1, $2, $3)
          ON CONFLICT (game_id, save_id) DO UPDATE SET game = $3
          RETURNING (xmax = 0) AS inserted`,
          [game.id, game.lastSaveId, gameJSON]);

        await client.query(
          `INSERT INTO game (game_id, log, options, participants, userids, prop, updated_time)
          VALUES ($1, $2, $3, $4, $5, $6, now())
          ON CONFLICT (game_id)
          DO UPDATE SET
            log = $2,
            participants = $4,
            userids = $5,
            prop = $6,
            updated_time = now()`,
          [game.id, log, options, participantIds, userIds, prop]);
        return saveResult;
      });


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
    } catch (err) {
      this.statistics.saveErrorCount++;
      console.error('PostgreSQL:saveGame' + game.id, err);
    }
    this.trim(game);
  }

  // 默认0 没有启用
  private async trim(game: IGame) {
    if (this.trimCount <= 0) {
      return;
    }
    if (game.lastSaveId % this.trimCount === 0) {
      const maxSaveId = game.lastSaveId - this.trimCount;
      await this.client.query(
        'DELETE FROM games WHERE game_id = $1 AND save_id > 0 AND save_id < $2', [game.id, maxSaveId]);
    }
    return Promise.resolve();
  }

  async deleteGameNbrSaves(gameId: GameId, rollbackCount: number): Promise<void> {
    if (rollbackCount <= 0) {
      console.error(`invalid rollback count for ${gameId}: ${rollbackCount}`);
      // Should this be an error?
      return;
    }
    await this.client.query('DELETE FROM games WHERE ctid IN (SELECT ctid FROM games WHERE game_id = $1 ORDER BY save_id DESC LIMIT $2)', [gameId, rollbackCount]);
  }

  async saveUser(id: string, name: string, password: string, prop: string): Promise<void> {
    try {
      await this.client.query('INSERT INTO users(id, name, password, prop) VALUES($1, $2, $3, $4)', [id, name, password, prop]);
    } catch (err) {
      const constraint = (err as {constraint?: string}).constraint;
      if (constraint === 'users_name_unique' || constraint === 'users_name_lower_unique_idx') {
        throw new UserNameExistsError(name);
      }
      throw err;
    }
  }

  updateUserProp(id: string, prop: string): void {
    this.client.query('UPDATE users SET prop = $1 WHERE id = $2', [prop, id], function(err: any) {
      if (err) {
        return console.error('PostgreSQL:updateUserProp', err);
      }
    });
  }
  getUsers(cb: (err: any, allUsers: Array<User>) => void): void {
    const allUsers:Array<User> = [];
    const sql: string = 'SELECT distinct id, name, password, prop, createtime FROM users ';
    this.client.query(sql, [], (err, res) => {
      if (err) {
        return console.warn('getUsers', err);
      }
      if (res && res.rows.length > 0) {
        res.rows.forEach((row) => {
          allUsers.push(deserializeUser(row));
        });
        return cb(err, allUsers);
      }
    });
  }

  // 按 userId 单查用户，供 GameLoader 懒加载使用，避免启动时全量加载 users。
  async getUser(id: string): Promise<User | undefined> {
    const res = await this.client.query('SELECT id, name, password, prop, createtime FROM users WHERE id = $1 LIMIT 1', [normalizeUserId(id)]);
    const row = res.rows[0];
    return row === undefined ? undefined : deserializeUser(row);
  }

  // 按用户名单查用户，供登录等路径懒加载使用。
  async getUserByName(name: string): Promise<User | undefined> {
    const res = await this.client.query('SELECT id, name, password, prop, createtime FROM users WHERE lower(name) = lower($1) LIMIT 1', [name]);
    const row = res.rows[0];
    return row === undefined ? undefined : deserializeUser(row);
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

    const columns = POSTGRESQL_TABLES.map((table_name) => `pg_size_pretty(pg_total_relation_size('${table_name}')) as ${table_name}_size`);
    const dbsizes = await this.client.query(`SELECT ${columns.join(', ')}, pg_size_pretty(pg_database_size('${this.databaseName}')) as db_size`);

    function varz(x: string) {
      return x.replaceAll('_', '-');
    }

    POSTGRESQL_TABLES.forEach((table) => map['size-bytes-' + varz(table)] = dbsizes.rows[0][table + '_size']);
    map['size-bytes-database'] = dbsizes.rows[0].db_size;

    // Using count(*) is inefficient, but the estimates from here
    // https://stackoverflow.com/questions/7943233/fast-way-to-discover-the-row-count-of-a-table-in-postgresql
    // seem wildly inaccurate.
    //
    // heroku pg:bloat --app terraforming-mars
    // shows some bloat
    // and the postgres command
    // VACUUM (VERBOSE) shows a fairly reasonable vacumm (no rows locked, for instance),
    // so it's not clear why those wrong. But these select count(*) commands seem pretty quick
    // in testing. :fingers-crossed:
    for (const table of POSTGRESQL_TABLES) {
      const result = await this.client.query('select count(*) as rowcount from ' + table);
      map['rows-' + varz(table)] = result.rows[0].rowcount;
    }
    return map;
  }

  refresh(): void {

  }

  addUserRank(userRank: UserRank): void {
    // Insert user
    this.client.query('INSERT INTO user_rank(id, rank_value, mu, sigma, trueskill, points, season_id) VALUES($1, $2, $3, $4, $5, $6, $7)', [userRank.userId, userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill, userRank.points || 0, userRank.seasonId || ''], function(err: { message: any; }) {
      if (err) {
        return console.error('addUserRank', userRank, err);
      }
    });
  }

  // 按 userId 单查排名，避免启动时全量加载 user_rank。
  public async getUserRank(userId: string): Promise<UserRank | undefined> {
    const res = await this.client.query('SELECT id, rank_value, mu, sigma, trueskill, points, season_id FROM user_rank WHERE id = $1 LIMIT 1', [normalizeUserId(userId)]);
    const row = res.rows[0];
    if (row === undefined) {
      return undefined;
    }
    return new UserRank(row.id, row.rank_value, row.mu, row.sigma, row.trueskill, row.points || 0, row.season_id || '');
  }

  public async getUserRanks(limit:number | undefined = 0, seasonId?: string): Promise<Array<UserRank>> {
    const params: Array<number | string> = [];
    let sql = ` SELECT user_rank.id, COALESCE(users.name, 'Unknown') AS user_name, rank_value, mu, sigma, trueskill, points, season_id
                FROM user_rank
                LEFT JOIN users ON users.id = user_rank.id `;
    if (seasonId !== undefined && seasonId !== '') {
      params.push(seasonId);
      sql += ` WHERE user_rank.season_id = $${params.length} `;
    }
    sql += ' order by user_rank.rank_value desc,user_rank.trueskill desc ';
    if (limit !== 0) {
      params.push(limit);
      sql += ` limit $${params.length}`;
    }
    const allUserRanks : Array<UserRank> = [];
    const res = await this.client.query(sql, params);
    res.rows.forEach((row: any) => {
      const userRank = new UserRank(row.id, row.rank_value, row.mu, row.sigma, row.trueskill, row.points || 0, row.season_id || '', row.user_name);
      allUserRanks.push(userRank);
    });
    return allUserRanks;
  }

  public async updateUserRank(userRank:UserRank): Promise<void> {
    await this.client.query('UPDATE user_rank SET rank_value = $1, mu = $2, sigma = $3, trueskill = $4, points = $5, season_id = $6 WHERE id = $7', [userRank.rankValue, userRank.mu, userRank.sigma, userRank.trueskill, userRank.points || 0, userRank.seasonId || '', userRank.userId]);
  }

  // @param position: 这局游戏第几名
  saveUserGameResult(user_id: string, game_id: string, phase: string, score: Score, players: number, generations: number, create_time: string, position: number, is_rank: boolean, user_rank: UserRank | undefined, is_timeout: boolean = false): void {
    const sql: string = user_rank !== undefined ?
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, rank_value, mu, sigma,trueskill, is_rank, phase, is_timeout) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)' :
      'INSERT INTO user_game_results (user_id, game_id, players, generations, createtime, corporation, position, player_score, is_rank, phase, is_timeout) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const params: any = user_rank !== undefined ?
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, user_rank.rankValue, user_rank.mu, user_rank.sigma, user_rank.trueskill, is_rank?1:0, phase, is_timeout?1:0] :
      [user_id, game_id, players, generations, create_time, score.corporation, position, score.playerScore, is_rank?1:0, phase, is_timeout?1:0];

    this.client.query(sql, params, (err) => {
      if (err) {
        console.error('saveUserGameResult', err, params);
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
      WHERE user_id = $1 ${dateFilter}
    `;

    const allTimeResult = await this.client.query(buildStatsQuery(''), [userId]);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentResult = await this.client.query(
      buildStatsQuery('AND createtime >= $2'),
      [userId, threeMonthsAgo.toISOString()],
    );

    const mapRow = (row: any): import('./IDatabase').IUserGameStatsBlock => {
      const totalGames = parseInt(row.total_games) || 0;
      const nonTimeoutGames = parseInt(row.non_timeout_games) || 0;
      const wins = parseInt(row.wins) || 0;
      const fleeCount = parseInt(row.flee_count) || 0;
      return {
        totalGames,
        wins,
        losses: parseInt(row.losses) || 0,
        winRate: nonTimeoutGames > 0 ? Math.round((wins / nonTimeoutGames) * 10000) / 100 : 0,
        fleeCount,
        fleeRate: totalGames > 0 ? Math.round((fleeCount / totalGames) * 10000) / 100 : 0,
        avgScore: Math.round(parseFloat(row.avg_score) * 100) / 100,
        avgPosition: Math.round(parseFloat(row.avg_position) * 100) / 100,
        totalRankGames: parseInt(row.total_rank_games) || 0,
        rankWins: parseInt(row.rank_wins) || 0,
      };
    };

    return {
      allTime: mapRow(allTimeResult.rows[0]),
      recent3Months: mapRow(recentResult.rows[0]),
    };
  }

  // 赛季相关方法
  public async saveUserRankSeasonSnapshot(userId: string, seasonId: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number): Promise<void> {
    await this.client.query(
      `INSERT INTO user_rank_seasons (user_id, season_id, rank_value, mu, sigma, trueskill, points_earned, final_position)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, season_id) DO NOTHING`,
      [userId, seasonId, rankValue, mu, sigma, trueskill, pointsEarned, finalPosition],
    );
  }

  public async getUserRankSeasonSnapshots(seasonId: string, limit?: number): Promise<Array<{userId: string, userName: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number}>> {
    const params: Array<string | number> = [seasonId];
    let sql = `SELECT user_rank_seasons.user_id, COALESCE(users.name, 'Unknown') AS user_name, rank_value, mu, sigma, trueskill, points_earned, final_position
               FROM user_rank_seasons
               LEFT JOIN users ON users.id = user_rank_seasons.user_id
               WHERE season_id = $1
               ORDER BY final_position ASC`;
    if (limit !== undefined && limit > 0) {
      params.push(limit);
      sql += ' LIMIT $2';
    }
    const result = await this.client.query(sql, params);
    return result.rows.map((row: any) => ({
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
    const result = await this.client.query('SELECT DISTINCT season_id FROM user_rank_seasons ORDER BY season_id DESC', []);
    return result.rows.map((row: any) => row.season_id);
  }

  public async updateUserPoints(userId: string, points: number): Promise<void> {
    await this.client.query('UPDATE user_rank SET points = $1 WHERE id = $2', [points, userId]);
  }

  public async setCurrentSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void> {
    // 先删除旧记录，再插入新记录（确保只有一条当前赛季记录）
    await this.client.query('DELETE FROM current_season');
    await this.client.query(
      'INSERT INTO current_season (season_id, season_name, start_date, end_date) VALUES ($1, $2, $3, $4)',
      [seasonId, seasonName, startDate.toISOString(), endDate.toISOString()],
    );
  }

  public async getCurrentSeason(): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined> {
    const result = await this.client.query('SELECT season_id, season_name, start_date, end_date FROM current_season', []);
    if (result.rows.length === 0) {
      return undefined;
    }
    const row = result.rows[0];
    return {
      seasonId: row.season_id,
      seasonName: row.season_name,
      startDate: row.start_date,
      endDate: row.end_date,
    };
  }

  public async saveSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void> {
    await this.client.query(
      `INSERT INTO seasons (season_id, season_name, start_date, end_date) VALUES ($1, $2, $3, $4)
       ON CONFLICT(season_id) DO UPDATE SET season_name = EXCLUDED.season_name, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date`,
      [seasonId, seasonName, startDate.toISOString(), endDate.toISOString()],
    );
  }

  public async getSeason(seasonId: string): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined> {
    const result = await this.client.query('SELECT season_id, season_name, start_date, end_date FROM seasons WHERE season_id = $1', [seasonId]);
    if (result.rows.length === 0) {
      return undefined;
    }
    const row = result.rows[0];
    return {
      seasonId: row.season_id,
      seasonName: row.season_name,
      startDate: row.start_date,
      endDate: row.end_date,
    };
  }
}
