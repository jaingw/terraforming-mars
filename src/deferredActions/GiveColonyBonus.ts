import {Player} from '../Player';
import {Game} from '../Game';
import {Colony} from '../colonies/Colony';
import {DeferredAction} from './DeferredAction';
import {Multiset} from '../utils/Multiset';

export class GiveColonyBonus implements DeferredAction {
    public cb: () => void = () => {};
    private waitingFor: Multiset<Player> = new Multiset<Player>();
    constructor(
        public player: Player,
        public game: Game,
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
        const player = entry[0];
        this.giveColonyBonus(player, this.game);
      }

      return undefined;
    }

    public giveColonyBonus(player: Player, game: Game): void {
      if (this.waitingFor.get(player) !== undefined && this.waitingFor.get(player)! > 0) {
        this.waitingFor.subtract(player);
        const input = this.colony.giveColonyBonus(player, game, true);
        if (input !== undefined) {
          player.setWaitingFor(input, () => this.giveColonyBonus(player, game));
        } else {
          this.giveColonyBonus(player, game);
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
