import {expect} from 'chai';
import {GreenLeafDance} from '../../../src/server/cards/commission/GreenLeafDance';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions, cast} from '../../TestingUtils';
import {Resource} from '../../../src/common/Resource';
import {IGame} from '../../../src/server/IGame';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {TileType} from '../../../src/common/TileType';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {OrOptions} from '../../../src/server/inputs/OrOptions';

describe('GreenLeafDance', () => {
  let card: GreenLeafDance;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new GreenLeafDance();
    [game, player, player2] = testGame(2, {skipInitialShuffling: true});
  });

  it('should start with 35 M€ and place an ocean', () => {
    player.playCorporationCard(card);
    player.defer(card.initialAction(player));
    runAllActions(game);

    // 验证放置海洋的流程
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const oceanSpace = selectSpace.spaces[0];
    selectSpace.cb(oceanSpace);

    // 检查是否有海洋板块被放置
    expect(oceanSpace.tile?.tileType).to.equal(TileType.OCEAN);
    expect(game.board.getOceanSpaces().length).to.equal(1);
  });

  it('should trigger plant production increase when placing tile on plant bonus and can afford', () => {
    // 先放置公司卡
    player.playCorporationCard(card);
    runAllActions(game);

    // 模拟有足够资金
    player.megaCredits = 10;

    // 找一个有植物奖励的空间
    const space = game.board.getAvailableSpacesOnLand(player).find(
      (space) => space.bonus.includes(SpaceBonus.PLANT),
    );

    if (!space) {
      throw new Error('Could not find a space with plant bonus');
    }

    // 记录初始植物产能
    const initialPlantProduction = player.production.get(Resource.PLANTS);

    // 放置一个板块到这个空间以触发能力
    game.addTile(player, space, {tileType: TileType.GREENERY});
    runAllActions(game);

    // 应该触发卡牌效果，选择支付3MC提升植物产能
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[0].cb(); // 选择"支付3MC提升植物产能"选项
    runAllActions(game);

    // 植物产能应该增加
    expect(player.production.get(Resource.PLANTS)).to.equal(initialPlantProduction + 1);
  });

  it('should not trigger effect if cannot afford', () => {
    // 先放置公司卡
    player.playCorporationCard(card);
    runAllActions(game);


    // 设置资金不足
    player.megaCredits = 1;

    // 找一个有植物奖励的空间
    const space = game.board.getAvailableSpacesOnLand(player).find(
      (space) => space.bonus.includes(SpaceBonus.PLANT),
    );

    if (!space) {
      throw new Error('Could not find a space with plant bonus');
    }

    // 记录初始植物产能
    const initialPlantProduction = player.production.get(Resource.PLANTS);

    // 放置一个板块到这个空间以触发能力
    game.addTile(player, space, {tileType: TileType.GREENERY});
    runAllActions(game);

    // 植物产能不应该变化，且不会弹出选择提示(因为资金不足)
    expect(player.production.get(Resource.PLANTS)).to.equal(initialPlantProduction);
  });

  it('should allow declining the effect even when able to afford', () => {
    // 先放置公司卡
    player.playCorporationCard(card);
    runAllActions(game);


    // 设置足够的资金
    player.megaCredits = 10;

    // 找一个有植物奖励的空间
    const space = game.board.getAvailableSpacesOnLand(player).find(
      (space) => space.bonus.includes(SpaceBonus.PLANT),
    );

    if (!space) {
      throw new Error('Could not find a space with plant bonus');
    }

    // 记录初始植物产能
    const initialPlantProduction = player.production.get(Resource.PLANTS);

    // 放置一个板块到这个空间以触发能力
    game.addTile(player, space, {tileType: TileType.GREENERY});
    runAllActions(game);

    // 应该触发卡牌效果，选择不使用效果
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[1].cb(); // 选择"不使用卡牌效果"选项
    runAllActions(game);

    // 植物产能应该保持不变
    expect(player.production.get(Resource.PLANTS)).to.equal(initialPlantProduction);
  });

  it('should not trigger effect when placing tile on space without plant bonus', () => {
    // 先放置公司卡
    player.playCorporationCard(card);
    runAllActions(game);


    // 设置足够资金
    player.megaCredits = 10;

    // 找一个没有植物奖励的空间
    const space = game.board.getAvailableSpacesOnLand(player).find(
      (space) => !space.bonus.includes(SpaceBonus.PLANT),
    );

    if (!space) {
      throw new Error('Could not find a space without plant bonus');
    }

    // 记录初始植物产能
    const initialPlantProduction = player.production.get(Resource.PLANTS);

    // 放置一个板块到这个空间
    game.addTile(player, space, {tileType: TileType.GREENERY});
    runAllActions(game);

    // 应该不会触发效果选择
    expect(player.popWaitingFor()).to.be.undefined;

    // 植物产能应该保持不变
    expect(player.production.get(Resource.PLANTS)).to.equal(initialPlantProduction);
  });

  it('should not trigger effect when another player places a tile', () => {
    // 先放置公司卡
    player.playCorporationCard(card);
    runAllActions(game);


    // 确保玩家2有足够资金
    player2.megaCredits = 10;

    // 找一个有植物奖励的空间
    const space = game.board.getAvailableSpacesOnLand(player2).find(
      (space) => space.bonus.includes(SpaceBonus.PLANT),
    );

    if (!space) {
      throw new Error('Could not find a space with plant bonus');
    }

    // 记录初始植物产能
    const initialPlantProduction = player.production.get(Resource.PLANTS);

    // 玩家2放置一个板块到这个空间
    game.addTile(player2, space, {tileType: TileType.GREENERY});
    runAllActions(game);

    // 玩家1不应该有任何等待操作
    expect(player.getWaitingFor()).to.be.undefined;

    // 玩家1的植物产能应该保持不变
    expect(player.production.get(Resource.PLANTS)).to.equal(initialPlantProduction);
  });
});
