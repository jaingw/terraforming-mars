import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';
import {CardRenderDynamicVictoryPoints} from '../../render/CardRenderDynamicVictoryPoints';
import {Size} from '../../render/Size';
import {CardRenderer} from '../../render/CardRenderer';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  public get name() {
    return CardName._STORMCRAFT_INCORPORATED_;
  }
  public getVictoryPoints(player: Player) {
    return player.getTagCount(Tags.JOVIAN, false, false);
  }
  public get metadata() {
    return {
      cardNumber: 'R29',
      description: 'You start with 48 M€.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(48);
        b.corpBox('action', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.action('Add a floater to ANY card.', (eb) => {
            eb.empty().startAction.floaters(1).asterix();
          });
          ce.vSpace();
          ce.effect('Floaters on this card may be used as 2 heat each.', (eb) => {
            eb.startEffect.floaters(1).equals().heat(2);
          });
        });
      }),
      victoryPoints: CardRenderDynamicVictoryPoints.jovians(1, 1),
    };
  }
}

