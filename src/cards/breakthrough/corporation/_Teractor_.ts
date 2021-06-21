import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {IProjectCard} from '../../IProjectCard';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';

export class _Teractor_ extends Card implements CorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._TERACTOR_,
      tags: [Tags.EARTH],
      startingMegaCredits: 55,

      cardDiscount: {tag: Tags.EARTH, amount: 3},
      metadata: {
        cardNumber: 'R30',
        description: 'You start with 55 M€. As your first action, draw 1 earth tag card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(55).nbsp.cards(1).secondaryTag(Tags.EARTH);
          b.corpBox('effect', (ce) => {
            ce.effect('When you play an Earth tag, you pay 3 M€ less for it.', (eb) => {
              eb.earth(1).played.startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }
  /* Start with 55 M€ and draw 1 earth card as first sction*/
  public initialAction(player: Player) {
    player.drawCard(1, {tag: Tags.EARTH});
    return undefined;
  }

  public getCardDiscount(_player: Player, card: IProjectCard) {
    return card.tags.filter((tag) => tag === Tags.EARTH).length * 3;
  }
  public play() {
    return undefined;
  }
}
