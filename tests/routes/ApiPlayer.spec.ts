import {expect} from 'chai';
import {ApiPlayer} from '../../src/routes/ApiPlayer';
import {MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';

describe('ApiPlayer', function() {
  let scaffolding: RouteTestScaffolding;
  let res: MockResponse;

  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('fails game not found', async () => {
    scaffolding.url = '/api/player?id=googoo';
    await scaffolding.asyncGet(ApiPlayer.INSTANCE, res);
    expect(res.content).eq('Not found');
  });

  // it('pulls player', () => {
  //   const player = TestPlayers.BLACK.newPlayer();
  //   req.url = '/api/player?id=' + player.id;
  //   ctx.url = new URL('http://boo.com' + req.url);
  //   const game = Game.newInstance('game-id', [player], player);
  //   ctx.gameLoader.add(game);
  //   ApiPlayer.INSTANCE.get(req, res.hide(), ctx);
  //   const response: PlayerModel = JSON.parse(res.content);
  //   expect(response.id).eq(player.id);
  // });
});
