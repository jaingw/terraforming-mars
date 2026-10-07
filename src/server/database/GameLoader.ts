
import {Database} from './Database';
import {Game} from '../Game';
import {Player} from '../Player';
import {User} from '../User';
import {IGameLoader, State} from './IGameLoader';
import {UserRank} from '../../common/rank/RankManager';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
import {IGame} from '../IGame';
// import {Cache} from './Cache';
// import {timeAsync} from '../utils/timer';
import {IPlayer} from '../IPlayer';
import {GameId} from '../../common/Types';
import {GameNotFoundError} from './IDatabase';


/**
 * Loads games from javascript memory or database
 * Loads games from database sequentially as needed
 */
export class GameLoader implements IGameLoader {
  public state: State = State.WAITING;
  private readonly games = new Map<string, IGame>();
  private readonly playerToGame = new Map<string, IGame>();
  private readonly userIdMap: Map<string, User> = new Map<string, User>();
  private readonly userNameMap: Map<string, User> = new Map<string, User>();

  // 天梯，id到`UserRank`的映射表
  private readonly userRankMap: Map<string, UserRank> = new Map<string, UserRank>();

  private readonly missingGameIds = new Map<string, number>();
  private readonly missingParticipantIds = new Map<string, number>();
  private readonly missingUserIds = new Map<string, number>();
  private readonly missingUserNames = new Map<string, number>();
  private readonly missingUserRankIds = new Map<string, number>();
  private readonly lastAccessedAt = new Map<string, number>();
  private readonly loadingGames = new Map<GameId, Promise<IGame | undefined>>();

  private static readonly MISS_TTL_MS = 24 * 60 * 60 * 1000; // 24小时
  private static readonly LOADED_GAME_TTL_MS = 12 * 60 * 60 * 1000; // 12小时

  private static instance: GameLoader | undefined;


  public reset(): void {
    GameLoader.instance = undefined;
    GameLoader.getInstance().start(() => {
    });
  }

  private constructor( ) {
  }

  public static getInstance(): GameLoader {
    if (!GameLoader.instance) {
      GameLoader.instance = new GameLoader();
      const userNameMap = GameLoader.instance.userNameMap;
      // 统一转换成小写，以忽略大小写限制
      const getfunc = userNameMap.get;
      userNameMap.get = function(key: string) {
        if (key === undefined || key === '') {
          return undefined;
        }
        key = key.toLowerCase();
        return getfunc.apply(this, [key]);
      };

      const userIdMap = GameLoader.instance.userIdMap;
      // id截取前12位
      const idgetfunc = userIdMap.get;
      userIdMap.get = function(key: string) {
        if (key === undefined || key === '') {
          return undefined;
        }
        return idgetfunc.apply(this, [normalizeUserId(key)]);
      };

      const userRankMap = GameLoader.instance.userRankMap;
      // id截取前12位
      const rankgetfunc = userRankMap.get;
      userRankMap.get = function(key: string) {
        if (key === undefined || key === '') {
          return undefined;
        }
        return rankgetfunc.apply(this, [normalizeUserId(key)]);
      };
    }
    return GameLoader.instance;
  }

  public static getUserByPlayer(player: IPlayer): User | undefined {
    let user = undefined;
    if (player.userId !== undefined) {
      user = GameLoader.getInstance().userIdMap.get(player.userId);
    }
    if (user === undefined) {
      user = GameLoader.getInstance().userNameMap.get(player.name);
    }
    return user;
  }

  // 按 userId 懒加载单个用户；查不到时写入 miss map，避免重复打数据库。
  public async getUserById(userId: string): Promise<User | undefined> {
    const normalizedUserId = normalizeUserId(userId);
    const cachedUser = this.userIdMap.get(normalizedUserId);
    if (cachedUser !== undefined) {
      return cachedUser;
    }
    if (this.isMissing(this.missingUserIds, normalizedUserId)) {
      return undefined;
    }
    const user = await Database.getInstance().getUser(normalizedUserId);
    if (user === undefined) {
      this.markMissing(this.missingUserIds, normalizedUserId);
      return undefined;
    }
    this.cacheUser(user);
    return user;
  }

  // 按用户名懒加载单个用户，用户名统一小写后参与缓存和 miss 判断。
  public async getUserByName(name: string): Promise<User | undefined> {
    const normalizedName = name.trim().toLowerCase();
    const cachedUser = this.userNameMap.get(normalizedName);
    if (cachedUser !== undefined) {
      return cachedUser;
    }
    if (this.isMissing(this.missingUserNames, normalizedName)) {
      return undefined;
    }
    const user = await Database.getInstance().getUserByName(normalizedName);
    if (user === undefined) {
      this.markMissing(this.missingUserNames, normalizedName);
      return undefined;
    }
    this.cacheUser(user);
    return user;
  }

  // 按 userId 懒加载用户排名，避免启动时全量加载 user_rank。
  public async getUserRankById(userId: string): Promise<UserRank | undefined> {
    const normalizedUserId = normalizeUserId(userId);
    const cachedUserRank = this.userRankMap.get(normalizedUserId);
    if (cachedUserRank !== undefined) {
      return cachedUserRank;
    }
    if (this.isMissing(this.missingUserRankIds, normalizedUserId)) {
      return undefined;
    }
    const userRank = await Database.getInstance().getUserRank(normalizedUserId);
    if (userRank === undefined) {
      this.markMissing(this.missingUserRankIds, normalizedUserId);
      return undefined;
    }
    this.addOrUpdateUserRank(userRank);
    return userRank;
  }

  public static getLoadedGameCount(): number {
    return GameLoader.getInstance().games.size;
  }

  // 只查询内存中的游戏，不触发数据库加载。
  public getLoadedGame(id: string): IGame | undefined {
    return this.games.get(id);
  }

  // 返回快照，避免外部直接修改排名缓存。
  public getCachedUserRanks(): ReadonlyArray<UserRank> {
    return Array.from(this.userRankMap.values());
  }

  // 预热给定玩家的天梯缓存：命中缓存为 O(1)，未命中才查库。
  // 展示层 ServerModel 是同步的，构建玩家模型前需先调用本方法，
  // 否则 rankValue/rankTier 会因缓存未命中而显示为 -1/undefined。
  public async ensureUserRanksLoaded(players: ReadonlyArray<IPlayer>): Promise<void> {
    await Promise.all(players.map(async (player) => {
      if (player.userId !== undefined) {
        await this.getUserRankById(player.userId);
      }
    }));
  }

  public start(cb = () => { }): void {
    switch (this.state) {
    case State.READY:
      console.warn('already loaded, ignoring');
      return;
    case State.LOADING:
      console.warn('already loading, ignoring');
      return;
    case State.WAITING:
      this.loadAllGames(cb);
    }
  }

  public add(game: IGame): void {
    this.games.set(game.id, game);
    // 每次进入内存都刷新访问时间，供 12 小时未访问清理使用。
    this.lastAccessedAt.set(game.id, Date.now());
    this.missingGameIds.delete(game.id);
    if (game.spectatorId !== undefined) {
      this.playerToGame.set(game.spectatorId, game);
      this.missingParticipantIds.delete(game.spectatorId);
    }
    for (const player of game.getAllPlayers()) {
      this.playerToGame.set(player.id, game);
      this.missingParticipantIds.delete(player.id);
    }
  }

  // 缓存懒加载得到的用户，并清掉对应 miss 标记，便于后续访问直接命中内存。
  public cacheUser(user: User): void {
    this.userIdMap.set(user.id, user);
    this.userNameMap.set(user.name.trim().toLowerCase(), user);
    this.missingUserIds.delete(user.id);
    this.missingUserNames.delete(user.name.trim().toLowerCase());
  }

  // 只读取内存里的用户缓存，不触发数据库懒加载，供同步建模逻辑使用。
  public getCachedUserById(userId: string): User | undefined {
    return this.userIdMap.get(userId);
  }

  // 用户被删除或改名时，从内存缓存移除旧索引，避免旧名称/ID 继续命中。
  public removeUserFromCache(user: User): void {
    this.userIdMap.delete(user.id);
    this.userIdMap.delete(normalizeUserId(user.id));
    this.userNameMap.delete(user.name.trim().toLowerCase());
  }


  // 按 gameId 获取游戏：先查内存，miss map 命中则直接返回，否则直接加载完整 games 存档。
  public async getGame(id: string): Promise<IGame | undefined> {
    if (this.state !== State.READY) {
      return undefined;
    }
    const loadedGame = this.games.get(id);
    if (loadedGame !== undefined) {
      // 访问命中时刷新 lastAccessedAt，防止活跃游戏被定时清理。
      this.lastAccessedAt.set(loadedGame.id, Date.now());
      return loadedGame;
    }

    if (this.isMissing(this.missingGameIds, id)) {
      // 不存在的 gameId 每天统一清理 miss map 前不再重复查库。
      return undefined;
    }

    const gameId = id as GameId;
    //同一 gameId 的并发请求共享加载 Promise
    const pendingLoad = this.loadingGames.get(gameId);
    if (pendingLoad !== undefined) {
      return await pendingLoad;
    }

    const load = this.loadFullGame(gameId);
    this.loadingGames.set(gameId, load);
    try {
      return await load;
    } finally {
      if (this.loadingGames.get(gameId) === load) {
        this.loadingGames.delete(gameId);
      }
    }
  }

  // 按 playerId/spectatorId 找游戏；userId 查询已经拆到 getGamesByUserId，不走这里。
  public async getByPlayerId(playerId: string): Promise<IGame | undefined> {
    if (this.state !== State.READY) {
      return undefined;
    }
    const loadedGame = this.playerToGame.get(playerId);
    if (loadedGame !== undefined) {
      if (!this.games.has(loadedGame.id)) {
        this.playerToGame.delete(playerId);
        return undefined;
      }
      // 访问命中时刷新 lastAccessedAt，防止活跃游戏被定时清理。
      this.lastAccessedAt.set(loadedGame.id, Date.now());
      return loadedGame;
    }

    if (this.isMissing(this.missingParticipantIds, playerId)) {
      return undefined;
    }

    const gameId = await Database.getInstance().getGameIdByParticipant(playerId);
    if (gameId === undefined) {
      // playerId 查不到游戏时记 miss，避免同一不存在玩家反复查库。
      this.markMissing(this.missingParticipantIds, playerId);
      return undefined;
    }

    const game = await this.getGame(gameId);
    if (game === undefined) {
      this.markMissing(this.missingParticipantIds, playerId);
    } else {
      this.missingParticipantIds.delete(playerId);
    }
    return game;
  }

  // 直接从 games 表加载完整存档；不再先查 metadata，也不放 HALFLOADED 占位对象。
  private async loadFullGame(gameId: GameId): Promise<IGame | undefined> {
    try {
      console.log(`loadFullGame ${gameId}`);
      const serializedGame = await Database.getInstance().getGame(gameId);
      if ( serializedGame === undefined) {
        console.error(`unable to load  game ${gameId}`);
        this.markMissing(this.missingGameIds, gameId);
        return undefined;
      } else {
        // loadFromJSON 是实例方法，所以先构造空 game，成功后再一次性写入内存 map。
        const game = this.createEmptyGame(gameId);
        game.loadFromJSON(serializedGame, true);
        this.onGameLoaded(game);
        return game;
      }
    } catch (err) {
      if (err instanceof GameNotFoundError) {
        console.warn(`game ${gameId} not found in database`);
        this.markMissing(this.missingGameIds, gameId);
        return undefined;
      }
      throw err;
    }
  }

  // 完整游戏加载成功后统一建立 game/player/user 映射；失败时清理残留映射。
  private onGameLoaded(game: IGame, err: boolean = false): void {
    const gameId = game.id;
    console.log(`load game ${gameId}  result:${err ? 'failed' : 'success'}`);
    if (err) {
      // 加载失败，从所有映射中移除
      this.games.delete(gameId);
      this.lastAccessedAt.delete(gameId);
      for (const player of game.getAllPlayers()) {
        this.playerToGame.delete(player.id);
      }
    } else {
      this.games.set(game.id, game);
      // 成功加载才刷新访问时间和移除 miss 标记。
      this.lastAccessedAt.set(game.id, Date.now());
      this.missingGameIds.delete(game.id);
      if (game.spectatorId !== undefined) {
        this.playerToGame.set(game.spectatorId, game);
        this.missingParticipantIds.delete(game.spectatorId);
      }
      for (const player of game.getAllPlayers()) {
        this.playerToGame.set(player.id, game);
        this.missingParticipantIds.delete(player.id);
      }
    }
  }


  // 数据库初始化完成即可进入 READY；启动阶段不再全量加载 games/users/user_rank。
  private onAllGamesLoaded(): void {
    this.state = State.READY;
  }

  // 启动只初始化数据库连接和表结构，具体游戏等首次访问时再懒加载。
  private async loadAllGames(cb = () => { }): Promise<void> {
    this.state = State.LOADING;
    await Database.getInstance().initialize();
    this.onAllGamesLoaded();
    cb();
  }

  // 为 loadFromJSON 提供最小可重建对象；对象不会以半加载状态写入内存。
  private createEmptyGame(gameId: GameId): IGame {
    const player = new Player('test', 'blue', false, 0, 'p000');
    const player2 = new Player('test2', 'red', false, 0, 'p111');
    const game = Game.rebuild(gameId, [player, player2], player);
    return game;
  }

  // 记录数据库 miss 的时间戳，实际过期删除只在每日凌晨统一清理。
  private markMissing(cache: Map<string, number>, id: string): void {
    cache.set(id, Date.now());
  }

  // 访问时只判断是否命中 miss map，不在这里做过期清理。
  private isMissing(cache: Map<string, number>, id: string): boolean {
    return cache.has(id);
  }

  public cleanupExpiredMisses(): void {
    const now = Date.now();
    for (const [id, missingAt] of this.missingGameIds) {
      if (now - missingAt >= GameLoader.MISS_TTL_MS) {
        this.missingGameIds.delete(id);
      }
    }
    for (const [id, missingAt] of this.missingParticipantIds) {
      if (now - missingAt >= GameLoader.MISS_TTL_MS) {
        this.missingParticipantIds.delete(id);
      }
    }
    for (const [id, missingAt] of this.missingUserIds) {
      if (now - missingAt >= GameLoader.MISS_TTL_MS) {
        this.missingUserIds.delete(id);
      }
    }
    for (const [id, missingAt] of this.missingUserNames) {
      if (now - missingAt >= GameLoader.MISS_TTL_MS) {
        this.missingUserNames.delete(id);
      }
    }
    for (const [id, missingAt] of this.missingUserRankIds) {
      if (now - missingAt >= GameLoader.MISS_TTL_MS) {
        this.missingUserRankIds.delete(id);
      }
    }
  }

  // 定时清理长时间未访问的完整游戏，只移除内存对象，不删除数据库数据。
  public cleanupExpiredLoadedGames(): void {
    const now = Date.now();
    for (const [gameId, accessedAt] of this.lastAccessedAt) {
      const game = this.games.get(gameId);
      if (game === undefined) {
        this.lastAccessedAt.delete(gameId);
        continue;
      }
      if ( now - accessedAt >= GameLoader.LOADED_GAME_TTL_MS) {
        this.removeGameFromMemory(game);
      }
    }
  }

  // 从所有内存索引里移除游戏，确保 game/player/user 映射不会留下悬挂引用。
  public removeGameFromMemory(game: IGame): void {
    this.games.delete(game.id);
    this.lastAccessedAt.delete(game.id);
    if (game.spectatorId !== undefined) {
      this.playerToGame.delete(game.spectatorId);
    }
    for (const player of game.getAllPlayers()) {
      this.playerToGame.delete(player.id);
    }
  }


  public saveGame(game: IGame): Promise<void> {
    return Database.getInstance().saveGame(game);
  }


  // 天梯
  public static getUserRankByPlayer(player: IPlayer): UserRank | undefined {
    const user = this.getUserByPlayer(player);
    let userRank = undefined;
    if (user !== undefined) {
      userRank = GameLoader.getInstance().userRankMap.get(user.id);
    }
    return userRank;
  }

  // 天梯，新增/更新 UserRank 到 GameLoader。
  // onlyIfCached=true 时只刷新已在缓存中的用户、不新增，避免把懒加载缓存撑成全量。
  public addOrUpdateUserRank(userRank: UserRank, onlyIfCached = false): void {
    const key = normalizeUserId(userRank.userId);
    if (onlyIfCached && !this.userRankMap.has(key)) {
      return;
    }
    // 键需与 userRankMap.get 的规范化保持一致，否则按规范化 id 取不到回填的排名。
    this.userRankMap.set(key, userRank);
  }
}
