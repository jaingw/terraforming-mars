import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {Resource} from '../../../../common/Resource';

export class PowerPlantStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.POWER_PLANT_STANDARD_PROJECT,
      cost: 11,
      metadata: {
        cardNumber: 'SP7',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 11 M€ to increase your energy production 1 step.', (eb) => {
            eb.megacredits(11).startAction.production((pb) => {
              pb.energy(1);
            });
          }),
        ),
      },
    });
  }

  protected override discount(player: IPlayer): number {
    let discount = 0;
    if (player.isCorporation(CardName.THORGATE) || player.isCorporation(CardName._THORGATE_)) {
      discount += 3;
    }
    if (player.cardIsInEffect(CardName.HIGH_TEMP_SUPERCONDUCTORS)) {
      discount += 3;
    }
    return discount + super.discount(player);
  }

  actionEssence(player: IPlayer): void {
    player.production.add(Resource.ENERGY, 1);
  }
}
