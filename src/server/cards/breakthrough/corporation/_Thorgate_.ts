
import {IPlayer} from '../../../IPlayer';
import {IProjectCard} from '../../IProjectCard';
import {CardRenderer} from '../../render/CardRenderer';
import {played} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {CorporationCard} from '../../corporation/CorporationCard';

export class _Thorgate_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._THORGATE_,
      tags: [Tag.POWER, Tag.SCIENCE],
      startingMegaCredits: 44,

      cardDiscount: {tag: Tag.POWER, amount: 3},
      metadata: {
        cardNumber: 'R13',
        description: 'You start with 2 energy production and 44 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.production((pb) => pb.energy(2)).nbsp.megacredits(44);
          b.corpBox('effect', (ce) => {
            ce.effect('When playing a power card OR THE STANDARD PROJECT POWER PLANT, you pay 3 M€ less for it.', (eb) => {
              // TODO(chosta): energy().played needs to be power() [same for space()]
              eb.energy(1, {played}).asterix().startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }


  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    if (card.tags.includes(Tag.POWER)) {
      return 3;
    }
    return 0;
  }
  /* Start with 2 energy prod and 1 extra science tag */
  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.ENERGY, 2);
    return undefined;
  }
}

