import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {IActionCard} from '../ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {SelectColony} from '../../inputs/SelectColony';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IColony} from '../../colonies/IColony';
import {IGame} from '../../IGame';

export class EMDrive extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      cost: 35,
      name: CardName.EM_DRIVE,
      tags: [Tag.JOVIAN, Tag.SCIENCE, Tag.SPACE],
      type: CardType.ACTIVE,
      victoryPoints: 2,
      requirements: {party: PartyName.SCIENTISTS},
      metadata: {
        cardNumber: 'Q19',
        renderData: CardRenderer.builder((b) => {
          b.action('Increase a Colony Tile track to the maximum.', (eb) => {
            eb.empty().startAction.trade().text('+MAX', Size.LARGE);
          });
        }),
        description: 'Requires that Scientists are ruling or that you have 2 delegates there.',
      },
    });
  }

  public canAct(): boolean {
    return true;
  }


  public override onDiscard(player: IPlayer): void {
    player.colonies.tradeOffset--;
  }
  private getIncreasableColonies(game: IGame) {
    return game.colonies.filter((colony) => colony.trackPosition < 6 && colony.isActive);
  }

  public action(player: IPlayer) {
    const selectColonies = new OrOptions();
    selectColonies.title = 'Select colonies to increase and decrease tile track';

    const increasableColonies = this.getIncreasableColonies(player.game);
    if (increasableColonies.length === 0) {
      return undefined;
    }
    player.game.defer(new SimpleDeferredAction(
      player,
      () => new SelectColony('Select colony to increase the track mark to the maximum', 'Select', increasableColonies ).andThen((colony: IColony) => {
        if (increasableColonies.includes(colony)) {
          colony.increaseTrack(10);
          player.game.log('${0} increase ${1} to the max', (b) => b.player(player).colony(colony));
          return undefined;
        }
        return undefined;
      }),
    ));
    return undefined;
  }
}

