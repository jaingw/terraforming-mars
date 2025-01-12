import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {PlaceTile} from '../../../server/deferredActions/PlaceTile';
import {CanAffordOptions, IPlayer} from '../../IPlayer';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {TileType} from '../../../common/TileType';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {message} from '../../logs/MessageBuilder';
import {Units} from '../../../common/Units';

export class SolarFarm extends Card implements IProjectCard {
  public data: number = -1; 
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SOLAR_FARM,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 12,
      metadata: {
        cardNumber: 'A17',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.energy(1).slash().plants(1);
          }).asterix().nbsp.tile(TileType.SOLAR_FARM, false, true).br;
        }),
        description: 'Place this tile which grants an ADJACENCY BONUS of 2 energy. Increase your energy production 1 step for each plant resource on the area where you place the tile.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer, canAffordOptions: CanAffordOptions): boolean {
    return player.game.board.getAvailableSpacesOnLand(player, canAffordOptions).length > 0;
  }

  public productionBox(player: IPlayer) {
    if(this.data === -1) {
      // 历史没有设置data的已打出卡牌, 重新加载时, 需要重新初始化data;
      const space = player.game.board.getSpaceByTileCard(this.name);
      if (space === undefined) {
        throw new Error('Solar Farm space not found');
      }
      this.data = space.bonus.filter((b) => b === SpaceBonus.PLANT).length;
    }
    return Units.of({energy: this.data ?? 0});
  }

  public override bespokePlay(player: IPlayer) {
    // 先设置个0, 避免重新初始化data;
    this.data = 0;
    player.game.defer(
      new PlaceTile(player, {
        tile: {tileType: TileType.SOLAR_FARM, card: this.name},
        on: 'land',
        title: message('Select space for ${0} tile', (b) => b.card(this)),
        adjacencyBonus: {bonus: [SpaceBonus.ENERGY, SpaceBonus.ENERGY]},
      }).andThen(() => {
        
        const space = player.game.board.getSpaceByTileCard(this.name);
        if (space === undefined) {
          throw new Error('Solar Farm space not found');
        }
        this.data = space.bonus.filter((b) => b === SpaceBonus.PLANT).length;
        const production = Units.of({energy: this.data ?? 0});
        player.production.adjust(production, {log: true});
      }));
    return undefined;
  }
}
