import {CardName} from '../../common/cards/CardName';
import {Player} from '../../Player';
import {CardType} from '../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tags} from '../../common/cards/Tags';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {IActionCard} from '../ICard';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';
import {Card} from '../Card';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';

export class LunaPoliticalInstitute extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      name: CardName.LUNA_POLITICAL_INSTITUTE,
      cardType: CardType.ACTIVE,
      tags: [Tags.MOON, Tags.EARTH],
      cost: 6,
      requirements: CardRequirements.builder((b) => b.tag(Tags.MOON, 2)),

      metadata: {
        description: 'Requires that you have 2 Moon tags.',
        cardNumber: 'M71',
        renderData: CardRenderer.builder((b) => {
          b.action(
            'Move one of your delegates from the reserve to any party.',
            (eb) => eb.empty().startAction.delegates(1));
        }),
      },
    });
  }

  public play() {
    return undefined;
  }

  public canAct(player: Player) {
    return TurmoilUtil.getTurmoil(player.game).getDelegatesInReserve(player) > 0;
  }

  public action(player: Player) {
    player.game.defer(new SendDelegateToArea(player, 'Select where to send a delegate', {source: 'reserve'}));
    return undefined;
  }
}
