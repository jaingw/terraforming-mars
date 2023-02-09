import {IProjectCard} from '../IProjectCard';
import {CardType} from '../../../common/cards/CardType';
import {Player} from '../../Player';
import {Resources} from '../../../common/Resources';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';

export class FleetRecycling extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.FLEET_RECYCLING,
      cardType: CardType.EVENT,
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

  public override bespokePlay(player: Player) {
    player.colonies.decreaseFleetSize();
    player.addResource(Resources.STEEL, 4);
    player.addResource(Resources.TITANIUM, 4);
    return undefined;
  }
}
