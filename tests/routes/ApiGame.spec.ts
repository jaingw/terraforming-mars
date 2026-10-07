import {expect} from 'chai';
import {ApiGame} from '../../src/server/routes/ApiGame';
import {Game} from '../../src/server/Game';
import {MockResponse} from './HttpMocks';
import {TestPlayer} from '../TestPlayer';
import {RouteTestScaffolding} from './RouteTestScaffolding';
import {statusCode} from '../../src/common/http/statusCode';

describe('ApiGame', () => {
  let scaffolding: RouteTestScaffolding;
  let res: MockResponse;

  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('no parameter', async () => {
    scaffolding.url = '/api/game';
    await scaffolding.get(ApiGame.INSTANCE, res);
    expect(res.statusCode).eq(statusCode.badRequest);
    expect(res.content).eq('Bad request: missing id parameter');
  });

  it('invalid id', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.ctx.gameLoader.add(Game.newInstance('game-valid-id', [player], player, 'spectatorid'));
    scaffolding.url = '/api/game?id=invalidId';
    await scaffolding.get(ApiGame.INSTANCE, res);
    expect(res.statusCode).eq(statusCode.notFound);
    expect(res.content).eq('Not found: game not found');
  });

  it('valid id', async () => {
    const player = TestPlayer.BLACK.newPlayer();
    scaffolding.ctx.gameLoader.add(Game.newInstance('game-valid-id', [player], player, 'spectatorid'));
    scaffolding.url = '/api/game?id=game-valid-id';
    await scaffolding.get(ApiGame.INSTANCE, res);
    const json = JSON.parse(res.content);
    expect(json).to.include({
      activePlayer: 'black',
      breakthrough: false,
      gameAge: 7,
      heatFor: false,
      id: 'game-valid-id',
      lastSoloGeneration: 14,
      phase: 'research',
      saveId: 0,
      spectatorId: 'spectatorid',
    });
    expect(json.name).to.be.a('string').and.not.empty;
    expect(json.createtime).to.match(/^\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(json.updatetime).to.match(/^\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(json.players).deep.eq([
      {
        color: 'black',
        id: 'p-black-id',
        name: 'player-black',
      },
    ]);
    expect(json.gameOptions).to.include({
      altVenusBoard: false,
      aresExtremeVariant: false,
      boardName: 'tharsis',
      ceosDraftVariant: false,
      draftVariant: false,
      fastModeOption: false,
      heatFor: false,
      includeFanMA: false,
      initialDraftVariant: false,
      politicalAgendasExtension: 'Standard',
      preludeDraftVariant: false,
      randomMA: 'No randomization',
      removeNegativeGlobalEventsOption: false,
      requiresMoonTrackCompletion: false,
      requiresVenusTrackCompletion: false,
      showOtherPlayersVP: false,
      showTimers: true,
      shuffleMapOption: false,
      solarPhaseOption: false,
      soloTR: false,
      undoOption: false,
    });
    expect(json.gameOptions.bannedCards).deep.eq([]);
    expect(json.gameOptions.includedCards).deep.eq([]);
    expect(json.gameOptions.expansions).to.include({
      ares: false,
      breakthrough: false,
      ceo: false,
      colonies: false,
      commission: false,
      community: false,
      corpera: true,
      deltaProject: false,
      eros: false,
      moon: false,
      pathfinders: false,
      prelude: false,
      prelude2: false,
      promo: false,
      starwars: false,
      turmoil: false,
      underworld: false,
      venus: false,
    });
  });
});
