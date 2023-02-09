import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../../cards/ICard';

export class Protogen extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.PROTOGEN,
      tags: [Tag.MICROBE],
      startingMegaCredits: 47,

      initialActionText: 'Draw 1 card with a microbe tag',
      metadata: {
        cardNumber: 'XB06',
        description: 'You start with 47 M€. As your first action, draw 1 card with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(47).cards(1, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you gain microbes in one action, also gain 2 heat.', (eb) => {
              eb.microbes(1).asterix().startEffect.heat(2);
            });
          });
        }),
      },
    });
  }


  public initialAction(player: Player) {
    player.drawCard(1, {tag: Tag.MICROBE});
    return undefined;
  }
  public onResourceAdded(player: Player, card: ICard) {
    if (card.resourceType === CardResource.MICROBE) {
      player.heat += 2;
    }
  }
}
