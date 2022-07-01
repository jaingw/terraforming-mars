import {Player} from '../Player';
import {BonusId} from '../common/turmoil/Types';

export interface Bonus {
  id: BonusId;
  description: string;
  isDefault: boolean;
  grant: (players: Array<Player>) => void;
  getScore: (player: Player) => number;
}
