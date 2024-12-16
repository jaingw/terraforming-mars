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
import {IProjectCard} from '../IProjectCard';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {PlayerInput} from '../../PlayerInput';

export class StarlinkDrifter extends CorporationCard implements ICard {
  public data: {tags: Array<Tag>, count:number } = {tags: [], count: 0};

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

  public onCorpCardPlayed(player: IPlayer, card: ICorporationCard) :PlayerInput | undefined {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }


  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (player.corporations.filter((corp) => corp === this).length === 0) {
      return;
    }
    if (this.data === undefined || this.data.tags === undefined) {
      this.data= {tags: card.tags, count: 0};
      return;
    } else if (card.type !== CardType.EVENT) {
      const tags = card.tags.filter((tag) => tag !== Tag.WILD);
      // 问号接任意标  问号接无标 无标接问号  触发摸牌
      if (JSON.stringify(this.data.tags.sort()) === JSON.stringify(tags.sort()) || (this.data.tags.length ===1 && this.data.tags[0] === Tag.WILD && tags.length <= 1)) {
        player.drawCard(1);
        this.data.count ++;
        player.game.log('${0} get ${1} cards from 🌸StarlinkDrifter🌸 in this game', (b) => b.player(player).number(this.data.count || 0));
      }
      this.data.tags= card.tags;
    } else {
      this.data.tags = [Tag.EVENT];
    }
  }
}
