import {expect} from 'chai';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {MarsHotSpring} from '../../../src/server/cards/eros/MarsHotSpring';
import {IGame} from '../../../src/server/IGame';
import {TileType} from '../../../src/common/TileType';
import {Resource} from '../../../src/common/Resource';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {Space} from '../../../src/server/boards/Space';
import {cast} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('MarsHotSpring', function() {
  let card: MarsHotSpring;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MarsHotSpring();
    [game, player] = testGame(2, {skipInitialShuffling: true});
  });

  function placeOceansWithAdjacentLand(): Array<Space> {
    // 找到与陆地相邻的海洋空间并放置海洋
    const oceanSpacesWithAdjacentLand: Array<Space> = [];
    for (const space of game.board.spaces) {
      if (space.spaceType !== SpaceType.OCEAN) continue;
      if (space.tile !== undefined) continue;
      const adjSpaces = game.board.getAdjacentSpaces(space);
      const adjacentLand = adjSpaces.some((s) => s.spaceType === SpaceType.LAND);
      if (adjacentLand) {
        game.addTile(player, space, {tileType: TileType.OCEAN});
        oceanSpacesWithAdjacentLand.push(space);
        if (oceanSpacesWithAdjacentLand.length >= 3) break;
      }
    }
    return oceanSpacesWithAdjacentLand;
  }

  it('canPlay 需要有相邻海洋的陆地', function() {
    expect(card.canPlay(player)).to.be.false;
    // 先放3个与陆地相邻的海洋，满足前置条件
    placeOceansWithAdjacentLand();
    // 现在应该有相邻海洋的陆地可以放置温泉
    expect(card.canPlay(player)).to.be.true;
  });

  it('play 增加2热产出和2M产出，并放置温泉地块', function() {
    // 先放3个与陆地相邻的海洋，满足前置条件
    placeOceansWithAdjacentLand();

    const heatBefore = player.production.get(Resource.HEAT);
    const mcBefore = player.production.get(Resource.MEGACREDITS);
    player.playCard(card);
    // 选择一个相邻海洋的陆地
    const available = game.board.getAvailableSpacesOnLand(player)
      .filter((space) => game.board.getAdjacentSpaces(space).some((adj) => adj.tile && adj.tile.tileType === TileType.OCEAN));
    expect(available.length).to.be.greaterThan(0);
    const selectSpace = cast(game.deferredActions.pop()?.execute(), SelectSpace);
    selectSpace.cb(available[0]);
    // 检查产出
    expect(player.production.get(Resource.HEAT)).to.equal(heatBefore + 2);
    expect(player.production.get(Resource.MEGACREDITS)).to.equal(mcBefore + 2);
    // 检查温泉地块
    expect(available[0].tile).to.exist;
    expect(available[0].tile!.tileType).to.equal(TileType.HOT_SPRING);
  });
});
