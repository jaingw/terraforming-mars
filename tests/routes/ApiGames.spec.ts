import {expect} from 'chai';
import {ApiGames} from '../../src/server/routes/ApiGames';
import {Game} from '../../src/server/Game';
import {TestPlayer} from '../TestPlayer';
import {MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';
import * as UserUtil from '../../src/server/UserUtil';
import {GameLoader} from '../../src/server/database/GameLoader';
import {State} from '../../src/server/database/IGameLoader';
import {IDatabase, IGameMetadata} from '../../src/server/database/IDatabase';
import {restoreTestDatabase, setTestDatabase} from '../testing/setup';

describe('ApiGames', () => {
  let res: MockResponse;
  let scaffolding: RouteTestScaffolding;


  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
    const gameLoader = GameLoader.getInstance();
    gameLoader.games.clear();
    gameLoader.playerToGame.clear();
    gameLoader.state = State.READY;
    setTestDatabase({
      getGames: async () => [],
      saveGame: async () => {},
    } as unknown as IDatabase);
  });

  afterEach(() => {
    restoreTestDatabase();
  });

  it('validates server id', () => {
    scaffolding.url = '/api/games';
    ApiGames.INSTANCE.processRequest(scaffolding.req, res, scaffolding.ctx);
    expect(res.content).eq('Not authorized');
  });

  it('simple', async () => {
    scaffolding.url = `/api/games?serverId=1&userId=${UserUtil.myId}`;
    scaffolding.req.method = 'GET';
    await ApiGames.INSTANCE.processRequest(scaffolding.req, res, scaffolding.ctx);
    expect(res.content).eq('[]');
  });

  it('a game', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    const game = Game.newInstance('game-id', [player], player, 'spectatorid');
    setTestDatabase({
      getGames: async (): Promise<Array<IGameMetadata>> => [{
        gameId: 'game-id',
        participants: [],
        userids: [],
        shortData: JSON.parse(game.toShortJSON()),
        updatedTime: game.updatetime,
      }],
      saveGame: async () => {},
    } as unknown as IDatabase);
    scaffolding.url = `/api/games?serverId=1&userId=${UserUtil.myId}`;
    await ApiGames.INSTANCE.get(scaffolding.req, res, scaffolding.ctx);
    const json = JSON.parse(res.content);
    json[0].createtime = '<date>';
    json[0].updatetime = '<date>';
    expect(json).deep.eq([{
      id: 'game-id',
      phase: 'research',
      players: [{
        id: 'p-black-id',
        name: 'player-black',
        color: 'black',
      }],
      createtime: '<date>',
      updatetime: '<date>',
      gameAge: 7,
      saveId: 0,
    }]);
  });
});
