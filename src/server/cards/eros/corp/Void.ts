import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardRenderer} from '../../render/CardRenderer';

export class Void extends CorporationCard {
  constructor() {
    super({
      name: CardName.VOID,
      startingMegaCredits: 70,

      metadata: {
        cardNumber: 'Q27',
        description: 'You start with 70 M€.',
        renderData: CardRenderer.builder((b) => {
          b.vSpace(Size.LARGE).br;
          b.megacredits(70, {size: Size.LARGE}).nbsp;
        }),
      },
    });
  }
}
