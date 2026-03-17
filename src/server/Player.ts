import * as constants from '../common/constants';
import {PlayerId} from '../common/Types';
import {MILESTONE_COST, REDS_RULING_POLICY_COST} from '../common/constants';
import {cardsFromJSON, ceosFromJSON, corporationCardsFromJSON, newCorporationCard, preludesFromJSON} from './createCard';
import {CardName} from '../common/cards/CardName';
import {CardType} from '../common/cards/CardType';
import {Color} from '../common/Color';
import {ICorporationCard, isICorporationCard} from './cards/corporation/ICorporationCard';
import {Database} from './database/Database';
import {IGame} from './IGame';
import {Game} from './Game';
import {Payment, PaymentOptions, DEFAULT_PAYMENT_VALUES} from '../common/inputs/Payment';
import {SpendableResource, SPENDABLE_RESOURCES, SpendableCardResource, CARD_FOR_SPENDABLE_RESOURCE} from '../common/inputs/Spendable';
import {IAward} from './awards/IAward';
import {ICard, isIActionCard, IActionCard} from './cards/ICard';
import {IMilestone} from './milestones/IMilestone';
import {IProjectCard} from './cards/IProjectCard';
import {OrOptions} from './inputs/OrOptions';
import {PartyHooks} from './turmoil/parties/PartyHooks';
import {PartyName} from '../common/turmoil/PartyName';
import {Phase} from '../common/Phase';
import {PlayerInput} from './PlayerInput';
import {Resource} from '../common/Resource';
import {CardResource} from '../common/CardResource';
import {SelectCard} from './inputs/SelectCard';
import {SellPatentsStandardProject} from './cards/base/standardProjects/SellPatentsStandardProject';
import {SimpleDeferredAction} from './deferredActions/DeferredAction';
import {Priority} from './deferredActions/Priority';
import {SelectPaymentDeferred} from './deferredActions/SelectPaymentDeferred';
import {SelectProjectCardToPlay} from './inputs/SelectProjectCardToPlay';
import {SelectOption} from './inputs/SelectOption';
import {SelectSpace} from './inputs/SelectSpace';
import {SelfReplicatingRobots} from './cards/promo/SelfReplicatingRobots';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {StormCraftIncorporated} from './cards/colonies/StormCraftIncorporated';
import {Tag} from '../common/cards/Tag';
import {_MiningGuild_} from './cards/breakthrough/corporation/_MiningGuild_';
import {Timer} from '../common/Timer';
import {TurmoilHandler} from './turmoil/TurmoilHandler';
import {_MorningStarInc_} from './cards/breakthrough/corporation/_MorningStarInc_';
import {AllOptions, DrawCards, DrawOptions} from './deferredActions/DrawCards';
import {Units} from '../common/Units';
import {MoonExpansion} from './moon/MoonExpansion';
import {IStandardProjectCard} from './cards/IStandardProjectCard';
import {ConvertPlants} from './cards/base/standardActions/ConvertPlants';
import {ConvertHeat} from './cards/base/standardActions/ConvertHeat';
import {GlobalParameter} from '../common/GlobalParameter';
import {LogHelper} from './LogHelper';
import {TurmoilUtil} from './turmoil/TurmoilUtil';
import {PathfindersExpansion} from './pathfinders/PathfindersExpansion';
import {deserializeProjectCard, serializedCardName, serializeProjectCard} from './cards/CardSerialization';
import {ColoniesHandler} from './colonies/ColoniesHandler';
import {MonsInsurance} from './cards/promo/MonsInsurance';
import {InputResponse} from '../common/inputs/InputResponse';
import {Tags} from './player/Tags';
import {Colonies} from './player/Colonies';
import {Production} from './player/Production';
import {Stock} from './player/Stock';
import {GameLoader} from './database/GameLoader';
import {SelectAmount} from './inputs/SelectAmount';
import {getBehaviorExecutor} from './behavior/BehaviorExecutor';
import {CeoExtension} from './CeoExtension';
import {ICeoCard, isCeoCard} from './cards/ceos/ICeoCard';
import {message} from './logs/MessageBuilder';
import {calculateVictoryPoints} from './game/calculateVictoryPoints';
import {VictoryPointsBreakdown} from '../common/game/VictoryPointsBreakdown';
import {UserRank} from '../common/rank/RankManager';
import {Supercapacitors} from './cards/promo/Supercapacitors';
import {CanAffordOptions, CardAction, IPlayer} from './IPlayer';
import {IPreludeCard} from './cards/prelude/IPreludeCard';
import {copyAndClear, inplaceRemove, sum, toName} from '../common/utils/utils';
import {PreludesExpansion} from './preludes/PreludesExpansion';
import {ChooseCards} from './deferredActions/ChooseCards';
import {UnderworldPlayerData} from './underworld/UnderworldData';
import {UnderworldExpansion} from './underworld/UnderworldExpansion';
import {Counter} from './behavior/Counter';
import {TRSource} from '../common/cards/TRSource';
import {UnexpectedInput} from './inputs/UnexpectedInput';
import {LunaChain} from './cards/eros/corp/LunaChain';
import {IParty} from './turmoil/parties/IParty';
import {newStandardDraft} from './Draft';
import {Message} from '../common/logs/Message';
import {LunaProjectOffice} from './cards/moon/LunaProjectOffice';
import {DiscordId} from './server/auth/discord';
import {AlliedParty, PolicyId} from '../common/turmoil/Types';
import {PlayedCards} from './cards/PlayedCards';
import {Chaos} from './cards/eros/corp/Chaos';

const THROW_STATE_ERRORS = Boolean(process.env.THROW_STATE_ERRORS);
const DEFAULT_GLOBAL_PARAMETER_STEPS = {
  [GlobalParameter.OCEANS]: 0,
  [GlobalParameter.OXYGEN]: 0,
  [GlobalParameter.TEMPERATURE]: 0,
  [GlobalParameter.VENUS]: 0,
  [GlobalParameter.MOON_HABITAT_RATE]: 0,
  [GlobalParameter.MOON_MINING_RATE]: 0,
  [GlobalParameter.MOON_LOGISTICS_RATE]: 0,
} as const;

export class Player implements IPlayer {
  public readonly id: PlayerId;
  public userId: string | undefined = undefined;// 传递到前端时务必忽略该值
  protected waitingFor?: PlayerInput;
  protected waitingForCb?: () => void;
  public game: IGame;
  public tags: Tags;
  public colonies: Colonies;
  public readonly production: Production;
  public readonly stock: Stock;
  public get opponents(): ReadonlyArray<IPlayer> {
    return this.game.players.filter((p) => p !== this);
  }

  // 下划线版本不能set  ,  反序列化时会报错  TypeError: Cannot set property alliedParty of #<Player> which has only a getter
  public alliedParty: AlliedParty | undefined;


  // Used only during set-up
  public pickedCorporationCard?: ICorporationCard;
  public pickedCorporationCard2?: ICorporationCard;

  // Terraforming Rating
  public terraformRating: number = 20;
  public hasIncreasedTerraformRatingThisGeneration: boolean = false;


  // Resource values
  private titaniumValue: number = 3;
  public steelValue: number = 2;
  // Helion
  public canUseHeatAsMegaCredits: boolean = false;
  // Martian Lumber Corp
  public canUsePlantsAsMegacredits: boolean = false;
  // Luna Trade Federation
  public canUseTitaniumAsMegacredits: boolean = false;

  // This generation / this round
  public actionsTakenThisRound: number = 0;
  public actionsThisGeneration: Set<CardName> = new Set();
  public lastCardPlayed: CardName | undefined;
  public pendingInitialActions: Array<ICorporationCard> = [];

  // Cards
  public dealtCorporationCards: Array<ICorporationCard> = [];
  public dealtPreludeCards: Array<IPreludeCard> = [];
  public dealtCeoCards: Array<ICeoCard> = [];
  public dealtProjectCards: Array<IProjectCard> = [];
  public cardsInHand: Array<IProjectCard> = [];
  public preludeCardsInHand: Array<IPreludeCard> = [];
  public ceoCardsInHand: Array<IProjectCard> = [];
  public playedCards: PlayedCards = new PlayedCards();
  public draftedCards: Array<IProjectCard> = []; // 实际上包含前序和公司卡
  public draftHand: Array<IProjectCard> = [];
  public cardCost: number = constants.CARD_COST;
  public needsToDraft?: boolean;

  public timer: Timer = Timer.newInstance();
  public autopass = false;

  // Turmoil
  public turmoilPolicyActionUsed: boolean = false;
  public politicalAgendasActionUsedCount: number = 0;

  public oceanBonus: number = constants.OCEAN_BONUS;

  // Custom cards
  // PoliticalAgendas Scientists P41
  public hasTurmoilScienceTagBonus: boolean = false;
  // Ecoline
  public plantsNeededForGreenery: number = 8;
  // Lawsuit
  public removingPlayers: Array<PlayerId> = [];
  // For Playwrights corp.
  // removedFromPlayCards is a bit of a misname: it's a temporary storage for
  // cards that provide 'next card' discounts. This will clear between turns.
  public removedFromPlayCards: Array<IProjectCard> = [];
  public preservationProgram = false;
  public underworldData: UnderworldPlayerData = UnderworldExpansion.initializePlayer();
  public standardProjectsThisGeneration: Set<CardName> = new Set();
  public temporaryGlobalParameterRequirementBonus = 0;

  // The number of actions a player can take this round.
  // It's almost always 2, but certain cards can change this value (Mars Maths, Tool with the First Order)
  //
  // This value isn't serialized. Probably ought to be.
  public availableActionsThisRound = 2;

  // Stats
  public actionsTakenThisGame: number = 0;
  public victoryPointsByGeneration: Array<number> = [];
  public totalDelegatesPlaced: number = 0;
  public globalParameterSteps: Record<GlobalParameter, number> = {...DEFAULT_GLOBAL_PARAMETER_STEPS};

  public user?: DiscordId;

  // Resources
  public get megaCredits(): number {
    return this.stock.megacredits;
  }

  public get steel(): number {
    return this.stock.steel;
  }

  public get titanium(): number {
    return this.stock.titanium;
  }

  public get plants(): number {
    return this.stock.plants;
  }

  public get energy(): number {
    return this.stock.energy;
  }
  public get heat(): number {
    return this.stock.heat;
  }

  public set megaCredits(megacredits: number) {
    this.stock.megacredits = megacredits;
  }

  public set steel(steel: number) {
    this.stock.steel = steel;
  }

  public set titanium(titanium: number) {
    this.stock.titanium = titanium;
  }

  public set plants(plants: number) {
    this.stock.plants = plants;
  }

  public set energy(energy: number) {
    this.stock.energy = energy;
  }

  public set heat(heat: number) {
    this.stock.heat = heat;
  }

  public setAlliedParty(p: IParty) {
    this.alliedParty = {
      partyName: p.name,
      agenda: {
        bonusId: p.bonuses[0].id,
        policyId: p.policies[0].id,
      },
    };
    const alliedPolicy = this.game.turmoil?.getPartyByName(p.name).policies.find((t) => t.id === p.policies[0].id);

    alliedPolicy?.onPolicyStartForPlayer?.(this);
  }

  public undoing : boolean = false;
  public exited : boolean = false;// 是否体退
  public canExit : boolean = false;// 能否体退： 行动阶段、当前行动玩家、没有未执行的拦截器
  public heatForTemperature: number = 8;
  // Hotsprings
  public heatProductionStepsIncreasedThisGeneration: number = 0;
  constructor(
    public name: string,
    public color: Color,
    public beginner: boolean,
    public handicap: number = 0,
    id: PlayerId) {
    this.id = id;
    // This seems pretty bad. The game will be set before the Player is actually
    // used, and if that doesn't happen, well, it's a worthy error.
    // The alterantive, to make game type Game | undefined, will cause compilation
    // issues throughout the app.
    // Ideally the right thing is to invert how players and games get created.
    // But one thing at a time.
    this.game = undefined as unknown as Game;
    this.tags = new Tags(this);
    this.colonies = new Colonies(this);
    this.production = new Production(this);
    this.stock = new Stock(this);
  }

  public setup(game: IGame) {
    this.game = game;
  }

  public tearDown() {
    this.game = undefined as unknown as Game;
  }

  /**
   * @deprecated use |playedCards|.
   */
  public get tableau(): PlayedCards {
    return this.playedCards;
  }

  public getTitaniumValue(): number {
    return this.titaniumValue;
  }

  public increaseTitaniumValue(): void {
    this.titaniumValue++;
  }

  public decreaseTitaniumValue(): void {
    if (this.titaniumValue > 0) {
      this.titaniumValue--;
    }
  }

  public getSelfReplicatingRobotsTargetCards(): Array<IProjectCard> {
    const selfReplicatingRobots = this.tableau.get(CardName.SELF_REPLICATING_ROBOTS);
    if (selfReplicatingRobots instanceof SelfReplicatingRobots) {
      return selfReplicatingRobots.targetCards;
    }
    return [];
  }

  public getSteelValue(): number {
    return this.steelValue;
  }

  public increaseSteelValue(): void {
    this.steelValue++;
  }

  public decreaseSteelValue(): void {
    if (this.steelValue > 0) {
      this.steelValue--;
    }
  }

  public getTerraformRating(): number {
    return this.terraformRating;
  }

  public increaseTerraformRating(steps: number = 1, opts: {log?: boolean} = {}) {
    if (this.preservationProgram === true && this.game.phase === Phase.ACTION) {
      steps--;
      this.game.log('${0} for ${1} is blocking 1 TR', (b) => b.cardName(CardName.PRESERVATION_PROGRAM).player(this));
      this.preservationProgram = false;
      if (steps === 0) {
        return;
      }
    }
    const raiseRating = () => {
      this.terraformRating += steps;
      this.hasIncreasedTerraformRatingThisGeneration = true;

      if (opts.log === true) {
        this.game.log('${0} gained ${1} TR', (b) => b.player(this).number(steps));
      }
      for (const cardOwner of this.game.playersInGenerationOrder) {
        for (const card of cardOwner.tableau) {
          card.onIncreaseTerraformRatingByAnyPlayer?.(cardOwner, this, steps);
        }
      }
    };

    if (PartyHooks.shouldApplyPolicy(this, PartyName.REDS, 'rp01')) {
      if (!this.canAfford(REDS_RULING_POLICY_COST * steps)) {
        // Cannot pay Reds, will not increase TR
        return;
      }
      this.game.defer(
        new SelectPaymentDeferred(this, REDS_RULING_POLICY_COST * steps, {title: 'Select how to pay for TR increase'}),
        Priority.COST)
        .andThen(raiseRating);
    } else {
      raiseRating();
    }
  }

  public decreaseTerraformRating(steps: number = 1, opts: {log?: boolean} = {}) {
    this.terraformRating -= steps;
    if (opts.log === true) {
      this.game.log('${0} lost ${1} TR', (b) => b.player(this).number(steps));
    }
  }

  public setTerraformRating(value: number) {
    return this.terraformRating = value;
  }

  public getVictoryPoints(): VictoryPointsBreakdown {
    return calculateVictoryPoints(this);
  }

  public plantsAreProtected(): boolean {
    return this.playedCards.has(CardName.PROTECTED_HABITATS) ||
    this.playedCards.has(CardName.MIRRORCOAT) ||
      this.playedCards.has(CardName.ASTEROID_DEFLECTION_SYSTEM);
  }

  public alloysAreProtected(): boolean {
    return this.playedCards.has(CardName.LUNAR_SECURITY_STATIONS) ||
    this.playedCards.has(CardName.MIRRORCOAT);
  }

  public isProtected(resource: Resource) {
    switch (resource) {
    case Resource.PLANTS:
      return this.plantsAreProtected();
    case Resource.STEEL:
    case Resource.TITANIUM:
      return this.alloysAreProtected();
    }
    return false;
  }

  public canHaveProductionReduced(resource: Resource, minQuantity: number, attacker: IPlayer) {
    if (this.playedCards.has(CardName.MIRRORCOAT)) {
      return false;
    }
    const reducable = this.production[resource] + (resource === Resource.MEGACREDITS ? 5 : 0);
    if (reducable < minQuantity) return false;

    if (resource === Resource.STEEL || resource === Resource.TITANIUM) {
      if (this.alloysAreProtected()) return false;
    }

    // The pathfindersExpansion test is just an optimization for non-Pathfinders games.
    if (attacker !== this && ( this.playedCards.has(CardName.PRIVATE_SECURITY) || this.playedCards.has(CardName.MIRRORCOAT) )) {
      return false;
    }
    return true;
  }

  public maybeBlockAttack(perpetrator: IPlayer, msg: Message | string, cb: (proceed: boolean) => PlayerInput | undefined): void {
    this.defer(UnderworldExpansion.maybeBlockAttack(this, perpetrator, msg, cb));
  }

  public attack(perpetrator: IPlayer, resource: Resource, count: number, options?: {log?: boolean, stealing?: boolean}): void {
    if (count === 0) {
      return;
    }
    if (count < 0) {
      throw new Error('Unexpected attack count is less than 0 ' + count);
    }
    const msg = message('Lose ${0} ${1}', (b) => b.number(count).string(resource));
    this.maybeBlockAttack(perpetrator, msg, (proceed) => {
      if (proceed) {
        if (options?.stealing) {
          this.stock.steal(resource, count, perpetrator, {log: options?.log});
        } else {
          this.stock.deduct(resource, count, {log: options?.log, from: {player: perpetrator}});
        }
      }
      return undefined;
    });
  }

  public resolveInsurance() {
    const monsInsuranceOwner = this.game.monsInsuranceOwner;
    if (monsInsuranceOwner !== undefined && monsInsuranceOwner !== this) {
      const monsInsurance = <MonsInsurance>monsInsuranceOwner.tableau.get(CardName.MONS_INSURANCE);
      monsInsurance.payDebt(monsInsuranceOwner, this);
    }
  }

  public resolveInsuranceInSoloGame() {
    const monsInsurance = <MonsInsurance> this.tableau.get(CardName.MONS_INSURANCE);
    monsInsurance?.payDebt(this, undefined);
  }

  public getColoniesCount() {
    if (!this.game.gameOptions.coloniesExtension) return 0;

    let coloniesCount = 0;

    this.game.colonies.forEach((colony) => {
      coloniesCount += colony.colonies.filter((owner) => owner === this).length;
    });

    return coloniesCount;
  }

  /**
   * Return the number of events played by this player.
   *
   * When playing Pharmacy Union, if the card is discarded, then it sits in the event pile.
   * That's why it's included below. The FAQ describes how this applies to things like the
   * Legend Milestone, Media Archives, and NOT Media Group.
   */
  public getPlayedEventsCount(): number {
    let count = this.playedCards.eventCount;
    if (this.tableau.get(CardName.PHARMACY_UNION)?.isDisabled) {
      count++;
    }
    return count;
  }

  // 获取全球参数适应调整值   如：  +-2科技
  public getGlobalParameterRequirementBonus(parameter: GlobalParameter): number {
    let requirementsBonus = this.temporaryGlobalParameterRequirementBonus;
    for (const card of this.tableau) {
      requirementsBonus += card.getGlobalParameterRequirementBonus(this, parameter);
    }

    // PoliticalAgendas Scientists P2 hook
    if (PartyHooks.shouldApplyPolicy(this, PartyName.SCIENTISTS, 'sp02')) {
      requirementsBonus += 2;
    }

    requirementsBonus += UnderworldExpansion.getGlobalParameterRequirementBonus(this, parameter);

    return requirementsBonus;
  }
  private generateId(): string {
    let id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
    while (id.length < 12) {
      id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
    }
    return id;
  }

  public onGlobalParameterIncrease(parameter: GlobalParameter, steps: number): void {
    this.globalParameterSteps[parameter] += steps;
  }

  public removeResourceFrom(card: ICard, count: number = 1, options?: {removingPlayer? : IPlayer, log?: boolean}): void {
    const removingPlayer = options?.removingPlayer;
    if (card.resourceCount) {
      const amountRemoved = Math.min(card.resourceCount, count);
      if (amountRemoved === 0) return;
      card.resourceCount -= amountRemoved;

      if (removingPlayer !== undefined && removingPlayer !== this) this.resolveInsurance();

      if (options?.log ?? true === true) {
        this.game.log('${0} removed ${1} resource(s) from ${2}\'s ${3}', (b) =>
          b.player(options?.removingPlayer ?? this)
            .number(amountRemoved)
            .player(this)
            .card(card));
      }

      // Lawsuit hook
      if (removingPlayer !== undefined && removingPlayer !== this && this.removingPlayers.includes(removingPlayer.id) === false) {
        this.removingPlayers.push(removingPlayer.id);
      }
      // Vermin hook (1 of 2)
      if (card.name === CardName.VERMIN) {
        this.game.verminInEffect = card.resourceCount >= 10;
      }
    }
  }

  public addResourceTo(card: ICard, options: number | {qty?: number, log: boolean, logZero?: boolean} = 1): void {
    const count = typeof(options) === 'number' ? options : (options.qty ?? 1);

    if (card.resourceCount !== undefined) {
      card.resourceCount += count;
    }

    // _Celestic_ hook
    if (card.resourceType === CardResource.FLOATER && this.playedCards.has(CardName._CELESTIC_)) {
      this.megaCredits += count;
    }
    // _Arklight_ hook
    if (card.resourceType === CardResource.ANIMAL && this.playedCards.has(CardName._ARKLIGHT_)) {
      this.megaCredits += count;
    }
    if (typeof(options) !== 'number' && options.log === true) {
      if (options.logZero === true || count !== 0) {
        LogHelper.logAddResource(this, card, count);
      }
    }

    if (count > 0) {
      for (const playedCard of this.tableau) {
        playedCard.onResourceAdded?.(this, card, count);
      }
    }

    // Vermin hook (2 of 2)
    if (card.name === CardName.VERMIN) {
      this.game.verminInEffect = card.resourceCount >= 10;
    }
  }

  public getCardsWithResources(resource?: CardResource): Array<ICard> {
    let result = this.tableau.filter((card) => card.resourceType !== undefined && card.resourceCount && card.resourceCount > 0);

    if (resource !== undefined) {
      result = result.filter((card) => card.resourceType === resource);
    }

    return result;
  }

  public getResourceCards(resource?: CardResource): Array<ICard> {
    let result = this.tableau.filter((card) => card.resourceType !== undefined);

    if (resource !== undefined) {
      result = result.filter((card) => card.resourceType === resource || card.resourceType === CardResource.WARE);
    }

    return result;
  }

  public getResourceCount(resource: CardResource): number {
    return sum(this.getCardsWithResources(resource).map((card) => card.resourceCount));
  }

  public runInput(input: InputResponse, pi: PlayerInput): void {
    const result = pi.process(input, this);
    this.defer(result, Priority.DEFAULT);
  }

  public getAvailableBlueActionCount(): number {
    return this.getPlayableActionCards().length;
  }

  public getPlayableActionCards(): Array<ICard & IActionCard> {
    const result: Array<ICard & IActionCard> = [];
    for (const card of this.tableau) {
      if (isIActionCard(card) && !this.actionsThisGeneration.has(card.name) && !isCeoCard(card)) {
        if (card.canAct(this)) {
          result.push(card);
        }
      }
    }
    return result;
  }

  public getUsableOPGCeoCards(): Array<ICeoCard> {
    const result: Array<ICeoCard> = [];
    for (const playedCard of this.tableau) {
      if (isCeoCard(playedCard) && playedCard.canAct(this) ) {
        result.push(playedCard);
      }
    }
    return result;
  }

  public runProductionPhase(): void {
    this.actionsThisGeneration.clear();
    this.removingPlayers = [];
    this.standardProjectsThisGeneration.clear();

    this.turmoilPolicyActionUsed = false;
    this.politicalAgendasActionUsedCount = 0;

    if (this.playedCards.has(CardName.SUPERCAPACITORS)) {
      Supercapacitors.onProduction(this);
    } else {
      this.heat += this.energy;
      this.energy = 0;
      this.finishProductionPhase();
    }
  }

  public finishProductionPhase() {
    this.megaCredits += this.production.megacredits + this.terraformRating;
    this.steel += this.production.steel;
    this.titanium += this.production.titanium;
    this.plants += this.production.plants;
    this.energy += this.production.energy;
    this.heat += this.production.heat;

    for (const card of this.tableau) {
      card.onProductionPhase?.(this);
    }

    // Turn off CEO OPG actions that were activated this generation
    for (const card of this.playedCards) {
      if (isCeoCard(card)) {
        card.opgActionIsActive = false;
      }
    }
  }

  /**
   * ../..return {number} the number of avaialble megacredits. Which is just a shorthand for megacredits,
   * plus any units of heat available thanks to Helion (and Stormcraft, by proxy).
   */
  public spendableMegacredits(): number {
    let total = this.megaCredits;
    if (this.canUseHeatAsMegaCredits) total += this.availableHeat();
    if (this.canUseTitaniumAsMegacredits) total += this.titanium * (this.titaniumValue - 1);
    return total;
  }

  // draftVariant 决定是买轮抽好的牌， 还是从牌库发牌，如果有轮抽阶段，就是在轮抽阶段已经发好牌了
  public runResearchPhase(): void {
    if (!this.game.gameOptions.draftVariant || this.game.isSoloMode()) {
      this.draftedCards = newStandardDraft(this.game).draw(this);
    }

    // 轮抽4张就可以买4张,轮抽5张就可以买5张, 唯一的例外就是 MARS_MATHS , 制定了轮抽5张只能买4张
    let selectable = this.draftedCards.length;
    if (this.playedCards.has(CardName.MARS_MATHS) && !LunaProjectOffice.isActive(this) && !this.playedCards.has(CardName._TERRALABS_RESEARCH_)) {
      selectable--;
    }

    const cards = copyAndClear(this.draftedCards);

    const chooseCardsToBuy = () => {
      return new ChooseCards(this, cards, {paying: true, keepMax: selectable}).execute();
    };

    const buyDraftedCards = () => {
      // TODO(kberg): Using .execute to rely on directly calling setWaitingFor is not great.
      // It's because all players is drafting at the same time. Once again, the server isn't ideal
      // when it comes to handling multiple players at once.
      const action = chooseCardsToBuy();
      this.setWaitingFor(action, () => this.game.playerIsFinishedWithResearchPhase(this));
    };

    if (this.game.underworldDraftEnabled &&
      this.underworldData.corruption > 0 &&
      cards.length >= 2 &&
      this.game.projectDeck.size() >= 2) {
      // Player may spend 1 corruption to discard 2 cards and draw 2 cards.
      const options = new OrOptions();
      options.options.push(chooseCardsToBuy());
      options.options.push(new SelectCard('Spend 1 corruption to replace 2 cards', 'Spend Corruption', cards, {min: 2, max: 2}).andThen((discards) => {
        this.game.projectDeck.discard(...discards);
        for (const discard of discards) {
          inplaceRemove(cards, discard);
        }
        // Drawing from the top to maintain seeds.
        cards.push(...this.game.projectDeck.drawN(this.game, 2, 'top'));
        buyDraftedCards();

        return undefined;
      }));
      this.setWaitingFor(options);
    } else {
      buyDraftedCards();
    }
  }

  public getCardCost(card: IProjectCard): number {
    let cost = card.cost;
    cost -= this.colonies.cardDiscount;

    for (const playedCard of this.tableau) {
      cost -= playedCard.getCardDiscount?.(this, card) ?? 0;
    }

    // Playwrights hook
    this.removedFromPlayCards.forEach((removedFromPlayCard) => {
      if (removedFromPlayCard.getCardDiscount !== undefined) {
        cost -= removedFromPlayCard.getCardDiscount(this, card);
      }
    });

    // TODO(kberg): put this in a callback.
    if (card.tags.includes(Tag.SPACE) && PartyHooks.shouldApplyPolicy(this, PartyName.UNITY, 'up04')) {
      cost -= 2;
    }

    return Math.max(cost, 0);
  }

  private paymentOptionsForCard(card: IProjectCard): PaymentOptions {
    return {
      heat: this.canUseHeatAsMegaCredits,
      steel: this.lastCardPlayed === CardName.LAST_RESORT_INGENUITY || card.tags.includes(Tag.BUILDING),
      plants: card.tags.includes(Tag.BUILDING) && this.playedCards.has(CardName.MARTIAN_LUMBER_CORP),
      titanium: this.lastCardPlayed === CardName.LAST_RESORT_INGENUITY || card.tags.includes(Tag.SPACE),
      lunaTradeFederationTitanium: this.canUseTitaniumAsMegacredits,
      seeds: card.tags.includes(Tag.PLANT) || card.name === CardName.GREENERY_STANDARD_PROJECT,
      floaters: card.tags.includes(Tag.VENUS),
      microbes: card.tags.includes(Tag.PLANT),
      lunaArchivesScience: card.tags.includes(Tag.MOON),
      spireScience: card.type === CardType.STANDARD_PROJECT,
      auroraiData: card.type === CardType.STANDARD_PROJECT,
      graphene: card.tags.includes(Tag.CITY) || card.tags.includes(Tag.SPACE),
      kuiperAsteroids: card.name === CardName.AQUIFER_STANDARD_PROJECT || card.name === CardName.ASTEROID_STANDARD_PROJECT,
    };
  }

  public checkPaymentAndPlayCard(selectedCard: IProjectCard, payment: Payment, cardAction: CardAction = 'add') {
    const cardCost = this.getCardCost(selectedCard);

    const reserved = MoonExpansion.adjustedReserveCosts(this, selectedCard);

    if (!this.canSpend(payment, reserved)) {
      throw new Error('You do not have that many resources to spend');
    }

    if (payment.floaters > 0) {
      if (selectedCard.name === CardName.STRATOSPHERIC_BIRDS && payment.floaters === this.getSpendable('floaters')) {
        const cardsWithFloater = this.getCardsWithResources(CardResource.FLOATER);
        if (cardsWithFloater.length === 1) {
          throw new Error('Cannot spend all floaters to play Stratospheric Birds');
        }
      }
    }

    if (payment.microbes > 0) {
      if (selectedCard.name === CardName.SOIL_ENRICHMENT && payment.microbes === this.getSpendable('microbes')) {
        const cardsWithMicrobe = this.getCardsWithResources(CardResource.MICROBE);
        if (cardsWithMicrobe.length === 1) {
          throw new Error('Cannot spend all microbes to play Soil Enrichment');
        }
      }
    }

    // TODO(kberg): Move this.paymentOptionsForCard to a parameter.
    const totalToPay = this.payingAmount(payment, this.paymentOptionsForCard(selectedCard));

    if (totalToPay < cardCost) {
      throw new Error('Did not spend enough to pay for card');
    }
    return this.playCard(selectedCard, payment, cardAction);
  }

  public resourcesOnCard(name: CardName): number {
    return this.playedCards.get(name)?.resourceCount ?? 0;
  }

  public getSpendable(SpendableResource: SpendableCardResource): number {
    // Psychrophiles + SoilEnrichment 可以写到这里
    return this.resourcesOnCard(CARD_FOR_SPENDABLE_RESOURCE[SpendableResource]);
  }

  public pay(payment: Payment) {
    const standardUnits = Units.of({
      megacredits: payment.megaCredits,
      steel: payment.steel,
      titanium: payment.titanium,
      plants: payment.plants,
    });

    this.stock.deductUnits(standardUnits);

    if (payment.heat > 0) {
      this.defer(this.spendHeat(payment.heat));
    }

    const removeResourcesOnCard = (name: CardName, count: number) => {
      if (count === 0) {
        return;
      }
      const card = this.playedCards.get(name);
      if (card === undefined) {
        throw new Error('Card ' + name + ' not found');
      }
      this.removeResourceFrom(card, count, {log: true});
    };

    removeResourcesOnCard(CardName.PSYCHROPHILES, payment.microbes);
    removeResourcesOnCard(CardName.DIRIGIBLES, payment.floaters);
    removeResourcesOnCard(CardName.LUNA_ARCHIVES, payment.lunaArchivesScience);
    removeResourcesOnCard(CardName.SPIRE, payment.spireScience);
    removeResourcesOnCard(CardName.CARBON_NANOSYSTEMS, payment.graphene);
    removeResourcesOnCard(CardName.SOYLENT_SEEDLING_SYSTEMS, payment.seeds);
    removeResourcesOnCard(CardName.AURORAI, payment.auroraiData);
    removeResourcesOnCard(CardName.KUIPER_COOPERATIVE, payment.kuiperAsteroids);

    if (payment.megaCredits > 0 || payment.steel > 0 || payment.titanium > 0) {
      PathfindersExpansion.addToSolBank(this);
    }
  }

  public playCard(selectedCard: IProjectCard, payment?: Payment, cardAction: CardAction = 'add'): void {
    ColoniesHandler.maybeActivateColonies(this.game, selectedCard);

    if (selectedCard.type !== CardType.PROXY) {
      this.lastCardPlayed = selectedCard.name;
      this.game.log('${0} played ${1}', (b) => b.player(this).card(selectedCard));
    }

    // Play the card
    //
    // IMPORTANT: This is the wrong place to take the play card action.
    // It should be played after putting the card into the playedCards array.
    // That makes sense because every card that has an "including this" behavior is
    // actually hacked to +1 things. That's too bad. It means all our code and tests are
    // a little busted.
    //
    // By the way, this "including this" issue does not happen with corporation cards.
    //
    // This issue is evident when playing New Partner, and drawing Double Down.
    // The issue is fixed in Double Down for the time being. But the right fix is to move this block
    // down. As I say, that's going to break a lot of things, many of which are not evident
    // in tests (because they use card.play instad of player.playCard).
    const action = selectedCard.play(this);
    this.defer(action, Priority.DEFAULT);

    if (payment !== undefined) {
      this.pay(payment);

      // 连月的逻辑
      if (this.playedCards.has(CardName.LUNA_CHAIN)) {
        const lunaChain = this.playedCards.get(CardName.LUNA_CHAIN) as LunaChain;
        if (lunaChain.data === undefined) {
          lunaChain.data = {lastPay: -100, triggerCount: 0};
        }
        const diff = 3 - Math.abs(payment.megaCredits - lunaChain.data.lastPay);
        if (diff > 0) {
          this.stock.add(Resource.MEGACREDITS, diff, {log: true});
          lunaChain.data.triggerCount += diff;
          this.game.log('${0} get ${1} M€ from Luna Chain in this game', (b) => b.player(this).number(lunaChain.data.triggerCount || 0));
        }
        lunaChain.data.lastPay = payment.megaCredits;
        this.game.log('${0} now need to pay ${1} to max trigger this effect', (b) => b.player(this).number(payment.megaCredits));
      }
    }
    // This could probably include 'nothing' but for now this will work.
    if (cardAction !== 'discard') {
      // Remove card from hand
      const projectCardIndex = this.cardsInHand.findIndex((card) => card.name === selectedCard.name);
      const preludeCardIndex = this.preludeCardsInHand.findIndex((card) => card.name === selectedCard.name);
      if (projectCardIndex !== -1) {
        this.cardsInHand.splice(projectCardIndex, 1);
      } else if (preludeCardIndex !== -1) {
        this.preludeCardsInHand.splice(preludeCardIndex, 1);
      }

      const selfReplicatingRobots = this.tableau.get(CardName.SELF_REPLICATING_ROBOTS);
      if (selfReplicatingRobots instanceof SelfReplicatingRobots) {
        if (inplaceRemove(selfReplicatingRobots.targetCards, selectedCard)) {
          selectedCard.resourceCount = 0;
        }
      }
    }

    switch (cardAction) {
    case 'add':
      if (selectedCard.name !== CardName.LAW_SUIT && selectedCard.name !== CardName.PRIVATE_INVESTIGATOR) {
        this.playedCards.push(selectedCard);
      }
      break;
    // Card is already played. Discard it.
    case 'discard':
      this.discardPlayedCard(selectedCard);
      break;
    // Do nothing. Good for fake cards and replaying events.
    case 'nothing':
      break;
    // Do nothing, used for Double Down.
    case 'double-down':
      break;
    }

    // See comment above regarding

    // See DeclareCloneTag for why this skips cards with clone tags.
    if (!selectedCard.tags.includes(Tag.CLONE) && cardAction !== 'double-down') {
      this.onCardPlayed(selectedCard);
    }

    return undefined;
  }

  public onCardPlayed(card: ICard) {
    if (card.type === CardType.PROXY) {
      return;
    }

    /* A player responding to their own cards played. */
    for (const effectCard of this.playedCards) {
      if (isICorporationCard(effectCard)) {
        this.defer(effectCard.onCardPlayedForCorps?.(this, card));
      } else {
        this.defer(effectCard.onCardPlayed?.(this, card));
      }
    }

    TurmoilHandler.applyOnCardPlayedEffect(this, card);

    /* A player responding to any other player's card played. */
    for (const somePlayer of this.game.playersInGenerationOrder) {
      for (const effectCard of somePlayer.playedCards) {
        const actionFromPlayedCard = effectCard.onCardPlayedByAnyPlayer?.(somePlayer, card, this);
        this.defer(actionFromPlayedCard);
      }
    }

    PathfindersExpansion.onCardPlayed(this, card);
  }

  /* Visible for testing */
  public playActionCard(): PlayerInput {
    const isvip = GameLoader.getUserByPlayer(this)?.isvip() || 0;
    const cards = this.getPlayableActionCards();
    const max = isvip > 0 && this.game.players.length === 1 ? cards.length : 1;
    return new SelectCard<ICard & IActionCard>(
      'Perform an action from a played card',
      'Take action',
      this.getPlayableActionCards(),
      {selectBlueCardAction: true, max})
      .andThen((foundCards) => {
        if (max === 1 ) {
          foundCards = [foundCards[0]];
        }
        for (const foundCard of foundCards) {
          if (foundCard.canAct(this)) {
            this.game.log('${0} used ${1} action', (b) => b.player(this).card(foundCard));
            const action = foundCard.action(this);
            this.defer(action);
            this.actionsThisGeneration.add(foundCard.name);
          }
        }

        return undefined;
      });
  }

  private playCeoOPGAction(): PlayerInput {
    return new SelectCard<ICeoCard>(
      'Use CEO once per game action',
      'Take action',
      this.getUsableOPGCeoCards(),
      {selectBlueCardAction: true})
      .andThen(([card]) => {
        this.game.log('${0} used ${1} action', (b) => b.player(this).card(card));
        const action = card.action?.(this);
        this.defer(action);
        this.actionsThisGeneration.add(card.name);
        return undefined;
      });
  }

  public playCorporationCard(corporationCard: ICorporationCard, isMerger: boolean = false): void {
    const additionalCorp = this.playedCards.corporations().length > 0;

    this.playedCards.push(corporationCard);

    if (isMerger) {
      // Update starting MC
      this.megaCredits += corporationCard.startingMegaCredits;
      // Update card cost.
      if ( corporationCard.cardCost !== undefined) {
        this.cardCost += corporationCard.cardCost - constants.CARD_COST;
      }
    }

    this.game.log('${0} played ${1}', (b) => b.player(this).card(corporationCard));

    ColoniesHandler.maybeActivateColonies(this.game, corporationCard);
    this.defer(corporationCard.play(this));
    if (corporationCard.initialAction !== undefined && corporationCard.initialActionText !== undefined) {
      this.pendingInitialActions.push(corporationCard);
    }

    if (additionalCorp === false) {
      this.game.log('${0} kept ${1} project cards', (b) => b.player(this).number(this.cardsInHand.length));
    }

    this.onCardPlayed(corporationCard);
  }

  public drawCard(count?: number, options?: DrawOptions): undefined {
    return DrawCards.keepAll(this, count, options).execute();
  }

  public drawCardKeepSome(count: number, options: AllOptions): void {
    this.game.defer(DrawCards.keepSome(this, count, options));
  }

  public discardPlayedCard(card: IProjectCard) {
    const found = this.playedCards.remove(card);
    if (found === false) {
      console.error(`Error: card ${card.name} not in ${this.id}'s hand`);
      return;
    }
    this.game.projectDeck.discard(card);
    card.onDiscard?.(this);
    card.resourceCount = 0;
    this.game.log('${0} discarded ${1}', (b) => b.player(this).card(card));
  }

  public discardCardFromHand(card: IProjectCard, options?: {log?: boolean}) {
    const found = inplaceRemove(this.cardsInHand, card);
    if (found === false) {
      console.error(`Error: card ${card.name} not in ${this.id}'s hand`);
      return;
    }
    this.game.projectDeck.discard(card);
    if (options?.log === true) {
      this.game.log('${0} discarded ${1}', (b) => b.player(this).card(card), {reservedFor: this});
    }
  }

  public availableHeat(): number {
    const floaters = this.resourcesOnCard(CardName.STORMCRAFT_INCORPORATED) + this.resourcesOnCard(CardName._STORMCRAFT_INCORPORATED_);
    return this.heat + (floaters * 2);
  }

  public spendHeat(amount: number, cb: () => (undefined | PlayerInput) = () => undefined) : PlayerInput | undefined {
    const stormcraft = <StormCraftIncorporated> (this.tableau.get(CardName.STORMCRAFT_INCORPORATED) || this.tableau.get(CardName._STORMCRAFT_INCORPORATED_) );
    if (stormcraft?.resourceCount > 0) {
      return stormcraft.spendHeat(this, amount, cb);
    }
    this.stock.deduct(Resource.HEAT, amount);
    return cb();
  }

  public claimableMilestones(): Array<IMilestone> {
    if (this.game.allMilestonesClaimed()) {
      return [];
    }
    if ((this.canAfford(this.milestoneCost()) || this.playedCards.has(CardName.VANALLEN))) {
      return this.game.milestones
        .filter((milestone) => !this.game.milestoneClaimed(milestone) && milestone.canClaim(this));
    }
    return [];
  }

  private claimMilestone(milestone: IMilestone) {
    if (this.game.milestoneClaimed(milestone)) {
      throw new Error(milestone.name + ' is already claimed');
    }
    this.game.claimedMilestones.push({
      player: this,
      milestone: milestone,
    });
    // VanAllen CEO Hook for Milestones
    const vanAllen = this.game.getCardPlayerOrUndefined(CardName.VANALLEN);
    if (vanAllen !== undefined) {
      vanAllen.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {player: this}});
    }
    if (!this.playedCards.has(CardName.VANALLEN)) { // Why isn't this an else clause to the statement above?
      const cost = this.milestoneCost();
      this.game.defer(new SelectPaymentDeferred(this, cost, {title: 'Select how to pay for milestone'}));
    }
    this.game.log('${0} claimed ${1} milestone', (b) => b.player(this).milestone(milestone));
  }

  private isStagedProtestsActive() {
    const owner = this.game.getCardPlayerOrUndefined(CardName.STAGED_PROTESTS);
    if (owner === undefined) {
      return false;
    }
    const stagedProtests = owner.tableau.get(CardName.STAGED_PROTESTS);
    return stagedProtests?.generationUsed === this.game.generation;
  }

  private milestoneCost() {
    if (this.playedCards.has(CardName.NIRGAL_ENTERPRISES)) {
      return 0;
    }
    return this.isStagedProtestsActive() ? MILESTONE_COST + 8 : MILESTONE_COST;
  }

  // Public for tests.
  public awardFundingCost() {
    if (this.playedCards.has(CardName.NIRGAL_ENTERPRISES)) {
      return 0;
    }
    const plus8 = this.isStagedProtestsActive() ? 8 : 0;
    return this.game.getAwardFundingCost() + plus8;
  }

  private fundAward(award: IAward): PlayerInput {
    return new SelectOption(award.name, 'Fund - ' + '(' + award.name + ')').andThen(() => {
      this.game.defer(new SelectPaymentDeferred(this, this.awardFundingCost(), {title: 'Select how to pay for award'}));
      this.game.fundAward(this, award);
      return undefined;
    });
  }

  private endTurnOption(): PlayerInput {
    return new SelectOption('End Turn', 'End').andThen(() => {
      this.actionsTakenThisRound = this.availableActionsThisRound; // This allows for variable actions per turn, like Mars Maths
      this.game.log('${0} ended turn', (b) => b.player(this));
      return undefined;
    });
  }

  public pass(): void {
    this.game.playerHasPassed(this);
    this.lastCardPlayed = undefined;
    this.autopass = false;
    this.game.log('${0} passed', (b) => b.player(this));
  }

  private passOption(): PlayerInput {
    return new SelectOption('Pass for this generation', 'Pass').andThen(() => {
      this.pass();
      return undefined;
    });
  }

  // Propose a new action to undo last action
  private undoTurnOption(): PlayerInput {
    return new SelectOption('Undo last action', 'Undo' ).andThen(() => {
      try {
        this.undoing = true;// To prevent going back into takeAction()
        Database.getInstance().restoreGame(this.game.id, this.game.lastSaveId, this.game, this.id);
      } catch (error) {
        console.error(error);
      }
      return undefined;
    });
  }

  public takeActionForFinalGreenery(): void {
    console.log('takeActionForFinalGreenery ' +this.id + ' ' +this.name + ' ' + this.game.deferredActions.length );
    const resolveFinalGreeneryDeferredActions = () => {
      this.game.deferredActions.runAll(() => this.takeActionForFinalGreenery());
    };

    // Resolve any deferredAction before placing the next greenery
    // Otherwise if two tiles are placed next to Philares, only the last benefit is triggered
    // if Philares does not accept the first bonus before the second tile is down
    if (this.game.deferredActions.length > 0) {
      resolveFinalGreeneryDeferredActions();
      return;
    }

    if (this.game.canPlaceGreenery(this)) {
      const action = new OrOptions()
        .setTitle('Place any final greenery from plants')
        .setButtonLabel('Confirm');
      action.options.push(
        new SelectSpace(
          'Select space for greenery tile',
          this.game.board.getAvailableSpacesForGreenery(this))
          .andThen((space) => {
            // Do not raise oxygen or award TR for final greenery placements
            this.game.addGreenery(this, space, false);
            this.stock.deduct(Resource.PLANTS, this.plantsNeededForGreenery);
            console.log('takeActionForFinalGreenery from  action ' + this.id + ' ' + this.name);
            this.takeActionForFinalGreenery();

            // Resolve Philares deferred actions
            // takeActionForFinalGreenery 中已经包含下面的逻辑了 不用重复执行
            // if (this.game.deferredActions.length > 0) resolveFinalGreeneryDeferredActions();
            return undefined;
          }));
      action.options.push(
        new SelectOption('Don\'t place a greenery').andThen(() => {
          this.game.playerIsDoneWithGame(this);
          return undefined;
        }),
      );
      const waif = this.waitingFor === undefined;
      this.setWaitingForSafely(action);
      // 最后一时代种树5分钟自动跳过
      if (this.game.isRankMode()) {
        console.log(`尾树10分钟跳过开始设置 ${this.name}  ${this.game.id} ${waif} ${this.game.deferredActions.length}`);
        setTimeout(() => {
          console.log(`尾树10分钟跳过 ${this.name}  ${this.game.id} ${this.waitingFor === action} ${this.game.deferredActions.length}`);
          if (this.waitingFor === action && this.game.phase === Phase.PRODUCTION) {
            this.waitingFor = undefined;
            this.waitingForCb = undefined;
            this.timer.stop();
            this.game.playerIsDoneWithGame(this);
            this.game.log('${0} 10分钟内未响应,跳过', (b) => b.player(this));
          }
        }, 300 * 1000);
      }
      return;
    }

    if (this.game.deferredActions.length > 0) {
      resolveFinalGreeneryDeferredActions();
    } else {
      this.game.playerIsDoneWithGame(this);
    }
  }

  public getPlayableCards(): Array<IProjectCard> {
    const candidateCards: Array<IProjectCard> = [...this.cardsInHand];
    // Self Replicating robots check
    const card = this.tableau.get(CardName.SELF_REPLICATING_ROBOTS);
    if (card instanceof SelfReplicatingRobots) {
      candidateCards.push(...card.targetCards);
    }

    const playableCards: Array<IProjectCard> = [];
    for (const card of candidateCards) {
      card.warnings.clear();
      card.additionalProjectCosts = undefined;
      if (this.canPlay(card)) {
        playableCards.push(card);
      }
    }
    return playableCards;
  }

  public affordOptionsForCard(card: IProjectCard): CanAffordOptions {
    let trSource: TRSource = {};
    if (card.tr) {
      trSource = card.tr;
    } else {
      const computedTr = card.computeTr?.(this);
      if (computedTr !== undefined) {
        trSource = computedTr;
      } else if (card.behavior !== undefined) {
        trSource = getBehaviorExecutor().toTRSource(card.behavior, new Counter(this, card));
      }
    }

    const pharmacyUnion = this.tableau.get(CardName.PHARMACY_UNION);
    if ((pharmacyUnion?.resourceCount ?? 0 > 0) && this.tags.cardHasTag(card, Tag.SCIENCE)) {
      trSource.tr = (trSource.tr ?? 0) + 1;
    }

    const cost = this.getCardCost(card);
    const paymentOptionsForCard = this.paymentOptionsForCard(card);
    return {
      cost,
      ...paymentOptionsForCard,
      reserveUnits: MoonExpansion.adjustedReserveCosts(this, card),
      tr: trSource,
    };
  }

  public canPlay(card: IProjectCard): boolean {
    card.additionalProjectCosts = undefined;
    const options = this.affordOptionsForCard(card);
    const canAfford = this.canAffordInternal(options);
    if (!canAfford.canAfford) {
      return false;
    }
    const canPlay = card.canPlay(this, options);
    if (canPlay === false) {
      return false;
    }
    if (canAfford.redsCost > 0) {
      card.additionalProjectCosts = card.additionalProjectCosts ?? {};
      card.additionalProjectCosts.redsCost = canAfford.redsCost;
    }
    if (this.playedCards.has(CardName.PHARMACY_UNION) && card.tags.includes(Tag.MICROBE)) {
      const pharmacyUnion = this.tableau.get(CardName.PHARMACY_UNION);
      if (pharmacyUnion?.isDisabled === false) {
        card.warnings.add('pharmacyUnion');
      }
    }
    return true;
  }

  private maxSpendable(reserveUnits: Units = Units.EMPTY): Payment {
    return {
      megaCredits: this.megaCredits - reserveUnits.megacredits,
      steel: this.steel - reserveUnits.steel,
      titanium: this.titanium - reserveUnits.titanium,
      plants: this.plants - reserveUnits.plants,
      heat: this.availableHeat() - reserveUnits.heat,
      floaters: this.getSpendable('floaters'),
      microbes: this.getSpendable('microbes'),
      lunaArchivesScience: this.getSpendable('lunaArchivesScience'),
      spireScience: this.getSpendable('spireScience'),
      seeds: this.getSpendable('seeds'),
      auroraiData: this.getSpendable('auroraiData'),
      graphene: this.getSpendable('graphene'),
      kuiperAsteroids: this.getSpendable('kuiperAsteroids'),
    };
  }

  public canSpend(payment: Payment, reserveUnits?: Units): boolean {
    const maxPayable = this.maxSpendable(reserveUnits);

    return SPENDABLE_RESOURCES.every((key) =>
      0 <= payment[key] && payment[key] <= maxPayable[key]);
  }

  /**
   * Returns the value of the suppled payment given the payment options.
   *
   * For example, if the payment is 3M€ and 2 steel, given that steel by default is
   * worth 2M€, this will return 7.
   *
   * ../..param {Payment} payment the resources being paid.
   * ../..param {PaymentOptions} options any configuration defining the accepted form of payment.
   * ../..return {number} a number representing the value of payment in M€.
   */
  public payingAmount(payment: Payment, options?: Partial<PaymentOptions>): number {
    const multiplier = {
      ...DEFAULT_PAYMENT_VALUES,
      steel: this.getSteelValue(),
      titanium: this.getTitaniumValue(),
    };

    const usable: {[key in SpendableResource]: boolean} = {
      megaCredits: true,
      steel: options?.steel ?? false,
      titanium: options?.titanium ?? false,
      heat: this.canUseHeatAsMegaCredits,
      plants: options?.plants ?? false,
      microbes: options?.microbes ?? false,
      floaters: options?.floaters ?? false,
      lunaArchivesScience: options?.lunaArchivesScience ?? false,
      spireScience: options?.spireScience ?? false,
      seeds: options?.seeds ?? false,
      auroraiData: options?.auroraiData ?? false,
      graphene: options?.graphene ?? false,
      kuiperAsteroids: options?.kuiperAsteroids ?? false,
    };

    // HOOK: Luna Trade Federation
    if (usable.titanium === false && payment.titanium > 0 && this.canUseTitaniumAsMegacredits) {
      usable.titanium = true;
      multiplier.titanium -= 1;
    }

    let totalToPay = 0;
    for (const key of SPENDABLE_RESOURCES) {
      if (usable[key]) totalToPay += payment[key] * multiplier[key];
    }

    return totalToPay;
  }

  private static CANNOT_AFFORD = {canAfford: false, redsCost: 0} as const;

  /**
   * Returns information about whether a player can afford to spend money with other costs and ways to pay taken into account.
   */
  private canAffordInternal(options: CanAffordOptions): {redsCost: number, canAfford: boolean} {
    // TODO(kberg): These are set both here and in SelectPayment. Consolidate, perhaps.
    options.heat = this.canUseHeatAsMegaCredits;
    options.lunaTradeFederationTitanium = this.canUseTitaniumAsMegacredits;

    const reserveUnits = options.reserveUnits ?? Units.EMPTY;
    if (reserveUnits.heat > 0) {
      // Special-case heat
      const unitsWithoutHeat = {...reserveUnits, heat: 0};
      if (!this.stock.has(unitsWithoutHeat)) {
        return Player.CANNOT_AFFORD;
      }
      if (this.availableHeat() < reserveUnits.heat) {
        return Player.CANNOT_AFFORD;
      }
    } else {
      if (!this.stock.has(reserveUnits)) {
        return Player.CANNOT_AFFORD;
      }
    }

    const maxPayable = this.maxSpendable(reserveUnits);
    const redsCost = TurmoilHandler.computeTerraformRatingBump(this, options.tr) * REDS_RULING_POLICY_COST;
    if (redsCost > 0) {
      const usableForRedsCost = this.payingAmount(maxPayable, {});
      if (usableForRedsCost < redsCost) {
        return Player.CANNOT_AFFORD;
      }
    }

    const usable = this.payingAmount(maxPayable, options);

    const canAfford = options.cost + redsCost <= usable;
    return {canAfford, redsCost};
  }

  /**
   * Returns `true` if the player can afford to pay `options.cost` mc (possibly replaceable with steel, titanium etc.)
   * and additionally pay the reserveUnits (no replaces here)
   */
  public canAfford(o: number | CanAffordOptions): boolean {
    const options: CanAffordOptions = typeof(o) === 'number' ? {cost: o} : {...o};
    return this.canAffordInternal(options).canAfford;
  }

  public getStandardProjectOption(): SelectCard<IStandardProjectCard> {
    const standardProjects: Array<IStandardProjectCard> = this.game.getStandardProjects();

    const $this = this;
    function buffergas(amount:number, card : IStandardProjectCard) {
      if (amount > 0 && card.canAct($this)) {
        const result = card.action($this);
        $this.game.defer(new SimpleDeferredAction($this, () =>{
          return buffergas(amount-1, card);
        }));
        return result;
      }
      return undefined;
    }

    return new SelectCard(
      'Standard projects',
      'Confirm',
      standardProjects,
      {enabled: standardProjects.map((card) => card.canAct(this))})
      .andThen( (card) => {
        const isvip = GameLoader.getUserByPlayer(this)?.isvip() || 0;
        if (isvip > 0 && this.megaCredits > 100 && card[0].name === CardName.BUFFER_GAS_STANDARD_PROJECT) {
          return new SelectAmount(card[0].name, 'Save', 0, Math.min(100, Math.floor(this.megaCredits / 9))).andThen((amount: number) => {
            if (amount > 0) {
              return buffergas(amount, card[0]);
            }
            return undefined;
          });
        } else {
          return card[0].action(this);
        }
      });
  }

  private headStartIsInEffect() {
    if (this.game.phase === Phase.PRELUDES && this.playedCards.has(CardName.HEAD_START)) {
      if (this.actionsTakenThisRound < 2) {
        return true;
      }
    }
    return false;
  }

  // 返回玩家可选的行动
  /**
   * Set up a player taking their next action.
   *
   * This method indicates the avalilable actions by setting the `waitingFor` attribute of this player.
   *
   * saveBeforeTakingAction when true, the game state is saved. Default is `true`. This
   * should only be false in testing and when this method is called during game deserialization. In other
   * words, don't set this value unless you know what you're doing.
   */
  // @ts-ignore saveBeforeTakingAction is unused at the moment.
  public takeAction(saveBeforeTakingAction: boolean = true): void {
    const game = this.game;

    // 天梯 异常结束游戏后，不会修改Phase
    if (game.phase === Phase.END || game.phase === Phase.ABANDON || game.phase === Phase.TIMEOUT) {
      return;
    }
    if (game.deferredActions.length > 0) {
      this.canExit = false;
      game.deferredActions.runAll(() => this.takeAction());
      return;
    }

    // undoing 参数不能入库
    if (this.undoing) {
      this.waitingFor = undefined;
      return;
    }


    // Autopass is disabled.
    // if (this.autopass) {
    //   this.passOption().cb();
    // }
    const headStartIsInEffect = this.headStartIsInEffect();
    this.game.inDoubleDown = false;

    if (!headStartIsInEffect) {
      // Prelude cards have to be played first
      if (this.preludeCardsInHand.length > 0) {
        game.phase = Phase.PRELUDES;

        const selectPrelude = PreludesExpansion.selectPreludeToPlay(this, this.preludeCardsInHand);

        this.setWaitingFor(selectPrelude, this.runWhenEmpty(() => {
          this.incrementActionsTaken();
          if (this.preludeCardsInHand.length === 0 && !this.headStartIsInEffect()) {
            game.playerIsFinishedTakingActions();
            return;
          }
          this.takeAction();
        }));

        return;
      }

      if (this.ceoCardsInHand.length > 0) {
        // The CEO phase occurs between the Prelude phase and before the Action phase.
        // All CEO cards are played before players take their first normal actions.
        game.phase = Phase.CEOS;

        // start from the end of the list and work backwards, not sure why.
        const playableCeoCards = this.ceoCardsInHand.filter((card) => card.canPlay?.(this) === true).reverse();
        for (const ceo of playableCeoCards) {
          this.playCard(ceo);
        }
        // Null out ceoCardsInHand, anything left was unplayable.
        this.ceoCardsInHand = [];
        this.takeAction(); // back to top
        return;
      } else if (game.phase === Phase.PRELUDES || game.phase === Phase.CEOS) {
        game.phase = Phase.ACTION;
      }

      if (game.hasPassedThisActionPhase(this) || this.actionsTakenThisRound >= this.availableActionsThisRound + 1 || (game.players.length === 1 && this.actionsTakenThisRound >= this.availableActionsThisRound)) {
        this.actionsTakenThisRound = 0;
        this.canExit = false;
        this.undoing = false;
        this.availableActionsThisRound = 2;
        game.resettable = true;
        game.playerIsFinishedTakingActions();
        return;
      }
    }
    this.canExit = true;

    // Terraforming Mars FAQ says:
    //   If for any reason you are not able to perform your mandatory first action (e.g. if
    //   all 3 Awards are claimed before starting your turn as Vitor), you can skip this and
    //   proceed with other actions instead.
    // This code just uses "must skip" instead of "can skip".
    const vitor = this.tableau.get(CardName.VITOR);
    if (vitor !== undefined && this.game.allAwardsFunded()) {
      this.pendingInitialActions = this.pendingInitialActions.filter((card) => card !== vitor);
    }

    if (this.pendingInitialActions.length > 0) {
      const orOptions = new OrOptions();

      this.pendingInitialActions.forEach((corp) => {
        const option = new SelectOption(
          message('Take first action of ${0} corporation', (b) => b.card(corp)),
          corp.initialActionText)
          .andThen(() => {
            game.log('${0} took the first action of ${1} corporation', (b) => b.player(this).card(corp)),
            this.defer(corp.initialAction?.(this));
            inplaceRemove(this.pendingInitialActions, corp);
            return undefined;
          });
        orOptions.options.push(option);
      });


      this.setWaitingFor(orOptions, () => {
        if (this.pendingInitialActions.length === 0) {
          this.incrementActionsTaken();
          this.timer.rebate(constants.BONUS_SECONDS_PER_ACTION * 1000);
        }
        this.takeAction();
      });
      return;
    }

    this.setWaitingFor(this.getActions(), () => {
      this.incrementActionsTaken();
      this.takeAction();
    });
  }

  private incrementActionsTaken(): void {
    this.actionsTakenThisRound++;
    this.actionsTakenThisGame++;
  }

  public getActions() {
    const action = new OrOptions()
      .setTitle(this.actionsTakenThisRound === 0 ? 'Take your first action' : 'Take your next action')
      .setButtonLabel('Take action');
    action.id = this.generateId();
    // 单人的时候 第二动就不显示撤回了
    if (this.actionsTakenThisRound >= this.availableActionsThisRound && this.game.players.length > 1 ) {
      // end turn
      if (this.actionsTakenThisRound > 0) {
        action.options.push(
          this.endTurnOption(),
        );
      }
      // undo
      if (this.game.gameOptions.undoOption && ( !this.game.cardDrew || this.game.isSoloMode())) {
        action.options.push(this.undoTurnOption());
      }
      return action;
    }

    // Chaos hook
    for (const somePlayer of this.game.players) {
      const chaosCorp = somePlayer.playedCards.get(CardName.CHAOS);
      if (chaosCorp !== undefined) {
        const resourceArray = [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT];
        let bonus = 0;
        if (this.game.isSoloMode()) {
          resourceArray.forEach((resource: Resource)=>{
            if (somePlayer.production.get(resource) >= 1) {
              bonus ++;
            }
          });
        } else {
          resourceArray.forEach((resource: Resource)=>{
            const players = [...this.game.getAllPlayers()].sort(
              (p1, p2) => p2.production.get(resource) - p1.production.get(resource),
            );
            if (players[0].id === somePlayer.id && players[0].production.get(resource) > players[1].production.get(resource) && players[0].production.get(resource) >= 1) {
              bonus ++;
            }
          });
        }
        const wildtags:Array<Tag> = [];
        for (let index = 0; index < bonus; index++) {
          wildtags.push(Tag.WILD);
        }
        somePlayer.playedCards.retagCard(chaosCorp, () => {
          (chaosCorp as Chaos).settags = wildtags;
        });
      }
    }

    // VanAllen can claim milestones for free:
    const claimableMilestones = this.claimableMilestones();
    if (claimableMilestones.length > 0) {
      const milestoneOption = new OrOptions().setTitle('Claim a milestone');
      milestoneOption.options = claimableMilestones.map(
        (milestone) => new SelectOption(milestone.name, 'Claim - ' + '('+ milestone.name + ')').andThen(() => {
          this.claimMilestone(milestone);
          return undefined;
        }));
      action.options.push(milestoneOption);
    }

    // Convert Plants
    const convertPlants = new ConvertPlants();
    if (convertPlants.canAct(this)) {
      action.options.push(convertPlants.action(this));
    }

    // Convert Heat
    const convertHeat = new ConvertHeat();
    if (convertHeat.canAct(this)) {
      const option = new SelectOption(`Convert ${this.heatForTemperature} heat into temperature`, 'Convert heat').andThen(() => {
        return convertHeat.action(this);
      });
      if (convertHeat.warnings.size > 0) {
        option.warnings = Array.from(convertHeat.warnings);
        if (convertHeat.warnings.has('maxtemp')) {
          option.eligibleForDefault = false;
        }
      }
      action.options.push(option);
    }

    // 兄弟会
    // 遍历政党，通过getDelegates获得中立代表数量，delete并直接add对应代表，之后checkPartyLeader。
    const brotherhood = this.playedCards.get(CardName.BROTHERHOOD_OF_MUTANTS);
    if (brotherhood !== undefined && brotherhood.isUsed === false ) {
      action.options.push(
        new SelectOption('Mutant and Proud (transform all neutral delegates to your delegates)', 'Transform').andThen(() => {
          if (this.game.turmoil !== undefined) {
            const turmoil = this.game.turmoil;
            const parties = this.game.turmoil.parties;
            parties.forEach((party)=>{
              const neutral = party.delegates.count('NEUTRAL');
              for (let i=0; i<neutral; i++) {
                turmoil.delegateReserve.add(this);
                turmoil.sendDelegateToParty(this, party.name, this.game);
                turmoil.removeDelegateFromParty('NEUTRAL', party.name, this.game);
              }
            });
            this.game.log('${0} transforms all neutral delegates to his members.', (b) => b.player(this));
            brotherhood.isUsed = true;
            return undefined;
          }
          return undefined;
        }),
      );
    }

    // Turmoil
    const turmoilInput = TurmoilHandler.partyAction(this);
    if (turmoilInput !== undefined) {
      action.options.push(turmoilInput);
    }

    // Action cards
    if (this.getPlayableActionCards().length > 0) {
      action.options.push(this.playActionCard());
    }

    // CEO cards
    if (CeoExtension.ceoActionIsUsable(this)) {
      action.options.push(this.playCeoOPGAction());
    }

    // Playable cards
    const playableCards = this.getPlayableCards();
    if (playableCards.length !== 0) {
      action.options.push(new SelectProjectCardToPlay(this, playableCards));
    }

    // Trade with colonies
    const coloniesTradeAction = this.colonies.coloniesTradeAction();
    if (coloniesTradeAction !== undefined) {
      action.options.push(coloniesTradeAction);
    }

    // Add delegates
    TurmoilUtil.ifTurmoil(this.game, (turmoil) => {
      const input = turmoil.getSendDelegateInput(this);
      if (input !== undefined) {
        action.options.push(input);
      }
    });

    // End turn
    if (this.game.players.length > 1 &&
      this.actionsTakenThisRound > 0 &&
      !this.game.gameOptions.fastModeOption &&
      this.allOtherPlayersHavePassed() === false) {
      action.options.push(this.endTurnOption());
    }

    // Fund award
    const fundingCost = this.awardFundingCost();
    if (this.canAfford(fundingCost) && !this.game.allAwardsFunded()) {
      const remainingAwards = new OrOptions()
        .setTitle(message('Fund an award (${0} M€)', (b) => b.number(fundingCost)))
        .setButtonLabel('Confirm');
      remainingAwards.options = this.game.awards
        .filter((award: IAward) => this.game.hasBeenFunded(award) === false)
        .map((award: IAward) => this.fundAward(award));
      action.options.push(remainingAwards);
    }

    // Standard Projects
    action.options.push(this.getStandardProjectOption());

    // Pass
    action.options.push(this.passOption());

    // Sell patents
    const sellPatents = new SellPatentsStandardProject();
    if (sellPatents.canAct(this)) {
      action.options.push(sellPatents.action(this));
    }

    // Propose undo action only if you have done one action this turn
    if (this.actionsTakenThisRound > 0 && this.game.gameOptions.undoOption && !this.game.cardDrew) {
      action.options.push(this.undoTurnOption());
    }
    return action;
  }

  private allOtherPlayersHavePassed(): boolean {
    const game = this.game;
    if (game.isSoloMode()) return true;
    const players = game.players;
    const passedPlayers = game.getPassedPlayers();
    return passedPlayers.length === players.length - 1 && passedPlayers.includes(this.color) === false;
  }


  public process(input: any): void {
    if (this.waitingFor === undefined || this.waitingForCb === undefined) {
      throw new UnexpectedInput('Not waiting for anything');
    }
    if (input.id && this.waitingFor instanceof OrOptions && this.waitingFor.id ) {
      if (input.id !== this.waitingFor.id) {
        throw new UnexpectedInput('Not Exact Id');
      }
    }
    if (input.input !== undefined ) {
      input = input.input;
    }

    const waitingFor = this.waitingFor;
    const waitingForCb = this.waitingForCb;
    this.waitingFor = undefined;
    this.waitingForCb = undefined;
    try {
      this.timer.stop();
      this.runInput(input, waitingFor);
      waitingForCb();
    } catch (err) {
      this.setWaitingFor(waitingFor, waitingForCb);
      throw err;
    }
  }

  public getWaitingFor(): PlayerInput | undefined {
    return this.waitingFor;
  }

  public setWaitingFor(input: PlayerInput | undefined, cb: (() => void) | undefined = () => {}): void {
    if (this.waitingFor !== undefined && !this.exited) {
      const message = `Overwriting waitingFor ${this.waitingFor.type} with ${input?.type} ${this.id}`;

      const replacer = (_key: string, value: any) => {
        if (value instanceof Player) {
          return {id: value.id, name: value.name};
        }
        if (value instanceof Game) {
          return {id: value.id};
        }
        // 对于其他值，返回原值
        return value;
      };

      console.warn(message, JSON.stringify( this.waitingFor, replacer, 2), JSON.stringify( input, replacer, 2) );
      if (THROW_STATE_ERRORS) {
        throw new Error(message);
      }
    }
    if (this.game.phase !== Phase.END && this.game.phase !== Phase.ABANDON && this.game.phase !== Phase.TIMEOUT) {
      this.timer.start();
    }
    this.waitingFor = input;
    this.waitingForCb = cb;
    this.game.inputsThisRound++;
  }


  /**
   * A version of setWaitingFor that does not discard a setWaitingFor call whe
   * this player is already waiting for something. Instead, it modifies the
   * current waitingFor by wrapping it with behavior that calls the next setWaitingFor
   * when it finishes.
   *
   * This was only built for the Philares/Final Greenery case. Might not work elsewhere.
   */
  public setWaitingForSafely(input: PlayerInput, cb: () => void = () => {}): void {
    if (this.waitingFor === undefined) {
      this.setWaitingFor(input, cb);
    } else {
      const savedcb = this.waitingForCb;
      if (savedcb === undefined) {
        this.waitingForCb = cb;
      } else {
        this.waitingForCb = () => {
          savedcb();
          this.setWaitingForSafely(input, cb);
        };
      }
    }
  }

  // 体退新增规则：如果是排名模式，则必须玩家人数为2才行
  public canExitFun(game:Game):boolean {
    return this.canExit && game.phase === Phase.ACTION && game.activePlayer === this && game.players.length > 1 && (!game.isRankMode() || game.players.length === 2);
  }
  public toJSON(): string {
    return JSON.stringify(this.serialize());
  }
  public serializeId(): SerializedPlayerId {
    return {id: this.id} as SerializedPlayerId;
  }

  public serialize(): SerializedPlayer {
    const result: SerializedPlayer = {
      id: this.id,
      // user: this.user,
      corporations: this.playedCards.corporations().map((corporation) => {
        const serialized = {
          name: corporation.name,
          resourceCount: corporation.resourceCount,
          isDisabled: false,
          data: corporation.data,
        };
        corporation.serialize?.(serialized);
        return serialized;
      }),
      // Used only during set-up
      pickedCorporationCard: this.pickedCorporationCard === undefined ? undefined : serializedCardName(this.pickedCorporationCard),
      pickedCorporationCard2: this.pickedCorporationCard2 === undefined ? undefined : serializedCardName(this.pickedCorporationCard2),
      // Terraforming Rating
      terraformRating: this.terraformRating,
      hasIncreasedTerraformRatingThisGeneration: this.hasIncreasedTerraformRatingThisGeneration,
      // Resources
      megaCredits: this.megaCredits,
      megaCreditProduction: this.production.megacredits,
      steel: this.steel,
      steelProduction: this.production.steel,
      titanium: this.titanium,
      titaniumProduction: this.production.titanium,
      plants: this.plants,
      plantProduction: this.production.plants,
      energy: this.energy,
      energyProduction: this.production.energy,
      heat: this.heat,
      heatProduction: this.production.heat,
      heatProductionStepsIncreasedThisGeneration: this.heatProductionStepsIncreasedThisGeneration,
      heatForTemperature: this.heatForTemperature,
      // Resource values
      titaniumValue: this.titaniumValue,
      steelValue: this.steelValue,
      // Helion
      canUseHeatAsMegaCredits: this.canUseHeatAsMegaCredits,
      // Martian Lumber Corp
      canUsePlantsAsMegacredits: this.canUsePlantsAsMegacredits,
      // Luna Trade Federation
      canUseTitaniumAsMegacredits: this.canUseTitaniumAsMegacredits,
      preservationProgram: this.preservationProgram,
      // This generation / this round
      actionsTakenThisRound: this.actionsTakenThisRound,
      actionsThisGeneration: Array.from(this.actionsThisGeneration),
      pendingInitialActions: this.pendingInitialActions.map(toName),
      // Cards
      dealtCorporationCards: this.dealtCorporationCards.map(serializedCardName),
      dealtPreludeCards: this.dealtPreludeCards.map(serializedCardName),
      dealtCeoCards: this.dealtCeoCards.map(toName),
      dealtProjectCards: this.dealtProjectCards.map(serializedCardName),
      cardsInHand: this.cardsInHand.map(serializedCardName),
      preludeCardsInHand: this.preludeCardsInHand.map(serializedCardName),
      ceoCardsInHand: this.ceoCardsInHand.map(toName),
      playedCards: this.playedCards.serialize(),
      draftedCards: this.draftedCards.map(serializedCardName),
      cardCost: this.cardCost,
      cardDiscount: this.colonies.cardDiscount,
      // Colonies
      fleetSize: this.colonies.getFleetSize(),
      tradesThisGeneration: this.colonies.tradesThisGeneration,
      colonyTradeOffset: this.colonies.tradeOffset,
      colonyTradeDiscount: this.colonies.tradeDiscount,
      colonyVictoryPoints: this.colonies.victoryPoints,
      // Turmoil
      turmoilPolicyActionUsed: this.turmoilPolicyActionUsed,
      politicalAgendasActionUsedCount: this.politicalAgendasActionUsedCount,
      hasTurmoilScienceTagBonus: this.hasTurmoilScienceTagBonus,
      oceanBonus: this.oceanBonus,
      // Custom cards
      // Leavitt Station.
      scienceTagCount: this.tags.extraScienceTags,
      plantTagCount: this.tags.extraPlantTags,
      // Ecoline
      plantsNeededForGreenery: this.plantsNeededForGreenery,
      // Lawsuit
      removingPlayers: this.removingPlayers,
      // Playwrights
      removedFromPlayCards: this.removedFromPlayCards.map(serializeProjectCard),
      // Standard Technology: Underworld
      standardProjectsThisGeneration: Array.from(this.standardProjectsThisGeneration),

      name: this.name,
      color: this.color,
      beginner: this.beginner,
      handicap: this.handicap,
      timer: this.timer.serialize(),
      lastCardPlayed: this.lastCardPlayed,
      undoing: this.undoing,
      exited: this.exited,
      canExit: this.canExit,
      _game: {id: this.id},
      userId: this.userId,
      // Stats
      actionsTakenThisGame: this.actionsTakenThisGame,
      victoryPointsByGeneration: this.victoryPointsByGeneration,
      totalDelegatesPlaced: this.totalDelegatesPlaced,
      underworldData: this.underworldData,
      alliedParty: this.alliedParty,
      draftHand: this.draftHand.map(toName),
      autoPass: this.autopass,
      globalParameterSteps: this.globalParameterSteps,
    };

    return result;
  }

  public static deserialize(d: SerializedPlayer): Player {
    const player = new Player(d.name, d.color, d.beginner, Number(d.handicap), d.id);

    Object.assign(player, d); // 对象属性需要慎重使用，尤其是需要反序列化的， 需要先清空 如 player.corporations
    player.actionsTakenThisGame = player.actionsTakenThisGame ?? 0;
    player.actionsThisGeneration = new Set(d.actionsThisGeneration);


    player.colonies.cardDiscount = d.cardDiscount;
    player.colonies.tradeDiscount = d.colonyTradeDiscount;
    player.colonies.tradeOffset = d.colonyTradeOffset;
    player.colonies.setFleetSize(d.fleetSize);
    player.colonies.victoryPoints = d.colonyVictoryPoints;
    player.victoryPointsByGeneration = d.victoryPointsByGeneration ?? new Array(20).fill(0);


    // TODO(kberg): Remove ?? [] by 2025-08-01
    player.standardProjectsThisGeneration = new Set(d.standardProjectsThisGeneration ?? []);
    player.production.override(Units.of({
      energy: d.energyProduction,
      heat: d.heatProduction,
      megacredits: d.megaCreditProduction,
      plants: d.plantProduction,
      steel: d.steelProduction,
      titanium: d.titaniumProduction,
    }));

    player.tags.extraScienceTags = d.scienceTagCount;
    player.tags.extraPlantTags = d.plantTagCount ?? 0;
    player.colonies.tradesThisGeneration = d.tradesThisTurn ?? d.tradesThisGeneration ?? 0;

    player.lastCardPlayed = d.lastCardPlayed !== undefined ?
      ((d.lastCardPlayed as unknown as IProjectCard).name || d.lastCardPlayed ):
      undefined;

    // Rebuild removed from play cards (Playwrights, Odyssey)
    player.removedFromPlayCards = d.removedFromPlayCards.map((x) => deserializeProjectCard(x));

    if (d.pickedCorporationCard !== undefined) {
      player.pickedCorporationCard = newCorporationCard(d.pickedCorporationCard.name);
    }
    if (d.pickedCorporationCard2 !== undefined) {
      player.pickedCorporationCard2 = newCorporationCard(d.pickedCorporationCard2.name);
    }

    player.playedCards = new PlayedCards();
    player.playedCards.deserialize(d.playedCards);
    // Rebuild corporation card
    const corporations = d.corporations || [];
    if (corporations !== undefined) {
      for (const corporation of corporations) {
        const card = newCorporationCard(corporation.name);
        if (card === undefined || player.playedCards.get(card.name) !== undefined) {
          continue;
        }
        if (corporation.resourceCount !== undefined) {
          card.resourceCount = corporation.resourceCount;
        }
        if (corporation.data !== undefined) {
          card.data = corporation.data;
        }
        card.deserialize?.(corporation);
        player.playedCards.push(card);
      }
    }

    player.pendingInitialActions = [];
    if (d.pendingInitialActions !== undefined) {
      player.pendingInitialActions = player.playedCards.corporations().filter((card) => {
        return d.pendingInitialActions?.find( (name) => name === card.name) !== undefined;
      });
    }

    player.dealtCorporationCards = corporationCardsFromJSON(d.dealtCorporationCards.map(toName));
    player.dealtPreludeCards = preludesFromJSON(d.dealtPreludeCards.map(toName));
    player.dealtCeoCards = ceosFromJSON(d.dealtCeoCards);
    player.dealtProjectCards = cardsFromJSON(d.dealtProjectCards.map(toName));
    player.cardsInHand = cardsFromJSON(d.cardsInHand.map(toName));
    player.preludeCardsInHand = cardsFromJSON(d.preludeCardsInHand.map(toName)) as Array<IPreludeCard>;
    player.ceoCardsInHand = ceosFromJSON(d.ceoCardsInHand);
    player.draftedCards = cardsFromJSON(d.draftedCards.map(toName));
    player.autopass = d.autoPass ?? false;
    player.preservationProgram = d.preservationProgram ?? false;

    player.timer = Timer.deserialize(d.timer);

    if (d.underworldData !== undefined) {
      const dunerworldData = d.underworldData;
      // TODO(kberg): Remove the wrapper by 2025-10-01
      player.underworldData = {
        tokens: dunerworldData.tokens ?? [],
        corruption: dunerworldData.corruption,
        activeBonus: dunerworldData.temperatureBonus ?? dunerworldData.activeBonus,
      };
    }
    if (d.alliedParty !== undefined) {
      // TODO(kberg): Remove after 2025-08-01
      const agenda = d.alliedParty.agenda;
      if (agenda.policyId.startsWith('mfp')) {
        agenda.policyId = (agenda.policyId.slice(0, 1) + agenda.policyId.slice(2)) as PolicyId;
      }
      player.alliedParty = d.alliedParty;
    }

    player.draftHand = cardsFromJSON(d.draftHand);
    if (d.globalParameterSteps) {
      player.globalParameterSteps = {...DEFAULT_GLOBAL_PARAMETER_STEPS, ...d.globalParameterSteps};
    }
    return player;
  }

  /* Shorthand for deferring things */
  public defer(input: PlayerInput | undefined | void | (() => PlayerInput | undefined), priority: Priority = Priority.DEFAULT): void {
    if (input === undefined) {
      return;
    }
    const cb = typeof(input) === 'function' ? input : () => input;
    const action = new SimpleDeferredAction(this, cb, priority);
    this.game.defer(action);
  }

  // 天梯
  public getUserRank(): UserRank | undefined {
    return GameLoader.getUserRankByPlayer(this);
  }

  // 天梯 如果是对应player，则更新玩家排名
  public addOrUpdateUserRank(userRank: UserRank): void {
    const dbrank = this.getUserRank();
    if (dbrank?.userId === userRank.userId) {
      GameLoader.getInstance().addOrUpdateUserRank(userRank);
    } else {
      console.error('addOrUpdateUserRank rank error', dbrank, userRank);
    }
  }


  public runWhenEmpty(cb: () => void): () => void {
    const f = () => {
      if (this.game.deferredActions.length === 0) {
        cb();
        return;
      }
      this.game.deferredActions.runAll(() => f());
    };
    return f;
  }
}
