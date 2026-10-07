import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';

export class EliteTech extends CorporationCard {
  constructor() {
    super({
      name: CardName.ELITETECH,
      tags: [],
      startingMegaCredits: 55,
      initialActionText: 'Draw 1 card with a science tag',
      metadata: {
        cardNumber: 'XB13',
        description: 'You start with 55 M€. As your first action, draw 1 card with a science tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(55).cards(1, {secondaryTag: Tag.SCIENCE});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('when you playing a card without a requirement, you gain 1 M€.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.REQNOT}).startEffect.megacredits(1);
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(1, {tag: Tag.SCIENCE});
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard ) {
    if (player.playedCards.has(CardName.ELITETECH) && (card.requirements === undefined || card.requirements.length === 0 )) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
  }
}
