import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {IPlayer} from '../../../IPlayer';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';

export class ImperialStarDestroyer extends CorporationCard {
  constructor() {
    super({
      name: CardName.IMPERIAL_STAR_DESTROYER,
      tags: [Tag.SPACE],
      startingMegaCredits: 53,
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


  public override bespokePlay(player: IPlayer) {
    player.colonies.increaseFleetSize();
    return undefined;
  }
}
