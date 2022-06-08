import {expect} from 'chai';
import {Game, DEFAULT_GAME_OPTIONS} from '../../src/Game';
import {GameId} from '../../src/common/Types';
import {TestPlayers} from '../TestPlayers';
import {IN_MEMORY_SQLITE_PATH, SQLite} from '../../src/database/SQLite';
import {Database} from '../../src/database/Database';
import {restoreTestDatabase} from '../utils/setup';

class TestSQLite extends SQLite {
  public saveGamePromise: Promise<void> = Promise.resolve();

  constructor() {
    super(IN_MEMORY_SQLITE_PATH);
  }

  public get database() {
    return this.db;
  }

  public saveGame(game: Game): Promise<void> {
    super.saveGameState(game.id, game.lastSaveId, game.toJSON());
    game.lastSaveId++;
    return Promise.resolve(); // new Promise<void>(() => {});
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
}

describe('SQLite', () => {
  let db: TestSQLite;
  beforeEach(() => {
    db = new TestSQLite();
    Database.getInstance = () => db;
    return db.initialize();
  });

  afterEach(() => {
    restoreTestDatabase();
  });

  it('game is saved', async () => {
    const player = TestPlayers.BLACK.newPlayer();
    Game.newInstance('game-id-1212', [player], player, DEFAULT_GAME_OPTIONS, 0, undefined, false);
    await db.saveGamePromise;
    await new Promise<void>((resolve) => {
      db.getGames((err, allGames) => {
        expect(err).eq(undefined);
        expect(allGames[0].gameId).deep.eq('game-id-1212');
        resolve();
      });
    });
  });

  it('saveIds', async () => {
    const player = TestPlayers.BLACK.newPlayer();
    const game = Game.newInstance('game-id-1213', [player], player, DEFAULT_GAME_OPTIONS, 0, undefined, false);
    await db.saveGamePromise;
    expect(game.lastSaveId).eq(0);

    // await db.saveGame(game);
    // await db.saveGame(game);
    // await db.saveGame(game);

    // const allSaveIds = await db.getSaveIds(game.id);
    // expect(allSaveIds).has.members([0, 1, 2, 3]);
  });

  it('purge', async () => {
    const player = TestPlayers.BLACK.newPlayer();
    const game = Game.newInstance('game-id-1214', [player], player, DEFAULT_GAME_OPTIONS, 0, undefined, false);
    await db.saveGamePromise;
    expect(game.lastSaveId).eq(0);

    // await db.saveGame(game);
    // await db.saveGame(game);
    // await db.saveGame(game);

    // expect(await db.getSaveIds(game.id)).has.members([0, 1, 2, 3]);

    // TODO(kberg): make cleanSaves a promise, too. Beacuse right now
    // this timeout doesn't participate in automated testing. But for now I can
    // verify this in the debugger. Next step.
    // db.cleanSaves(game.id, 3);
    // setTimeout(async () => {
    //   const saveIds = await db.getSaveIds(game.id);
    //   expect(saveIds).has.members([0, 3]);
    // }, 1000);
  });

  // it('gets cloneable game by id', async () => {
  //   const player = TestPlayers.BLACK.newPlayer();
  //   const game = Game.newInstance('game-id-1212', [player], player);
  //   await db.saveGamePromise;
  //   expect(game.lastSaveId).eq(1);

  //   db.getClonableGameByGameId(game.id, (err, gameData) => {
  //     expect(err).to.be.undefined;
  //     expect(gameData?.gameId).to.eq(game.id);
  //     expect(gameData?.playerCount).to.eq(1);
  //   });
  // });

  // it('does not find cloneable game by id', async () => {
  //   const player = TestPlayers.BLACK.newPlayer();
  //   const game = Game.newInstance('game-id-1212', [player], player);
  //   await db.saveGamePromise;
  //   expect(game.lastSaveId).eq(1);

  //   db.getClonableGameByGameId('notfound', (err, gameData) => {
  //     expect(err).to.be.undefined;
  //     expect(gameData).to.be.undefined;
  //   });
  // });
});
