
import {CardName} from '../../../CardName';
import {Celestic} from '../../venusNext/Celestic';
import {CardRenderer} from '../../render/CardRenderer';
import {AltSecondaryTag} from '../../render/CardRenderItem';
import {CardRenderDynamicVictoryPoints} from '../../render/CardRenderDynamicVictoryPoints';
import {Size} from '../../render/Size';

export class _Celestic_ extends Celestic {
  public get name() {
    return CardName._CELESTIC_;
  }

  public resourceCount = 0;
  public get metadata() {
    return {
      cardNumber: 'R05',
      description: 'You start with 42 M€. As your first action, draw 2 floater-icon cards.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(42).nbsp.cards(2).secondaryTag(AltSecondaryTag.FLOATER);
        b.corpBox('action', (ce) => {
          ce.vSpace();
          ce.action('Add a floater to ANY card.', (eb) => {
            eb.empty().startAction.floaters(1).asterix();
          });
          ce.vSpace(Size.SMALL);
          ce.effect( 'When you gain a floater to ANY CARD, gain 1 M€. 1 VP per 3 floaters on this card.', (eb) => {
            eb.floaters(1).asterix().startEffect.megacredits(1);
          });
          ce.vSpace(Size.SMALL);
        });
      }),
      victoryPoints: CardRenderDynamicVictoryPoints.floaters(1, 3),
    };
  }
}
