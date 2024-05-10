import {expect} from 'chai';
import {PlayerInput} from '../../src/server/routes/PlayerInput';
import {MockRequest, MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';

describe('PlayerInput', function() {
  let scaffolding: RouteTestScaffolding;
  let req: MockRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = new MockRequest();
    res = new MockResponse();
    scaffolding = new RouteTestScaffolding(req);
  });

  it('fails when id not provided', async () => {
    scaffolding.url = '/player/input';
    await scaffolding.post(PlayerInput.INSTANCE, res);
    expect(res.content).eq('Bad request: missing id parameter');
  });

  // it('performs undo action', () => {
  //   const player = TestPlayers.BLUE.newPlayer();
  //   req.url = '/player/input?id=' + player.id;
  //   ctx.url = new URL('http://boo.com' + req.url);
  //   player.beginner = true;
  //   const game = Game.newInstance('foo', [player], player);
  //   const undo = Game.newInstance('old', [player], player);
  //   ctx.gameLoader.add(game);
  //   game.gameOptions.undoOption = true;
  //   player.process([['1'], ['Power Plant:SP']]);
  //   const options = player.getWaitingFor() as OrOptions;
  //   options.options.push(new UndoActionOption());
  //   ctx.gameLoader.restoreGameAt = function(_gameId: string, _lastSaveId: number, cb: (game: Game | undefined) => void) {
  //     cb(undo);
  //   };
  //   PlayerInput.INSTANCE.post(req, res.hide(), ctx);
  //   req.emit('data', JSON.stringify([[String(options.options.length - 1)], ['']]));
  //   req.emit('end');
  //   const model = JSON.parse(res.content);
  //   expect(game.gameAge).not.eq(undo.gameAge);
  //   expect(model.game.gameAge).eq(undo.gameAge);
  // });

  // it('reverts to current game instance if undo fails', () => {
  //   const player = TestPlayers.BLUE.newPlayer();
  //   req.url = '/player/input?id=' + player.id;
  //   ctx.url = new URL('http://boo.com' + req.url);
  //   player.beginner = true;
  //   const game = Game.newInstance('foo', [player], player);
  //   const undo = Game.newInstance('old', [player], player);
  //   ctx.gameLoader.add(game);
  //   game.gameOptions.undoOption = true;
  //   player.process([['1'], ['Power Plant:SP']]);
  //   const options = player.getWaitingFor() as OrOptions;
  //   options.options.push(new UndoActionOption());
  //   ctx.gameLoader.restoreGameAt = function(_gameId: string, _lastSaveId: number, cb: (game: Game | undefined) => void) {
  //     cb(undefined);
  //   };
  //   PlayerInput.INSTANCE.post(req, res.hide(), ctx);
  //   req.emit('data', JSON.stringify([[String(options.options.length - 1)], ['']]));
  //   req.emit('end');
  //   const model = JSON.parse(res.content);
  //   expect(game.gameAge).not.eq(undo.gameAge);
  //   expect(model.game.gameAge).eq(model.game.gameAge);
  // });

  // it('sends 400 on server error', () => {
  //   const player = TestPlayers.BLUE.newPlayer();
  //   scaffolding.url = `/player/input?id=${player.id}`;
  //   const game = Game.newInstance('foo', [player], player);
  //   scaffolding.ctx.gameLoader.add(game);
  //   scaffolding.post(PlayerInput.INSTANCE, res);
  //   scaffolding.req.emit('data', '}{');
  //   scaffolding.req.emit('end');
  //  expect(res.content).eq('{"message":"Unexpected token } in JSON at position 0"}');
  // });
});
