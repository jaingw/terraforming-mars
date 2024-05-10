import {PartyName} from '../../common/turmoil/PartyName';
import {IParty} from './parties/IParty';
import {IGame} from '../IGame';
import {GlobalEventDealer, getGlobalEventByName} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {SerializedDelegate, SerializedTurmoil} from './SerializedTurmoil';
import {DELEGATES_FOR_NEUTRAL_PLAYER, DELEGATES_PER_PLAYER} from '../../common/constants';
import {PoliticalAgendasData, PoliticalAgendas} from './PoliticalAgendas';
import {AgendaStyle} from '../../common/turmoil/Types';
import {CardName} from '../../common/cards/CardName';
import {MultiSet} from 'mnemonist';
import {IPlayer} from '../IPlayer';
import {SendDelegateToArea} from '../deferredActions/SendDelegateToArea';
import {SelectParty} from '../inputs/SelectParty';
import {Policy, PolicyId, policyDescription} from './Policy';
import {PlayerId} from '../../common/Types';
import {SerializedPlayerId} from '../SerializedPlayer';
import {MARS_FIRST_POLICY_1, MarsFirst} from './parties/MarsFirst';
import {GREENS_POLICY_1, Greens} from './parties/Greens';
import {KELVINISTS_POLICY_1, Kelvinists} from './parties/Kelvinists';
import {REDS_POLICY_1, Reds} from './parties/Reds';
import {SCIENTISTS_POLICY_1, Scientists} from './parties/Scientists';
import {UNITY_POLICY_1, Unity} from './parties/Unity';
export type NeutralPlayer = 'NEUTRAL';
export type Delegate = IPlayer | NeutralPlayer;

export type PartyFactory = new() => IParty;

export function getDefaultPolicy(partName: PartyName): Policy {
  switch (partName) {
  case PartyName.MARS:
    return MARS_FIRST_POLICY_1;
  case PartyName.SCIENTISTS:
    return SCIENTISTS_POLICY_1;
  case PartyName.UNITY:
    return UNITY_POLICY_1;
  case PartyName.KELVINISTS:
    return KELVINISTS_POLICY_1;
  case PartyName.REDS:
    return REDS_POLICY_1;
  case PartyName.GREENS:
    return GREENS_POLICY_1;
  }
}

function createParties(): ReadonlyArray<IParty> {
  return [new MarsFirst(), new Scientists(), new Unity(), new Greens(), new Reds(), new Kelvinists()];
}


const UNINITIALIZED_POLITICAL_AGENDAS_DATA: PoliticalAgendasData = {
  agendas: new Map(),
  agendaStyle: AgendaStyle.CHAIRMAN,
};
export class Turmoil {
  public chairman: undefined | Delegate = undefined;
  public rulingParty: IParty;
  public dominantParty: IParty;
  public usedFreeDelegateAction = new Set<IPlayer>();
  public delegateReserve = new MultiSet<Delegate>();
  public parties = createParties();
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

  public static newInstance(game: IGame, agendaStyle: AgendaStyle = AgendaStyle.STANDARD): Turmoil {
    const dealer = GlobalEventDealer.newInstance(game);

    // The game begins with Greens in power and a Neutral chairman
    const turmoil = new Turmoil(PartyName.GREENS, 'NEUTRAL', PartyName.GREENS, dealer);

    game.log('A neutral delegate is the new chairman.');
    game.log('Greens are in power in the first generation.');

    // Init parties
    turmoil.parties = createParties();

    game.getPlayersInGenerationOrder().forEach((player) => {
      turmoil.delegateReserve.add(player, DELEGATES_PER_PLAYER);
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

  public initGlobalEvent(game: IGame) {
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

  rulingPolicy(): Policy {
    const rulingParty = this.rulingParty;
    const rulingPolicyId: PolicyId = PoliticalAgendas.currentAgenda(this).policyId;
    const policy = rulingParty.policies.find((policy) => policy.id === rulingPolicyId);
    if (policy === undefined) {
      throw new Error(`Policy ${rulingPolicyId} not found in ${rulingParty.name}`);
    }
    return policy;
  }

  public sendDelegateToParty(playerId: Delegate, partyName: PartyName, game: IGame, throwIfError = false): void {
    const party = this.getPartyByName(partyName);
    if (this.delegateReserve.has(playerId)) {
      this.delegateReserve.remove(playerId);
    } else {
      console.log(`${playerId}/${game.id} tried to get a delegate from an empty reserve.`);
      if (throwIfError) {
        throw new Error('No available delegate');
      }
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

  /**
   * Remove one `delegate` from `partyName`.
   *
   * Will re-evaluate the dominant party.
   */
  public removeDelegateFromParty(delegate: Delegate, partyName: PartyName, game: IGame): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(delegate);
    party.removeDelegate(delegate, game);
    this.checkDominantParty();
  }

  /**
   * Replace one `outgoingDelegate` delegate with one `incomingDelegate` in `party` without changing
   * dominance. (I don't think it prevents checking dominance, really.)
   */
  public replaceDelegateFromParty(
    outgoingDelegate: Delegate,
    incomingDelegate: Delegate,
    partyName: PartyName,
    game: IGame): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(outgoingDelegate);
    party.removeDelegate(outgoingDelegate, game);
    this.sendDelegateToParty(incomingDelegate, partyName, game);
  }

  /**
   * Updates the dominant party. Called as part of delegate changes.
   */
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

  /**
   * Set the next dominanant party taking into account that
   * `currentDominantParty` is the current dominant party, taking
   * clockwise order into account.
   */
  // Function to get next dominant party taking into account the clockwise order
  private setNextPartyAsDominant(currentDominantParty: IParty) {
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

  // PoliticalReform
  private setSecondPartyForPoliticalReform(currentDominantParty: IParty, player: IPlayer) {
    const corp = player.getCorporation(CardName.POLITICALREFORM);
    if (corp === undefined) {
      return;
    }
    if (corp.data !== undefined) {
      const policy = getDefaultPolicy(corp.data as PartyName);
      policy.onPolicyEnd?.(player.game);
    }
    const sortParties = [...this.parties].sort(
      (p1, p2) => p2.delegates.get(player) - p1.delegates.get(player),
    );
    const max = sortParties[0].delegates.get(player);
    if (max === 0 ) {
      corp.data = undefined;
      return;
    }
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
      if (newParty.delegates.get(player) === max) {
        corp.data = newParty.name;
        getDefaultPolicy(newParty.name).onPolicyStart?.(player.game);
        return true;
      }
      return false;
    });
  }

  // Launch the turmoil phase
  public endGeneration(game: IGame): void {
    // 1 - All player lose 1 TR
    game.getPlayers().forEach((player) => {
      player.decreaseTerraformRating();
    });

    // 2 - Global Event
    if (this.currentGlobalEvent !== undefined) {
      const currentGlobalEvent: IGlobalEvent = this.currentGlobalEvent;
      game.log('Resolving global event ${0}', (b) => b.globalEvent(currentGlobalEvent));
      // TODO(kberg): if current global event adds an action, all of the rest of this should wait.
      currentGlobalEvent.resolve(game, this);
    }

    // WOW THIS BREAKS THINGS
    //   this.startNewGovernment(game);
    // }
    // private startNewGovernment(game: IGame) {
    //   if (game.deferredActions.length > 0) {
    //     game.deferredActions.runAll(() => {
    //       this.startNewGovernment(game);
    //     });
    //     return;
    //   }

    // 3 - New Government

    // 3.a - Ruling Policy change
    this.setRulingParty(game);

    // 3.b - New dominant party
    this.setNextPartyAsDominant(this.rulingParty);

    // 3.c - Fill the lobby
    this.usedFreeDelegateAction.clear();

    // 4 - Changing Time
    if (this.currentGlobalEvent) {
      this.globalEventDealer.discard(this.currentGlobalEvent);
    }
    // 4.a - Coming Event is now Current event. Add neutral delegate.
    this.currentGlobalEvent = this.comingGlobalEvent;
    this.addNeutralDelegate(this.currentGlobalEvent?.currentDelegate, game);
    // 4.b - Distant Event is now Coming Event
    this.comingGlobalEvent = this.distantGlobalEvent;
    // 4.c - Draw the new distant event and add neutral delegate
    this.distantGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.distantGlobalEvent?.revealedDelegate, game);

    // hook of PoliticalReform
    game.getPlayers().forEach((player) => {
      if (player.isCorporation(CardName.POLITICALREFORM)) {
        this.setSecondPartyForPoliticalReform(this.rulingParty, player);
      }
    });
  }

  private addNeutralDelegate(partyName: PartyName | undefined, game: IGame) {
    if (partyName) {
      this.sendDelegateToParty('NEUTRAL', partyName, game);
      game.log('A neutral delegate was added to the ${0} party', (b) => b.partyName(partyName));
    }
  }

  /**
   * Set the next ruling party as part of the Turmoil phase.
   */
  public setRulingParty(game: IGame): void {
    this.rulingPolicy().onPolicyEnd?.(game);

    // Behond the Emperor Hook prevents changing the ruling party.
    if (game.beholdTheEmperor !== true) {
      this.rulingParty = this.dominantParty;
    }

    let newChairman = this.rulingParty.partyLeader || 'NEUTRAL';
    if (game.beholdTheEmperor === true && this.chairman !== undefined) {
      newChairman = this.chairman;
    }

    if (game.beholdTheEmperor !== true) {
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
    }
    this.setNewChairman(newChairman, game, /* setAgenda*/ true);
  }

  public setNewChairman(newChairman : Delegate, game: IGame, setAgenda: boolean = true, gainTR: boolean = true) {
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
      const chairman = this.chairman;
      let steps = gainTR ? 1 : 0;
      // Tempest Consultancy Hook (gains an additional TR when they become chairman)
      if (chairman.isCorporation(CardName.TEMPEST_CONSULTANCY)) steps += 1;

      // Raise TR
      chairman.defer(() => {
        if (steps > 0) {
          chairman.increaseTerraformRating(steps);
          game.log('${0} is the new chairman and gains ${1} TR', (b) => b.player(chairman).number(steps));
        } else {
          game.log('${0} is the new chairman', (b) => b.player(chairman));
        }
      });
    } else {
      game.log('A neutral delegate is the new chairman.');
    }
  }

  // Called either directly during generation change, or after asking chairperson player
  // to choose an agenda.
  public onAgendaSelected(game: IGame): void {
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
    const description = policyDescription(policy, undefined);
    game.log('The ruling policy is: ${0}', (b) => b.string(description));
    policy.onPolicyStart?.(game);
  }

  public getPlayerInfluence(player: IPlayer) {
    let influence = 0;
    if (this.chairman === player) influence++;

    const dominantParty : IParty = this.dominantParty;
    const isPartyLeader = dominantParty.partyLeader === player;
    const delegateCount = dominantParty.delegates.get(player);

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
        if (x.partyLeader === player) {
          influence++;
        }
      });
    }

    player.tableau.forEach((card) => {
      const bonus = card.getInfluenceBonus?.(player);
      if (bonus !== undefined) {
        influence += bonus;
      }
    });

    return influence;
  }

  public addInfluenceBonus(player: IPlayer, bonus:number = 1) {
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

  /** Return the number of delegates for `delegate` in the reserve. */
  public getAvailableDelegateCount(delegate: Delegate): number {
    return this.delegateReserve.get(delegate);
  }

  /** List the delegates present in the reserve */
  public getPresentPlayersInReserve(): Array<Delegate> {
    return Array.from(new Set(this.delegateReserve));
  }

  /** Return true if `player` has delegates in reserve. */
  public hasDelegatesInReserve(player: Delegate): boolean {
    return this.getAvailableDelegateCount(player) > 0;
  }

  /**
   * End-game victory points for `player`.
   *
   * Players get 1 VP at the end of the game for each chairman and party leader they have.
   */
  public getPlayerVictoryPoints(player: IPlayer): number {
    let victory = 0;
    if (this.chairman === player) victory++;
    this.parties.forEach((party) => {
      if (party.partyLeader === player) {
        victory++;
      }
    });
    return victory;
  }

  public getSendDelegateInput(player: IPlayer): SelectParty | undefined {
    if (this.hasDelegatesInReserve(player)) {
      let sendDelegate;
      if (!this.usedFreeDelegateAction.has(player)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (from lobby)', {freeStandardAction: true});
      } else if (player.isCorporation(CardName.INCITE) && player.canAfford(3)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (3 M€)', {cost: 3});
      } else if (player.canAfford(5)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (5 M€)', {cost: 5});
      }
      if (sendDelegate) {
        return sendDelegate.execute();
      }
    }
    return undefined;
  }

  public serialize(): SerializedTurmoil {
    const result: SerializedTurmoil = {
      chairman: serializeDelegateOrUndefined(this.chairman),
      rulingParty: this.rulingParty.name,
      dominantParty: this.dominantParty.name,
      usedFreeDelegateAction: Array.from(this.usedFreeDelegateAction).map((p) => p.id),
      delegateReserve: Array.from(this.delegateReserve.values()).map(serializeDelegate),
      parties: this.parties.map((p) => {
        return {
          name: p.name,
          delegates: Array.from(p.delegates.values()).map(serializeDelegate),
          partyLeader: serializeDelegateOrUndefined(p.partyLeader),
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

  public static deserialize(d: SerializedTurmoil, players: Array<IPlayer>): Turmoil {
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
    const chairman = deserializeDelegateOrUndefined(d.chairman, players);
    const turmoil = new Turmoil(partyName(d.rulingParty), chairman || 'NEUTRAL', partyName(d.dominantParty), dealer);
    turmoil.usedFreeDelegateAction = new Set(d.usedFreeDelegateAction.map((p) => deserializePlayerId(p, players)));

    if (d.delegateReserve === undefined && d.delegate_reserve !==undefined) {
      d.delegateReserve = d.delegate_reserve;
    }

    turmoil.delegateReserve = MultiSet.from(d.delegateReserve.map((p) => deserializeDelegate(p, players)));

    if (d.lobby !== undefined) {
      turmoil.usedFreeDelegateAction.clear();
      const legacyLobby = new Set(d.lobby);
      for (const player of players) {
        if (legacyLobby.has(player.id)) {
          turmoil.delegateReserve.add(player);
        } else {
          turmoil.usedFreeDelegateAction.add(player);
        }
      }
    }

    turmoil.politicalAgendasData = PoliticalAgendas.deserialize(d.politicalAgendasData || UNINITIALIZED_POLITICAL_AGENDAS_DATA );

    // Rebuild party leader
    d.parties.forEach((sp ) => {
      const tp = turmoil.getPartyByName(sp.name);

      // Rebuild delegates
      tp.delegates = MultiSet.from(sp.delegates.map((p) => deserializeDelegate(p, players)));


      if (sp.partyLeader) {
        tp.partyLeader = deserializeDelegateOrUndefined(sp.partyLeader, players);
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

function serializeDelegate(delegate: Delegate): SerializedDelegate {
  return delegate === 'NEUTRAL' ? 'NEUTRAL' : delegate.id;
}

function serializeDelegateOrUndefined(delegate: Delegate | undefined): SerializedDelegate | undefined {
  if (delegate === undefined) {
    return undefined;
  }
  return serializeDelegate(delegate);
}

function deserializePlayerId(playerId: PlayerId, players: Array<IPlayer>): IPlayer {
  const player = players.find((p) => p.id === playerId);
  if (player === undefined) {
    throw new Error('Delegate not found');
  }
  return player;
}

function deserializeDelegate(serializedDelegate: SerializedDelegate | SerializedPlayerId, players: Array<IPlayer>): Delegate {
  if (serializedDelegate === 'NEUTRAL') {
    return 'NEUTRAL';
  }
  return deserializePlayerId(serializedDelegate.hasOwnProperty('id') ? (serializedDelegate as SerializedPlayerId).id : serializedDelegate as PlayerId, players);
}

function deserializeDelegateOrUndefined(serializedDelegate: SerializedDelegate | SerializedPlayerId | undefined, players: Array<IPlayer>): Delegate | undefined {
  if (serializedDelegate === undefined) {
    return undefined;
  }
  return deserializeDelegate(serializedDelegate, players);
}
