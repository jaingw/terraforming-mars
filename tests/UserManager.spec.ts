import {expect} from 'chai';
import {rejects} from 'node:assert';
import {register} from '../src/server/UserManager';
import {GameLoader} from '../src/server/database/GameLoader';
import {IDatabase} from '../src/server/database/IDatabase';
import {State} from '../src/server/database/IGameLoader';
import {myId} from '../src/server/UserUtil';
import {MockResponse} from './routes/HttpMocks';
import {InMemoryDatabase} from './testing/InMemoryDatabase';
import {restoreTestDatabase, restoreTestGameLoader, setTestDatabase, setTestGameLoader} from './testing/setup';

describe('UserManager', () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    const gameLoader = Reflect.construct(GameLoader, []) as GameLoader;
    gameLoader.state = State.READY;
    setTestGameLoader(gameLoader);
    database = new InMemoryDatabase();
    setTestDatabase(database as unknown as IDatabase);
  });

  afterEach(() => {
    restoreTestDatabase();
    restoreTestGameLoader();
  });

  it('allows only one concurrent registration for the same normalized user name', async () => {
    const request = {userName: 'TestUser', password: 'password'};
    const results = await Promise.allSettled([
      register(request, {} as any, new MockResponse()),
      register(request, {} as any, new MockResponse()),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).has.length(1);
    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason.message).eq('User name already exists, please use another name');
  });

  it('keeps the original database and cache values when a renamed user conflicts', async () => {
    await database.saveUser('u00000000001', 'first-user', 'password', '{}');
    await database.saveUser('u00000000002', 'second-user', 'password', '{}');
    const gameLoader = GameLoader.getInstance();
    await gameLoader.getUserById('u00000000002');

    expect((await database.getUser('u00000000002'))?.name).eq('second-user');
    expect(gameLoader.getCachedUserById('u00000000002')?.name).eq('second-user');
  });
});
