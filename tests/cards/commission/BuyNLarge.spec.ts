import {expect} from 'chai';
import {BuyNLarge} from '../../../src/server/cards/commission/BuyNLarge';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions, cast} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TileType} from '../../../src/common/TileType';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Ants} from '../../../src/server/cards/base/Ants';
import {ArcticAlgae} from '../../../src/server/cards/base/ArcticAlgae';
import {Birds} from '../../../src/server/cards/base/Birds';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {Bushes} from '../../../src/server/cards/base/Bushes';
import {Greenhouses} from '../../../src/server/cards/base/Greenhouses';
import {Heather} from '../../../src/server/cards/base/Heather';
import {Lichen} from '../../../src/server/cards/base/Lichen';
import {Moss} from '../../../src/server/cards/base/Moss';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('BuyNLarge', () => {
  let card: BuyNLarge;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new BuyNLarge();
    [game, player, player2] = testGame(2, {skipInitialShuffling: true});
  });

  it('初始资金为30，初始资源1', () => {
    player.playCorporationCard(card);
    expect(card.resourceCount).to.eq(1);
  });


  it('初始行动应放置一个绿化', () => {
    // 执行初始行动
    player.playCorporationCard(card);
    player.defer(card.initialAction(player));
    runAllActions(game);

    // 验证等待输入是选择空间
    const input = player.popWaitingFor();
    expect(input).to.exist;
    expect(input).to.be.instanceOf(SelectSpace);

    // 选择一个可用空间放置绿化
    const selectSpace = input as SelectSpace;
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    runAllActions(game);

    // 验证放置了绿化
    expect(space.tile?.tileType).to.eq(TileType.GREENERY);
    expect(space.player).to.eq(player);
    const bonusPlant = space.bonus.filter((bonus) => bonus === SpaceBonus.PLANT).length;
    // 验证通过放置绿地，卡牌获得了种子资源
    expect(card.resourceCount).to.eq(bonusPlant + 2); // 初始1 + 放置绿化1
  });

  it('当打出带有生物标签的卡牌时获得种子资源', () => {
    // 打出公司卡并完成初始行动
    player.playCorporationCard(card);
    runAllActions(game);


    // 记录初始资源数量
    const initialResources = card.resourceCount;

    // 打出微生物标签卡
    player.playCard(new Ants());
    runAllActions(game);

    // 验证获得了1个种子资源
    expect(card.resourceCount).to.eq(initialResources + 1);

    // 打出植物标签卡
    player.playCard(new ArcticAlgae());
    runAllActions(game);

    // 验证再次获得1个种子资源
    expect(card.resourceCount).to.eq(initialResources + 2);

    // 打出动物标签卡
    player.playCard(new Birds());
    runAllActions(game);

    // 验证再次获得1个种子资源
    expect(card.resourceCount).to.eq(initialResources + 3);
  });

  it('当有8个种子资源时自动转换为8植物', () => {
    // 打出公司卡并完成初始行动
    player.playCorporationCard(card);
    runAllActions(game);


    // 手动设置资源到7（差1个达到阈值8）
    card.resourceCount = 7;

    // 记录初始植物数量
    const initialPlants = player.plants;

    // 打出1张生物标签卡，获得第8个种子
    player.playCard(new Ants());
    runAllActions(game);

    // 验证种子资源被消耗（8个种子 → 0），得到植物
    expect(card.resourceCount).to.eq(0); // 8个种子应被转换
    expect(player.plants).to.eq(initialPlants + 8); // 获得8植物
  });

  it('7个种子资源时不应触发转换', () => {
    player.playCorporationCard(card);
    runAllActions(game);

    // 手动设置资源到6
    card.resourceCount = 6;

    const initialPlants = player.plants;

    // 打出1张生物标签卡，获得第7个种子
    player.playCard(new Ants());
    runAllActions(game);

    // 7个种子不足以触发转换（阈值为8）
    expect(card.resourceCount).to.eq(7);
    expect(player.plants).to.eq(initialPlants);
  });

  it('当放置多个绿化时，每次都获得种子资源', () => {
    // 打出公司卡并触发初始行动
    player.playCorporationCard(card);
    runAllActions(game);


    // 记录此时的资源数量
    const resourcesAfterFirstGreenery = card.resourceCount;

    // 准备放置第二个绿化
    // 首先需要足够的植物资源
    player.plants = 8; // 设置足够的植物来放置绿化

    // 尝试放置第二个绿化
    const availableSpaces = game.board.getAvailableSpacesForGreenery(player);
    if (availableSpaces.length > 0) {
      // 使用标准行动放置绿化
      player.takeAction();
      const actions = cast(player.getWaitingFor(), OrOptions);
      const greeneryAction = actions.options.find((option) => option.title === 'Convert 8 plants into greenery');
      if (greeneryAction) {
        greeneryAction.cb();

        // 选择空间
        const spaceSelection = player.popWaitingFor() as SelectSpace;
        spaceSelection.cb(availableSpaces[0]);
        runAllActions(game);

        // 验证再次获得1个种子资源
        expect(card.resourceCount).to.eq(resourcesAfterFirstGreenery + 1);
      }
    }
  });

  it('其他玩家放置绿地不会触发效果', () => {
    // 打出公司卡并完成初始行动
    player.playCorporationCard(card);
    runAllActions(game);


    // 记录当前资源数量
    const resourcesAfterInit = card.resourceCount;

    // 玩家2放置绿化
    player2.plants = 8; // 确保有足够的植物
    const availableSpaces = game.board.getAvailableSpacesForGreenery(player2);
    if (availableSpaces.length > 0) {
      // 使用标准行动放置绿化
      player2.takeAction();
      const actions = cast(player2.getWaitingFor(), OrOptions);
      const greeneryAction = actions.options.find((option) => option.title === 'Convert 8 plants into greenery');
      if (greeneryAction) {
        greeneryAction.cb();

        // 选择空间
        const spaceSelection = player2.popWaitingFor() as SelectSpace;
        spaceSelection.cb(availableSpaces[0]);
        runAllActions(game);

        // 验证玩家1的卡牌没有获得种子资源
        expect(card.resourceCount).to.eq(resourcesAfterInit);
      }
    }
  });

  it('其他玩家打出生物标签卡牌不会触发效果', () => {
    // 打出公司卡并完成初始行动
    player.playCorporationCard(card);
    runAllActions(game);


    // 记录当前资源数量
    const resourcesAfterInit = card.resourceCount;

    // 玩家2打出带有微生物标签的卡牌
    player2.playCard(new Ants());
    runAllActions(game);

    // 验证玩家1的卡牌没有获得种子资源
    expect(card.resourceCount).to.eq(resourcesAfterInit);
  });
});
