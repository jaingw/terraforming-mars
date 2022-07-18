import {CardName} from '../../../common/cards/CardName';
import {Tags} from '../../../common/cards/Tags';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';
import {VictoryPoints} from '../../ICard';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../../../cards/render/CardRenderer';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  constructor() {
    super({
      name: CardName._STORMCRAFT_INCORPORATED_,
      tags: [Tags.JOVIAN],
      startingMegaCredits: 48,
      resourceType: CardResource.FLOATER,
      cardType: CardType.CORPORATION,
      victoryPoints: VictoryPoints.tags(Tags.JOVIAN, 1, 1),
      metadata: {
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
            ce.effect('Floaters on this card may be used as 2 heat each. 1 VP per Jovian tag you have.', (eb) => {
              eb.startEffect.floaters(1).equals().heat(2);
            });
          });
        }),
      },
    });
  }
}

