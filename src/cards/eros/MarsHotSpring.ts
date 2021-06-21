import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {Player} from '../../Player';
import {Game} from '../../Game';
import {CardType} from '../CardType';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {SelectSpace} from '../../inputs/SelectSpace';
import {TileType} from '../../TileType';
import {ISpace} from '../../boards/ISpace';
import {Board} from '../../boards/Board';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {Units} from '../../Units';

export class MarsHotSpring extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MARS_HOT_SPRING,
      cardType: CardType.AUTOMATED,
      tags: [Tags.BUILDING],
      cost: 12,
      productionBox: Units.of({heat: 2, megacredits: 2}),

      requirements: CardRequirements.builder((b) => b.oceans(3)),
      metadata: {
        cardNumber: 'Q06',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).nbsp.heat(2).digit).br;
          b.tile(TileType.HOT_SPRING, true, false).asterix();
        }),
        description: 'Requires 3 ocean tiles. Increase your M€ and Heat production 2 steps. Place this tile ADJACENT TO an ocean tile.',
      },
    });
  };
  public canPlay(player: Player): boolean {
    const canPlaceTile = this.getAvailableSpaces(player, player.game).length > 0;
    return super.canPlay(player) && canPlaceTile;
  }
  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 2);
    player.addProduction(Resources.HEAT, 2);

    const availableSpaces = this.getAvailableSpaces(player, player.game);
    if (availableSpaces.length < 1) return undefined;

    return new SelectSpace('Select space for tile', availableSpaces, (foundSpace: ISpace) => {
      player.game.addTile(player, foundSpace.spaceType, foundSpace, {tileType: TileType.HOT_SPRING});
      return undefined;
    });
  }

  private getAvailableSpaces(player: Player, game: Game): Array<ISpace> {
    return game.board.getAvailableSpacesOnLand(player)
      .filter(
        (space) => game.board.getAdjacentSpaces(space).filter(
          (adjacentSpace) => Board.isOceanSpace(adjacentSpace),
        ).length > 0,
      );
  }
}

