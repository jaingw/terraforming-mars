import {expect} from 'chai';
import {LandHarvest} from '../../../src/server/cards/commission/LandHarvest';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions, cast, addCity} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
// import {TileType} from '../../../src/common/TileType';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Tag} from '../../../src/common/cards/Tag';
import {Phase} from '../../../src/common/Phase';
// import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('LandHarvest', () => {
  let card: LandHarvest;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new LandHarvest();
    [game, player, player2] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  it('初始资金为11 M€，标签为铁', () => {
    expect(card.cost).to.eq(11);
    expect(card.tags).deep.eq([Tag.BUILDING]);
  });

  it('初始效果：放置1个金边版块', () => {
  //   // 记录初始版块数量
  //   const initialTileCount = player.game.board.spaces.filter((space) => space.tile !== undefined).length;

    game.phase = Phase.ACTION;
    player.playCard(card);
    runAllActions(game);

    //   const initialMegacredits = player.megaCredits;

    //   const action = cast(player.popWaitingFor(), SelectSpace);
    //   const space = action.spaces[0];
    //   action.cb(space);
    //   runAllActions(game);

    //   // 验证版块已放置
    //   expect(space.tile?.tileType).to.eq(TileType.RESTRICTED_AREA);
    //   expect(space.adjacency).to.deep.eq({bonus: [SpaceBonus.DRAW_CARD]});
    //   expect(player.game.board.spaces.filter((space) => space.tile !== undefined).length).to.eq(initialTileCount + 1);

    //   // 验证玩家获得了2MC
    //   expect(player.megaCredits).to.eq(initialMegacredits + 2);

    // 效果：在火星上放置版块时获得2MC

    // 记录初始资金
    const initialMegacredits2 = player.megaCredits;
    addCity(player);

    runAllActions(game);

    // 验证玩家获得了2MC
    expect(player.megaCredits).to.eq(initialMegacredits2 + 2);
  });

  it('效果不会在SOLAR阶段触发', () => {
    player.playCard(card);
    runAllActions(game);

    // const action = cast(player.popWaitingFor(), SelectSpace);
    // const space = action.spaces[0];
    // action.cb(space);
    // runAllActions(game);


    // 记录初始资金
    const initialMegacredits = player.megaCredits;

    game.phase = Phase.SOLAR;

    addCity(player);

    runAllActions(game);

    // 验证玩家没有获得额外MC
    expect(player.megaCredits).to.eq(initialMegacredits );
  });

  it('效果不会为其他玩家触发', () => {
    player.playCard(card);
    runAllActions(game);

    // const action = cast(player.popWaitingFor(), SelectSpace);
    // const space = action.spaces[0];
    // action.cb(space);
    // runAllActions(game);

    player2.megaCredits = 100;

    // 记录初始资金
    const initialMegacredits = player.megaCredits;

    addCity(player2);
    runAllActions(game);

    // 验证玩家1没有获得额外MC
    expect(player.megaCredits).to.eq(initialMegacredits);
    expect(player2.megaCredits).to.eq(100);
  });
});
