import {expect} from 'chai';
import {_Aphrodite_} from '../../../src/server/cards/breakthrough/corporation/_Aphrodite_';
import {cast, runAllActions, testGame} from '../../TestingUtils';
import {CardName} from '../../../src/common/cards/CardName';
import {GlobalParameter} from '../../../src/common/GlobalParameter';

describe('_Aphrodite_', () => {
  it('Should not start with plant production', () => {
    const card = new _Aphrodite_();
    const [game, player] = testGame(1, {breakthrough: true});
    cast(card.play(player), undefined);

    // Breakthrough Aphrodite should NOT have starting plant production
    expect(player.production.plants).to.eq(0);
  });

  it('Should start with 40 M€ and correct name', () => {
    const card = new _Aphrodite_();
    const [game, player] = testGame(1, {breakthrough: true});
    player.playCorporationCard(card);
    runAllActions(game);

    expect(card.name).to.eq(CardName._APHRODITE_);
    expect(card.startingMegaCredits).to.eq(40);
  });

  it('Should give 2 plants when Venus is terraformed', () => {
    const card = new _Aphrodite_();
    const [game, player] = testGame(1, {breakthrough: true});
    player.playCorporationCard(card);
    runAllActions(game);

    // Initial plants should be 0 (no starting production)
    const initialPlants = player.plants;

    // Raise Venus 1 step
    game.increaseVenusScaleLevel(player, 1);
    runAllActions(game);

    // Should have gained 2 plants (2 * 1 step)
    expect(player.plants).to.eq(initialPlants + 2);
  });

  it('Should give 4 plants when Venus is terraformed 2 steps', () => {
    const card = new _Aphrodite_();
    const [game, player] = testGame(1, {breakthrough: true});
    player.playCorporationCard(card);
    runAllActions(game);

    const initialPlants = player.plants;

    // Raise Venus 2 steps
    game.increaseVenusScaleLevel(player, 2);
    runAllActions(game);

    // Should have gained 4 plants (2 * 2 steps)
    expect(player.plants).to.eq(initialPlants + 4);
  });

  it('Should allow first action to raise Venus 2 steps', () => {
    const card = new _Aphrodite_();
    const [game, player] = testGame(1, {breakthrough: true});

    expect(card.initialActionText).to.eq('Raise Venus Scale 2 steps');

    const initialVenus = game.getVenusScaleLevel();
    card.initialAction(player);
    expect(game.getVenusScaleLevel()).to.eq(initialVenus + 4); // 2 steps = 4 actual levels
  });
});
