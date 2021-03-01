
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Aphrodite} from '../../venusNext/Aphrodite';

export class _Aphrodite_ extends Aphrodite {
  public name: CardName = CardName._APHRODITE_;
  public startingMegaCredits: number = 40;

  public initialAction(player: Player) {
    player.game.increaseVenusScaleLevel(player, 2);
    return undefined;
  }

  public play(_player: Player) {
    return undefined;
  }

  public metadata?: CardMetadata = {
    cardNumber: 'R01',
    description: 'You start with 40 MC. As your first action, raise Venus Scale 2 steps.',
    renderData: CardRenderer.builder((b) => {
      b.br;
      b.megacredits(40).nbsp.venus(1).venus(1);
      b.corpBox('effect', (ce) => {
        ce.effect('Whenever Venus is terraformed 1 step, you gain 2 plant.', (eb) => {
          eb.venus(1).any.startEffect.plants(2);
        });
      });
    }),
  }
}
