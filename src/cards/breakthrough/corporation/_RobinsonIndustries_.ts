
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
    return player.canAfford(2);
  }

  public increaseAndLogProduction(player: Player, resource: Resources) {
    player.addProduction(resource);
    player.megaCredits -= 2;
    LogHelper.logGainProduction(player, resource);
  }

  public get metadata() {
    return {
      cardNumber: 'R27',
      description: 'You start with 47 MC.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(47);
        b.corpBox('action', (ce) => {
          ce.action('Spend 2 MC to increase (one of) your LOWEST production 1 step.', (eb) => {
            eb.megacredits(2).startAction.production((pb) => pb.wild(1).asterix());
          });
        });
      }),
    };
  }
}
