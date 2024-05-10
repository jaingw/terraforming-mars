import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CorporationCard} from '../corporation/CorporationCard';

export class EliteTech extends CorporationCard {
  constructor() {
    super({
      name: CardName.ELITETECH,
      tags: [],
      startingMegaCredits: 49,

      metadata: {
        cardNumber: 'XB13',
        description: 'You start with 49 M€. As your first action, draw 1 card with a science tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(49).cards(1, {secondaryTag: Tag.SCIENCE});
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

  public initialAction(player: IPlayer) {
    player.drawCard(1, {tag: Tag.SCIENCE});
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard ) {
    if (player.isCorporation(CardName.ELITETECH) && card.requirements === undefined) player.stock.add(Resource.MEGACREDITS, 1, {log: true});
  }
}
