import {expect} from 'chai';
import {LargeEcologicalReserve} from '../../../src/server/cards/eros/LargeEcologicalReserve';
import {testGame, runAllActions, cast} from '../../TestingUtils';
import {TileType} from '../../../src/common/TileType';
import {TestPlayer} from '../../TestPlayer';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

// TODO: 补充红党 ruling policy 相关费用测试
// TODO: 补充氧气已满/无地可放等极端场景

describe('LargeEcologicalReserve', () => {
  let card: LargeEcologicalReserve;
  let player: TestPlayer;
  let game: ReturnType<typeof testGame>[0];

  beforeEach(() => {
    card = new LargeEcologicalReserve();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
    // 满足tag条件
    player.tagsForTest = {plant: 1, animal: 1, microbe: 1};
  });

  it('play - 满足条件时放置2块绿地，氧气提升2格', () => {
    const oxygenBefore = game.getOxygenLevel();
    player.playCard(card);
    // deferred action 队列应有2个 PlaceGreeneryTile
    expect(game.deferredActions.length).to.equal(2);
    // 依次执行放置绿地
    for (let i = 0; i < 2; i++) {
      runAllActions(game);
      const input = cast(player.popWaitingFor(), SelectSpace);
      expect(input).to.not.be.undefined;
      // 直接选择第一个可用地块
      input.cb(input.spaces[0]);
      runAllActions(game);
      expect(input.spaces[0].tile?.tileType).to.equal(TileType.GREENERY);
      expect(input.spaces[0].player).to.equal(player);
    }
    // 氧气提升2格
    expect(game.getOxygenLevel()).to.equal(oxygenBefore + 2);
  });

  it('getVictoryPoints 只在打出后获得1分', () => {
    // 未打出时分数为0
    expect(player.getVictoryPoints().victoryPoints).to.equal(0);
    player.playCard(card);
    expect(player.getVictoryPoints().victoryPoints).to.equal(1);
  });
});
