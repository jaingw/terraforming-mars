import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';

export class EnergySupply extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.ENERGY_SUPPLY,
      cardType: CardType.EVENT,
      tags: [Tags.ENERGY],
      cost: 3,

      metadata: {
        cardNumber: 'Q18',
        renderData: CardRenderer.builder((b) => b.energy(3)),
        description: 'Gain 3 energy.',
      },
    });
  }
  public play(player: Player) {
    player.addResource(Resources.ENERGY, 3);
    return undefined;
  }
}
