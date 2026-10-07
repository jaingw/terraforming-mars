import {describeDatabaseSuite} from './databaseSuite';
import {IGame} from '../../src/server/IGame';
import {IN_MEMORY_SQLITE_PATH, SQLite} from '../../src/server/database/SQLite';
import {GameId} from '../../src/common/Types';
import {ITestDatabase, Status} from './ITestDatabase';
import {Game} from '../../src/server/Game';
import {rejects} from 'node:assert';
import {UserNameExistsError} from '../../src/server/database/IDatabase';
import {expect} from 'chai';

class TestSQLite extends SQLite implements ITestDatabase {
  public lastSaveGamePromise: Promise<void> = Promise.resolve();

  constructor() {
    super(IN_MEMORY_SQLITE_PATH, true);
  }

  public get database() {
    return this.db;
  }

  public override saveGame(game: IGame): Promise<void> {
    this.lastSaveGamePromise = super.saveGame(game);
    return this.lastSaveGamePromise;
  }

  public async status(gameId: GameId): Promise<Status> {
    const rows = await this.asyncAll('SELECT DISTINCT status FROM games WHERE game_id = ? ORDER BY save_id DESC LIMIT 1', [gameId]);
    const statusText = rows[0].status;

    if (statusText === 'running' || statusText === 'finished') {
      return statusText;
    }
    throw new Error('Invalid status for ' + gameId + ': ' + statusText);
  }
}

const newgame = Game.newInstance;
Game.newInstance = (...args) => {
  const game = newgame(...args);
  return game;
};
describeDatabaseSuite({
  name: 'SQLite',
  constructor: () => new TestSQLite(),
  stats: {
    type: 'SQLite',
    path: ':memory:',
    size_bytes: -1,
  },
});

describe('SQLite users', () => {
  it('enforces case-insensitive unique user names', async () => {
    const db = new TestSQLite();
    await db.initialize();
    await db.saveUser('u1', 'test-user', 'password', '{}');

    await rejects(
      db.saveUser('u2', 'TEST-USER', 'password', '{}'),
      (err) => err instanceof UserNameExistsError,
    );
  });

  it('rejects a case-insensitive duplicate user name on update', async () => {
    const db = new TestSQLite();
    await db.initialize();
    await db.saveUser('u1', 'first-user', 'password', '{}');
    await db.saveUser('u2', 'second-user', 'password', '{}');
    const user = await db.getUser('u2');
    expect(user).is.not.undefined;
    user!.name = 'FIRST-USER';

    expect((await db.getUser('u2'))?.name).eq('second-user');
  });
});
