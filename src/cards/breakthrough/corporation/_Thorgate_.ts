
import {Player} from '../../../Player';
import {IProjectCard} from '../../IProjectCard';
import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {played} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tags} from '../../../common/cards/Tags';
import {Resources} from '../../../common/Resources';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _Thorgate_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._THORGATE_,
      tags: [Tags.ENERGY, Tags.SCIENCE],
      startingMegaCredits: 44,

      cardDiscount: {tag: Tags.ENERGY, amount: 3},
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


  public override getCardDiscount(_player: Player, card: IProjectCard) {
    if (card.tags.includes(Tags.ENERGY)) {
      return 3;
    }
    return 0;
  }
  /* Start with 2 energy prod and 1 extra science tag */
  public play(player: Player) {
    player.addProduction(Resources.ENERGY, 2);
    return undefined;
  }
}

