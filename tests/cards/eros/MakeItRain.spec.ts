import {expect} from 'chai';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {MakeItRain} from '../../../src/server/cards/eros/MakeItRain';
import {IGame} from '../../../src/server/IGame';
import {cast, runAllActions} from '../../TestingUtils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {CardType} from '../../../src/common/cards/CardType';
import {SolarWindPower} from '../../../src/server/cards/base/SolarWindPower';
import {PowerPlant} from '../../../src/server/cards/base/PowerPlant';

describe('MakeItRain', function() {
  let card: MakeItRain;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(function() {
    card = new MakeItRain();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 1;
  });

  it('basic properties', function() {
    expect(card.cost).to.eq(1);
    expect(card.type).to.eq(CardType.EVENT);
    expect(card.tags).to.deep.eq([]);
  });

  it('cannot play without Space tag cards in hand', function() {
    player.cardsInHand.push(new PowerPlant());
    expect(card.canPlay(player)).to.be.false;
  });

  it('can play with Space tag cards in hand', function() {
    player.cardsInHand.push(new SolarWindPower());
    expect(card.canPlay(player)).to.be.true;
  });

  it('play - discard 1 Space tag card for 1 titanium', function() {
    const spaceCard = new SolarWindPower();
    player.cardsInHand.push(spaceCard);
    const titaniumBefore = player.titanium;

    player.playCard(card);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).to.have.length(1);
    expect(selectCard.config.min).to.eq(0);
    expect(selectCard.config.max).to.eq(1);

    selectCard.cb([spaceCard]);
    runAllActions(game);

    expect(player.titanium).to.eq(titaniumBefore + 1);
    expect(player.cardsInHand).to.not.include(spaceCard);
  });

  it('play - discard multiple Space tag cards', function() {
    const spaceCard1 = new SolarWindPower();
    const spaceCard2 = new SolarWindPower();
    const spaceCard3 = new SolarWindPower();
    player.cardsInHand.push(spaceCard1, spaceCard2, spaceCard3);
    const titaniumBefore = player.titanium;

    player.playCard(card);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.config.max).to.eq(3);

    selectCard.cb([spaceCard1, spaceCard2, spaceCard3]);
    runAllActions(game);

    expect(player.titanium).to.eq(titaniumBefore + 3);
    expect(player.cardsInHand).to.have.length(0);
  });

  it('play - max 10 cards limit', function() {
    for (let i = 0; i < 15; i++) {
      player.cardsInHand.push(new SolarWindPower());
    }
    const titaniumBefore = player.titanium;

    player.playCard(card);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).to.have.length(15);
    expect(selectCard.config.max).to.eq(10);

    const selectedCards = selectCard.cards.slice(0, 10);
    selectCard.cb(selectedCards);
    runAllActions(game);

    expect(player.titanium).to.eq(titaniumBefore + 10);
    expect(player.cardsInHand).to.have.length(5);
  });

  it('play - can discard 0 cards (optional)', function() {
    const spaceCard = new SolarWindPower();
    player.cardsInHand.push(spaceCard);
    const titaniumBefore = player.titanium;

    player.playCard(card);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    selectCard.cb([]);
    runAllActions(game);

    expect(player.titanium).to.eq(titaniumBefore);
    expect(player.cardsInHand).to.have.length(1);
  });

  it('play - only Space tag cards are selectable', function() {
    const spaceCard = new SolarWindPower();
    const nonSpaceCard = new PowerPlant();
    player.cardsInHand.push(spaceCard, nonSpaceCard);

    player.playCard(card);
    runAllActions(game);

    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).to.have.length(1);
    expect(selectCard.cards[0]).to.eq(spaceCard);
  });
});
