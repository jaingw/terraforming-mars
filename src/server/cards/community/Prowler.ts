/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 11:51:43
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-12-08 14:51:33
 * @Description:
 */
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {PlayableCard} from '../IProjectCard';
import {digit} from '../Options';

export class Prowler extends CorporationCard implements ICard {
  public bonus: number = 0;

  constructor() {
    super({
      name: CardName.PROWLER,
      tags: [Tag.PLANT],
      startingMegaCredits: 43,

      behavior: {
        stock: {plants: 5},
      },

      firstAction: {
        text: 'Draw 2 plants card',
        drawCard: {count: 2, tag: Tag.PLANT},
      },
      metadata: {
        cardNumber: 'XB17',
        description: 'You start with 43 M€. 5 plants',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).nbsp.cards(2, {secondaryTag: Tag.PLANT}).plants(5, {digit});

          b.corpBox('action', (ce) => {
            ce.effect('当氧气满了,你起树时,可以获得1tr.', (eb) => {
              eb.greenery().startAction.tr(1).asterix();
            });
            ce.action('花費1植物,选一张植卡无视全球参数付费打出.', (eb) => {
              eb.plants(1).asterix().startAction.text('play', Size.MEDIUM, true).cards(1, {secondaryTag: Tag.PLANT});
            });
          });
        }),
      },
    });
  }

  public override getGlobalParameterRequirementBonus(_player: IPlayer): number {
    return this.bonus;
  }


  public canAct(player: IPlayer): boolean {
    if (player.plants === 0) {
      return false;
    }
    this.bonus = 50;
    player.stock.deduct(Resource.PLANTS, 1);
    const length = player.cardsInHand.filter((card) => card.tags.indexOf(Tag.PLANT) > -1 && player.canPlay(card)).length;
    this.bonus = 0;
    player.stock.add(Resource.PLANTS, 1);
    return length > 0;
  }

  public action(player: IPlayer) {
    this.bonus = 50;
    player.stock.deduct(Resource.PLANTS, 1);

    const playableCards: Array<PlayableCard> = [];
    for (const card of player.cardsInHand) {
      if (card.tags.indexOf(Tag.PLANT) > -1 ) {
        card.warnings.clear();
        const canPlay = player.canPlay(card);
        if (canPlay !== false) {
          playableCards.push({
            card,
            details: canPlay,
          });
        }
      }
    }


    return new SelectProjectCardToPlay(player, playableCards)
      .andThen((_card) => {
        this.bonus = 0;
        return undefined;
      });
  }
}
