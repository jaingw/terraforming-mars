import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {PolarAnimals} from '../../../src/server/cards/commission/PolarAnimals';
import {TestPlayer} from '../../TestPlayer';
import {cast, runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';

describe('PolarAnimals', () => {
  let card: PolarAnimals;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new PolarAnimals();
    [game, player] = testGame(2, {aresExtension: true});
  });

  it('Should place an ecological zone with animal adjacency bonus', () => {
    cast(card.play(player), undefined);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);

    const selectedSpace = selectSpace.spaces[0];
    selectSpace.cb(selectedSpace);

    expect(selectedSpace.tile?.tileType).to.eq(TileType.ECOLOGICAL_ZONE);
    expect(selectedSpace.adjacency).to.deep.eq({bonus: [SpaceBonus.ANIMAL]});
  });

  it('Should gain an animal when placing a tile adjacent to its animal tile', () => {
    player.playCard(card);
    runAllActions(game);

    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const selectedSpace = selectSpace.spaces[0];
    selectSpace.cb(selectedSpace);

    expect(card.resourceCount).to.eq(2);

    const adjacentSpace = game.board.getAdjacentSpaces(selectedSpace)
      .find((space) => space.tile === undefined);
    expect(adjacentSpace).is.not.undefined;

    player.megaCredits = 0;
    game.addGreenery(player, adjacentSpace!);
    runAllActions(game);

    expect(player.megaCredits).to.eq(1);
    expect(card.resourceCount).to.eq(3);
  });
});
