import {expect} from 'chai';
import {FloralBloomSurge} from '../../../src/server/cards/commission/FloralBloomSurge';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {Resource} from '../../../src/common/Resource';
import {IGame} from '../../../src/server/IGame';
import {AdaptedLichen} from '../../../src/server/cards/base/AdaptedLichen';
import {ProtectedValley} from '../../../src/server/cards/base/ProtectedValley';
import {ArcticAlgae} from '../../../src/server/cards/base/ArcticAlgae';
import {Greenhouses} from '../../../src/server/cards/base/Greenhouses';
import {SearchForLife} from '../../../src/server/cards/base/SearchForLife';
import {NoctisFarming} from '../../../src/server/cards/base/NoctisFarming';

describe('FloralBloomSurge', () => {
  let card: FloralBloomSurge;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new FloralBloomSurge();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  it('should not be played if not enough plant tags', () => {
    // 只打出1张植物tag卡
    player.playCard(new AdaptedLichen());
    runAllActions(game);
    // 不满足2植物tag要求
    expect(card.canPlay && card.canPlay(player)).to.be.false;
  });

  it('should play with enough plant tags and increase plant production on plant card played', () => {
    // 先打出2张植物tag卡
    player.playCard(new Greenhouses());
    player.playCard(new ProtectedValley());
    runAllActions(game);
    expect(card.canPlay && card.canPlay(player)).to.be.true;
    player.playCard(card);
    runAllActions(game);
    expect(player.production.get(Resource.PLANTS)).to.equal(1);

    // 再打出一张植物tag卡
    const plantCard = new ArcticAlgae();
    player.playCard(plantCard);
    runAllActions(game);
    // 植物生产力提升
    expect(player.production.get(Resource.PLANTS)).to.equal(2);
  });

  it('should not increase plant production on non-plant card', () => {
    player.playCard(new Greenhouses());
    player.playCard(new NoctisFarming());
    runAllActions(game);
    player.playCard(card);
    runAllActions(game);
    expect(player.production.get(Resource.PLANTS)).to.equal(1);
    // 打出一张无植物tag的牌
    const nonPlant = new SearchForLife();
    player.playCard(nonPlant);
    runAllActions(game);
    expect(player.production.get(Resource.PLANTS)).to.equal(1);
  });
});
