import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {SelectSpace} from '../../inputs/SelectSpace';
import {TileType} from '../../../common/TileType';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {digit} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IGame} from '../../IGame';

export class MarsHotSpring extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MARS_HOT_SPRING,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING],
      cost: 12,

      behavior: {
        production: {heat: 2, megacredits: 2},
      },

      requirements: {oceans: 3},
      metadata: {
        cardNumber: 'Q06',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).nbsp.heat(2, {digit})).br;
          b.tile(TileType.HOT_SPRING, true, false).asterix();
        }),
        description: 'Requires 3 ocean tiles. Increase your M€ and Heat production 2 steps. Place this tile ADJACENT TO an ocean tile.',
      },
    });
  }
  public override bespokeCanPlay(player: IPlayer): boolean {
    const canPlaceTile = this.getAvailableSpaces(player, player.game).length > 0;
    return canPlaceTile;
  }
  public override bespokePlay(player: IPlayer) {
    const availableSpaces = this.getAvailableSpaces(player, player.game);
    if (availableSpaces.length < 1) return undefined;

    return new SelectSpace('Select space for tile', availableSpaces ).andThen((foundSpace: Space) => {
      player.game.addTile(player, foundSpace, {tileType: TileType.HOT_SPRING});
      return undefined;
    });
  }

  private getAvailableSpaces(player: IPlayer, game: IGame): Array<Space> {
    return game.board.getAvailableSpacesOnLand(player)
      .filter(
        (space) => game.board.getAdjacentSpaces(space).filter(
          (adjacentSpace) => Board.isOceanSpace(adjacentSpace),
        ).length > 0,
      );
  }
}

