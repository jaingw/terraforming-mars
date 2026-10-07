import {expect} from 'chai';
import {Game} from '../../src/server/Game';
import {GameLoader} from '../../src/server/database/GameLoader';
import {SerializedGame} from '../../src/server/SerializedGame';
import {TestPlayer} from '../TestPlayer';
import {GameId, PlayerId} from '../../src/common/Types';
import {restoreTestDatabase, restoreTestGameLoader, setTestDatabase, setTestGameLoader} from '../testing/setup';
import {sleep} from '../TestingUtils';
import {InMemoryDatabase} from '../testing/InMemoryDatabase';
import {State} from '../../src/server/database/IGameLoader';
import {Phase} from '../../src/common/Phase';
import {User} from '../../src/server/User';
import {UserRank} from '../../src/common/rank/RankManager';
import {rejects} from 'node:assert';

class TestDatabase extends InMemoryDatabase {
  public failure: 'getGameIds' | undefined = undefined;
  public getGameSleep = 0;
  public getGameCalls = 0;
  public getGameIdByParticipantCalls = 0;
  public getUserCalls = 0;
  public getUserByNameCalls = 0;
  public getUserRankCalls = 0;
  public failNextGetGame = false;
  public failNextGetUser = false;
  public failNextGetUserByName = false;
  public failNextGetUserRank = false;

  override async getGame(gameId: GameId): Promise<SerializedGame> {
    this.getGameCalls++;
    if (this.failNextGetGame) {
      this.failNextGetGame = false;
      throw new Error('transient getGame failure');
    }
    const game = await super.getGame(gameId);
    await sleep(this.getGameSleep);
    return game;
  }

  override getGameIds(): Promise<GameId[]> {
    if (this.failure === 'getGameIds') {
      return Promise.reject(new Error('error'));
    }
    return super.getGameIds();
  }

  override async getGameIdByParticipant(participantId: string): Promise<GameId | undefined> {
    this.getGameIdByParticipantCalls++;
    return super.getGameIdByParticipant(participantId);
  }

  override async getUser(userId: string): Promise<User | undefined> {
    this.getUserCalls++;
    if (this.failNextGetUser) {
      this.failNextGetUser = false;
      throw new Error('transient getUser failure');
    }
    return super.getUser(userId);
  }

  override async getUserByName(name: string): Promise<User | undefined> {
    this.getUserByNameCalls++;
    if (this.failNextGetUserByName) {
      this.failNextGetUserByName = false;
      throw new Error('transient getUserByName failure');
    }
    return super.getUserByName(name);
  }

  override async getUserRank(userId: string): Promise<UserRank | undefined> {
    this.getUserRankCalls++;
    if (this.failNextGetUserRank) {
      this.failNextGetUserRank = false;
      throw new Error('transient getUserRank failure');
    }
    return super.getUserRank(userId);
  }
}

describe('GameLoader', () => {
  let instance: GameLoader;
  let database: TestDatabase;
  let game: Game;

  function newTestInstance(): GameLoader {
    return Reflect.construct(GameLoader, []) as GameLoader;
  }

  function resetForTesting(loader: GameLoader): void {
    const state = loader as any;
    state.games.clear();
    state.playerToGame.clear();
    state.userIdMap.clear();
    state.userNameMap.clear();
    state.userRankMap.clear();
    state.loadingGames.clear();
    state.allGameIds = [];
    state.state = State.READY;
  }

  beforeEach(() => {
    instance = newTestInstance();
    setTestGameLoader(instance);
    database = new TestDatabase();
    setTestDatabase(database);
    const player = TestPlayer.BLUE.newPlayer();
    const player2 = TestPlayer.RED.newPlayer();
    game = Game.newInstance('gameid', [player, player2], player, 'spectatorid');
    resetForTesting(instance);
  });
  afterEach(() => {
    restoreTestDatabase();
    restoreTestGameLoader();
  });

  it('uses shared instance', () => {
    expect(instance).to.eq(GameLoader.getInstance());
  });

  it('gets undefined when player does not exist', async () => {
    const game = await instance.getByPlayerId('player-doesnotexist' as PlayerId);
    expect(game).is.undefined;
  });

  it('gets game when it exists in memory', async () => {
    instance.add(game);
    const game1 = await instance.getGame('gameid');
    expect(game1!.id).to.eq(game.id);
  });

  it('loads game from database when it is not loaded in memory', async () => {
    const game1 = await instance.getGame('gameid');
    expect(game1?.id).eq(game.id);
    expect(instance.games.size).eq(1);
  });

  it('shares one game instance between concurrent database loads', async () => {
    database.getGameSleep = 50;

    const [game1, game2] = await Promise.all([
      instance.getGame('gameid'),
      instance.getGame('gameid'),
    ]);

    expect(game1).eq(game2);
    expect(game1).eq(instance.games.get(game.id));
    expect(database.getGameCalls).eq(1);
  });

  it('gets no game when requested before database loaded', async () => {
    (instance as any).state = State.LOADING;
    const game1 = await instance.getGame('gameid');
    expect(game1).is.undefined;
  });

  it('gets no player when requested before database loaded', async () => {
    (instance as any).state = State.LOADING;
    const game1 = await instance.getByPlayerId(game.playersInGenerationOrder[0].id);
    expect(game1).is.undefined;
  });

  it('caches misses when game is not in memory or database', async () => {
    const game1 = await instance.getGame('game-never');
    expect(game1).is.undefined;
    const game2 = await instance.getGame('game-never');
    expect(game2).is.undefined;
    expect(database.getGameCalls).eq(1);
  });

  it('does not cache transient game load failures as misses', async () => {
    database.failNextGetGame = true;

    await rejects(instance.getGame('gameid'), /transient getGame failure/);
    expect((await instance.getGame('gameid'))?.id).eq(game.id);
    expect(database.getGameCalls).eq(2);
  });

  it('does not cache transient user lookup failures as misses', async () => {
    const user = new User('test-user', 'password', 'u123456789012');

    database.failNextGetUser = true;
    await rejects(instance.getUserById(user.id), /transient getUser failure/);
    expect(await instance.getUserById(user.id)).eq(user);
    expect(database.getUserCalls).eq(2);

    resetForTesting(instance);
    database.failNextGetUserByName = true;
    await rejects(instance.getUserByName(user.name), /transient getUserByName failure/);
    expect(await instance.getUserByName(user.name)).eq(user);
    expect(database.getUserByNameCalls).eq(2);
  });

  it('does not cache transient user rank lookup failures as misses', async () => {
    const userRank = new UserRank('u123456789012', 1, 25, 8.333);
    database.addUserRank(userRank);
    database.failNextGetUserRank = true;

    await rejects(instance.getUserRankById(userRank.userId), /transient getUserRank failure/);
    expect(await instance.getUserRankById(userRank.userId)).eq(userRank);
    expect(database.getUserRankCalls).eq(2);
  });

  it('addOrUpdateUserRank with onlyIfCached refreshes cached entries but never adds new ones', () => {
    const cached = new UserRank('u123456789012', 1, 25, 8.333);
    instance.addOrUpdateUserRank(cached);

    // 已缓存：刷新为新值
    instance.addOrUpdateUserRank(new UserRank(cached.userId, 9, 30, 6), true);
    expect(instance.getCachedUserRanks()).to.have.length(1);
    expect(instance.getCachedUserRanks()[0].rankValue).eq(9);

    // 未缓存：不新增，缓存大小不变
    instance.addOrUpdateUserRank(new UserRank('u987654321098', 2, 20, 7), true);
    expect(instance.getCachedUserRanks()).to.have.length(1);
    expect(instance.getCachedUserRanks().find((rank) => rank.userId === 'u987654321098')).is.undefined;
  });

  it('gets player when it exists in memory', async () => {
    const players = game.playersInGenerationOrder;
    instance.add(game);
    const game1 = await instance.getByPlayerId(players[Math.floor(Math.random() * players.length)].id);
    expect(game1!.id).to.eq(game.id);
  });

  it('gets game when added and not in database', async () => {
    // Violating the readonly nature for this test. It ensures that no game with the specific ID is not in the loader.
    (game.id as GameId) = 'gameid-alpha';
    instance.add(game);
    const game1 = await instance.getGame('gameid-alpha');
    expect(game1!.id).to.eq('gameid-alpha');
  });

  it('gets player when added and not in database', async () => {
    const players = game.playersInGenerationOrder;
    instance.add(game);
    const game1 = await instance.getByPlayerId(players[Math.floor(Math.random() * players.length)]!.id);
    expect(game1).is.not.undefined;
    expect((await instance.getByPlayerId('p-blue-id'))?.id).to.eq('gameid');
    expect((await instance.getByPlayerId('spectatorid'))?.id).to.eq('gameid');
  });

  it('gets no game when startup is waiting', async () => {
    (instance as any).state = State.WAITING;
    const game1 = await instance.getGame('gameid');
    expect(game1).is.undefined;
  });

  it('loads values when matching game exists in database', async () => {
    const game1 = await instance.getGame('gameid');
    expect(game1?.id).eq('gameid');
  });

  it('loads players that will never exist', async () => {
    const game1 = await instance.getByPlayerId('p-non-existent-id' as PlayerId);
    expect(game1).is.undefined;
  });

  it('loads players available later', async () => {
    instance.add(game);
    const game1 = await instance.getGame('gameid');
    expect(game1!.id).to.eq('gameid');
    const game2 = await GameLoader.getInstance().getByPlayerId(game.playersInGenerationOrder[0].id);
    expect(game2!.id).to.eq('gameid');
  });

  it('waits for games to finish loading', async () => {
    (instance as any).state = State.LOADING;
    const loaded = await instance.getGame('gameid');
    expect(loaded).is.undefined;
  });

  it('evicts inactive games after 12 hours and reloads them on the next access', async () => {
    instance.add(game);
    game.phase = Phase.END;

    instance.cleanupExpiredLoadedGames();
    expect(instance.games.get(game.id)).eq(game);

    (instance as any).lastAccessedAt.set(game.id, Date.now() - 12 * 60 * 60 * 1000);
    instance.cleanupExpiredLoadedGames();
    expect(instance.games.get(game.id)).is.undefined;

    const reloaded = await instance.getGame(game.id);
    expect(reloaded?.id).eq(game.id);
    expect(database.getGameCalls).eq(1);
  });

  it('saveGame', async () => {
    game.generation = 12;
    instance.saveGame(game);

    expect(game.lastSaveId).eq(2);

    game.generation = 13;
    instance.saveGame(game);

    expect(await database.getSaveIds(game.id)).deep.eq([0, 1, 2]);
  });


  it('saveGame, already deleted', async () => {
    game.generation = 12;
    instance.saveGame(game);

    expect(game.lastSaveId).eq(2);

    game.generation = 13;
    instance.saveGame(game);

    database.markFinished(game.id);
  });
});
