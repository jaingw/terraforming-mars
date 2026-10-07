import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {Space} from '../../boards/Space';
import {Card} from '../Card';
import {SpaceType} from '../../../common/boards/SpaceType';
import {Phase} from '../../../common/Phase';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {BoardType} from '../../boards/BoardType';
import {IProjectCard} from '../IProjectCard';
// import {SpaceBonus} from '../../../common/boards/SpaceBonus';

export class LandHarvest extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.LAND_HARVEST,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 11,


      // behavior: {
      //   tile: {
      //     type: TileType.RESTRICTED_AREA,
      //     on: 'land',
      //     adjacencyBonus: {bonus: [SpaceBonus.DRAW_CARD]},
      //   },
      // },

      metadata: {
        cardNumber: 'XC01',
        renderData: CardRenderer.builder((b) => {
          b.effect('你在火星上放版块时，拿2MC', (eb) => {
            eb.tile(TileType.EMPTY).startEffect.megacredits(2);
          });
          b.br;
          // b.tile(TileType.RESTRICTED_AREA, false, true);
        }),
        // description: '放置1個金边牌版塊',
      },
    });
  }


  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType): void {
    // 只有卡牌拥有者才能获得效果
    if (cardOwner !== activePlayer) {
      return;
    }

    if (activePlayer.game.phase === Phase.SOLAR) {
      return;
    }

    // 只有火星上的版块触发效果
    if (boardType === BoardType.MARS && space.spaceType !== SpaceType.COLONY) {
      activePlayer.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this.name}});
    }
  }
}
