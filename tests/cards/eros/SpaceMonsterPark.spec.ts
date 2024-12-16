import {expect} from 'chai';
import {Bushes} from '../../../src/server/cards/base/Bushes';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TestPlayer} from '../../TestPlayer';
import {cast} from '../../TestingUtils';
import {testGame} from '../../TestGame';
import {SpaceMonsterPark} from '../../../src/server/cards/eros/SpaceMonsterPark';
import {ImmigrationShuttles} from '../../../src/server/cards/base/ImmigrationShuttles';
import {IGame} from '../../../src/server/IGame';

describe('SpaceMonsterPark', function() {
  let card: SpaceMonsterPark;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(function() {
    card = new SpaceMonsterPark();
    [game, player] = testGame(2);
  });

  it('Cannot play when have no titanium production', function() {
    expect(card.canPlay(player)).to.eq(false);
  });
  it('Should play', function() {
    player.playedCards.push(card);
    card.play(player);

    expect(card.getVictoryPoints(player)).to.eq(1);

    card.onCardPlayed(player, new Bushes());
    expect(game.deferredActions).has.lengthOf(0);

    // No resource
    card.onCardPlayed(player, card);
    expect(game.deferredActions).has.lengthOf(3); // 应该是先加两个,然后选择加第三个还是直接抽牌
    let input = game.deferredActions.peek()!.execute();
    game.deferredActions.pop();
    expect(input).is.undefined;
    expect(card.resourceCount).to.eq(1);

    // No resource, can't draw, resource automatically added
    input = game.deferredActions.peek()!.execute();
    game.deferredActions.pop();
    expect(input).is.undefined;
    expect(card.resourceCount).to.eq(2);

    // // Resource available
    // card.onCardPlayed(player, card);
    // expect(game.deferredActions).has.lengthOf(1);

    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    orOptions.options[1].cb();
    expect(card.resourceCount).to.eq(3);

    orOptions.options[0].cb();
    expect(card.resourceCount).to.eq(1);
    expect(player.cardsInHand).has.lengthOf(1);
    expect(game.deferredActions).has.lengthOf(0);
  });

  // it('including this', function() {
  //   player.cardsInHand = [card];
  //   player.playCard(card, undefined);
  //   expect(card.resourceCount).to.eq(0);
  //   runAllActions(game);
  //   expect(card.resourceCount).to.eq(1);
  // });

  it('Plays IMMIGRATION SHUTTLES', function() {
    player.playedCards.push(card);
    card.onCardPlayed(player, new ImmigrationShuttles());
    expect(game.deferredActions).has.lengthOf(2);

    // No resource, can't draw, resource automatically added
    const input = game.deferredActions.peek()!.execute();
    game.deferredActions.pop();
    expect(input).is.undefined;
    expect(card.resourceCount).to.eq(2);
  });

  // it('Plays IMMIGRATION SHUTTLES', function() {
  //   player.playedCards.push(card);
  //   card.onCardPlayed(player, new ImmigrationShuttles());
  //   expect(game.deferredActions).has.lengthOf(2);

  //   // No resource, can't draw, resource automatically added
  //   const input = game.deferredActions.peek()!.execute();
  //   game.deferredActions.pop();
  //   expect(input).is.undefined;
  //   expect(card.resourceCount).to.eq(1);

  //   // Resource on card, can draw
  //   const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
  //   game.deferredActions.pop();
  //   orOptions.options[0].cb();
  //   expect(card.resourceCount).to.eq(0);
  //   expect(player.cardsInHand).has.lengthOf(1);

  //   expect(game.deferredActions).has.lengthOf(0);
  // });

  // it('Triggers before Mars University', function() {
  //   const marsUniversity = new MarsUniversity();
  //   const scienceTagCard = new AdaptationTechnology();

  //   // Olypus Conference played before Mars University
  //   player.playedCards.push(card);
  //   player.playedCards.push(marsUniversity);
  //   card.resourceCount = 1;

  //   // Play a 1 science tag card
  //   player.playCard(scienceTagCard);

  //   // OC asking to draw & MU asking to discard
  //   expect(game.deferredActions).has.lengthOf(2);

  //   // OC's trigger should be the first one
  //   const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
  //   game.deferredActions.pop();
  //   orOptions.options[1].cb();
  //   expect(card.resourceCount).to.eq(2);


  //   // Reset the state
  //   game.deferredActions = new DeferredActionsQueue();
  //   player.playedCards = [];


  //   // Mars University played before Olympus Conference
  //   player.playedCards.push(marsUniversity);
  //   player.playedCards.push(card);
  //   card.resourceCount = 1;

  //   // Play a 1 science tag card
  //   player.playCard(scienceTagCard);

  //   // OC asking to draw & MU asking to discard
  //   expect(game.deferredActions).has.lengthOf(2);

  //   // OC's trigger should be the first one
  //   const orOptions2 = cast(game.deferredActions.peek()!.execute(), OrOptions);
  //   game.deferredActions.pop();
  //   orOptions2.options[1].cb();
  //   expect(card.resourceCount).to.eq(2);
  // });
});
