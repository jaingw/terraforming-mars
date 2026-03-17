import {expect} from 'chai';
import {AntiGravityExperiment} from '../../../src/server/cards/eros/AntiGravityExperiment';
import {CardName} from '../../../src/common/cards/CardName';
import {fakeCard} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {Research} from '../../../src/server/cards/base/Research';
import {SearchForLife} from '../../../src/server/cards/base/SearchForLife';
import {EarthCatapult} from '../../../src/server/cards/base/EarthCatapult';
import {Tag} from '../../../src/common/cards/Tag';
import {DeuteriumExport} from '../../../src/server/cards/venusNext/DeuteriumExport';
import {AdvancedAlloys} from '../../../src/server/cards/base/AdvancedAlloys';
import {InventorsGuild} from '../../../src/server/cards/base/InventorsGuild';
import {LagrangeObservatory} from '../../../src/server/cards/base/LagrangeObservatory';


describe('AntiGravityExperiment', () => {
  let card: AntiGravityExperiment;
  let player: TestPlayer;
  let game: import('../../../src/server/IGame').IGame;

  beforeEach(() => {
    card = new AntiGravityExperiment();
    [game, player] = testGame(1, {skipInitialShuffling: true});
  });

  function addScienceTags(n: number) {
    if (n === 6) {
      player.playedCards.push(new Research());
      player.playedCards.push(new SearchForLife());
      player.playedCards.push(new AdvancedAlloys());
      player.playedCards.push(new InventorsGuild());
      player.playedCards.push(new LagrangeObservatory());
      return;
    }
    for (let i = 0; i < n; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    }
  }

  it('should not be playable with less than 6 science tags', () => {
    addScienceTags(5);
    expect(card.canPlay(player)).to.be.false;
  });

  it('should be playable with 6 science tags and give 2 VP', () => {
    addScienceTags(6);
    expect(card.canPlay(player)).to.be.true;
    player.playCard(card);
    expect(player.playedCards.get(CardName.ANTI_GRAVITY_EXPERIMENT)).to.exist;
    expect(card.getVictoryPoints(player)).to.eq(2);
  });

  it('should give 2 MC discount for all cards this generation only', () => {
    addScienceTags(6);
    player.playCard(card);
    // 本代有效
    const testCard = new EarthCatapult();
    const discount = testCard.cost - player.getCardCost(testCard);
    expect(discount).to.eq(2);
    // 下一代失效
    game.generation++;
    const discount2 = testCard.cost - player.getCardCost(testCard);
    expect(discount2).to.eq(0);
  });

  it('should persist after serialization/deserialization', () => {
    addScienceTags(6);
    player.playCard(card);
    const testCard = new EarthCatapult();
    const discount5 = testCard.cost - player.getCardCost(testCard);
    expect(discount5).to.eq(2);
    const data = game.serialize();
    const game2 = game.loadFromJSON(data);
    const player2 = game2.players[0];
    const card2 = player2.playedCards.get(CardName.ANTI_GRAVITY_EXPERIMENT);
    expect(card2).to.exist;
    const discount3 = testCard.cost - player2.getCardCost(testCard);
    expect(discount3).to.eq(2);
    game2.generation++;
    const discount4 = testCard.cost - player2.getCardCost(testCard);
    expect(discount4).to.eq(0);
  });

  it('should stack discount with other discount cards (e.g. EarthCatapult)', () => {
    addScienceTags(6);
    // 打出 EarthCatapult（全局减2元）
    const catapult = new EarthCatapult();
    player.playedCards.push(catapult);
    player.playCard(card);
    const testCard = new DeuteriumExport();
    // EarthCatapult -2，AntiGravityExperiment -2，总共-4
    const discount = testCard.cost - player.getCardCost(testCard);
    expect(discount).to.eq(4);
    // 下一代只剩 EarthCatapult
    game.generation++;
    const discount2 = testCard.cost - player.getCardCost(testCard);
    expect(discount2).to.eq(2);
  });

  it('should give 2 points after being played', () => {
    addScienceTags(6);
    expect(card.getVictoryPoints(player)).to.eq(2);
    player.playCard(card);
    expect(player.playedCards.get(CardName.ANTI_GRAVITY_EXPERIMENT)?.getVictoryPoints(player)).to.eq(2);
  });

  it('should persist points after serialization/deserialization', () => {
    addScienceTags(6);
    player.playCard(card);
    expect(player.playedCards.get(CardName.ANTI_GRAVITY_EXPERIMENT)?.getVictoryPoints(player)).to.eq(2);
    const data = game.serialize();
    const game2 = game.loadFromJSON(data);
    const player2 = game2.players[0];
    expect(player2.playedCards.get(CardName.ANTI_GRAVITY_EXPERIMENT)?.getVictoryPoints(player2)).to.eq(2);
  });
});
