import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {Player} from '../../../Player';
// import {DeferredAction} from '../../../deferredActions/DeferredAction';
// import {OrOptions} from '../../../inputs/OrOptions';
// import {SelectOption} from '../../../inputs/SelectOption';
// import {SelectAmount} from '../../../inputs/SelectAmount';
// import {AndOptions} from '../../../inputs/AndOptions';
// import {all} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {SendDelegateToArea} from '../../../deferredActions/SendDelegateToArea';

export class SithOrganizations extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.SITH_ORGANIZATIONS,
      tags: [Tags.JOVIAN, Tags.VENUS],
      startingMegaCredits: 40,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q48',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40, {size: Size.TINY});
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.action('Send a neutral delegate to any party.', (eb) => {
              eb.empty().startAction.delegates(1).asterix();
            });
            ce.effect('Your delegates count as neutral delegates. If neutral delegate becomes chairman, you can decide: let all other player lose 1 TR, or ignore their ruling bonus.', (eb) => {
              eb.delegates(1).startEffect.delegates(1).nbsp.nbsp.chairman().asterix();
            });
          });
        }),
      },
    });
  }

  public play(_player: Player) {
    // 去掉影响力
    // if (player.game.turmoil) {
    //   player.game.turmoil.addInfluenceBonus(player);
    // }
    return undefined;
  }

  public action(player: Player) {
    if (player.game.turmoil) {
      player.game.defer(new SendDelegateToArea(player, 'Select where to send a delegate', {source: 'reserve'}));
    }
    return undefined;
  }

  public canAct(): boolean {
    return true;
  }
}

