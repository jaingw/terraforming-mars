import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../render/Size';
import {CardRequirements} from '../CardRequirements';
import {PartyName} from '../../turmoil/parties/PartyName';
import {IActionCard} from '../ICard';
import {Game} from '../../Game';
import {OrOptions} from '../../inputs/OrOptions';
import {ColonyName} from '../../colonies/ColonyName';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {SelectColony} from '../../inputs/SelectColony';
import {ColonyModel} from '../../models/ColonyModel';

export class EMDrive extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      cost: 35,
      name: CardName.EM_DRIVE,
      tags: [Tags.JOVIAN, Tags.SCIENCE, Tags.SPACE],
      cardType: CardType.ACTIVE,
      requirements: CardRequirements.builder((b) => b.party(PartyName.SCIENTISTS)),
      metadata: {
        cardNumber: 'Q19',
        renderData: CardRenderer.builder((b) => {
          b.action('Increase a Colony Tile track to the maximum.', (eb) => {
            eb.startAction.trade().text('+MAX', Size.LARGE);
          });
        }),
        description: 'Requires that Scientists are ruling or that you have 2 delegates there.',
        victoryPoints: 2,
      },
    });
  }

  public canPlay(player: Player): boolean {
    if (player.game.turmoil !== undefined) {
      return player.game.turmoil.canPlay(player, PartyName.SCIENTISTS);
    }
    return false;
  }

  public canAct(): boolean {
    return true;
  }

  public play() {
    return undefined;
  }

  public onDiscard(player: Player): void {
    player.colonyTradeOffset--;
  }
  private getIncreasableColonies(game: Game) {
    return game.colonies.filter((colony) => colony.trackPosition < 6 && colony.isActive);
  }

  public action(player: Player) {
    const selectColonies = new OrOptions();
    selectColonies.title = 'Select colonies to increase and decrease tile track';

    const increasableColonies = this.getIncreasableColonies(player.game);
    if (increasableColonies.length === 0) {
      return undefined;
    }
    const coloniesModel: Array<ColonyModel> = player.game.getColoniesModel(increasableColonies);
    player.game.defer(new DeferredAction(
      player,
      () => new SelectColony('Select colony to increase the track mark to the maximum', 'Select', coloniesModel, (colonyName: ColonyName) => {
        increasableColonies .forEach((colony) => {
          if (colony.name === colonyName) {
            colony.increaseTrack(10);
            player.game.log('${0} increase ${1} to the max', (b) => b.player(player).colony(colony));
            return undefined;
          }
          return undefined;
        });
        return undefined;
      }),
    ));
    return undefined;
  }
}

