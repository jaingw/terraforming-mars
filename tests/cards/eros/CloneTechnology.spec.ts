import {expect} from 'chai';
import {NoctisFarming} from '../../../src/server/cards/base/NoctisFarming';
import {IGame} from '../../../src/server/IGame';
import {Resource} from '../../../src/common/Resource';
import {addCity, cast, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {SolarWindPower} from '../../../src/server/cards/base/SolarWindPower';
import {ResearchNetwork} from '../../../src/server/cards/prelude/ResearchNetwork';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {testGame} from '../../TestGame';
import {FreyjaBiodomes} from '../../../src/server/cards/venusNext/FreyjaBiodomes';
import {ForestMoon} from '../../../src/server/cards/starwars/ForestMoon';
import {SnowAlgae} from '../../../src/server/cards/promo/SnowAlgae';
import {_EcoLine_} from '../../../src/server/cards/breakthrough/corporation/_EcoLine_';
import {NitrophilicMoss} from '../../../src/server/cards/base/NitrophilicMoss';
import {ViralEnhancers} from '../../../src/server/cards/base/ViralEnhancers';
import {Manutech} from '../../../src/server/cards/venusNext/Manutech';
import {CloneTechnology} from '../../../src/server/cards/eros/CloneTechnology';
import {Greenhouses} from '../../../src/server/cards/base/Greenhouses';
import {DesignedOrganisms} from '../../../src/server/cards/pathfinders/DesignedOrganisms';
import {ScolexIndustries} from '../../../src/server/cards/commission/ScolexIndustries';

describe('CloneTechnology', () => {
  let card: CloneTechnology;
  let player: TestPlayer;
  let game: IGame;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new CloneTechnology();
    [game, player, player2] = testGame(2, {moonExpansion: true});
  });

  it('Cannot play if no plant cards to copy', () => {
    expect(card.canPlay(player)).is.not.true;
  });

  it('Cannot play when production must go down', () => {
    // FreyjaBiodomes needs one unit of energy production
    player.playedCards.push(new FreyjaBiodomes());
    expect(card.canPlay(player)).is.not.true;

    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
  });

  it('Cannot play when any production must go down', () => {
    // FOREST MOON (VI) needs any player to have 2 energy production
    player.playedCards.push(new ForestMoon());
    expect(card.canPlay(player)).is.not.true;

    player2.production.override({energy: 2});
    expect(card.canPlay(player)).is.true;
  });

  it('Should play', () => {
    const noctisFarming = new NoctisFarming();
    player.playedCards.push(noctisFarming);

    const selectCard = cast(card.play(player), SelectCard);
    selectCard.cb([noctisFarming]);
    expect(player.production.megacredits).to.eq(1);
    expect(player.plants).to.eq(2);
  });

  it('Should work with freyjaBiodomes', () => {
    const freyjaBiodomes = new FreyjaBiodomes();
    const snowAlgae = new SnowAlgae();
    player.playedCards.push(freyjaBiodomes, snowAlgae);

    const selectCard2 = cast(card.play(player), SelectCard);// Not enough energy production for FreyjaBiodomes
    selectCard2.cb([snowAlgae]);

    expect(player.production.plants).to.eq(1);
    expect(player.production.heat).to.eq(1);

    player.production.add(Resource.ENERGY, 1);
    const selectCard = cast(card.play(player), SelectCard);
    selectCard.cb([freyjaBiodomes]);
    expect(player.production.energy).to.eq(0);
    expect(player.production.megacredits).to.eq(2);
  });


  it('Should play with corporation cards', () => {
    const corporationCard = new _EcoLine_();
    player.corporations.push(corporationCard);

    const selectCard = cast(card.play(player), SelectCard);
    selectCard.cb([corporationCard]);
    runAllActions(game);
    expect(player.production.plants).to.eq(2);
    expect(player.plants).to.eq(3);
  });

  it('Should not work with Solar Wind Power (no plant tag, but has production)', () => {
    player.playedCards.push(new SolarWindPower());

    expect(card.canPlay(player)).is.false;
  });

  it('Should work with Research Network', () => {
    const researchNetwork = new ResearchNetwork();
    player.playedCards.push(researchNetwork);
    const selectCard = cast(card.play(player), SelectCard);

    expect(selectCard.cards[0]).eq(researchNetwork);
    expect(player.production.megacredits).to.eq(0);
    selectCard.cb([researchNetwork]);
    expect(player.production.megacredits).to.eq(1);
  });


  it('Should work with NitrophilicMoss', () => {
    const nitrophilicMoss = new NitrophilicMoss();
    player.playedCards.push(nitrophilicMoss);
    expect(card.canPlay(player)).is.false;

    player.stock.plants = 2;
    expect(card.canPlay(player)).is.true;
    const selectCard = cast(card.play(player), SelectCard);

    expect(selectCard.cards[0]).eq(nitrophilicMoss);
    expect(player.production.plants).to.eq(0);
    expect(player.plants).to.eq(2);
    selectCard.cb([nitrophilicMoss]);
    expect(player.production.plants).to.eq(2);
    expect(player.plants).to.eq(0);

    player.stock.plants = 1;
    const viralEnhancers = new ViralEnhancers;
    player.playedCards.push(viralEnhancers);
    expect(card.canPlay(player)).is.true;
    const selectCard2 = cast(card.play(player), SelectCard);
    selectCard2.cb([nitrophilicMoss]);
    viralEnhancers.onCardPlayed(player, card);
    expect(player.production.plants).to.eq(4);
    expect(player.plants).to.eq(0);

    player.stock.plants = 0;
    player.corporations.push(new Manutech);
    expect(card.canPlay(player)).is.true;
    const selectCard3 = cast(card.play(player), SelectCard);
    selectCard3.cb([nitrophilicMoss]);
    expect(player.production.plants).to.eq(6);
    expect(player.plants).to.eq(0);
  });


  it('Should work with Greenhouses', () => {
    const greenhouses = new Greenhouses();
    player.playedCards.push(greenhouses);
    expect(card.canPlay(player)).is.true;
    addCity(player, '17');
    addCity(player, '19');
    const selectCard = cast(card.play(player), SelectCard);
    expect(selectCard.cards[0]).eq(greenhouses);
    selectCard.cb([greenhouses]);
    expect(player.plants).to.eq(2);
  });


  it('Should work with DesignedOrganisms', () => {
    const designedOrganisms = new DesignedOrganisms();
    player.playedCards.push(designedOrganisms);
    expect(card.canPlay(player)).is.true;
    const selectCard = cast(card.play(player), SelectCard);
    expect(selectCard.cards[0]).eq(designedOrganisms);
    selectCard.cb([designedOrganisms]);
    expect(player.plants).to.eq(3);
    expect(player.production.plants).to.eq(2);
  });


  it('Should work with scolex', () => {
    const scolex = new ScolexIndustries();
    player.playedCards.push(scolex);
    expect(card.canPlay(player)).is.true;
    const selectCard = cast(card.play(player), SelectCard);
    expect(selectCard.cards[0]).eq(scolex);
    selectCard.cb([scolex]);
    expect(player.production.plants).to.eq(1);
    expect(player.production.energy).to.eq(1);
    expect(player.production.steel).to.eq(1);
    expect(player.production.titanium).to.eq(1);
  });
});
