import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';

export class EnergySupply extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.ENERGY_SUPPLY,
      type: CardType.EVENT,
      tags: [Tag.POWER],
      cost: 3,

      metadata: {
        cardNumber: 'Q18',
        renderData: CardRenderer.builder((b) => b.energy(3)),
        description: 'Gain 3 energy.',
      },
    });
  }
  public override bespokePlay(player: IPlayer) {
    player.stock.add(Resource.ENERGY, 3);
    return undefined;
  }
}
