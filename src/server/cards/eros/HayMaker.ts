import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {LogHelper} from '../../LogHelper';
import {TileType} from '../../../common/TileType';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {digit} from '../../cards/Options';
import {IPlayer} from '../../IPlayer';

export class HayMaker extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.HAY_MAKER,
      type: CardType.EVENT,
      tags: [Tag.SPACE],
      cost: 8,

      metadata: {
        cardNumber: 'Q55',
        renderData: CardRenderer.builder((b) => {
          b.minus().greenery().asterix().br;
          b.resourceCube().heat(12, {digit}).br;
        }),
        description: 'Remove one of your greenery and place a neutral cube. Gain 12 heat.',
      },
    });
  }

  public override canPlay(player: IPlayer): boolean {
    return player.game.board.getGreeneries(player).length >= 1;
  }

  private removeGreenery(player: IPlayer) {
    const removableSpaces = player.game.board.spaces.filter((space) => {
      if (!Board.isGreenerySpace(space)) return false;
      if (space.player !== player) return false;
      return true;
    });

    return new SelectSpace(
      'select your greenery to remove',
      removableSpaces)
      .andThen((space: Space) => {
        player.game.removeTile(space.id);
        LogHelper.logBoardTileAction(player, space, 'greenery tile', 'destroy');
        player.game.simpleAddTile(player, space, {tileType: TileType.MARTIAN_NATURE_WONDERS});
        return undefined;
      },
      );
  }
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new SimpleDeferredAction(player, () => this.removeGreenery(player)));
    player.stock.add(Resource.HEAT, 12);
    return undefined;
  }
}
