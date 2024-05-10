import {IPlayer} from '../../IPlayer';
import {CardRequirement} from './CardRequirement';
import {RequirementType} from '../../../common/cards/RequirementType';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';

/**
 * Evaluates whether a player is the chairman.
 */
export class ChairmanRequirement extends CardRequirement {
  public readonly type = RequirementType.CHAIRMAN;
  constructor() {
    super({count: 1});
  }
  public satisfies(player: IPlayer) : boolean {
    return TurmoilUtil.getTurmoil(player.game).chairman === player;
  }
}
