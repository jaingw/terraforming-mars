import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {Tag} from '../../../../common/cards/Tag';

export class ImperialStarDestroyer extends Card implements ICorporationCard {
  constructor() {
    super({
      name: CardName.IMPERIAL_STAR_DESTROYER,
      tags: [Tag.SPACE],
      startingMegaCredits: 53,
      type: CardType.CORPORATION,
      metadata: {
        cardNumber: 'Q031',
        description: 'You start with 53 M€',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(53).tradeFleet();
          b.corpBox('effect', (ce) => {
            ce.effect('You gain double trade bonus.', (eb) => {
              eb.trade().startEffect.text('X 2');
            });
          });
        }),
      },
    });
  }


  public override bespokePlay(player: Player) {
    player.colonies.increaseFleetSize();
    return undefined;
  }
}
