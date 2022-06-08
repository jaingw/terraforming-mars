import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {Player} from '../../Player';
import {TileType} from '../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {ISpace} from '../../boards/ISpace';
import {Board} from '../../boards/Board';
import {IAdjacencyBonus} from '../../ares/IAdjacencyBonus';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {ICardMetadata} from '../../common/cards/ICardMetadata';
import {Tags} from '../../common/cards/Tags';

export class WasteIncinerator extends Card implements IProjectCard {
  constructor(
    name: CardName = CardName.WASTE_INCINERATOR,
    adjacencyBonus: IAdjacencyBonus | undefined = undefined,
    metadata: ICardMetadata = {
      cardNumber: 'Q11',
      renderData: CardRenderer.builder((b) => {
        b.effect('When you sell patents, you can gain 2 heat instead of 1 MC. ', (eb) => {
          eb.cards(1).startEffect.heat(2).asterix;
        }).br;
        b.tile(TileType.WASTE_INCINERATOR, true, false).asterix();
      }),
      description: 'Place this tile adjacent to a city tile.',
    }) {
    super({
      cardType: CardType.ACTIVE,
      name,
      tags: [Tags.BUILDING],
      cost: 4,
      adjacencyBonus,

      metadata,
    });
  }

  private getAvailableSpaces(player: Player): Array<ISpace> {
    return player.game.board.getAvailableSpacesOnLand(player)
      .filter((space) => player.game.board.getAdjacentSpaces(space).some((adjacentSpace) => Board.isCitySpace(adjacentSpace)));
  }
  public override canPlay(player: Player): boolean {
    return this.getAvailableSpaces(player).length > 0;
  }
  public play(player: Player) {
    return new SelectSpace('Select space adjacent to a city tile', this.getAvailableSpaces(player), (foundSpace: ISpace) => {
      player.game.addTile(player, foundSpace.spaceType, foundSpace, {tileType: TileType.WASTE_INCINERATOR});
      foundSpace.adjacency = this.adjacencyBonus;
      return undefined;
    });
  }
}


