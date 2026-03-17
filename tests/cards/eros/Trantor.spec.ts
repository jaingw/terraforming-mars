import {expect} from 'chai';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {Trantor} from '../../../src/server/cards/eros/Trantor';
import {IGame} from '../../../src/server/IGame';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {Resource} from '../../../src/common/Resource';

// 真实太空城市卡牌
import {StanfordTorus} from '../../../src/server/cards/promo/StanfordTorus';
import {LunaMetropolis} from '../../../src/server/cards/venusNext/LunaMetropolis';
import {Stratopolis} from '../../../src/server/cards/venusNext/Stratopolis';
import {MaxwellBase} from '../../../src/server/cards/venusNext/MaxwellBase';
import {TileType} from '../../../src/common/TileType';
import {PhobosSpaceHaven} from '../../../src/server/cards/base/PhobosSpaceHaven';

function getTrantorVP(player: TestPlayer) {
  const details = player.getVictoryPoints().detailsCards;
  const found = details.find((d) => d.cardName === 'Trantor');
  return found ? found.victoryPoint : 0;
}

describe('Trantor', function() {
  let card: Trantor;
  let player: TestPlayer;
  let game: IGame;
  let player1: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    card = new Trantor();
    [game, player, player1, player2] = testGame(3, {skipInitialShuffling: true, erosCardsOption: true, promoCardsOption: true, venusNextExtension: true});
  });

  it('canPlay 总是可以打出', function() {
    expect(card.canPlay(player)).to.be.true;
  });

  it('play 后生产力提升、城市放置在太空', function() {
    const prodBefore = player.production.get(Resource.MEGACREDITS);
    player.playCard(card);
    // 生产力+2
    expect(player.production.get(Resource.MEGACREDITS)).to.equal(prodBefore + 2);
    // 城市放置在TRANTOR
    const trantorSpace = game.board.getSpaceOrThrow(SpaceName.TRANTOR);
    expect(trantorSpace.tile).to.exist;
    expect(trantorSpace.tile!.tileType).to.equal(TileType.CITY);
    expect(trantorSpace.player).to.equal(player);
  });

  it('结算时自己太空城市最多得3分，否则0分', function() {
    player.playCard(card);
    // 只有自己有太空城市
    expect(getTrantorVP(player)).to.equal(3);
    // 另一个玩家也有太空城市
    player1.playCard(new StanfordTorus());
    expect(getTrantorVP(player)).to.equal(3);
  });


  it('多个玩家各自打出多张不同的太空城市卡牌，测试Trantor得分', function() {
    // 玩家1打出Trantor、StanfordTorus
    player.playCard(card);
    player.playCard(new StanfordTorus());
    // 玩家2打出LunaMetropolis、Stratopolis
    player1.playCard(new LunaMetropolis());
    player1.playCard(new Stratopolis());
    // 玩家3打出MaxwellBase
    player2.playCard(new MaxwellBase());
    // 玩家1太空城市最多，应得3分，其余为0
    expect(getTrantorVP(player)).to.equal(3);
    expect(getTrantorVP(player1)).to.equal(0);
    expect(getTrantorVP(player2)).to.equal(0);
    // 玩家2再打出Trantor，超过玩家1， 玩家1不得分
    player1.playCard(new PhobosSpaceHaven());
    expect(getTrantorVP(player)).to.equal(0);
    expect(getTrantorVP(player1)).to.equal(0);
    expect(getTrantorVP(player2)).to.equal(0);
  });

  it('序列化/反序列化后效果保留', function() {
    player.playCard(card);
    const serialized = game.serialize();
    const deserialized = game.loadFromJSON(serialized);
    const deserializedPlayer = deserialized.players[0];
    // 检查卡牌依然存在
    expect(deserializedPlayer.playedCards.get(card.name)).to.exist;
    // 检查城市依然在TRANTOR
    const trantorSpace = deserialized.board.getSpaceOrThrow(SpaceName.TRANTOR);
    expect(trantorSpace.tile).to.exist;
    expect(trantorSpace.tile!.tileType).to.equal(TileType.CITY);
    expect(trantorSpace.player).to.equal(deserializedPlayer);
  });
});
