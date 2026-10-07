import {expect} from 'chai';
import {_RobinsonIndustries_} from '../../../src/server/cards/breakthrough/corporation/_RobinsonIndustries_';
import {Resource} from '../../../src/common/Resource';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestingUtils';

describe('_RobinsonIndustries_', () => {
  let card: _RobinsonIndustries_;
  let player: TestPlayer;

  beforeEach(() => {
    card = new _RobinsonIndustries_();
    [, player] = testGame(1);
  });

  it('does not lose megacredits when immediate M€ production is negative', () => {
    player.megaCredits = 3;
    player.production.add(Resource.MEGACREDITS, -3);

    card.increaseAndLogProduction(player, Resource.MEGACREDITS);

    expect(player.production.megacredits).eq(-2);
    expect(player.megaCredits).eq(0);
  });

  it('gains megacredits when immediate M€ production is positive', () => {
    player.megaCredits = 3;
    player.production.add(Resource.MEGACREDITS, 1);

    card.increaseAndLogProduction(player, Resource.MEGACREDITS);

    expect(player.production.megacredits).eq(2);
    expect(player.megaCredits).eq(2);
  });
});
