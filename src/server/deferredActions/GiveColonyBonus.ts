import {IPlayer} from '../IPlayer';
import {PlayerId} from '../../common/Types';
import {IColony} from '../colonies/IColony';
import {DeferredAction} from './DeferredAction';
import {Priority} from './Priority';
import {MultiSet} from 'mnemonist';
import {CardName} from '../../common/cards/CardName';

export class GiveColonyBonus extends DeferredAction {
  private waitingFor = new MultiSet<PlayerId>();
  private playersWithBonuses = new Set<PlayerId>();

  constructor(
    player: IPlayer,
    public colony: IColony,
    public selfish: boolean = false, // Used for CoordinatedRaid.
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    if (this.colony.colonies.length === 0) {
      this.cb(undefined);
      return undefined;
    }

    for (const player of this.colony.colonies) {
      if (!this.selfish) {
        // Normal behavior; colony owners get their bonuses.
        this.waitingFor.add(player.id);
        if (player.isCorporation(CardName.IMPERIAL_STAR_DESTROYER)) {
          this.waitingFor.add(player.id); // 再触发一次殖民地奖励
        }
        this.playersWithBonuses.add(player.id);
      } else {
        // Selfish behavior, `player` gets all the colony bonuses.
        this.waitingFor.add(this.player.id);
        if (this.player.isCorporation(CardName.IMPERIAL_STAR_DESTROYER)) {
          this.waitingFor.add(this.player.id); // 如果自己是歼星则全部翻倍
        }
        this.playersWithBonuses.add(this.player.id);
      }
    }

    for (const playerId of this.waitingFor.keys()) {
      const bonusPlayer = this.player.game.getPlayerById(playerId);
      this.giveColonyBonus(bonusPlayer);
    }

    return undefined;
  }

  private giveColonyBonus(player: IPlayer): void {
    if ((this.waitingFor.get(player.id) ?? 0 > 0) && player.exited === false) {
      this.waitingFor.remove(player.id);
      const input = this.colony.giveColonyBonus(player, true);
      if (input !== undefined) {
        player.setWaitingFor(input, () => this.giveColonyBonus(player));
      } else {
        this.giveColonyBonus(player);
      }
    } else {
      this.playersWithBonuses.delete(player.id);
      this.doneGettingBonus();
    }
  }

  private doneGettingBonus(): void {
    if (this.playersWithBonuses.size === 0) {
      this.cb(undefined);
    }
  }
}
