import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {Size} from '../../../common/cards/render/Size';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {IPolicy} from '../../turmoil/Policy';
import {ICard} from '../ICard';
import {Turmoil} from '../../turmoil/Turmoil';
import {
  PoliticalReformData,
  getPoliticalReformPartyName,
  getPoliticalReformPolicyId,
} from '../../turmoil/PoliticalReformData';

/**
 * 实现额外的政策
 * Turmoil 蓝
 * PartyHooks  铁 绿 红
 * TurmoilHandler partyAction 科 热  PoliticalReform.canAct
 */
export class PoliticalReform extends CorporationCard implements ICard {
  public data: PoliticalReformData | undefined = undefined;

  public static getPartyName(data: PoliticalReformData | undefined): PartyName | undefined {
    return getPoliticalReformPartyName(data);
  }

  public static getPolicyId(data: PoliticalReformData | undefined) {
    return getPoliticalReformPolicyId(data);
  }

  private getPartyPolicy(player: IPlayer): IPolicy | undefined {
    if (!player.game.turmoil || this.data === undefined) {
      return undefined;
    }
    const turmoil = player.game.turmoil as Turmoil;
    const partyName = PoliticalReform.getPartyName(this.data);
    if (partyName === undefined) {
      return undefined;
    }
    const explicitPolicyId = PoliticalReform.getPolicyId(this.data);
    if (explicitPolicyId !== undefined) {
      return turmoil.getPartyByName(partyName).policies.find((policy) => policy.id === explicitPolicyId);
    }
    return turmoil.getPolicyByPartyName(partyName);
  }

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
    return this.getPartyPolicy(player)?.canAct?.(player) === true;
  }

  public action(player: IPlayer) {
    const policy = this.getPartyPolicy(player);
    if (policy?.canAct?.(player)) {
      policy.action?.(player);
    }
    return undefined;
  }
}
