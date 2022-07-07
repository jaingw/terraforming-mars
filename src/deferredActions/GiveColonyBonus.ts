import {Player} from '../Player';
import {IColony} from '../colonies/IColony';
import {DeferredAction, Priority} from './DeferredAction';
import {Multiset} from '../utils/Multiset';
import {CardName} from '../common/cards/CardName';

// 殖民者贸易奖励
export class GiveColonyBonus extends DeferredAction {
  public cb: () => void = () => {};
  private waitingFor: Multiset<Player> = new Multiset<Player>();
  constructor(
    player: Player,
    public colony: IColony,
    public selfish: boolean = false, // Used for CoordinatedRaid.
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    if (this.colony.colonies.length === 0) {
      this.cb();
      return undefined;
    }

    for (const player of this.colony.colonies) {
      if (!this.selfish) {
        // Normal behavior; colony owners get their bonuses.
        this.waitingFor.add(player);
        if (player.isCorporation(CardName.IMPERIAL_STAR_DESTROYER)) {
          this.waitingFor.add(player); // 再触发一次殖民地奖励
        }
      } else {
        // Selfish behavior, `player` gets all the colony bonuses.
        this.waitingFor.add(this.player);
        if (this.player.isCorporation(CardName.IMPERIAL_STAR_DESTROYER)) {
          this.waitingFor.add(this.player); // 如果自己是歼星则全部翻倍
        }
      }
    }

    for (const entry of this.waitingFor.entries()) {
      const bonusPlayer = entry[0];
      console.log(bonusPlayer.name, bonusPlayer.isCorporation(CardName.IMPERIAL_STAR_DESTROYER));
      this.giveColonyBonus(bonusPlayer);
    }

    return undefined;
  }

  private giveColonyBonus(player: Player): void {
    if ((this.waitingFor.get(player) ?? 0 > 0) && player.exited === false) {
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
