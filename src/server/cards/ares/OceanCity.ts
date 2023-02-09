import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {TileType} from '../../../common/TileType';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Resources} from '../../../common/Resources';
import {Player} from '../../Player';

export class OceanCity extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.OCEAN_CITY,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 18,

      behavior: {
        production: {energy: -1, megacredits: 3},
        tile: {
          type: TileType.OCEAN_CITY,
          on: 'upgradeable-ocean',
          title: 'Select space for Ocean City',
        },
      },

      requirements: CardRequirements.builder((b) => b.oceans(6)),
      metadata: {
        cardNumber: 'A20',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.minus().energy(1).br;
            pb.plus().megacredits(3);
          }).nbsp.tile(TileType.OCEAN_CITY, false, true);
        }),
        description: 'Requires 6 ocean tiles. Decrease your energy production 1 step and increase your M€ production 3 steps. Place this tile on top of an existing ocean tile, IGNORING NORMAL PLACEMENT RESTRICTIONS FOR CITIES. The tile counts as a city as well as an ocean.',
      },
    });
  }
  public override bespokeCanPlay(player: Player): boolean {
    return player.production.get(Resources.ENERGY) > 0 && player.game.board.getOceanSpaces({upgradedOceans: false}).length > 0;
  }
}
