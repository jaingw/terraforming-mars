import {PartyName} from '../../common/turmoil/PartyName';
import {IParty, ALL_PARTIES} from './parties/IParty';
import {Player} from '../Player';
import {Game} from '../Game';
import {GlobalEventDealer, getGlobalEventByName} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {SerializedTurmoil} from './SerializedTurmoil';
import {DELEGATES_FOR_NEUTRAL_PLAYER, DELEGATES_PER_PLAYER} from '../../common/constants';
import {PoliticalAgendasData, PoliticalAgendas} from './PoliticalAgendas';
import {AgendaStyle} from '../../common/turmoil/Types';
import {CardName} from '../../common/cards/CardName';
import {SimpleDeferredAction} from '../deferredActions/DeferredAction';
import {SelectOption} from '../inputs/SelectOption';
import {OrOptions} from '../inputs/OrOptions';
import {MultiSet} from 'mnemonist';
import {SerializedPlayerId} from '../SerializedPlayer';
import {PlayerId} from '../../common/Types';
export type NeutralPlayer = 'NEUTRAL';
export type Delegate = PlayerId | NeutralPlayer;


const UNINITIALIZED_POLITICAL_AGENDAS_DATA: PoliticalAgendasData = {
  agendas: new Map(),
  agendaStyle: AgendaStyle.CHAIRMAN,
};
export class Turmoil {
  public chairman: undefined | Delegate = undefined;
  public rulingParty: IParty;
  public dominantParty: IParty;
  public usedFreeDelegateAction = new Set<PlayerId>();
  public delegateReserve = new MultiSet<Delegate>();
  public parties = ALL_PARTIES.map((cf) => new cf.Factory());
  public playersInfluenceBonus = new Map<string, number>();
  public readonly globalEventDealer: GlobalEventDealer;
  public distantGlobalEvent: IGlobalEvent | undefined;
  public comingGlobalEvent: IGlobalEvent | undefined;
  public currentGlobalEvent: IGlobalEvent | undefined;
  public politicalAgendasData: PoliticalAgendasData = UNINITIALIZED_POLITICAL_AGENDAS_DATA;

  private constructor(
    rulingPartyName: PartyName,
    chairman: Delegate,
    dominantPartyName: PartyName,
    globalEventDealer: GlobalEventDealer) {
    this.rulingParty = this.getPartyByName(rulingPartyName);
    this.chairman = chairman;
    this.dominantParty = this.getPartyByName(dominantPartyName);
    this.globalEventDealer = globalEventDealer;
  }

  public static newInstance(game: Game, agendaStyle: AgendaStyle = AgendaStyle.STANDARD): Turmoil {
    const dealer = GlobalEventDealer.newInstance(game);

    // The game begins with Greens in power and a Neutral chairman
    const turmoil = new Turmoil(PartyName.GREENS, 'NEUTRAL', PartyName.GREENS, dealer);

    game.log('A neutral delegate is the new chairman.');
    game.log('Greens are in power in the first generation.');

    // Init parties
    turmoil.parties = ALL_PARTIES.map((cf) => new cf.Factory());

    game.getPlayersInGenerationOrder().forEach((player) => {
      turmoil.delegateReserve.add(player.id, DELEGATES_PER_PLAYER);
    });
    // One Neutral delegate is already Chairman
    turmoil.delegateReserve.add('NEUTRAL', DELEGATES_FOR_NEUTRAL_PLAYER - 1);

    turmoil.politicalAgendasData = PoliticalAgendas.newInstance(agendaStyle, turmoil.parties);
    // Note: this call relies on an instance of Game that will not be fully formed.
    // TODO(kberg): split newInstance into create/set-up so this can be done once the whole thing is ready.
    turmoil.onAgendaSelected(game);
    turmoil.initGlobalEvent(game);
    return turmoil;
  }

  public initGlobalEvent(game: Game) {
    // Draw the first global event to setup the game
    this.comingGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.comingGlobalEvent?.revealedDelegate, game);
    this.distantGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.distantGlobalEvent?.revealedDelegate, game);
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
    playerId: Delegate,
    partyName: PartyName,
    game: Game): void {
    const party = this.getPartyByName(partyName);
    if (this.delegateReserve.has(playerId)) {
      this.delegateReserve.remove(playerId);
    } else {
      console.log(`${playerId}/${game.id} tried to get a delegate from an empty reserve.`);
      return;
    }
    party.sendDelegate(playerId, game);
    // 如果是西斯，所有放置的代表都是中立代表
    /**
    const sith = game.getPlayers().find((p) => p.isCorporation(CardName.SITH_ORGANIZATIONS));
    if (playerId === 'NEUTRAL' && sith !== undefined) {
      party.sendDelegate(sith.id, game);
    } else {
      party.sendDelegate(playerId, game);
    }
     */
    this.checkDominantParty();
  }

  // Use to remove a delegate from a specific party
  public removeDelegateFromParty(playerId: Delegate, partyName: PartyName, game: Game): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(playerId);
    party.removeDelegate(playerId, game);
    this.checkDominantParty();
  }

  // Use to replace a delegate from a specific party with another delegate with NO DOMINANCE CHANGE
  public replaceDelegateFromParty(
    outgoingPlayer: Delegate,
    incomingPlayer: Delegate,
    partyName: PartyName,
    game: Game): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(outgoingPlayer);
    party.removeDelegate(outgoingPlayer, game);
    this.sendDelegateToParty(incomingPlayer, partyName, game);
  }

  // Check dominant party
  public checkDominantParty(): void {
    // If there is a dominant party
    const sortParties = [...this.parties].sort(
      (p1, p2) => p2.delegates.size - p1.delegates.size,
    );
    const max = sortParties[0].delegates.size;
    if (this.dominantParty.delegates.size !== max) {
      this.setNextPartyAsDominant(this.dominantParty);
    }
  }

  // Function to get next dominant party taking into account the clockwise order
  public setNextPartyAsDominant(currentDominantParty: IParty) {
    const sortParties = [...this.parties].sort(
      (p1, p2) => p2.delegates.size - p1.delegates.size,
    );
    const max = sortParties[0].delegates.size;

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
      if (newParty.delegates.size === max) {
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
    if (this.currentGlobalEvent !== undefined) {
      const currentGlobalEvent: IGlobalEvent = this.currentGlobalEvent;
      game.log('Resolving global event ${0}', (b) => b.globalEvent(currentGlobalEvent));
      currentGlobalEvent.resolve(game, this);
    }

    // 3 - New Government
    this.rulingParty = this.dominantParty;

    // 3.a - Ruling Policy change
    this.setRulingParty(game);

    // 3.b - New dominant party
    this.setNextPartyAsDominant(this.rulingParty);

    // 3.c - Fill the lobby
    this.usedFreeDelegateAction.clear();

    // 4 - Changing Time
    if (this.currentGlobalEvent) {
      this.globalEventDealer.discardedGlobalEvents.push(this.currentGlobalEvent);
    }
    // 4.a - Coming Event is now Current event. Add neutral delegate.
    this.currentGlobalEvent = this.comingGlobalEvent;
    this.addNeutralDelegate(this.currentGlobalEvent?.currentDelegate, game);
    // 4.b - Distant Event is now Coming Event
    this.comingGlobalEvent = this.distantGlobalEvent;
    // 4.c - Draw the new distant event and add neutral delegate
    this.distantGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.distantGlobalEvent?.revealedDelegate, game);
    game.log('Turmoil phase has been resolved');
  }

  private addNeutralDelegate(partyName: PartyName | undefined, game: Game) {
    if (partyName) {
      this.sendDelegateToParty('NEUTRAL', partyName, game);
      game.log('A neutral delegate was added to the ${0} party', (b) => b.partyName(partyName));
    }
  }

  // Ruling Party changes
  public setRulingParty(game: Game): void {
    // Cleanup previous party effects
    game.getPlayers().forEach((player) => player.hasTurmoilScienceTagBonus = false);

    const newChariman = this.rulingParty.partyLeader || 'NEUTRAL';

    // Fill the delegate reserve with everyone except the party leader
    if (this.rulingParty.partyLeader !== undefined) {
      this.rulingParty.delegates.remove(this.rulingParty.partyLeader);
    }
    this.rulingParty.delegates.forEachMultiplicity((count, playerId) => {
      this.delegateReserve.add(playerId, count);
    });

    // Clean the party
    this.rulingParty.partyLeader = undefined;
    this.rulingParty.delegates.clear();

    this.setNewChairman(newChariman, game, /* setAgenda*/ true);
  }

  public setNewChairman(newChairman : Delegate, game: Game, setAgenda: boolean = true, gainTR: boolean = true) {
    // Change the chairman
    if (this.chairman) {
      // Return the current Chairman to reserve
      this.delegateReserve.add(this.chairman);
    }
    this.chairman = newChairman;

    // Set Agenda
    if (setAgenda) {
      PoliticalAgendas.setNextAgenda(this, game);
    }

    // Finally, award Chairman benefits
    if (this.chairman !== 'NEUTRAL' && this.chairman !== undefined) {
      const player = game.getPlayerById(this.chairman);
      let steps = gainTR ? 1 : 0;
      // Tempest Consultancy Hook (gains an additional TR when they become chairman)
      if (player.isCorporation(CardName.TEMPEST_CONSULTANCY)) steps += 1;

      // Raise TR
      game.defer(new SimpleDeferredAction(player, () => {
        if (steps > 0) {
          player.increaseTerraformRatingSteps(steps);
          game.log('${0} is the new chairman and gains ${1} TR', (b) => b.player(player).number(steps));
        } else {
          game.log('${0} is the new chairman', (b) => b.player(player));
        }
        return undefined;
      }));
    } else {
      game.log('A neutral delegate is the new chairman.');
    }
  }

  public chooseRulingParty(player: Player): void {
    const setRulingParty = new OrOptions();

    setRulingParty.title = 'Select new ruling party';
    setRulingParty.options = [...ALL_PARTIES.map((p) => new SelectOption(
      p.partyName, 'Select', () => {
        this.rulingParty = this.getPartyByName(p.partyName);
        PoliticalAgendas.setNextAgenda(this, player.game);

        return undefined;
      }),
    )];

    player.game.defer(new SimpleDeferredAction(
      player,
      () => setRulingParty,
    ));
  }

  // Called either directly during generation change, or after asking chairperson player
  // to choose an agenda.
  public onAgendaSelected(game: Game): void {
    const rulingParty = this.rulingParty;

    // Resolve Ruling Bonus
    const bonusId = PoliticalAgendas.currentAgenda(this).bonusId;
    const bonus = rulingParty.bonuses.find((b) => b.id === bonusId);
    if (bonus === undefined) {
      throw new Error(`Bonus id ${bonusId} not found in party ${rulingParty.name}`);
    }
    game.log('The ruling bonus is: ${0}', (b) => b.string(bonus.description));

    bonus.grant(game);

    /**
    if (this.chairman !== undefined && this.chairman !== 'NEUTRAL' && game.getPlayerById(this.chairman).isCorporation(CardName.SITH_ORGANIZATIONS)) {
      const NonSithPlayers = game.getPlayers().filter((p) => !p.isCorporation(CardName.SITH_ORGANIZATIONS));
      const sithPlayer = game.getPlayerById(this.chairman);
      sithPlayer.decreaseTerraformRatingSteps(1); // 其实是中立执政，无法享有TR
      const action: OrOptions = new OrOptions();
      action.title = 'Select effect from Sith ability';
      action.buttonLabel = 'Confirm';
      action.options.push(
        new SelectOption('Decrease all other players 1 TR', 'Decrease', () => {
          NonSithPlayers.forEach((p) => p.decreaseTerraformRatingSteps(1));
          game.log('${0} let everyone else lose 1 TR.', (b) => b.player(SithPlayer));
          game.log('The ruling bonus is: ${0}', (b) => b.string(bonus.description));
          bonus.grant(game);
          return undefined;
        }),
        new SelectOption('Ignore ruling bonus this generation', 'Ignore', () => {
          let bakplayers = game.getPlayersInGenerationOrder;
          game.getPlayersInGenerationOrder = () => {return [sithPlayer]};
          bonus.grant(game);
          game.getPlayersInGenerationOrder = bakplayers;
          game.log('${0} let everyone else ignore the ruling bonus', (b) => b.player(sithPlayer));
          game.log('The ruling bonus is: ${0} (only apply for ${1})', (b) => b.string(bonus.description).player(sithPlayer));
          return undefined;
        }),
      );
      game.defer(new SimpleDeferredAction(sithPlayer, () => action));
    } else {
      game.log('The ruling bonus is: ${0}', (b) => b.string(bonus.description));
      bonus.grant(game);
    }
    */

    const policyId = PoliticalAgendas.currentAgenda(this).policyId;
    const policy = rulingParty.policies.find((p) => p.id === policyId);
    if (policy === undefined) {
      throw new Error(`Policy id ${policyId} not found in party ${rulingParty.name}`);
    }
    const description = typeof(policy.description) === 'string' ? policy.description : policy.description(undefined);
    game.log('The ruling policy is: ${0}', (b) => b.string(description));
    // Resolve Ruling Policy for Scientists P4
    if (policy.apply !== undefined) {
      policy.apply(game);
    }
  }

  public getPlayerInfluence(player: Player) {
    let influence = 0;
    if (this.chairman !== undefined && this.chairman === player.id) influence++;

    const dominantParty : IParty = this.dominantParty;
    const isPartyLeader = dominantParty.partyLeader === player.id;
    const delegateCount = dominantParty.delegates.get(player.id);

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
    if (player.isCorporation(CardName.INCITE_ENDER)) {
      this.parties.filter((x) => x !== this.dominantParty).forEach((x) => {
        if (x.partyLeader === player.id) {
          influence++;
        }
      });
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
    if (this.rulingParty.name === partyName) {
      return true;
    }

    const party = this.getPartyByName(partyName);
    return party.delegates.count(player.id) >= 2;
  }

  // Return number of delegates
  public getAvailableDelegateCount(playerId: Delegate): number {
    return this.delegateReserve.get(playerId);
  }

  // List players present in the reserve
  public getPresentPlayersInReserve(): Array<Delegate> {
    return Array.from(new Set(this.delegateReserve));
  }

  // Check if player has delegates available
  public hasDelegatesInReserve(playerId: Delegate): boolean {
    return this.getAvailableDelegateCount(playerId) > 0;
  }

  // Get Victory Points
  public getPlayerVictoryPoints(player: Player): number {
    let victory = 0;
    if (this.chairman !== undefined && this.chairman === player.id) victory++;
    this.parties.forEach(function(party) {
      if (party.partyLeader === player.id) {
        victory++;
      }
    });
    return victory;
  }

  public serialize(): SerializedTurmoil {
    const result: SerializedTurmoil = {
      chairman: this.chairman,
      rulingParty: this.rulingParty.name,
      dominantParty: this.dominantParty.name,
      usedFreeDelegateAction: Array.from(this.usedFreeDelegateAction),
      delegateReserve: Array.from(this.delegateReserve.values()),
      parties: this.parties.map((p) => {
        return {
          name: p.name,
          delegates: Array.from(p.delegates.values()),
          partyLeader: p.partyLeader,
        };
      }),
      playersInfluenceBonus: Array.from(this.playersInfluenceBonus.entries()),
      globalEventDealer: this.globalEventDealer.serialize(),
      distantGlobalEvent: {'name': this.distantGlobalEvent?.name} as IGlobalEvent,
      comingGlobalEvent: {'name': this.comingGlobalEvent?.name} as IGlobalEvent,
      currentGlobalEvent: this.currentGlobalEvent !== undefined ? ({'name': this.currentGlobalEvent?.name} as IGlobalEvent) : undefined,
      politicalAgendasData: PoliticalAgendas.serialize(this.politicalAgendasData),
    };
    return result;
  }

  public static deserialize(d: SerializedTurmoil, playerIds: Array<Player>): Turmoil {
    function partyName(object: any): PartyName {
      try {
        if (typeof object !== 'string' && 'name' in object) {
          return object.name;
        }
      } catch (typeError) {
        return object;
      }
      return object;
    }
    const dealer = GlobalEventDealer.deserialize(d.globalEventDealer);
    const turmoil = new Turmoil(partyName(d.rulingParty), 'NEUTRAL', partyName(d.dominantParty), dealer);
    // Rebuild chairman
    if (d.chairman) {
      if (d.chairman === 'NEUTRAL') {
        turmoil.chairman = 'NEUTRAL';
      } else {
        turmoil.chairman = (d.chairman as any).id || d.chairman;
      }
    }

    turmoil.usedFreeDelegateAction = new Set(d.usedFreeDelegateAction);

    if (d.delegateReserve === undefined && d.delegate_reserve !==undefined) {
      d.delegateReserve = d.delegate_reserve;
    }
    turmoil.delegateReserve = MultiSet.from( d.delegateReserve.map((element: SerializedPlayerId | NeutralPlayer | PlayerId) => {
      return (element as any).id || element;
    }));

    if (d.lobby !== undefined) {
      turmoil.usedFreeDelegateAction.clear();
      const legacyLobby = new Set(d.lobby);
      for (const player of playerIds) {
        if (legacyLobby.has(player.id)) {
          turmoil.delegateReserve.add(player.id);
        } else {
          turmoil.usedFreeDelegateAction.add(player.id);
        }
      }
    }

    turmoil.politicalAgendasData = PoliticalAgendas.deserialize(d.politicalAgendasData || UNINITIALIZED_POLITICAL_AGENDAS_DATA );

    // Rebuild party leader
    d.parties.forEach((sp ) => {
      const tp = turmoil.getPartyByName(sp.name);

      // Rebuild delegates
      tp.delegates = new MultiSet();
      sp.delegates.forEach((element: SerializedPlayerId | NeutralPlayer | PlayerId) => {
        tp.delegates.add((element as any).id || element);
      });

      if (sp.partyLeader) {
        tp.partyLeader = (sp.partyLeader as any).id || sp.partyLeader;
      }
    });

    turmoil.playersInfluenceBonus = new Map<string, number>(d.playersInfluenceBonus);
    if (d.distantGlobalEvent) {
      turmoil.distantGlobalEvent = getGlobalEventByName((d.distantGlobalEvent as any).name || d.distantGlobalEvent );
    }
    if (d.comingGlobalEvent) {
      turmoil.comingGlobalEvent = getGlobalEventByName((d.comingGlobalEvent as any).name || d.comingGlobalEvent);
    } else if ((d as any).commingGlobalEvent) {
      turmoil.comingGlobalEvent = getGlobalEventByName((d as any).commingGlobalEvent.name);
    }

    if (d.currentGlobalEvent) {
      turmoil.currentGlobalEvent = getGlobalEventByName((d.currentGlobalEvent as any).name || d.currentGlobalEvent);
    }

    return turmoil;
  }
}
