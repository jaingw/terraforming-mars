/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-27 14:10:20
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-30 12:40:08
 * @Description:
 */
/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-27 14:10:20
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-29 18:01:13
 * @Description:
 */
import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class EarthCatCult extends CorporationCard {
  constructor() {
    super({
      name: CardName.EARTHCATCULT,
      tags: [Tag.ANIMAL, Tag.EARTH],
      startingMegaCredits: 45,
      resourceType: CardResource.ANIMAL,
      behavior: {
      },
      firstAction: {
        text: 'Place this tile ON AN AREA NOT RESERVED.',
        tile: {
          type: TileType.ECOLOGICAL_ZONE,
          on: 'land',
          adjacencyBonus: {bonus: [SpaceBonus.ANIMAL]},
        },
      },

      metadata: {
        cardNumber: 'A29',
        description: 'You start with 45 M€. As your first action, place this tile ON A NON-RESERVED AREA.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).tile(TileType.ECOLOGICAL_ZONE, false, true);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('当你的板块提供相邻收益时，将一个动物资源放在此卡上', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).emptyTile('golden').startEffect.resource(CardResource.ANIMAL);
            });
            ce.action('Gain 1M€ per animal here.', (eb) => {
              eb.empty().startAction.megacredits(1).slash().resource(CardResource.ANIMAL);
            }).br;
            ce.vSpace(Size.LARGE);
          });
        }),
      },
    });
  }


  public onCardPlayed(player: IPlayer, card: IProjectCard): void {
    if (player.isCorporation(this.name)) {
      const qty = player.tags.cardTagCount(card, [Tag.ANIMAL]);
      player.addResourceTo(this, {qty, log: true});
    }
  }

  public canAct(): boolean {
    return this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, this.resourceCount, {log: true});
    return undefined;
  }
}
