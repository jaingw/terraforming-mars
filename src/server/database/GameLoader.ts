
import {Color} from '../../common/Color';
// import * as prometheus from 'prom-client';
import {Database} from './Database';
import {Game, LoadState} from '../Game';
import {Player} from '../Player';
import {GameId, ParticipantId} from '../../common/Types';
import {User} from '../User';
import {IGameLoader, State} from './IGameLoader';
import {GameIdLedger, IGameShortData} from './IDatabase';
import {UserRank} from '../../common/rank/RankManager';
import {IGame} from '../IGame';
// import {Cache} from './Cache';
// import {timeAsync} from '../utils/timer';
import {CacheConfig} from './CacheConfig';
import {Clock} from '../../common/Timer';
import {IPlayer} from '../IPlayer';
import {durationToMilliseconds} from '../utils/durations';

type LoadCallback = (game: IGame | undefined) => void;

// const metrics = {
//   initialize: new prometheus.Gauge({
//     name: 'gameloader_initialize',
//     help: 'Time to load all games',
//     registers: [prometheus.register],
//   }),
//   evictions: new prometheus.Counter({
//     name: 'gameloader_evictions',
//     help: 'Game evictions count',
//     registers: [prometheus.register],
//   }),
// };

/**
 * Loads games from javascript memory or database
 * Loads games from database sequentially as needed
 */
export class GameLoader implements IGameLoader {
  public state: State = State.WAITING;
  public readonly games = new Map<string, IGame>();
  private readonly pendingGame = new Map<string, Array<LoadCallback>>();
  private readonly pendingPlayer = new Map<string, Array<LoadCallback>>();
  public readonly playerToGame = new Map<string, IGame>();
  public readonly userIdMap: Map<string, User> = new Map<string, User>();
  public readonly userNameMap: Map<string, User> = new Map<string, User>();
  public readonly usersToGames: Map<string, Set<string>> = new Map<string, Set<string>>();

  // 天梯，id到`UserRank`的映射表
  public readonly userRankMap: Map<string, UserRank> = new Map<string, UserRank>();
  // 以前的game没存shortData, 通过allGameIds读取全部数据
  public allGameIds: Array<GameId> = [];

  private static instance?: GameLoader;

  // private cache: Cache;
  // private readonly config: CacheConfig;
  // private readonly clock: Clock;
  private purgedGames: Array<GameId>;

  public reset(): void {
    GameLoader.instance = undefined;
    GameLoader.getInstance().start(() => {
    });
  }

  private constructor(_config: CacheConfig, _clock: Clock) {
    // this.config = config;
    // this.clock = clock;
    // this.cache = new Cache(config, clock);
    this.purgedGames = [];
    // timeAsync(this.cache.load())
    //   .then((v) => {
    //     metrics.initialize.set(v.duration);
    //   });
  }

  public static getInstance(): GameLoader {
    if (GameLoader.instance === undefined) {
      const config = parseConfigString(process.env.GAME_CACHE ?? '');
      GameLoader.instance = new GameLoader(config, new Clock());
      const userNameMap = GameLoader.instance.userNameMap;
      // 统一转换成小写，以忽略大小写限制
      const getfunc = userNameMap.get;
      const obj = {
        _getfunc: function _getfunc(key: string) {
          if (key === undefined || key === '') {
            return undefined;
          }
          key = key.toLowerCase();
          return getfunc.apply(this, [key]);
        },
      };
      userNameMap.get = obj._getfunc;
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
    for (const player of game.getAllPlayers()) {
      this.playerToGame.set(player.id, game);
      const user = GameLoader.getUserByPlayer(player);
      if (user !== undefined) {
        if (this.usersToGames.get(user.id) === undefined) {
          this.usersToGames.set(user.id, new Set());
        }
        this.usersToGames.get(user.id)?.add(game.id);
      }
    }
  }

  // READY是已读取gameid, 可以处理请求， 否则直接返回空
  public getGameById(gameId: string, cb: LoadCallback): void {
    if (this.state === State.READY ) {
      const game = this.games.get(gameId);
      if (game === undefined) {
        cb(undefined);
        return;
      }
      if (game.loadState === LoadState.LOADED) {
        cb(game);
        return;
      }
      if (game.loadState === LoadState.HALFLOADED) {
        game.loadState = LoadState.LOADING;
        this.loadFullGame(game);
      }

      // LOADING 等待读库回调
      const pendingGame = this.pendingGame.get(gameId);
      if (pendingGame !== undefined) {
        pendingGame.push(cb);
      } else {
        this.pendingGame.set(gameId, [cb]);
      }
    } else {
      cb(undefined);
    }
  }

  public getByParticipantId(playerId: ParticipantId ): Promise<IGame | undefined> {
    return this.getByPlayerId(playerId);
  }

  public getByPlayerId(playerId: string): Promise<IGame | undefined> {
    return new Promise((resolve) => {
      if (this.state === State.READY && this.playerToGame.has(playerId)) {
        const game: any = this.playerToGame.get(playerId);
        if (this.games.get(game.id) === undefined) {
          this.playerToGame.delete(game.id);
          resolve(game);
          return;
        }
        if (game.loadState === LoadState.LOADED) {
          resolve(game);
          return;
        }
        if (game.loadState !== LoadState.LOADING) {
          game.loadState === LoadState.LOADING;
          this.loadFullGame(game);
        }

        // LOADING 等待读库回调
        const pendingPlayer = this.pendingPlayer.get(playerId);
        if (pendingPlayer !== undefined) {
          pendingPlayer.push(resolve);
        } else {
          this.pendingPlayer.set(playerId, [resolve]);
        }
      } else {
        resolve(undefined);
      }

      // reject(new Error(`unknown error loadign player count for ${gameId}`));
    });
  }

  private async loadFullGame(game: IGame): Promise<void> {
    console.log('game phase', game.phase); // 天梯 TEST
    const gameId = game.id;
    try {
      console.log(`loadFullGame ${gameId}`);
      const serializedGame = await Database.getInstance().getGame(gameId);
      if ( serializedGame === undefined) {
        console.error(`unable to load  game ${gameId}`);
        this.onGameLoaded(game, true);
      } else {
        game.loadFromJSON(serializedGame, true);
        this.onGameLoaded(game);
      }
    } catch (err) {
      console.error(`unable to load  game ${gameId}`, err);
      this.onGameLoaded(game, true);
      return undefined;
    }
  }

  private onGameLoaded(game: IGame, err: boolean = false): void {
    const gameId = game.id;
    console.log(`load game ${gameId}`);
    if (err) {
      // 加载失败 移除game_id相关数据
      this.games.delete(gameId);
      for (const player of game.getAllPlayers()) {
        this.playerToGame.delete(player.id);
        const user = GameLoader.getUserByPlayer(player);
        if (user !== undefined) {
          this.usersToGames.get(user.id)?.delete(game.id);
        }
      }
    } else {
      this.games.set(game.id, game);
      if (game.spectatorId !== undefined) {
        this.playerToGame.set(game.spectatorId, game);
      }
      for (const player of game.getAllPlayers()) {
        this.playerToGame.set(player.id, game);
        const user = GameLoader.getUserByPlayer(player);
        if (user !== undefined) {
          this.usersToGames.get(user.id)?.add(game.id);
        }
      }
    }
  }

  // public async getIds(): Promise<Array<GameIdLedger>> {
  //   const d = await this.cache.getGames();
  //   const map = new MultiMap<GameId, ParticipantId>();
  //   d.participantIds.forEach((gameId, participantId) => map.set(gameId, participantId));
  //   const arry: Array<[GameId, Array<PlayerId | SpectatorId>]> = Array.from(map.associations());
  //   return arry.map(([gameId, participantIds]) => ({gameId, participantIds}));
  // }

  // public async isCached(gameId: GameId): Promise<boolean> {
  //   const d = await this.cache.getGames();
  //   return d.games.get(gameId) !== undefined;
  // }

  // public async getGame(id: GameId | PlayerId | SpectatorId, forceLoad: boolean = false): Promise<IGame | undefined> {
  //   const d = await this.cache.getGames();
  //   const gameId = isGameId(id) ? id : d.participantIds.get(id);
  //   if (gameId === undefined) return undefined;

  //   // 1. Check the cache as long as forceLoad isn't true.
  //   if (forceLoad === false && d.games.get(gameId) !== undefined) return d.games.get(gameId);

  //   // 2. The game isn't cached. If it's in the database, there will still be an entry
  //   // for it in the cache.
  //   if (d.games.has(gameId)) {
  //     try {
  //       const serializedGame = await Database.getInstance().getGame(gameId);
  //       if (serializedGame === undefined) {
  //         console.error(`GameLoader:loadGame: game ${gameId} not found`);
  //         return undefined;
  //       }
  //       const game = Game.deserialize(serializedGame);
  //       await this.add(game);
  //       console.log(`GameLoader loaded game ${gameId} into memory from database`);
  //       return game;
  //     } catch (e) {
  //       console.error('GameLoader:loadGame', e);
  //       return undefined;
  //     }
  //   }


  //   const pendingGames = this.pendingGame.get(gameId);
  //   if (pendingGames !== undefined) {
  //     for (const pendingGame of pendingGames) {
  //       pendingGame(err ? undefined : game);
  //     }
  //     this.pendingGame.delete(gameId);
  //   }
  //   for (const player of game.getAllPlayers()) {
  //     const pendingPlayers = this.pendingPlayer.get(player.id);
  //     if (pendingPlayers !== undefined) {
  //       for (const pendingPlayer of pendingPlayers) {
  //         pendingPlayer(err ? undefined : this.playerToGame.get(player.id));
  //       }
  //       this.pendingPlayer.delete(player.id);
  //     }
  //   }
  // }

  private onAllGamesLoaded(): void {
    this.state = State.READY;

    // any pendingPlayer or pendingGame callbacks
    // are waiting for a train that is never coming
    // send them packing. call their callbacks with
    // undefined and remove from pending
    for (const pendingGame of Array.from(this.pendingGame.values())) {
      for (const cb of pendingGame) {
        cb(undefined);
      }
    }
    this.pendingGame.clear();
    for (const pendingPlayer of Array.from(this.pendingPlayer.values())) {
      for (const cb of pendingPlayer) {
        cb(undefined);
      }
    }
    this.pendingPlayer.clear();
  }

  private async loadAllGames(cb = () => { }): Promise<void> {
    this.state = State.LOADING;
    await Database.getInstance().initialize();
    const $this = this;
    Database.getInstance().getUsers(function(err, allUser) {
      if (err) {
        return;
      }
      allUser.forEach((user) => {
        $this.userIdMap.set(user.id, user);
        $this.userNameMap.set(user.name.trim().toLowerCase(), user);
        $this.usersToGames.set(user.id, new Set());
      });

      Database.getInstance().getGames().then( (allGames:Array<IGameShortData> ) => {
        if (allGames.length === 0) {
          $this.onAllGamesLoaded();
          cb();
          return;
        }
        console.log(`loading all games ${allGames.length}`);
        const player = new Player('test', Color.BLUE, false, 0, 'p000');
        const player2 = new Player('test2', Color.RED, false, 0, 'p111');

        allGames.forEach((gamedata) => {
          if (gamedata.shortData) {
            const gameToRebuild = Game.rebuild(gamedata.gameId, [player, player2], player);
            Object.assign(gameToRebuild, gamedata.shortData);
            gameToRebuild.loadState = LoadState.HALFLOADED;
            $this.onGameLoaded(gameToRebuild);
          } else {
            $this.allGameIds.push(gamedata.gameId);
          }
        });
        $this.loadNextGame(cb);

        // FIXME: 嵌套Promise有点怪，但是不这么写测试用例会报错，要求必须加载完所有游戏
        Database.getInstance().getUserRanks().then( (allUserRanks:Array<UserRank> ) => {
          if (allUserRanks.length === 0) {
            return;
          }
          console.log(`loading all ranks ${allUserRanks.length}`);

          allUserRanks.forEach((userRank) => {
            $this.userRankMap.set(userRank.userId, userRank); // TODO: 是否要加一个检查是否是用户的判断？
          });
        }).catch((err) => {
          console.error('error loading all user ranks', err);
          return;
        });
      }).catch((err) => {
        console.error('error loading all games', err);
        $this.onAllGamesLoaded();
        cb();
        return;
      });
    });
  }

  private loadNextGame(cb = () => { }) {
    const game_id = this.allGameIds.shift();
    if (game_id === undefined) {
      this.onAllGamesLoaded();
      cb();
      return;
    }
    const player = new Player('test', Color.BLUE, false, 0, 'p000');
    const player2 = new Player('test2', Color.RED, false, 0, 'p111');
    const gameToRebuild = Game.rebuild(game_id, [player, player2], player);

    console.log(`ready to load game ${game_id}`);

    try {
      Database.getInstance().getGame(game_id).then((serializedGame) =>{
        if ( serializedGame === undefined) {
          console.error(`unable to load  game ${game_id}`);
        } else {
          gameToRebuild.loadFromJSON(serializedGame, false);
          this.onGameLoaded(gameToRebuild);
        }
        this.loadNextGame(cb);
      });
    } catch (err) {
      console.error(`unable to load game ${game_id}`, err);
      this.loadNextGame(cb);
    }
  }

  public async getIds(): Promise<Array<GameIdLedger>> {
    await Promise.resolve();
    return Promise.resolve([]);
  }

  public completeGame(_game: IGame) {
    // const database = Database.getInstance();
    // await database.saveGame(game);
    try {
      // this.mark(game.id);
      // await database.markFinished(game.id);
      // await this.maintenance();
    } catch (err) {
      console.error(err);
    }
    return Promise.resolve();
  }

  public saveGame(game: IGame): Promise<void> {
    if (this.purgedGames.includes(game.id)) {
      throw new Error('This game no longer exists');
    }
    return Database.getInstance().saveGame(game);
  }


  public async maintenance() {
    const database = Database.getInstance();
    const purgedGames = await database.purgeUnfinishedGames();
    this.purgedGames.push(...purgedGames);
    await database.compressCompletedGames();
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

  // 天梯，新增UserRank到GameLoader
  public addOrUpdateUserRank(userRank: UserRank): void {
    this.userRankMap.set(userRank.userId, userRank);
  }
}


function parseConfigString(stringValue: string): CacheConfig {
  const options: CacheConfig = {
    sweep: 'manual', // default is manual
    evictMillis: durationToMilliseconds('15m'),
    sleepMillis: durationToMilliseconds('5m'),
  };
  const parsed = Object.fromEntries((stringValue ?? '').split(';').map((s) => s.split('=', 2)));
  if (parsed.sweep === 'auto' || parsed.sweep === 'manual') {
    options.sweep = parsed.sweep;
  } else if (parsed.sweep !== undefined) {
    throw new Error('invalid sweep option from GAME_CACHE: ' + parsed.sweep);
  }
  const evictMillis = durationToMilliseconds(parsed.eviction_age);
  if (!isNaN(evictMillis)) options.evictMillis = evictMillis;
  const sleepMillis = durationToMilliseconds(parsed.sweep_freq);
  if (isNaN(sleepMillis)) options.sleepMillis = sleepMillis;
  return options;
}
