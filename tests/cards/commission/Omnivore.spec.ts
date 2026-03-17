import {expect} from 'chai';
import {Omnivore} from '../../../src/server/cards/commission/Omnivore';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {cast, runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {CardResource} from '../../../src/common/CardResource';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Decomposers} from '../../../src/server/cards/base/Decomposers';

describe('Omnivore', () => {
  let card: Omnivore;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new Omnivore();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  it('基本属性正确', () => {
    expect(card.cost).to.eq(8);
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).to.deep.eq([Tag.ANIMAL, Tag.MICROBE]);
  });

  it('没有资源时不能执行行动', () => {
    player.playCard(card);
    runAllActions(game);
    expect(card.canAct(player)).to.be.false;
  });

  it('有微生物资源时可以执行行动，花费1微生物获得5MC', () => {
    player.playCard(card);

    // 添加一张带微生物资源的卡牌并手动添加资源
    const decomposers = new Decomposers();
    player.playCard(decomposers);
    runAllActions(game);

    // 手动设置资源数量为1
    decomposers.resourceCount = 1;
    expect(decomposers.resourceType).to.eq(CardResource.MICROBE);
    expect(decomposers.resourceCount).to.eq(1);

    expect(card.canAct(player)).to.be.true;

    const initialMC = player.megaCredits;

    // 只有微生物，自动选择花费微生物
    card.action(player);
    runAllActions(game);

    expect(decomposers.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(initialMC + 5);
  });

  it('有动物资源时可以执行行动，花费1动物获得7MC', () => {
    player.playCard(card);

    // Fish has CardResource.ANIMAL
    const fish = new Fish();
    player.playCard(fish);
    runAllActions(game);

    // 手动设置动物资源
    fish.resourceCount = 1;
    expect(fish.resourceType).to.eq(CardResource.ANIMAL);
    expect(fish.resourceCount).to.eq(1);

    expect(card.canAct(player)).to.be.true;

    const initialMC = player.megaCredits;

    // 只有动物，自动选择花费动物
    card.action(player);
    runAllActions(game);

    expect(fish.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(initialMC + 7);
  });

  it('同时拥有微生物和动物时显示选项', () => {
    player.playCard(card);

    // 添加微生物和动物资源
    const decomposers = new Decomposers();
    player.playCard(decomposers);

    const fish = new Fish();
    player.playCard(fish);

    runAllActions(game);

    // 在所有卡牌打出并结算后，手动设定资源数量（避免Decomposers自身效果干扰）
    decomposers.resourceCount = 1;
    fish.resourceCount = 1;

    expect(card.canAct(player)).to.be.true;

    const initialMC = player.megaCredits;

    // 应该返回OrOptions让玩家选择
    const orOptions = cast(card.action(player), OrOptions);
    expect(orOptions.options.length).to.eq(2);

    // 选择花费微生物（第一个选项）
    orOptions.options[0].cb(undefined);
    runAllActions(game);

    expect(decomposers.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(initialMC + 5);
  });

  it('选择花费动物获得7MC', () => {
    player.playCard(card);

    const decomposers = new Decomposers();
    player.playCard(decomposers);

    const fish = new Fish();
    player.playCard(fish);

    runAllActions(game);

    // 设定资源数量
    decomposers.resourceCount = 1;
    fish.resourceCount = 1;

    const initialMC = player.megaCredits;

    const orOptions = cast(card.action(player), OrOptions);

    // 选择花费动物（第二个选项）
    orOptions.options[1].cb(undefined);
    runAllActions(game);

    expect(fish.resourceCount).to.eq(0);
    expect(player.megaCredits).to.eq(initialMC + 7);
  });
});
