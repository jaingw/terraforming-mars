import {expect} from 'chai';
import {PlayerInput} from '../../src/server/routes/PlayerInput';
import {MockRequest, MockResponse} from './HttpMocks';
import {Game} from '../../src/server/Game';
import {Database} from '../../src/server/database/Database';
import {TestPlayer} from '../TestPlayer';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {UndoActionOption} from '../../src/server/inputs/UndoActionOption';
import {RouteTestScaffolding} from './RouteTestScaffolding';
import {cast} from '@/common/utils/utils';
import {OrOptionsResponse} from '../../src/common/inputs/InputResponse';
import {CardName} from '../../src/common/cards/CardName';
import {Payment} from '../../src/common/inputs/Payment';

describe('PlayerInput', () => {
  let scaffolding: RouteTestScaffolding;
  let req: MockRequest;
  let res: MockResponse;
  let restoreGame: any;
  let getSaveIds: any;
  let deleteGameNbrSaves: any;

  beforeEach(() => {
    req = new MockRequest();
    res = new MockResponse();
    scaffolding = new RouteTestScaffolding(req);
    restoreGame = Database.getInstance().restoreGame;
    getSaveIds = Database.getInstance().getSaveIds;
    deleteGameNbrSaves = Database.getInstance().deleteGameNbrSaves;
  });

  afterEach(() => {
    Database.getInstance().restoreGame = restoreGame;
    Database.getInstance().getSaveIds = getSaveIds;
    Database.getInstance().deleteGameNbrSaves = deleteGameNbrSaves;
  });

  it('fails when id not provided', async () => {
    scaffolding.url = '/player/input';
    await scaffolding.post(PlayerInput.INSTANCE, res);
    expect(res.content).eq('Bad request: missing id parameter');
  });

  it('performs undo action', async () => {
    const player = TestPlayer.BLUE.newPlayer({beginner: true});
    scaffolding.url = '/player/input?id=' + player.id;
    const game = Game.newInstance('gameid-foo', [player], player, 'spectatorid');

    const undoVersionOfPlayer = TestPlayer.BLUE.newPlayer({beginner: true});
    const undo = Game.newInstance('gameid-old', [undoVersionOfPlayer], undoVersionOfPlayer, 'spectatorid');
    undo.generation = 5;

    await scaffolding.ctx.gameLoader.add(game);

    player.process({type: 'or', index: 1, response: {type: 'projectCard', card: CardName.POWER_PLANT_STANDARD_PROJECT, payment: Payment.of({megacredits: 11})}});
    const options = cast(player.getWaitingFor(), OrOptions);
    options.options.push(new UndoActionOption());
    Database.getInstance().restoreGame = async (_gameId, _saveId, currentGame) => {
      currentGame.loadFromJSON(undo.serialize(), true);
      return currentGame;
    };
    Database.getInstance().getSaveIds = async () => [0, 1, 2];
    Database.getInstance().deleteGameNbrSaves = async () => Promise.resolve();

    const post = scaffolding.post(PlayerInput.INSTANCE, res);
    const emit = Promise.resolve().then(() => {
      const orOptionsResponse: OrOptionsResponse = {type: 'or', index: options.options.length - 1, response: {type: 'option'}};
      req.emitter.emit('data', JSON.stringify({id: '', input: orOptionsResponse}));
      req.emitter.emit('end');
    });
    await Promise.all(([emit, post]));

    const model = JSON.parse(res.content);
    expect(game.generation).eq(5);
    expect(model.game.generation).eq(5);
  });

  it('reverts to current game instance if undo fails', async () => {
    const player = TestPlayer.BLUE.newPlayer({beginner: true});
    scaffolding.url = '/player/input?id=' + player.id;
    const game = Game.newInstance('gameid-foo', [player], player, 'spectatorid');

    const undoVersionOfPlayer = TestPlayer.BLUE.newPlayer({beginner: true});
    const undo = Game.newInstance('gameid-old', [undoVersionOfPlayer], undoVersionOfPlayer, 'spectatorid');

    await scaffolding.ctx.gameLoader.add(game);

    player.process(<OrOptionsResponse>{type: 'or', index: 1, response: {type: 'projectCard', card: CardName.POWER_PLANT_STANDARD_PROJECT, payment: Payment.of({megacredits: 11})}});
    const options = cast(player.getWaitingFor(), OrOptions);
    options.options.push(new UndoActionOption());
    Database.getInstance().restoreGame = async () => Promise.reject(new Error('error'));

    const post = scaffolding.post(PlayerInput.INSTANCE, res);
    const emit = Promise.resolve().then(() => {
      const orOptionsResponse: OrOptionsResponse = {type: 'or', index: options.options.length - 1, response: {type: 'option'}};
      scaffolding.req.emitter.emit('data', JSON.stringify({id: '', input: orOptionsResponse}));
      scaffolding.req.emitter.emit('end');
    });
    await Promise.all(([emit, post]));

    const model = JSON.parse(res.content);
    expect(game.gameAge).not.eq(undo.gameAge);
    expect(model.game.gameAge).eq(model.game.gameAge);
  });

  it('sends 400 on server error', async () => {
    const player = TestPlayer.BLUE.newPlayer();
    scaffolding.url = `/player/input?id=${player.id}`;
    const game = Game.newInstance('gameid', [player], player, 'spectatorid');
    await scaffolding.ctx.gameLoader.add(game);

    const post = scaffolding.post(PlayerInput.INSTANCE, res);
    const emit = Promise.resolve().then(() => {
      scaffolding.req.emitter.emit('data', '}{');
      scaffolding.req.emitter.emit('end');
    });
    await Promise.all(([emit, post]));

    expect(res.content).matches(/Unexpected token/);
  });
});
