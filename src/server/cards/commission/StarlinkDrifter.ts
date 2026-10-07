/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 11:51:43
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-12-08 12:40:33
 * @Description:
 */
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';

export class StarlinkDrifter extends CorporationCard implements ICard {
  // tags 是上一张卡的标记,Event标记为对任何卡不触发
  // count 是摸牌次数
  public data: {tags: ReadonlyArray<Tag>, count:number } = {tags: [Tag.EVENT], count: 0};

  constructor() {
    super({
      name: CardName.STARLINKDRIFTER,
      tags: [Tag.WILD],
      startingMegaCredits: 51,


      metadata: {
        cardNumber: 'XB16',
        description: 'You start with 51 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(51);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.text('效果: 如你打出的卡的標記和上一張的完全一樣(包括無標記,但不包括事件卡),摸一卡.', Size.SMALL);
          });
        }),
      },
    });
  }


  public onCardPlayed(player: IPlayer, card: ICard) {
    if (!player.playedCards.has(this.name)) {
      return;
    }
    if (this.data === undefined || this.data.tags === undefined) {
      this.data= {tags: card.tags, count: 0};
      return;
    } else if (card.type !== CardType.EVENT) {
      const tags = card.tags.filter((tag) => tag !== Tag.WILD);
      // 问号接任意标  问号接无标 无标接问号  触发摸牌
      const prevTags = Array.from(this.data.tags).filter((tag) => tag !== Tag.WILD);
      const isSameTags = JSON.stringify(prevTags.sort()) === JSON.stringify(tags.sort());
      // 考虑到多wild标的卡牌， 这里兼容前一张牌为多wild,  后续如果存在wild+其他tag的牌需要单独处理
      const wildtagnum = this.data.tags.filter((tag) => tag === Tag.WILD).length;
      if (
        isSameTags || (this.data.tags.length === wildtagnum && tags.length <= wildtagnum)
      ) {
        player.drawCard(1);
        this.data.count++;
        player.game.log('${0} get ${1} cards from 🌸StarlinkDrifter🌸 in this game', (b) => b.player(player).number(this.data.count || 0));
      }
      this.data.tags = card.tags;
    } else {
      this.data.tags = [Tag.EVENT];
    }
  }
}
