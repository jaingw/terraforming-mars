import {expect} from 'chai';
import {StarCoreMining} from '../../../src/server/cards/eros/StarCoreMining';
import {CardName} from '../../../src/common/cards/CardName';
import {testGame} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {AsteroidMining} from '../../../src/server/cards/base/AsteroidMining';
import {Steelworks} from '../../../src/server/cards/base/Steelworks';
import {Lichen} from '../../../src/server/cards/base/Lichen';
import {SearchForLife} from '../../../src/server/cards/base/SearchForLife';
import {EnergySaving} from '../../../src/server/cards/base/EnergySaving';
import {SpaceElevator} from '../../../src/server/cards/base/SpaceElevator';


describe('StarCoreMining', () => {
  let card: StarCoreMining;
  let player: TestPlayer;

  beforeEach(() => {
    card = new StarCoreMining();
    const [_game, _player] = testGame(1, {skipInitialShuffling: true});
    player = _player;
  });


  it('should play and have 2分', () => {
    player.playCard(card);
    expect(player.getVictoryPoints().victoryPoints).to.eq(2);
    expect(player.playedCards.get(CardName.STARCORE_MINING)).to.exist;
  });

  it('should gain correct resources onCardPlayed', () => {
    player.playCard(card);
    // EnergySaving: POWER
    const power = new EnergySaving();
    player.playCard(power);
    expect(player.energy).to.eq(2);
    // AsteroidMining: SPACE
    const asteroid = new AsteroidMining();
    player.playCard(asteroid);
    expect(player.titanium).to.eq(2);
    // Steelworks: BUILDING
    const steelworks = new Steelworks();
    player.playCard(steelworks);
    expect(player.steel).to.eq(2);
    // Lichen: PLANT
    const lichen = new Lichen();
    player.playCard(lichen);
    expect(player.plants).to.eq(2);
    // SpaceElevator: BUILDING, SPACE
    const outpost = new SpaceElevator();
    player.playCard(outpost);
    expect(player.steel).to.eq(3);
    expect(player.titanium).to.eq(3);
  });

  it('should not gain resources for unrelated tags', () => {
    player.playCard(card);

    expect(player.plants).to.eq(1);
    expect(player.energy).to.eq(1);
    expect(player.titanium).to.eq(1);
    expect(player.steel).to.eq(1);
    // 用无关 tag 卡牌
    player.playCard(new SearchForLife());
    expect(player.plants).to.eq(1);
    expect(player.energy).to.eq(1);
    expect(player.titanium).to.eq(1);
    expect(player.steel).to.eq(1);
  });
});
