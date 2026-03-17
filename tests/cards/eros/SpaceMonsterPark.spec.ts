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

  beforeEach(() => {
    card = new SpaceMonsterPark();
    [game, player] = testGame(2, {skipInitialShuffling: true});
  });

  it('Cannot play when have no titanium production', function() {
    expect(card.canPlay(player)).to.eq(false);
  });
  it('Should play', function() {
    player.playedCards.push(card);

    expect(card.getVictoryPoints(player)).to.eq(1);
    player.plants = 2;
    player.playCard(new Bushes());
    expect(game.deferredActions).has.lengthOf(0);

    player.playedCards.remove(card);
    card = new SpaceMonsterPark();

    player.playCard(card);
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


    const orOptions = cast(game.deferredActions.peek()!.execute(), OrOptions);
    game.deferredActions.pop();
    orOptions.options[1].cb();
    expect(card.resourceCount).to.eq(3);

    orOptions.options[0].cb();
    expect(card.resourceCount).to.eq(1);
    expect(player.cardsInHand).has.lengthOf(1);
    expect(game.deferredActions).has.lengthOf(0);
  });


  it('Plays IMMIGRATION SHUTTLES', function() {
    player.playedCards.push(card);
    player.playCard(new ImmigrationShuttles());
    expect(game.deferredActions).has.lengthOf(2);

    // No resource, can't draw, resource automatically added
    const input = game.deferredActions.peek()!.execute();
    game.deferredActions.pop();
    expect(input).is.undefined;
    game.deferredActions.pop()?.execute();
    expect(card.resourceCount).to.eq(2);
  });
});
