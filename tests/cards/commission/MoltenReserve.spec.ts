import {expect} from 'chai';
import {MoltenReserve} from '../../../src/server/cards/commission/MoltenReserve';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';

describe('MoltenReserve', () => {
  let card: MoltenReserve;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MoltenReserve();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  it('基本属性正确', () => {
    expect(card.cost).to.eq(11);
    expect(card.type).to.eq(CardType.ACTIVE);
    expect(card.tags).to.deep.eq([Tag.SPACE]);
  });

  it('打出时增加1热产和1热能，同时获得1MC', () => {
    const initialHeatProd = player.production.heat;
    const initialHeat = player.heat;
    const initialMC = player.megaCredits;

    player.playCard(card);
    runAllActions(game);

    expect(player.production.heat).to.eq(initialHeatProd + 1);
    expect(player.heat).to.eq(initialHeat + 1);
    expect(player.megaCredits).to.eq(initialMC + 1);
  });

  it('通过stock.add获得热能时获得1MC', () => {
    player.playCard(card);
    runAllActions(game);

    const initialMC = player.megaCredits;

    // 通过stock.add获得热能
    player.stock.add(Resource.HEAT, 5);
    runAllActions(game);

    // 无论获得多少热能，只获得1MC
    expect(player.megaCredits).to.eq(initialMC + 1);
  });

  it('多次获得热能每次都触发1MC', () => {
    player.playCard(card);
    runAllActions(game);

    const initialMC = player.megaCredits;

    // 第一次获得热能
    player.stock.add(Resource.HEAT, 3);
    runAllActions(game);
    expect(player.megaCredits).to.eq(initialMC + 1);

    // 第二次获得热能
    player.stock.add(Resource.HEAT, 1);
    runAllActions(game);
    expect(player.megaCredits).to.eq(initialMC + 2);
  });

  it('失去热能时不触发', () => {
    player.playCard(card);
    runAllActions(game);
    player.heat = 10;

    const initialMC = player.megaCredits;

    // 失去热能（负数）
    player.stock.add(Resource.HEAT, -3);
    runAllActions(game);

    // MC不应增加
    expect(player.megaCredits).to.eq(initialMC);
  });

  it('获得其他资源时不触发', () => {
    player.playCard(card);
    runAllActions(game);

    const initialMC = player.megaCredits;

    // 获得钢铁、钛、植物等
    player.stock.add(Resource.STEEL, 3);
    player.stock.add(Resource.TITANIUM, 2);
    player.stock.add(Resource.PLANTS, 1);
    player.stock.add(Resource.ENERGY, 4);
    runAllActions(game);

    // MC不应增加
    expect(player.megaCredits).to.eq(initialMC);
  });

  it('生产阶段有热产时获得1MC', () => {
    player.playCard(card);
    runAllActions(game);

    // 确认有热产
    expect(player.production.heat).to.be.greaterThan(0);

    const initialMC = player.megaCredits;

    // 模拟生产阶段回调
    card.onProductionPhase(player);

    expect(player.megaCredits).to.eq(initialMC + 1);
  });

  it('生产阶段无热产时不获得MC', () => {
    player.playCard(card);
    runAllActions(game);

    // 把热产降为0
    player.production.add(Resource.HEAT, -player.production.heat);
    expect(player.production.heat).to.eq(0);

    const initialMC = player.megaCredits;

    card.onProductionPhase(player);

    expect(player.megaCredits).to.eq(initialMC);
  });
});
