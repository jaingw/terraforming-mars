
import {CardName} from '../../../../common/cards/CardName';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {RobinsonIndustries} from '../../prelude/RobinsonIndustries';
import {CardRenderer} from '../../render/CardRenderer';

export class _RobinsonIndustries_ extends RobinsonIndustries {
  public override get name() {
    return CardName._ROBINSON_INDUSTRIES_;
  }

  public override canAct(player: IPlayer): boolean {
    return player.canAfford(3);
  }

  public override get metadata() {
    return {
      cardNumber: 'R27',
      description: 'You start with 47 M€.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(47);
        b.corpBox('action', (ce) => {
          ce.action('Spend 3 M€ to increase (one of) your LOWEST production 1 step.And you will product this resource immediately(M€ production ignore TR).', (eb) => {
            eb.megacredits(3).startAction.production((pb) => pb.wild(1).asterix()).asterix();
          });
        });
      }),
    };
  }

  public override increaseAndLogProduction(player: IPlayer, resource: Resource) {
    player.stock.deduct(Resource.MEGACREDITS, 3);
    player.production.add(resource, 1, {log: true});
    const number = player.production.get(resource);
    player.stock.add(resource, number);
  }
}
