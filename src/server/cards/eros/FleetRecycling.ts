import {IProjectCard} from '../IProjectCard';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';

export class FleetRecycling extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.FLEET_RECYCLING,
      type: CardType.EVENT,
      tags: [],
      cost: 10,

      metadata: {
        cardNumber: 'Q51',
        renderData: CardRenderer.builder((b) => {
          b.text('-1').tradeFleet().br;
          b.text('4').steel(1).text('4').titanium(1);
        }),
        description: 'Lose 1 Trade Fleet. Gain 4 steel and 4 titanium',
      },
    });
  }

  public override canPlay(): boolean {
    return true;
  }

  public override bespokePlay(player: IPlayer) {
    player.colonies.decreaseFleetSize();
    player.stock.add(Resource.STEEL, 4);
    player.stock.add(Resource.TITANIUM, 4);
    return undefined;
  }
}
