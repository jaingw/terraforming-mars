/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-29 12:03:47
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-30 12:38:34
 * @Description:
 */
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectOption} from '../../inputs/SelectOption';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../../server/inputs/OrOptions';

const MAX_COUNT = 8;

export class UniqueItemBounty extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.UNIQUE_ITEM_BOUNTY,
      tags: [Tag.PLANT],
      cost: 12,
      requirements: {temperature: -4},

      metadata: {
        cardNumber: 'XB53',
        renderData: CardRenderer.builder((b) => {
          b.wild(1).asterix().colon().text('3X').heat(1).slash().text('2X').plants(1);
        }),
        description: `你每有1种非标准资源，拿2叶或3热 (最多${MAX_COUNT})`,
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const nonStandardResources = new Set(player.getCardsWithResources().map((card) => card.resourceType));
    let count = nonStandardResources.size;
    count = Math.max(count, MAX_COUNT);
    if (count > 1) {
      const heatCount = 3 * count;
      const plantCount = 2 * count;
      const options = new OrOptions(
        new SelectOption(`get ${heatCount} Heats`).andThen(() => {
          player.stock.add(Resource.HEAT, heatCount, {log: true});
          return undefined;
        }),
        new SelectOption(`get ${plantCount} Plants`).andThen(() => {
          player.stock.add(Resource.PLANTS, plantCount, {log: true});
          return undefined;
        }),
      );
      return options;
    }

    return undefined;
  }
}
