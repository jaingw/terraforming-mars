import {expect} from 'chai';
import {PlantSmuggling} from '../../../src/server/cards/eros/PlantSmuggling';
import {CardName} from '../../../src/common/cards/CardName';
import {testGame, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Luna} from '../../../src/server/colonies/Luna';
import {Ceres} from '../../../src/server/colonies/Ceres';


describe('PlantSmuggling', () => {
  let card: PlantSmuggling;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new PlantSmuggling();
    [game, player] = testGame(2, {coloniesExtension: true, skipInitialShuffling: true});
  });

  it('should not be playable without colony', () => {
    // 没有殖民地
    game.colonies = [new Luna()];
    expect(card.canPlay(player)).to.be.false;

    game.colonies[0].addColony(player);
    expect(card.canPlay(player)).to.be.true;
  });

  it('should play, increase MC production, 1分', () => {
    // 添加一个殖民地
    game.colonies = [new Ceres()];
    game.colonies[0].addColony(player);

    expect(player.getVictoryPoints().victoryPoints).to.eq(0);
    expect(player.production.megacredits).to.eq(0);
    expect(player.playedCards.get(CardName.PLANT_SMUGGLING)).to.not.exist;
    player.playCard(card);
    expect(player.production.megacredits).to.eq(2);
    expect(player.getVictoryPoints().victoryPoints).to.eq(1);
    expect(player.playedCards.get(CardName.PLANT_SMUGGLING)).to.exist;
  });

  it('should gain 1 plant when any player trades', () => {
    // 添加一个殖民地
    game.colonies = [new Luna()];
    game.colonies[0].addColony(player);

    player.playCard(card);
    expect(player.plants).to.eq(0);
    // 玩家自己贸易
    game.colonies[0].trade(player);
    runAllActions(game);
    expect(player.plants).to.eq(1);
    // 其他玩家贸易
    const other = game.players[1];
    game.colonies[0].addColony(other);
    game.colonies[0].trade(other);
    runAllActions(game);
    expect(player.plants).to.eq(2);
  });
});
