import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../../cards/ICard';
import {CorporationCard} from '../corporation/CorporationCard';

export class Protogen extends CorporationCard {
  constructor() {
    super({
      name: CardName.PROTOGEN,
      tags: [Tag.MICROBE],
      startingMegaCredits: 52,

      initialActionText: 'Draw 1 card with a microbe tag',
      metadata: {
        cardNumber: 'XB06',
        description: 'You start with 52 M€. As your first action, draw 1 card with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(52).cards(2, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you gain microbes in one action, also gain 2 heat.', (eb) => {
              eb.resource(CardResource.MICROBE).asterix().startEffect.heat(2);
            });
          });
        }),
      },
    });
  }


  public initialAction(player: IPlayer) {
    player.drawCard(2, {tag: Tag.MICROBE});
    return undefined;
  }
  public onResourceAdded(player: IPlayer, card: ICard) {
    if (card.resourceType === CardResource.MICROBE) {
      player.heat += 2;
    }
  }
}
