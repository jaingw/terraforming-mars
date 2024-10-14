import {CardRenderer} from '../../render/CardRenderer';
import {all} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {CorporationCard} from '../../corporation/CorporationCard';

export class TradeNavigator extends CorporationCard {
  constructor() {
    super({
      name: CardName.TRADE_NAVIGATOR,
      tags: [],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'Q25',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.effect('The first time any player trades a colony in each generation, you perform a same trade without decreasing the track.', (eb) => {
              eb.trade({all}).asterix().startEffect.trade();
            });
          });
        }),
      },
    });
  }

}
