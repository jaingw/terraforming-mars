import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../../cards/Options';
import {CorporationCard} from '../corporation/CorporationCard';
export class MiningCorp extends CorporationCard {
  constructor() {
    super({
      name: CardName.MINING_CORP,
      tags: [Tag.BUILDING],
      startingMegaCredits: 35,

      metadata: {
        cardNumber: 'XB04',
        description: 'You start with 35 M€ and 7 steel. Draw 2 building cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(35).steel(7, {digit}).cards(2, {secondaryTag: Tag.BUILDING, digit});
          b.corpBox('effect', (ce) => {
            ce.effect('Your steel resources are worth 1 M€ extra.', (eb) => {
              eb.steel(1).startEffect.plus(Size.SMALL).megacredits(1);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.add(Resource.STEEL, 7);
    // player.production.add(Resource.ENERGY, 1);
    // player.production.add(Resource.STEEL, 1);
    player.drawCard(2, {tag: Tag.BUILDING});
    player.increaseSteelValue();
    return undefined;
  }
}
