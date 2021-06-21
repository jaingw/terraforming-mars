import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {Size} from '../render/Size';
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
          b.text('IMMEDIATE PRODUCE', Size.SMALL, true).br;
          b.plants(1).asterix().nbsp.heat(1).asterix();
        }),
        description: 'Requires that you have at least 25 TR.you gain plants and heat equal to your plants and heat production',
      },
    });
  };
  public canPlay(player: Player): boolean {
    return player.getTerraformRating() >= 25;
  }
  public play(player: Player) {
    player.addResource(Resources.PLANTS, player.getProduction(Resources.PLANTS));
    player.addResource(Resources.HEAT, player.getProduction(Resources.HEAT));
    return undefined;
  }
}
