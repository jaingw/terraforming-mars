import {Player} from '../Player';
import {Colony} from '../colonies/Colony';
import {DeferredAction, Priority} from './DeferredAction';
import {Multiset} from '../utils/Multiset';

// 殖民者贸易奖励
export class GiveColonyBonus implements DeferredAction {
    public priority = Priority.DEFAULT;
    public cb: () => void = () => {};
    private waitingFor: Multiset<Player> = new Multiset<Player>();
    constructor(
        public player: Player,
        public colony: Colony,
    ) {}

    public execute() {
      if (this.colony.colonies.length === 0) {
        this.cb();
        return undefined;
      }

      for (const player of this.colony.colonies) {
        this.waitingFor.add(player);
      }

      for (const entry of this.waitingFor.entries()) {
        const bonusPlayer = entry[0];
        this.giveColonyBonus(bonusPlayer);
      }

      return undefined;
    }

    private giveColonyBonus(player: Player): void {
      if (this.waitingFor.get(player) !== undefined && this.waitingFor.get(player)! > 0 && player.exited === false) {
        this.waitingFor.subtract(player);
        const input = this.colony.giveColonyBonus(player, true);
        if (input !== undefined) {
          player.setWaitingFor(input, () => this.giveColonyBonus(player));
        } else {
          this.giveColonyBonus(player);
        }
      } else {
        this.waitingFor.remove(player);
        this.doneGettingBonus();
      }
    }

    private doneGettingBonus(): void {
      if (this.waitingFor.entries().length === 0) {
        this.cb();
      }
    }
}
