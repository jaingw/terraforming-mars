
import {Player} from '../../../Player';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {LogHelper} from '../../../LogHelper';
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
      description: 'You start with 47 MC.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(47);
        b.corpBox('action', (ce) => {
          ce.action('Spend 3 MC to increase (one of) your LOWEST production 1 step.And you will product this resource immediately(MC production ignore TR).', (eb) => {
            eb.megacredits(3).startAction.production((pb) => pb.wild(1).asterix()).asterix();
          });
        });
      }),
    };
  }

  public increaseAndLogProduction(player: Player, resource: Resources) {
    player.megaCredits -= 3;
    player.addProduction(resource);
    const number = player.getProduction(resource);
    player.setResource(resource, number);
    LogHelper.logGainProduction(player, resource);
  }
}
