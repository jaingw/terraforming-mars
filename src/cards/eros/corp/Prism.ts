import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../../common/cards/Tags';
import {IProjectCard} from './../../IProjectCard';

export class Prism extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.PRISM,
      tags: [Tags.WILDCARD],
      startingMegaCredits: 33,

      metadata: {
        cardNumber: 'Q040',
        description: 'You start with 33 M€',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(33);
          b.corpBox('effect', (ce) => {
            ce.effect('For each tag, get 1 MC discount per 3 related tags', (eb) => {
              eb.diverseTag().startEffect.megacredits(-1).slash().text('3').diverseTag();
            });
          });
        }),
      },
    });
  }

  // private matchingTags(targetTag: Tags, tags: Array<Tags>): boolean {
  //   let hasTag: boolean = false;
  //   for (const tag of tags) {
  //     if (tag === targetTag) hasTag = true;
  //   }
  //   return hasTag;
  // }

  public play(player: Player) {
    player.addResourceTo(this, 1);
    return undefined;
  }


  public getCardDiscount(player: Player, card: IProjectCard) {
    let totalDiscount = 0;
    if (player.isCorporation(CardName.PRISM)) {
      let tagIndex: number;
      const tagArray = card.tags.filter((tag) => tag !== Tags.EVENT);
      const tagNum = tagArray.length;
      for (tagIndex = 0; tagIndex < tagNum; tagIndex++) {
        let cardDiscount = 0;
        let i = 0;
        for (const tag of tagArray) {
          if (i === tagIndex) {
            cardDiscount += Math.floor(player.getTagCount(tag) / 3);
          } else {
            cardDiscount += Math.floor(player.getTagCount(tag, 'raw') / 3);
          }
          i += 1;
        }
        totalDiscount = Math.max(totalDiscount, cardDiscount);
      }
    }
    // console.log('totalDiscount: ', totalDiscount);
    return totalDiscount;
  }
}
