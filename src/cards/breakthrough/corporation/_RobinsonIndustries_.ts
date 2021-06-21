
import {Player} from '../../../Player';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {RobinsonIndustries} from '../../prelude/RobinsonIndustries';
import {CardRenderer} from '../../render/CardRenderer';

export class _RobinsonIndustries_ extends RobinsonIndustries {
  public get name() {
    return CardName._ROBINSON_INDUSTRIES_;
  }

  public canAct(player: Player): boolean {
    return player.canAfford(3);
  }
  public get metadata() {
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

  public increaseAndLogProduction(player: Player, resource: Resources) {
    player.deductResource(Resources.MEGACREDITS, 3);
    player.addProduction(resource, 1, {log: true});
    const number = player.getProduction(resource);
    player.addResource(resource, number);
  }
}
