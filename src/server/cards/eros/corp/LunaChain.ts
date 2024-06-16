import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';
import {SerializedCard} from '../../../SerializedCard';

export class LunaChain extends CorporationCard {
  public lastPay?: number = -1;
  constructor() {
    super({
      name: CardName.LUNA_CHAIN,
      startingMegaCredits: 48,
      tags: [Tag.EARTH],

      metadata: {
        cardNumber: 'Q34',

        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.effect('After you pay for a card with the same amount as your last card, you gain 3 M€.', (eb) => {
              eb.cards(1).megacredits(1, {text: 'X'}).equals().megacredits(1, {text: 'X'}).asterix().startEffect.megacredits(3);
            });
          });
        }),
      },
    });
  }
  // private effect(player: IPlayer, card: IProjectCard | IStandardProjectCard): void {
  //   if (player.isCorporation(this.name) && card.cost >= 20) {
  //     player.stock.add(Resource.MEGACREDITS, 4, {log: true});
  //   }
  // }
  // public onCardPlayed(player: IPlayer, card: IProjectCard) {
  //   this.effect(player, card);
  // }

  public serialize(serialized: SerializedCard) {
    serialized.lastPay = this.lastPay;
  }

  public deserialize(serialized: SerializedCard) {
    this.lastPay = serialized.lastPay;
  }
}
