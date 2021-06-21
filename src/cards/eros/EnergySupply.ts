import {IProjectCard} from '../IProjectCard';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tags} from '../Tags';
import {Card} from '../Card';
import {Resources} from '../../Resources';

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
  };
  public play(player: Player) {
    player.addResource(Resources.ENERGY, 3);
    return undefined;
  }
}
