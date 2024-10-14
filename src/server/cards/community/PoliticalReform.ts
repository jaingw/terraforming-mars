import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {Policy} from '../../turmoil/Policy';
import {KELVINISTS_POLICY_1} from '../../turmoil/parties/Kelvinists';
import {SCIENTISTS_POLICY_1} from '../../turmoil/parties/Scientists';
import {ICard} from '../ICard';

/**
 * 实现额外的政策
 * Turmoil 蓝
 * PartyHooks  铁 绿 红
 * TurmoilHandler partyAction 科 热  PoliticalReform.canAct
 */
export class PoliticalReform extends CorporationCard implements ICard {
  public data:PartyName | undefined = undefined;

  constructor() {
    super({
      name: CardName.POLITICALREFORM,
      tags: [Tag.SPACE],
      startingMegaCredits: 52,


      metadata: {
        cardNumber: 'XB15',
        description: 'You start with 52 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(52);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.text('效果:  每时代派送的第一个议员到一个非执政党时, 你获得该政党的政策效果直至时代结束', Size.SMALL);
          });
        }),
      },
    });
  }


  public canAct(player: IPlayer): boolean {
    if (PartyName.KELVINISTS === this.data && KELVINISTS_POLICY_1.canAct?.(player)) {
      return true;
    }
    if ( PartyName.SCIENTISTS === this.data && SCIENTISTS_POLICY_1.canAct?.(player)) {
      return true;
    }
    return false;
  }

  public action(player: IPlayer) {
    if (!player.game.turmoil) {
      return undefined;
    }

    if (this.data === PartyName.KELVINISTS) {
      const policy: Policy = KELVINISTS_POLICY_1;
      if (policy.canAct?.(player)) {
        policy.action?.(player);
      }
    }

    if (this.data === PartyName.SCIENTISTS) {
      const policy: Policy = SCIENTISTS_POLICY_1;
      if (policy.canAct?.(player)) {
        policy.action?.(player);
      }
    }
    return undefined;
  }
}
