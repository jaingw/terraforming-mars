import {expect} from 'chai';
import {MirrorCoat} from '../../../src/server/cards/commission/MirrorCoat';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions, cast, finishGeneration} from '../../TestingUtils';
import {Resource} from '../../../src/common/Resource';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Mine} from '../../../src/server/cards/base/Mine';
import {Birds} from '../../../src/server/cards/base/Birds';
import {DeepWellHeating} from '../../../src/server/cards/base/DeepWellHeating';
import {GeothermalPower} from '../../../src/server/cards/base/GeothermalPower';
import {Asteroid} from '../../../src/server/cards/base/Asteroid';

describe('MirrorCoat', () => {
  let card: MirrorCoat;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MirrorCoat();
    [game, player, player2] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
    player2.megaCredits = 100;
  });

  it('should start with 39 M€ and draw 2 cards', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(card.startingMegaCredits).to.eq(39);
    expect(player.cardsInHand.length).to.eq(2);
  });

  it('should only act once and copy two building cards production', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    // 打出两张带building tag的牌
    const b1 = new Mine(); //  1铁产
    const b2 = new DeepWellHeating(); // 1电产
    const b3 = new GeothermalPower(); // 2电产

    player.playCard(b1);
    player.playCard(b2);
    player.playCard(b3);
    runAllActions(game);
    // 行动可用
    expect(card.canAct(player)).to.be.true;
    // 执行动作
    card.action(player);
    runAllActions(game);

    // 选择第一张卡
    const selectCard1 = cast(player.popWaitingFor(), SelectCard);
    selectCard1.cb([b1]);
    runAllActions(game);

    // 选择第二张卡
    const selectCard2 = cast(player.popWaitingFor(), SelectCard);
    selectCard2.cb([b2]);
    runAllActions(game);

    // 钢产能+1
    expect(player.production.get(Resource.STEEL)).to.eq(3);// mine + mirrorcat卡牌自身 + 复制mine
    expect(player.production.get(Resource.ENERGY)).to.eq(4);// mirrorcat卡牌自身 + 复制deepwellheating + GeothermalPower
    // 行动只能用一次
    expect(card.canAct(player)).to.be.false;

    finishGeneration(game);

    // 新世代后不可以再次使用
    expect(card.canAct(player)).to.be.false;
    // 验证data中isUsed为true
    expect(card.data.isUsed).to.be.true;

    // 序列化游戏
    const data = game.serialize();

    // 反序列化
    const newGame = game.loadFromJSON(data);
    const newPlayer = newGame.getPlayerById(player.id)!;
    const newCard = newPlayer.playedCards.get(card.name) as MirrorCoat;

    expect(newCard).to.not.be.undefined;
    // 验证反序列化后仍然不能使用行动
    expect(newCard.canAct(newPlayer)).to.be.false;
  });

  it('should not act if no building tag cards', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(card.canAct(player)).to.be.false;
  });

  it('should protect player from having resources decreased by opponents', () => {
    // 设置初始产能和资源
    player.playCorporationCard(card);
    runAllActions(game);
    player.production.add(Resource.PLANTS, 3);
    player.production.add(Resource.STEEL, 2);
    player.stock.add(Resource.PLANTS, 5);
    player.stock.add(Resource.STEEL, 4);

    // 记录初始值
    const initialPlantProd = player.production.get(Resource.PLANTS);
    const initialPlants = player.stock.get(Resource.PLANTS);

    // 玩家2尝试使用降低产能的卡牌
    const birds = new Birds();
    player2.playCard(birds);
    runAllActions(game);

    expect(player2.popWaitingFor()).to.be.undefined;

    // 玩家1的植物产能不应该减少
    expect(player.production.get(Resource.PLANTS)).to.eq(initialPlantProd);

    // 玩家2尝试使用可以移除植物的卡牌
    const asteroid = new Asteroid();
    player2.megaCredits = 36; // 确保有足够的钱
    player2.playCard(asteroid);
    runAllActions(game);

    // 处理移除植物的选择
    expect(player2.popWaitingFor()).to.be.undefined;

    // 玩家1的植物数量不应该减少
    expect(player.stock.get(Resource.PLANTS)).to.eq(initialPlants);
  });
});
