import {PartyName} from './parties/PartyName';
import {IParty, ALL_PARTIES} from './parties/IParty';
import {Player} from '../Player';
import {Game} from '../Game';
import {GlobalEventDealer, getGlobalEventByName} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {ISerializable} from '../ISerializable';
import {SerializedTurmoil} from './SerializedTurmoil';
import {PLAYER_DELEGATES_COUNT} from '../constants';
import {SerializedPlayer} from '../SerializedPlayer';
export type NeutralPlayer = 'NEUTRAL';

export class Turmoil implements ISerializable<SerializedTurmoil> {
    public chairman: undefined | Player | NeutralPlayer = undefined;
    public rulingParty: IParty;
    public dominantParty: IParty;
    public lobby: Set<string> = new Set<string>();
    public delegateReserve: Array<Player | NeutralPlayer> = [];
    public parties: Array<IParty> = ALL_PARTIES.map((cf) => new cf.Factory());
    public playersInfluenceBonus: Map<string, number> = new Map<string, number>();
    public readonly globalEventDealer: GlobalEventDealer;
    public distantGlobalEvent: IGlobalEvent | undefined;
    public comingGlobalEvent: IGlobalEvent | undefined;
    public currentGlobalEvent: IGlobalEvent | undefined;

    private constructor(
      rulingPartyName: PartyName,
      dominantPartyName: PartyName,
      globalEventDealer: GlobalEventDealer) {
      this.rulingParty = this.getPartyByName(rulingPartyName);
      this.dominantParty = this.getPartyByName(dominantPartyName);
      this.globalEventDealer = globalEventDealer;
    }

    public static newInstance(game: Game): Turmoil {
      const dealer = GlobalEventDealer.newInstance(game);
      const turmoil = new Turmoil(PartyName.GREENS, PartyName.GREENS, dealer);

      game.getPlayers().forEach((player) => {
        // Begin with one delegate in the lobby
        turmoil.lobby.add(player.id);
        // Begin with six delegates in the delegate reserve
        for (let i = 0; i < PLAYER_DELEGATES_COUNT - 1; i++) {
          turmoil.delegateReserve.push(player);
        }
      });

      // The game begins with a Neutral chairman
      turmoil.chairman = 'NEUTRAL';

      // Begin with 13 neutral delegates in the reserve
      for (let i = 0; i < 13; i++) {
        turmoil.delegateReserve.push('NEUTRAL');
      }

      // Init the global event dealer
      turmoil.initGlobalEvent(game);
      return turmoil;
    }

    public initGlobalEvent(game: Game) {
      // Draw the first global event to setup the game
      this.comingGlobalEvent = this.globalEventDealer.draw();
      if (this.comingGlobalEvent !== undefined) {
        this.sendDelegateToParty('NEUTRAL', this.comingGlobalEvent.revealedDelegate, game);
      }
      this.distantGlobalEvent = this.globalEventDealer.draw();
      if (this.distantGlobalEvent !== undefined) {
        this.sendDelegateToParty('NEUTRAL', this.distantGlobalEvent.revealedDelegate, game);
      }
    }

    public getPartyByName(name: PartyName): IParty {
      const party = this.parties.find((party) => party.name === name);
      if (party === undefined) {
        throw new Error(`Cannot find party with name {${name}}`);
      }
      return party;
    }

    // Use to send a delegate to a specific party
    public sendDelegateToParty(
      player: Player | NeutralPlayer,
      partyName: PartyName,
      game: Game,
      fromLobby: boolean = true): void {
      const party = this.getPartyByName(partyName);
      if (party) {
        if (player !== 'NEUTRAL' && this.lobby.has(player.id) && fromLobby) {
          this.lobby.delete(player.id);
        } else {
          const index = this.delegateReserve.indexOf(player);
          if (index > -1) {
            this.delegateReserve.splice(index, 1);
          }
        }
        party.sendDelegate(player, game);
        this.checkDominantParty(party);
      } else {
        throw 'Party not found';
      }
    }

    // Use to remove a delegate from a specific party
    public removeDelegateFromParty(player: Player | NeutralPlayer, partyName: PartyName, game: Game): void {
      const party = this.getPartyByName(partyName);
      if (party) {
        this.delegateReserve.push(player);
        party.removeDelegate(player, game);
        this.checkDominantParty(party);
      } else {
        throw 'Party not found';
      }
    }

    // Check dominant party
    public checkDominantParty(party:IParty): void {
      // If there is a dominant party
      if (this.dominantParty) {
        const sortParties = [...this.parties].sort(
          (p1, p2) => p2.delegates.length - p1.delegates.length,
        );
        const max = sortParties[0].delegates.length;
        if (this.dominantParty.delegates.length !== max) {
          this.setNextPartyAsDominant(this.dominantParty);
        }
      } else {
        this.dominantParty = party;
      }
    }

    // Function to get next dominant party taking into account the clockwise order
    public setNextPartyAsDominant(currentDominantParty: IParty) {
      const sortParties = [...this.parties].sort(
        (p1, p2) => p2.delegates.length - p1.delegates.length,
      );
      const max = sortParties[0].delegates.length;

      const currentIndex = this.parties.indexOf(currentDominantParty);

      let partiesToCheck = [];

      // Manage if it's the first party or the last
      if (currentIndex === 0) {
        partiesToCheck = this.parties.slice(currentIndex + 1);
      } else if (currentIndex === this.parties.length - 1) {
        partiesToCheck = this.parties.slice(0, currentIndex);
      } else {
        const left = this.parties.slice(0, currentIndex);
        const right = this.parties.slice(currentIndex + 1);
        partiesToCheck = right.concat(left);
      }

      // Take the clockwise order
      const partiesOrdered = partiesToCheck.reverse();

      partiesOrdered.some((newParty) => {
        if (newParty.delegates.length === max) {
          this.dominantParty = newParty;
          return true;
        }
        return false;
      });
    }

    // Launch the turmoil phase
    public endGeneration(game: Game): void {
      // 1 - All player lose 1 TR
      game.getPlayers().forEach((player) => {
        player.decreaseTerraformRating();
      });

      // 2 - Global Event
      if (this.currentGlobalEvent) {
        this.currentGlobalEvent.resolve(game, this);
      }

      // 3 - New Government
      this.rulingParty = this.dominantParty;

      // 3.a - Ruling Policy change
      if (this.rulingParty) {
        this.setRulingParty(game);
      }

      // 3.b - New dominant party
      this.setNextPartyAsDominant(this.rulingParty!);

      // 3.c - Fill the lobby
      this.lobby.forEach((playerId) => {
        this.delegateReserve.push(game.getPlayerById(playerId));
      });
      this.lobby = new Set<string>();

      game.getPlayers().forEach((player) => {
        if (this.getDelegates(player) > 0) {
          const index = this.delegateReserve.indexOf(player);
          if (index > -1) {
            this.delegateReserve.splice(index, 1);
          }
          this.lobby.add(player.id);
        }
      });

      // 4 - Changing Time
      if (this.currentGlobalEvent) {
        this.globalEventDealer.discardedGlobalEvents.push(this.currentGlobalEvent);
      }
      // 4.a - Coming Event is now Current event. Add neutral delegate.
      this.currentGlobalEvent = this.comingGlobalEvent;
      if (this.currentGlobalEvent) {
        this.sendDelegateToParty('NEUTRAL', this.currentGlobalEvent.currentDelegate, game);
      }
      // 4.b - Distant Event is now Coming Event
      this.comingGlobalEvent = this.distantGlobalEvent;
      // 4.c - Draw the new distant event and add neutral delegate
      this.distantGlobalEvent = this.globalEventDealer.draw();
      if (this.distantGlobalEvent) {
        this.sendDelegateToParty('NEUTRAL', this.distantGlobalEvent.revealedDelegate, game);
      }
      game.log('Turmoil phase has been resolved');
    }

    // Ruling Party changes
    public setRulingParty(game: Game): void {
      if (this.rulingParty) {
        // Resolve Ruling Bonus
        this.rulingParty.rulingBonus(game);

        // Change the chairman
        if (this.chairman) {
          this.delegateReserve.push(this.chairman);
        }

        this.chairman = this.rulingParty.partyLeader;
        if (this.chairman) {
          if (this.chairman instanceof Player) {
            this.chairman.increaseTerraformRating(game);
            game.log('${0} is the new chairman and got 1 TR increase', (b) => b.player(this.chairman as Player));
          }
        } else {
          console.error('No chairman');
        }

        const index = this.rulingParty.delegates.indexOf(this.rulingParty.partyLeader!);
        // Remove the party leader from the delegates array
        this.rulingParty.delegates.splice(index, 1);
        // Fill the delegate reserve
        this.delegateReserve = this.delegateReserve.concat(this.rulingParty.delegates);

        // Clean the party
        this.rulingParty.partyLeader = undefined;
        this.rulingParty.delegates = [];
      }
    }

    public getPlayerInfluence(player: Player) {
      let influence: number = 0;
      if (this.chairman !== undefined && this.chairman === player) influence++;

      const dominantParty : IParty = this.dominantParty;
      const isPartyLeader = dominantParty.partyLeader === player;
      const delegateCount = dominantParty.delegates.filter((delegate) => delegate === player).length;

      if (isPartyLeader) {
        influence++;
        if (delegateCount > 1) influence++; // at least 1 non-leader delegate
      } else {
        if (delegateCount > 0) influence++;
      }

      if (this.playersInfluenceBonus.has(player.id)) {
        const bonus = this.playersInfluenceBonus.get(player.id);
        if (bonus) {
          influence+= bonus;
        }
      }
      return influence;
    }

    public addInfluenceBonus(player: Player, bonus:number = 1) {
      if (this.playersInfluenceBonus.has(player.id)) {
        let current = this.playersInfluenceBonus.get(player.id);
        if (current) {
          current += bonus;
          this.playersInfluenceBonus.set(player.id, current);
        }
      } else {
        this.playersInfluenceBonus.set(player.id, bonus);
      }
    }

    public canPlay(player: Player, partyName : PartyName): boolean {
      if (this.rulingParty === this.getPartyByName(partyName)) {
        return true;
      }

      const party = this.getPartyByName(partyName);
      if (party !== undefined && party.getDelegates(player) >= 2) {
        return true;
      }

      return false;
    }

    // List players present in the reserve
    public getPresentPlayers(): Array<Player | NeutralPlayer> {
      return Array.from(new Set(this.delegateReserve));
    }

    // Return number of delegate
    public getDelegates(player: Player | NeutralPlayer): number {
      const delegates = this.delegateReserve.filter((p) => p === player).length;
      return delegates;
    }

    // Get Victory Points
    public getPlayerVictoryPoints(player: Player): number {
      let victory: number = 0;
      if (this.chairman !== undefined && this.chairman === player) victory++;
      this.parties.forEach(function(party) {
        if (party.partyLeader === player) {
          victory++;
        }
      });
      return victory;
    }

    public serialize(): SerializedTurmoil {
      const result: SerializedTurmoil = {
        chairman: this.chairman instanceof Player ? this.chairman.serialize() : this.chairman,
        rulingParty: this.rulingParty,
        dominantParty: this.dominantParty,
        lobby: Array.from(this.lobby),
        delegateReserve: this.delegateReserve.map((delegete) => delegete instanceof Player ? delegete.serialize() : delegete),
        parties: this.parties,
        playersInfluenceBonus: Array.from(this.playersInfluenceBonus.entries()),
        globalEventDealer: this.globalEventDealer.serialize(),
        distantGlobalEvent: this.distantGlobalEvent,
        comingGlobalEvent: this.comingGlobalEvent,
      };
      if (this.currentGlobalEvent !== undefined) {
        result.currentGlobalEvent = this.currentGlobalEvent;
      }
      return result;
    }

    public static deserialize(d: SerializedTurmoil, game: Game): Turmoil {
      function partyName(object: any): PartyName {
        function instanceOfIParty(object: any): object is IParty {
          try {
            return 'delegates' in object;
          } catch (typeError) {
            return false;
          }
        }
        if (instanceOfIParty(object)) {
          return object.name;
        } else {
          return object;
        }
      }
      const dealer = GlobalEventDealer.deserialize(d.globalEventDealer);
      const turmoil = new Turmoil(partyName(d.rulingParty), partyName(d.dominantParty), dealer);

      // Rebuild chairman
      if (d.chairman) {
        if (d.chairman === 'NEUTRAL') {
          turmoil.chairman = 'NEUTRAL';
        } else {
          const chairman_id = d.chairman.id;
          turmoil.chairman = game.getAllPlayers().find((player) => player.id === chairman_id); ;
        }
      }

      turmoil.lobby = new Set(d.lobby);

      if (d.delegateReserve === undefined && d.delegate_reserve !==undefined) {
        d.delegateReserve = d.delegate_reserve;
      }
      turmoil.delegateReserve = d.delegateReserve.map((element: SerializedPlayer | NeutralPlayer) => {
        if (element === 'NEUTRAL') {
          return 'NEUTRAL';
        } else {
          const player = game.getAllPlayers().find((player) => player.id === element.id);
          if (player) {
            return player;
          } else {
            throw 'Player not found when rebuilding delegate reserve';
          }
        }
      });

      // Rebuild party leader
      d.parties.forEach((element: IParty ) => {
        const party = turmoil.getPartyByName(element.name);
        if (party === undefined) {
          throw new Error('huh? unknown party: ' + element.name);
        }
        if (element.partyLeader) {
          if (element.partyLeader === 'NEUTRAL') {
            party!.partyLeader = 'NEUTRAL';
          } else {
            const partyLeaderId = element.partyLeader.id;
            party!.partyLeader = game.getAllPlayers().find((player) => player.id === partyLeaderId);
          }
        }

        // Rebuild delegates
        party!.delegates = [];
        element.delegates.forEach((element: Player | NeutralPlayer) => {
          if (element === 'NEUTRAL') {
            party!.delegates.push('NEUTRAL');
          } else {
            const player = game.getAllPlayers().find((player) => player.id === element.id);
            if (player) {
              party!.delegates.push(player);
            }
          }
        });
        if (turmoil.dominantParty?.name === party?.name) {
          turmoil.dominantParty = party;
        }
      });

      turmoil.playersInfluenceBonus = new Map<string, number>(d.playersInfluenceBonus);

      if (d.distantGlobalEvent) {
        turmoil.distantGlobalEvent = getGlobalEventByName(d.distantGlobalEvent.name);
      }
      if (d.comingGlobalEvent) {
        turmoil.comingGlobalEvent = getGlobalEventByName(d.comingGlobalEvent.name);
      } else if ((d as any).commingGlobalEvent) {
        turmoil.comingGlobalEvent = getGlobalEventByName((d as any).commingGlobalEvent.name);
      }

      if (d.currentGlobalEvent) {
        turmoil.currentGlobalEvent = getGlobalEventByName(d.currentGlobalEvent.name);
      }

      return turmoil;
    }
}
