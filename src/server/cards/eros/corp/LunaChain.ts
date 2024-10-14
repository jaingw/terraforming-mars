import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';

export class LunaChain extends CorporationCard {
  public data:{lastPay:number,triggerCount :number} = {lastPay:-100,triggerCount : 0};
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
            ce.effect('当你打出的项目卡实际支付的M€与上一张项目卡相差为X时(X<3)，你获得(3-X)M€.', (eb) => {
              eb.cards(1).megacredits(1, {text: 'M'}).minus().megacredits(1, {text: 'N'}).asterix().text('<3').startEffect.megacredits(1,{text:'3-X'});
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


}
