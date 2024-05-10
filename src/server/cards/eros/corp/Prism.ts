import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Tag} from '../../../../common/cards/Tag';
import {IProjectCard} from './../../IProjectCard';
import {CardName} from '../../../../common/cards/CardName';
import {CorporationCard} from '../../corporation/CorporationCard';

export class Prism extends CorporationCard {
  constructor() {
    super({
      name: CardName.PRISM,
      tags: [Tag.WILD],
      startingMegaCredits: 33,

      metadata: {
        cardNumber: 'Q029',
        description: 'You start with 33 M€',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(33);
          b.corpBox('effect', (ce) => {
            ce.effect('For each different tag, get 1 MC discount per 3 related tags', (eb) => {
              eb.diverseTag().startEffect.megacredits(-1).slash().text('3').diverseTag();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.addResourceTo(this, 1);
    return undefined;
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    let cardDiscount = 0;
    if (player.isCorporation(CardName.PRISM)) {
      let wildNum = player.tags.count(Tag.WILD, 'raw');
      let oneTagNum = 0; // 只有1个标志的数量
      let twoTagNum = 0; // 只有2个标志的数量

      //  标志去重  事件公司的事件标联动
      const cardTags = Array.from(new Set(card.tags.filter((tag) => (tag !== Tag.EVENT || player.isCorporation(CardName._INTERPLANETARY_CINEMATICS_)) && tag !== Tag.WILD)));
      if (cardTags.length === 0) {
        // 避免无标志卡牌也能3问号减1费
        return 0;
      }
      cardTags.forEach((tag) => {
        const tagNum = player.tags.count(tag, 'raw'); // 不含问号的标志数量
        cardDiscount += Math.floor(tagNum / 3);
        if ( tagNum % 3 === 2) { // 如果只差1个标志
          twoTagNum ++;
        } else if ( tagNum % 3 === 1) { // 如果差2个标志
          oneTagNum ++;
        }
      });

      // 问号先分配给只差1个标志
      cardDiscount += Math.min(wildNum, twoTagNum);
      wildNum-= Math.min(wildNum, twoTagNum);

      // 问号再分配给只差2个标志
      cardDiscount += Math.min(Math.floor(wildNum / 2), oneTagNum);
      wildNum-= 2 * Math.min(Math.floor(wildNum / 2), oneTagNum);

      // 问号分配完还有剩
      cardDiscount += Math.floor(wildNum / 3);
    }
    return cardDiscount;
  }
}
