import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CorporationCard} from '../corporation/CorporationCard';
import { Tag } from '../../../common/cards/Tag';
import { IPlayer } from '../../IPlayer';
import { SelectOption } from '../../inputs/SelectOption';
import { Resource } from '../../../common/Resource';
import { OrOptions } from '../../inputs/OrOptions';
import { TileType } from '../../../common/TileType';
import { SpaceBonus } from '../../../common/boards/SpaceBonus';

export class Eglogue extends CorporationCard {
  constructor() {
    super({
      name: CardName.EGLOGUE,
      tags: [Tag.PLANT],
      startingMegaCredits: 45,

      firstAction: {
        text: 'Place this tile ON AN AREA NOT RESERVED.',
        // ocean: {on: 'land'},
        tile: {
          type: TileType.MOHOLE_AREA,
          on: 'land',
          adjacencyBonus: {bonus: [SpaceBonus.HEAT, SpaceBonus.HEAT]},
        },
      },

      metadata: {
        cardNumber: 'A28',
        description: 'You start with 45 M€. As your first action,Place this tile ON AN AREA NOT RESERVED. The tile grants an ADJACENCY BONUS of 2 heat.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).tile(TileType.MOHOLE_AREA, false, true);
          b.corpBox('action', (ce) => {
            ce.action('你获得4个热资源,其他对手获得2个热资源.', (eb) => {
              eb.empty().startAction.text('4').heat(1).text('2').heat(1, {all}).asterix();
            });
            ce.action('除你以外拥有最多热资源数量的玩家,其热资源数量为X,你获得X/2个叶子.', (eb) => {
              eb.text('max X').heat(1, {all}).asterix().startAction.text('X/2').plants(1);
            });
          });
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }
  
  public action(player: IPlayer) {
    const getHeat = new SelectOption(
      '你获得4个热资源,其他对手获得2个热资源.',
      '获得热资源')
      .andThen(() => {
        player.stock.add(Resource.HEAT, 4, { log: true });
        player.game.getPlayers().filter(p => p !== player).forEach(p => p.stock.add(Resource.HEAT, 2, { log: true }));
        return undefined;
      });

    let  plants = 0;
    player.game.getPlayers().filter(p => p !== player).forEach(p => {
      if(p.heat > plants){
        plants = p.heat;
      }
    });
    plants = Math.floor (plants / 2);

    const getPlants = new SelectOption(`你获得${plants}个叶子`, '获得叶子')
      .andThen(() => {
        player.stock.add(Resource.PLANTS, plants, { log: true });
        return undefined;
      });

    return new OrOptions(getHeat, getPlants);
  }
}
