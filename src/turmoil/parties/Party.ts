import {Player} from '../../Player';
import {Game} from '../../Game';
import {NeutralPlayer} from '../Turmoil';

export abstract class Party {
    public partyLeader: undefined | Player | NeutralPlayer = undefined;
    public delegates: Array<Player|NeutralPlayer> = [];

    // Send a delegate in the area
    public sendDelegate(player: Player | NeutralPlayer, game: Game): void {
      this.delegates.push(player);
      this.checkPartyLeader(player, game);
    }

    // Remove a delegate from the area
    public removeDelegate(player: Player | NeutralPlayer, game: Game): void {
      this.delegates.splice(this.delegates.indexOf(player), 1);
      this.checkPartyLeader(player, game);
    }

    // Check if you are the new party leader
    public checkPartyLeader(newPlayer: Player | NeutralPlayer, game: Game): void {
      // If there is a party leader
      if (this.partyLeader) {
        if (game) {
          const sortedPlayers = [...this.getPresentPlayers()].sort(
            (p1, p2) => this.getDelegates(p2) - this.getDelegates(p1),
          );
          const max = this.getDelegates(sortedPlayers[0]);

          if (this.getDelegates(this.partyLeader) !== max) {
            let currentIndex = 0;
            if (this.partyLeader === 'NEUTRAL') {
              currentIndex = game.getPlayers().indexOf(game.activePlayer);
            } else {
              currentIndex = game.getPlayers().indexOf(this.partyLeader);
            }

            let playersToCheck: Array<Player | NeutralPlayer> = [];

            // Manage if it's the first player or the last
            if (game.getPlayers().length === 1 || currentIndex === 0) {
              playersToCheck = game.getPlayers();
            } else if (currentIndex === game.getPlayers().length - 1) {
              playersToCheck = game.getPlayers().slice(0, currentIndex);
              playersToCheck.unshift(game.getPlayers()[currentIndex]);
            } else {
              const left = game.getPlayers().slice(0, currentIndex);
              const right = game.getPlayers().slice(currentIndex);
              playersToCheck = right.concat(left);
            }

            // Add NEUTRAL in the list
            playersToCheck.push('NEUTRAL');

            playersToCheck.some((nextPlayer) => {
              if (this.getDelegates(nextPlayer) === max) {
                this.partyLeader = nextPlayer;
                return true;
              }
              return false;
            });
          }
        }
      } else {
        this.partyLeader = newPlayer;
      }
    }

    // List players present in this party
    public getPresentPlayers(): Array<Player | NeutralPlayer> {
      return Array.from(new Set(this.delegates));
    }

    // Return number of delegate
    public getDelegates(player: Player | NeutralPlayer): number {
      const delegates = this.delegates.filter((p) => p === player).length;
      return delegates;
    }
}
