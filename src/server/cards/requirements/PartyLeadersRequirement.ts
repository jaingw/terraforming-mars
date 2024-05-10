import {IPlayer} from '../../IPlayer';
import {InequalityRequirement} from './InequalityRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';

/**
 * Evaluate whether the number of Turmoil parties a player leads is at least (or at most) a given value.
 */
export class PartyLeadersRequirement extends InequalityRequirement {
  public readonly type = RequirementType.PARTY_LEADERS;
  public override getScore(player: IPlayer): number {
    const turmoil = TurmoilUtil.getTurmoil(player.game);
    return turmoil.parties.filter((party) => party.partyLeader === player).length;
  }
}
