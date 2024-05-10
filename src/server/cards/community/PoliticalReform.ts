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

/**
 * 实现额外的政策
 * PartyHooks  铁 绿 红
 * TurmoilHandler  科 热
 */
export class PoliticalReform extends CorporationCard {
  public data:PartyName | undefined = undefined;

  constructor() {
    super({
      name: CardName.POLITICALREFORM,
      tags: [Tag.SPACE],
      startingMegaCredits: 49,


      metadata: {
        cardNumber: 'XB15',
        description: 'You start with 49 M€..',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.corpBox('effect', (ce) => {
            ce.text('At the end of the solar phase,the party with most your delegates,regarded as your another ruling party,its policy will be active for you during the coming action phase. ', Size.SMALL);
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
