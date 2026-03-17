import {expect} from 'chai';
import {JovianExpedition} from '../../../src/server/cards/eros/JovianExpedition';
import {testGame, runAllActions, cast} from '../../TestingUtils';
import {ColonyName} from '../../../src/common/colonies/ColonyName';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Penguins} from '../../../src/server/cards/promo/Penguins';

describe('JovianExpedition', () => {
  let card: JovianExpedition;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new JovianExpedition();
    // 初始化8个殖民地，确保包含TITANIA和Miranda
    [game, player] = testGame(2, {coloniesExtension: true, skipInitialShuffling: true, communityCardsOption: true, customColoniesList: [
      ColonyName.TITANIA,
      ColonyName.MIRANDA,
      ColonyName.LUNA,
      ColonyName.CERES,
      ColonyName.IO,
      ColonyName.ENCELADUS,
      ColonyName.PLUTO,
      ColonyName.CALLISTO,
    ]});
    player.megaCredits = 100;
  });

  it('canPlay 需要已有殖民地', () => {
    // 没有殖民地时不可打出
    game.colonies.forEach((colony) => colony.colonies = []);
    expect(card.canPlay(player)).is.false;
    // 动态获取第一个殖民地并添加给玩家
    const firstColony = game.colonies[0];
    firstColony.addColony(player);
    expect(card.canPlay(player)).is.true;
  });

  it('play - coloniesExtension 开启时可添加殖民地且不能选 Titania', () => {
    // 新建游戏时指定 TITANIA 存在
    if (game.discardedColonies.find((colony) => colony.name === ColonyName.TITANIA) === undefined) {
      game.discardedColonies.push(game.colonies.splice(game.colonies.findIndex((colony) => colony.name === ColonyName.TITANIA), 1)[0]!);
    }
    // 新建游戏时指定 LUNA 存在
    if (game.discardedColonies.find((colony) => colony.name === ColonyName.LUNA) === undefined) {
      game.discardedColonies.push(game.colonies.splice(game.colonies.findIndex((colony) => colony.name === ColonyName.LUNA), 1)[0]!);
    }
    player.megaCredits = 100;
    // 动态获取第一个殖民地并添加给玩家，确保能打出
    const firstColony = game.colonies[0];
    firstColony.addColony(player);

    // 记录初始殖民地数量
    const initialColoniesCount = game.colonies.length;
    expect(game.discardedColonies.find((colony) => colony.name === ColonyName.TITANIA)).to.not.be.undefined;
    player.playCard(card);
    // 触发 colony tile 选择
    runAllActions(game);

    // 验证第一个等待操作是选择殖民地板块
    const selectColonyTile = cast(player.popWaitingFor(), SelectColony);

    // 验证不能选择 Titania
    expect(selectColonyTile.colonies.map((c) => c.name)).to.not.include(ColonyName.TITANIA);
    expect(selectColonyTile.colonies.map((c) => c.name)).to.include(ColonyName.LUNA);

    // 验证可以选择至少一个殖民地板块
    expect(selectColonyTile.colonies.length).to.be.greaterThan(0);

    // 选择第一个可用的殖民地板块
    const selectedColonyTile = selectColonyTile.colonies.find((colony) => colony.name === ColonyName.LUNA)!;

    expect(game.discardedColonies.find((colony) => colony.name === selectedColonyTile.name)).to.not.be.undefined;

    selectColonyTile.cb(selectedColonyTile);

    // 运行所有动作，处理选择殖民地板块后的效果
    runAllActions(game);

    // 验证殖民地板块已添加
    expect(game.colonies.length).to.equal(initialColoniesCount + 1);
    // 验证刚选择的殖民地板块已添加到 colonies
    expect(game.colonies.find((colony) => colony.name === selectedColonyTile.name)).to.exist;
    expect(game.discardedColonies.find((colony) => colony.name === selectedColonyTile.name)).to.be.undefined;


    // 验证第二个等待操作是放置殖民地
    const buildColonyInput = cast(player.popWaitingFor(), SelectColony);

    // 验证可以在新添加的殖民地上放置殖民地
    expect(buildColonyInput.colonies.some((colony) => colony.name === selectedColonyTile.name)).to.be.true;

    const megaCredits = player.production.megacredits;
    // 选择刚添加的殖民地进行放置
    const colonyToPlaceOn = buildColonyInput.colonies.find((colony) => colony.name === selectedColonyTile.name)!;
    buildColonyInput.cb(colonyToPlaceOn);

    // 运行所有动作，确保殖民地放置完成
    runAllActions(game);

    expect(player.production.megacredits).to.equal(megaCredits + 2);
    // 验证殖民地已成功放置
    const placedColony = game.colonies.find((colony) => colony.name === colonyToPlaceOn.name);
    expect(placedColony).to.not.be.undefined;
    expect(placedColony!.colonies.includes(player)).to.be.true;


    // 验证玩家获得了1分
    expect(card.getVictoryPoints(player)).to.equal(1);
  });

  it('play - coloniesExtension 关闭时无效果', () => {
    [game, player] = testGame(1, {coloniesExtension: false, skipInitialShuffling: true});
    expect(card.canPlay(player)).is.false;
    // 直接 play 不应有 deferred action
    player.playCard(card);
    expect(game.deferredActions.length).to.equal(0);
  });

  it('getVictoryPoints 打出后获得1分', () => {
    // 动态获取第一个殖民地并添加给玩家，确保能打出
    const firstColony = game.colonies[0];
    firstColony.addColony(player);
    expect(card.getVictoryPoints(player)).to.equal(1);
    // 未打出时分数也为1（如需更精确可用 playedCards 断言）
    player.playedCards.push(card);
    expect(card.getVictoryPoints(player)).to.equal(1);
  });

  it('测试选择未激活的殖民地能正确判断激活条件', () => {
    if (game.discardedColonies.find((colony) => colony.name === ColonyName.MIRANDA) === undefined) {
      game.discardedColonies.push(game.colonies.splice(game.colonies.findIndex((colony) => colony.name === ColonyName.MIRANDA), 1)[0]!);
    }


    // 确保玩家已有殖民地，以便能够打出卡牌
    game.colonies[0].addColony(player);

    const miranda = game.discardedColonies.find((colony) => colony.name === ColonyName.MIRANDA);
    expect(miranda?.isActive).to.be.false;

    // 打出卡牌
    player.playCard(card);
    runAllActions(game);

    // 验证第一个等待操作是选择殖民地板块
    const selectColonyTile = cast(player.popWaitingFor(), SelectColony);

    // 选择一个未激活的殖民地板块(Titan)
    const titanColony = selectColonyTile.colonies.find((colony) => colony.name === ColonyName.MIRANDA)!;
    expect(titanColony).to.not.be.undefined;
    selectColonyTile.cb(titanColony);

    runAllActions(game);

    // 验证殖民地板块已添加但仍然是未激活状态
    const addedTitan = game.colonies.find((colony) => colony.name === ColonyName.MIRANDA);
    expect(addedTitan).to.not.be.undefined;
    expect(addedTitan!.isActive).to.be.false;

    // 验证第二个等待操作是放置殖民地
    const buildColonyInput = cast(player.popWaitingFor(), SelectColony);

    // 验证未激活的殖民地不在可选列表中
    expect(buildColonyInput.colonies.find((colony) => colony.name === ColonyName.MIRANDA)).to.be.undefined;
  });

  it('测试激活殖民地的条件检测', () => {
    if (game.discardedColonies.find((colony) => colony.name === ColonyName.MIRANDA) === undefined) {
      game.discardedColonies.push(game.colonies.splice(game.colonies.findIndex((colony) => colony.name === ColonyName.MIRANDA), 1)[0]!);
    }


    // 确保玩家已有殖民地，以便能够打出卡牌
    game.colonies[0].addColony(player);

    const miranda = game.discardedColonies.find((colony) => colony.name === ColonyName.MIRANDA);
    expect(miranda?.isActive).to.be.false;

    player.playCard(new Penguins());

    // 打出卡牌
    player.playCard(card);
    runAllActions(game);

    // 验证第一个等待操作是选择殖民地板块
    const selectColonyTile = cast(player.popWaitingFor(), SelectColony);

    // 选择一个未激活的殖民地板块(Titan)
    const titanColony = selectColonyTile.colonies.find((colony) => colony.name === ColonyName.MIRANDA)!;
    expect(titanColony).to.exist;
    selectColonyTile.cb(titanColony);

    runAllActions(game);

    // 验证殖民地板块已添加并且是激活状态
    const addedTitan = game.colonies.find((colony) => colony.name === ColonyName.MIRANDA);
    expect(addedTitan).to.not.be.undefined;
    expect(addedTitan!.isActive).to.be.true;

    // 验证第二个等待操作是放置殖民地
    const buildColonyInput = cast(player.popWaitingFor(), SelectColony);

    // 验证激活的殖民地在可选列表中
    expect(buildColonyInput.colonies.find((colony) => colony.name === ColonyName.MIRANDA)).to.exist;
  });
});
