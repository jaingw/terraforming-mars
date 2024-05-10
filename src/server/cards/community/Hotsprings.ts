import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CorporationCard} from '../corporation/CorporationCard';

export class Hotsprings extends CorporationCard {
  constructor() {
    super({
      name: CardName.HOTSPRINGS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'R48',
        description: 'You start with 45 M€ and 5 heat.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(45).heat(5);
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.action('Increase your M€ production 1 step if your heat production was raised 1 step this generation, or 2 steps if it was raised more than 1 step this generation', (eb) => {
              eb.empty().startAction.production((pb) => pb.megacredits(1)).slash().production((pb) => pb.megacredits(2)).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.add(Resource.HEAT, 5);
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    return player.heatProductionStepsIncreasedThisGeneration > 0;
  }

  public action(player: IPlayer) {
    if (player.heatProductionStepsIncreasedThisGeneration === 1) {
      player.production.add(Resource.MEGACREDITS, 1);
    } else if (player.heatProductionStepsIncreasedThisGeneration > 1) {
      player.production.add(Resource.MEGACREDITS, 2);
    }

    return undefined;
  }
}
