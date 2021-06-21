import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {ICard} from '../../ICard';


export class TradeNavigator extends Card implements ICard, CorporationCard {
  constructor() {
    super({
      name: CardName.TRADE_NAVIGATOR,
      tags: [],
      startingMegaCredits: 42,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q25',
        description: 'You start with 42 MC.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42);
          b.corpBox('effect', (ce) => {
            ce.effect('The first time any player trades a colony in each generation, you perform a same trade without decreasing the track.', (eb) => {
              eb.trade().any.asterix().startEffect.trade();
            });
          });
        }),
      },
    });
  }

  public play() {
    return undefined;
  }

  public canAct(): boolean {
    return true;
  }
}
