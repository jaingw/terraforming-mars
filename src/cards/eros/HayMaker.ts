import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Board} from '../../boards/Board';
import {ISpace} from '../../boards/ISpace';
import {LogHelper} from '../../LogHelper';
import {TileType} from '../../common/TileType';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {digit} from '../../cards/Options';
import {Player} from '../../Player';

export class HayMaker extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.HAY_MAKER,
      cardType: CardType.EVENT,
      tags: [Tags.SPACE],
      cost: 8,

      metadata: {
        cardNumber: 'Q039',
        renderData: CardRenderer.builder((b) => {
          b.minus().greenery().asterix().br;
          b.resourceCube().heat(12, {digit}).br;
        }),
        description: 'Remove one of your greenery and place a neutral cube. Gain 12 heat.',
      },
    });
  }

  public override canPlay(player: Player): boolean {
    return player.game.getGreeneriesCount(player) >= 1;
  }

  private removeGreenery(player: Player) {
    const removableSpaces = player.game.board.spaces.filter((space) => {
      if (!Board.isGreenerySpace(space)) return false;
      if (space.player !== player) return false;
      return true;
    });

    return new SelectSpace(
      'select your greenery to remove',
      removableSpaces,
      (space: ISpace) => {
        player.game.removeTile(space.id);
        LogHelper.logBoardTileAction(player, space, 'greenery tile', 'destroy');
        player.game.simpleAddTile(player, space, {tileType: TileType.MARTIAN_NATURE_WONDERS});
        return undefined;
      },
    );
  }
  public play(player: Player) {
    player.game.defer(new SimpleDeferredAction(player, () => this.removeGreenery(player)));
    player.addResource(Resources.HEAT, 12);
    return undefined;
  }
}
