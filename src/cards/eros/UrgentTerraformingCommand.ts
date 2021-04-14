import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {CardRenderItemSize} from '../render/CardRenderItemSize';
import {Card} from '../Card';

export class UrgentTerraformingCommand extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.URGENT_TERRAFORMING_COMMAND,
      cardType: CardType.EVENT,
      tags: [Tags.EARTH],
      cost: 10,
      requirements: CardRequirements.builder((b) => b.tr(25)),

      metadata: {
        cardNumber: 'Q16',
        renderData: CardRenderer.builder((b) => {
          b.text('IMMEDIATE PRODUCE', CardRenderItemSize.SMALL, true).br;
          b.production((pb) => pb.plants(1).nbsp.heat(1));
        }),
        description: 'Requires that you have at least 25 TR.',
      },
    });
  };
  public canPlay(player: Player): boolean {
    return player.getTerraformRating() >= 25;
  }
  public play(player: Player) {
    player.setResource(Resources.PLANTS, player.getProduction(Resources.PLANTS));
    player.setResource(Resources.HEAT, player.getProduction(Resources.HEAT));
    return undefined;
  }
}
