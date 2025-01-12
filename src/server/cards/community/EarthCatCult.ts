import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class EarthCatCult extends CorporationCard {
  constructor() {
    super({
      name: CardName.EARTHCATCULT,
      tags: [Tag.ANIMAL, Tag.EARTH],
      startingMegaCredits: 45,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {
        // production: {megacredits: 4},
        addResources: 1,
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
        description: 'You start with 45 M€.As your first action, place this tile ON A NON-RESERVED AREA.1 VP per animals on this card.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).tile(TileType.ECOLOGICAL_ZONE, false, true);
          b.corpBox('effect', (ce) => {
            ce.effect('你的版块提供相邻收益时,你额外获得1mc', (eb) => {
              eb.emptyTile().emptyTile('golden').startEffect.megacredits(1);
            });
            ce.effect('你打出动物牌时,在本卡添加1动物', (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.resource(CardResource.ANIMAL);
            });
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
}
