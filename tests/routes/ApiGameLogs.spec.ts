import {expect} from 'chai';
import {ApiGameLogs} from '../../src/server/routes/ApiGameLogs';
import {Game, LoadState} from '../../src/server/Game';
import {TestPlayer} from '../TestPlayer';
import {MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';
import {Phase} from '../../src/common/Phase';
import {use} from 'chai';
import chaiAsPromised = require('chai-as-promised');
import {GameLoader} from '../../src/server/database/GameLoader';
import {State} from '../../src/server/database/IGameLoader';
use(chaiAsPromised);

describe('ApiGameLogs', function() {
  let scaffolding: RouteTestScaffolding;
  let res: MockResponse;

  before(function() {
    GameLoader.getInstance().state = State.READY;
  });

  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('fails when id not provided', async () => {
    scaffolding.url = '/api/game/logs';
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    expect(res.content).eq('Bad request: missing id parameter');
  });

  it('fails with invalid id', async () => {
    scaffolding.url = '/api/game/logs?id=game-id';
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    expect(res.content).eq('Bad request: invalid player id');
  });

  it('fails when game not found', async () => {
    scaffolding.url = '/api/game/logs?id=player-invalid-id';
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    expect(res.content).eq('Not found: game not found');
  });

  it('pulls logs when no generation provided', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id;
    const game = Game.newInstance('game-id', [player], player);
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    game.log('Generation ${0}', (b) => b.forNewGeneration().number(50));
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    const messages = JSON.parse(res.content);
    expect(messages.length).gt(1);
    expect(messages[messages.length - 1].message).eq('Generation ${0}');
    expect(messages[messages.length - 1].data[0].value).eq('50');
  });

  it('pulls logs for most recent generation', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id + '&generation=50';
    const game = Game.newInstance('game-id', [player], player);
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    game.log('Generation ${0}', (b) => b.forNewGeneration().number(50));
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    const messages = JSON.parse(res.content);
    expect(messages).has.length(1);
    expect(messages[messages.length - 1].message).eq('Generation ${0}');
    expect(messages[messages.length - 1].data[0].value).eq('50');
  });

  it('pulls logs for first generation', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id;
    const game = Game.newInstance('game-id', [player], player);
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    const messages = JSON.parse(res.content);
    expect(messages.length).gt(1);
    expect(messages[messages.length - 1].message).eq('Generation ${0}');
    expect(messages[messages.length - 1].data[0].value).eq('1');
  });

  it('pulls logs for missing generation', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id + '&generation=2';
    const game = Game.newInstance('game-id', [player], player);
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    const messages = JSON.parse(res.content);
    expect(messages).is.empty;
  });

  // [{idx: 0, color: 'Yellow'}, {idx: 1, color: 'Orange'}, {idx: 2, color: 'Blue'}].forEach((entry) => {
  //   it('omits private logs for other players: ' + entry.color, () => {
  //     const yellowPlayer = TestPlayers.YELLOW.newPlayer();
  //     const orangePlayer = TestPlayers.ORANGE.newPlayer();
  //     const bluePlayer = TestPlayers.BLUE.newPlayer();

  //     const players = [yellowPlayer, orangePlayer, bluePlayer];
  //     const playerUnderTest = players[entry.idx];

  //     const game = Game.newInstance('game-id', players, yellowPlayer);
  //     ctx.gameLoader.add(game);

  //     // Remove logs to-date to simplify the test
  //     game.gameLog.length = 0;
  //     game.log('All players see this.');
  //     game.log('Yellow player sees this.', (_b) => {}, {reservedFor: yellowPlayer});
  //     game.log('Orange player sees this.', (_b) => {}, {reservedFor: orangePlayer});
  //     game.log('Blue player sees this.', (_b) => {}, {reservedFor: bluePlayer});

  //     req.url = '/api/game/logs?id=' + playerUnderTest.id;
  //     ctx.url = new URL('http://boo.com' + req.url);
  //     ApiGameLogs.INSTANCE.get(req, res.hide(), ctx);
  //     const messages = JSON.parse(res.content);

  //    expect(messages).has.length(2);
  //     expect(messages[0].message).eq('All players see this.');
  //     expect(messages[1].message).eq(`${entry.color} player sees this.`);
  //   });
  // });

  it('Cannot pull full logs before game end', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id + '&full';
    const game = Game.newInstance('game-id', [player], player);
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    expect(res.content).eq('Bad request: cannot fetch game-end log');
  });

  it('Pulls full logs at game end', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.url = '/api/game/logs?id=' + player.id + '&full';
    const game = Game.newInstance('game-id', [player], player);
    game.phase = Phase.END;
    game.loadState = LoadState.LOADED;
    GameLoader.getInstance().add(game);
    await scaffolding.get(ApiGameLogs.INSTANCE, res);
    expect(res.content).to.match(/^Drew and discarded/);
  });
});
