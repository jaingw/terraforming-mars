import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../../common/cards/Tags';

export class ImperialStarDestroyer extends Card implements ICorporationCard {
  constructor() {
    super({
      name: CardName.IMPERIAL_STAR_DESTROYER,
      tags: [Tags.SPACE],
      startingMegaCredits: 48,
      cardType: CardType.CORPORATION,
      metadata: {
        cardNumber: 'Q046',
        description: 'You start with 48 M€',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(48).tradeFleet();
          b.corpBox('effect', (ce) => {
            ce.effect('You gain double trade bonus.', (eb) => {
              eb.trade().startEffect.text('X 2');
            });
          });
        }),
      },
    });
  }


  public play(player: Player) {
    player.increaseFleetSize();
    return undefined;
  }
}
