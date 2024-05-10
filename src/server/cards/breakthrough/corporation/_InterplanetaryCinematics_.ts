import {IPlayer} from '../../../IPlayer';
import {CardRenderer} from '../../render/CardRenderer';
import {IProjectCard} from '../../IProjectCard';
import {played} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';

export class _InterplanetaryCinematics_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._INTERPLANETARY_CINEMATICS_,
      tags: [Tag.BUILDING],
      startingMegaCredits: 50,
      metadata: {
        cardNumber: 'R19',
        description: 'You start with 50 M€. draw 2 event cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(50).nbsp.cards(2, {secondaryTag: Tag.EVENT});
          b.corpBox('effect', (ce) => {
            ce.effect('Your tags on event work the same as green or blue card. Event tag is a new tag for you. Each time you play an event, you gain 3 M€.', (eb) => {
              eb.event({played}).startEffect.megacredits(3);
              eb.description();
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (player.isCorporation(this.name) && card.type === CardType.EVENT) {
      player.megaCredits += 3;
    }
  }
  public override bespokePlay(player: IPlayer) {
    player.drawCard(2, {cardType: CardType.EVENT});
    return undefined;
  }
}
