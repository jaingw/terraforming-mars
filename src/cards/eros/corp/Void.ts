import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Player} from '../../../Player';
import {Card} from '../../Card';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {CardRenderer} from '../../render/CardRenderer';

export class Void extends Card implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VOID,
      startingMegaCredits: 70,
      cardType: CardType.CORPORATION,

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

  public play(_player: Player) {
    return undefined;
  }
}
