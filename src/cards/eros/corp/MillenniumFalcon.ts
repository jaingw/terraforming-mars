import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {BuildColony} from '../../../deferredActions/BuildColony';
import {all} from '../../Options';
import {SelectColony} from '../../../inputs/SelectColony';
import {IColony} from '../../../colonies/IColony';
import {SimpleDeferredAction} from '../../../deferredActions/DeferredAction';
import {ColonyName} from '../../../common/colonies/ColonyName';
export class MillenniumFalcon extends Card implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MILLENNIUM_FALCON,
      startingMegaCredits: 28,
      cardType: CardType.CORPORATION,
      initialActionText: 'Place a colony',

      metadata: {
        cardNumber: 'Q30',
        description: 'You start with 28 M€. As your first action, place a colony.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(28).nbsp.colonies(1);
          b.corpBox('action', (ce) => {
            ce.action('Move one of your colony to another colony (Could not be TITANIA for both case).', (eb) => {
              eb.colonies(1).startAction.colonies(1, {all}).asterix();
            });
          });
        }),
      },
    });
  }

  public canAct(player: Player) {
    return player.game.colonies.filter((colony) =>
      colony.colonies.includes(player) &&
      colony.isActive).length > 0;
  }

  private moveColony(player: Player) {
    const openColonies = player.game.colonies.filter((colony) =>
      colony.colonies.includes(player) &&
          colony.isActive && colony.name !== ColonyName.TITANIA); // 不能是分殖民地
    if (openColonies.length === 0) {
      return undefined;
    }
    return new SelectColony('Select colony to move', 'Move', openColonies, (colony: IColony) => {
      colony.removeColony(player);
      return undefined;
    });
  }

  public action(player: Player) {
    const openColonies = player.game.colonies.filter((colony) =>
      !colony.colonies.includes(player) && colony.colonies.length < 3 &&
        colony.isActive && colony.name !== ColonyName.TITANIA);
    player.game.defer(new SimpleDeferredAction(player, () => this.moveColony(player)), 2); // Let the priority higher than build colony
    player.game.defer(new BuildColony(player, false, 'Move to colony', openColonies));
    return undefined;
  }

  public initialAction(player: Player) {
    if (player.game.gameOptions.coloniesExtension) {
      player.game.defer(new BuildColony(player, false, 'first action - Select where to build colony'));
      return undefined;
    } else {
      console.warn('Colonies extension isn\'t selected.');
      return undefined;
    }
  }

  public play() {
    return undefined;
  }
}
