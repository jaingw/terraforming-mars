import * as constants from '../common/constants';
import {PlayerId} from '../common/Types';
import {MILESTONE_COST, REDS_RULING_POLICY_COST} from '../common/constants';
import {cardsFromJSON, ceosFromJSON, corporationCardsFromJSON, newCorporationCard} from './createCard';
import {CardName} from '../common/cards/CardName';
import {CardType} from '../common/cards/CardType';
import {Color} from '../common/Color';
import {ICorporationCard} from './cards/corporation/ICorporationCard';
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
import {RobotCard, SelfReplicatingRobots} from './cards/promo/SelfReplicatingRobots';
import {SerializedCard} from './SerializedCard';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {StormCraftIncorporated} from './cards/colonies/StormCraftIncorporated';
import {Tag} from '../common/cards/Tag';
import {_MiningGuild_} from './cards/breakthrough/corporation/_MiningGuild_';
import {Timer} from '../common/Timer';
import {TurmoilHandler} from './turmoil/TurmoilHandler';
import {GameCards} from './GameCards';
import {_MorningStarInc_} from './cards/breakthrough/corporation/_MorningStarInc_';
import {AllOptions, DrawCards, DrawOptions} from './deferredActions/DrawCards';
import {Units} from '../common/Units';
import {MoonExpansion} from './moon/MoonExpansion';
import {IStandardProjectCard} from './cards/IStandardProjectCard';
import {ConvertPlants} from './cards/base/standardActions/ConvertPlants';
import {ConvertHeat} from './cards/base/standardActions/ConvertHeat';
import {LunaProjectOffice} from './cards/moon/LunaProjectOffice';
import {GlobalParameter} from '../common/GlobalParameter';
import {LogHelper} from './LogHelper';
import {TurmoilUtil} from './turmoil/TurmoilUtil';
import {PathfindersExpansion} from './pathfinders/PathfindersExpansion';
import {deserializeProjectCard, serializedCardName, serializePlayedCard} from './cards/CardSerialization';
import {ColoniesHandler} from './colonies/ColoniesHandler';
import {AntiGravityExperiment} from './cards/eros/AntiGravityExperiment';
import {MonsInsurance} from './cards/promo/MonsInsurance';
import {InputResponse} from '../common/inputs/InputResponse';
import {Tags} from './player/Tags';
import {Colonies} from './player/Colonies';
import {Production} from './player/Production';
import {Stock} from './player/Stock';
import {Merger} from './cards/promo/Merger';
import {GameLoader} from './database/GameLoader';
import {SelectAmount} from './inputs/SelectAmount';
import {getBehaviorExecutor} from './behavior/BehaviorExecutor';
import {CeoExtension} from './CeoExtension';
import {ICeoCard, isCeoCard} from './cards/ceos/ICeoCard';
import {message} from './logs/MessageBuilder';
import {calculateVictoryPoints} from './game/calculateVictoryPoints';
import {IVictoryPointsBreakdown} from '../common/game/IVictoryPointsBreakdown';
import {UserRank} from '../common/rank/RankManager';
import {YesAnd} from './cards/requirements/CardRequirement';
import {PlayableCard} from './cards/IProjectCard';
import {Supercapacitors} from './cards/promo/Supercapacitors';
import {CanAffordOptions, CardAction, IPlayer, ResourceSource, isIPlayer} from './IPlayer';
import {IPreludeCard} from './cards/prelude/IPreludeCard';
import {inplaceRemove, sum} from '../common/utils/utils';
import {PreludesExpansion} from './preludes/PreludesExpansion';
import {ChooseCards} from './deferredActions/ChooseCards';
import {UnderworldPlayerData} from './underworld/UnderworldData';
import {UnderworldExpansion} from './underworld/UnderworldExpansion';
import {Counter} from './behavior/Counter';
import {TRSource} from '../common/cards/TRSource';
import {UnexpectedInput} from './inputs/UnexpectedInput';
import {LunaChain} from './cards/eros/corp/LunaChain';

const THROW_WAITING_FOR = Boolean(process.env.THROW_WAITING_FOR);

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

  // Corporate identity
  // 双将功能替换原有 corporationCard 属性，合并外网代码时，所有对公司的操作都需要核查一遍
  public corporations: Array<ICorporationCard> = [];
  // Used only during set-up
  public pickedCorporationCard?: ICorporationCard;
  public pickedCorporationCard2?: ICorporationCard;

  // Terraforming Rating
  private terraformRating: number = 20;
  public hasIncreasedTerraformRatingThisGeneration: boolean = false;

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

  // Resource values
  private titaniumValue: number = 3;
  public steelValue: number = 2;
  // Helion
  public canUseHeatAsMegaCredits: boolean = false;
  // Martian Lumber Corp
  public canUsePlantsAsMegacredits: boolean = false;
  // Luna Trade Federation
  public canUseTitaniumAsMegacredits: boolean = false;
  // Friends in High Places
  public canUseCorruptionAsMegacredits: boolean = false;

  // This generation / this round
  public actionsTakenThisRound: number = 0;
  public actionsThisGeneration: Set<CardName> = new Set<CardName>();
  public lastCardPlayed: CardName | undefined;
  public undoing : boolean = false;
  public exited : boolean = false;// 是否体退
  public canExit : boolean = false;// 能否体退： 行动阶段、当前行动玩家、没有未执行的拦截器
  public pendingInitialActions: Array<ICorporationCard> = [];

  // Cards
  public dealtCorporationCards: Array<ICorporationCard> = [];
  public dealtPreludeCards: Array<IProjectCard> = [];
  public dealtCeoCards: Array<ICeoCard> = [];
  public dealtProjectCards: Array<IProjectCard> = [];
  public cardsInHand: Array<IProjectCard> = [];
  public preludeCardsInHand: Array<IPreludeCard> = [];
  public ceoCardsInHand: Array<IProjectCard> = [];
  public playedCards: Array<IProjectCard> = [];
  public draftedCards: Array<IProjectCard | ICorporationCard> = [];
  public draftedCorporations: Array<ICorporationCard> = [];
  public cardCost: number = constants.CARD_COST;

  public timer: Timer = Timer.newInstance();

  // Turmoil
  public turmoilPolicyActionUsed: boolean = false;
  public politicalAgendasActionUsedCount: number = 0;

  public oceanBonus: number = constants.OCEAN_BONUS;

  // Custom cards
  // Community Leavitt Station and Pathfinders Leavitt Station
  // TODO(kberg): move scienceTagCount to Tags?
  public scienceTagCount: number = 0;
  // PoliticalAgendas Scientists P41
  public hasTurmoilScienceTagBonus: boolean = false;
  // Ecoline
  public plantsNeededForGreenery: number = 8;
  public heatForTemperature: number = 8;
  // Lawsuit
  public removingPlayers: Array<PlayerId> = [];
  // For Playwrights corp.
  // removedFromPlayCards is a bit of a misname: it's a temporary storage for
  // cards that provide 'next card' discounts. This will clear between turns.
  public removedFromPlayCards: Array<IProjectCard> = [];
  // Hotsprings
  public heatProductionStepsIncreasedThisGeneration: number = 0;

  // Underworld
  public underworldData: UnderworldPlayerData = UnderworldExpansion.initializePlayer();

  // The number of actions a player can take this round.
  // It's almost always 2, but certain cards can change this value (Mars Maths, Tool with the First Order)
  //
  // This value isn't serialized. Probably ought to be.
  public availableActionsThisRound = 2;

  // Stats
  public actionsTakenThisGame: number = 0;
  public victoryPointsByGeneration: Array<number> = [];
  public totalDelegatesPlaced: number = 0;

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

  public static initialize(
    name: string,
    color: Color,
    beginner: boolean,
    handicap: number = 0,
    id: PlayerId): Player {
    const player = new Player(name, color, beginner, handicap, id);
    return player;
  }

  public tearDown() {
    this.game = undefined as unknown as Game;
  }

  public get tableau(): Array<ICorporationCard | IProjectCard> {
    return [...this.corporations, ...this.playedCards];
  }

  public isCorporation(corporationName: CardName): boolean {
    return this.getCorporation(corporationName) !== undefined;
  }

  public getCorporation(corporationName: CardName): ICorporationCard | undefined {
    return this.corporations.find((c) => c.name === corporationName);
  }

  public getCorporationOrThrow(corporationName: CardName): ICorporationCard {
    const corporation = this.getCorporation(corporationName);
    if (corporation === undefined) {
      throw new Error(`player ${this.name} does not have corporation ${corporationName}`);
    }
    return corporation;
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

  public getSelfReplicatingRobotsTargetCards(): Array<RobotCard> {
    return (<SelfReplicatingRobots> this.playedCards.find((card) => card instanceof SelfReplicatingRobots))?.targetCards ?? [];
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
    const raiseRating = () => {
      this.terraformRating += steps;
      this.hasIncreasedTerraformRatingThisGeneration = true;

      if (opts.log === true) {
        this.game.log('${0} gained ${1} TR', (b) => b.player(this).number(steps));
      }
      this.game.getPlayersInGenerationOrder().forEach((player) => {
        player.corporations.forEach((corp) => {
          corp.onIncreaseTerraformRating?.(this, player, steps);
        });
        player.playedCards.filter((card: IProjectCard) => card.type === CardType.CEO).forEach((ceo) => {
          ceo.onIncreaseTerraformRating?.(this, player, steps);
        });
      });
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

  public logUnitDelta(
    resource: Resource,
    amount: number,
    unitType: 'production' | 'amount',
    from: ResourceSource | undefined,
    stealing = false,
  ) {
    if (amount === 0) {
      // Logging zero units doesn't seem to happen
      return;
    }

    const modifier = amount > 0 ? 'increased' : 'decreased';
    const absAmount = Math.abs(amount);
    let message = '${0}\'s ${1} ' + unitType + ' ${2} by ${3}';

    if (from !== undefined) {
      if (stealing === true) {
        message = message + ' stolen';
      }
      message = message + ' by ${4}';
    }

    this.game.log(message, (b) => {
      b.player(this)
        .string(resource)
        .string(modifier)
        .number(absAmount);
      if (isIPlayer(from)) {
        b.player(from);
      } else if (typeof(from) === 'object') {
        b.cardName(from.name);
      } else if (typeof(from) === 'string') {
        b.globalEventName(from);
      }
    });
  }

  public getActionsThisGeneration(): Set<CardName> {
    return this.actionsThisGeneration;
  }

  public addActionThisGeneration(cardName: CardName): void {
    this.actionsThisGeneration.add(cardName);
    return;
  }

  public getVictoryPoints(): IVictoryPointsBreakdown {
    return calculateVictoryPoints(this);
  }

  public cardIsInEffect(cardName: CardName): boolean {
    return this.playedCards.some(
      (playedCard) => playedCard.name === cardName);
  }

  public hasProtectedHabitats(): boolean {
    return this.cardIsInEffect(CardName.PROTECTED_HABITATS);
  }

  public plantsAreProtected(): boolean {
    return this.hasProtectedHabitats() || this.cardIsInEffect(CardName.ASTEROID_DEFLECTION_SYSTEM);
  }

  public alloysAreProtected(): boolean {
    return this.cardIsInEffect(CardName.LUNAR_SECURITY_STATIONS);
  }

  public canHaveProductionReduced(resource: Resource, minQuantity: number, attacker: IPlayer) {
    const reducable = this.production[resource] + (resource === Resource.MEGACREDITS ? 5 : 0);
    if (reducable < minQuantity) return false;

    if (resource === Resource.STEEL || resource === Resource.TITANIUM) {
      if (this.alloysAreProtected()) return false;
    }

    // The pathfindersExpansion test is just an optimization for non-Pathfinders games.
    if (this.game.gameOptions.pathfindersExpansion && this.productionIsProtected(attacker)) return false;
    return true;
  }


  public maybeBlockAttack(perpetrator: IPlayer, cb: (proceed: boolean) => PlayerInput | undefined): void {
    this.defer(UnderworldExpansion.maybeBlockAttack(this, perpetrator, cb));
  }

  public productionIsProtected(attacker: IPlayer): boolean {
    return attacker !== this && this.cardIsInEffect(CardName.PRIVATE_SECURITY);
  }

  public resolveInsurance() {
  // game.monsInsuranceOwner could be eliminated entirely if there
  // was a fast version of getCardPlayer().
  // I mean, it could be eliminated now, but getCardPlayer is expensive, and
  // checking for who is Mons Insurance is called often even when the card
  // is out of play.
    const game = this.game;
    if (game.monsInsuranceOwner !== undefined && game.monsInsuranceOwner !== this) {
      const monsInsuranceOwner = game.monsInsuranceOwner;
      const monsInsurance = <MonsInsurance> monsInsuranceOwner.getCorporationOrThrow(CardName.MONS_INSURANCE);
      monsInsurance.payDebt(monsInsuranceOwner, this);
    }
  }

  public resolveInsuranceInSoloGame() {
    const monsInsurance = <MonsInsurance> this.getCorporation(CardName.MONS_INSURANCE);
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

  /*
   * When playing Pharmacy Union, if the card is discarded, then it sits in the event pile.
   * That's why it's included below. The FAQ describes how this applies to things like the
   * Legend Milestone, Media Archives, and NOT Media Group.
   */
  public getPlayedEventsCount(): number {
    let count = this.playedCards.filter((card) => card.type === CardType.EVENT).length;
    if (this.getCorporation(CardName.PHARMACY_UNION)?.isDisabled) count++;

    return count;
  }

  // 获取全球参数适应调整值   如：  +-2科技
  public getGlobalParameterRequirementBonus(parameter: GlobalParameter): number {
    let requirementsBonus = 0;
    for (const card of this.tableau) {
      requirementsBonus += card.getGlobalParameterRequirementBonus(this, parameter);
    }

    // PoliticalAgendas Scientists P2 hook
    if (PartyHooks.shouldApplyPolicy(this, PartyName.SCIENTISTS, 'sp02')) {
      requirementsBonus += 2;
    }

    return requirementsBonus;
  }
  private generateId(): string {
    let id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
    while (id.length < 12) {
      id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
    }
    return id;
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
    }
  }

  public addResourceTo(card: ICard, options: number | {qty?: number, log: boolean, logZero?: boolean} = 1): void {
    const count = typeof(options) === 'number' ? options : (options.qty ?? 1);

    if (card.resourceCount !== undefined) {
      card.resourceCount += count;
    }

    // _Celestic_ hook
    if (card.resourceType === CardResource.FLOATER && this.isCorporation(CardName._CELESTIC_)) {
      this.megaCredits += count;
    }
    // _Arklight_ hook
    if (card.resourceType === CardResource.ANIMAL && this.isCorporation(CardName._ARKLIGHT_)) {
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
    for (const playedCard of this.tableau) {
      if (isIActionCard(playedCard) && !this.actionsThisGeneration.has(playedCard.name) && !isCeoCard(playedCard) && playedCard.canAct(this)) {
        result.push(playedCard);
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

    // AntiGravityExperiment Hook
    this.playedCards.forEach((card) => {
      if (card.name === CardName.ANTI_GRAVITY_EXPERIMENT) {
        (card as AntiGravityExperiment).isDisabled = true;
      }
    });


    this.turmoilPolicyActionUsed = false;
    this.politicalAgendasActionUsedCount = 0;

    if (this.cardIsInEffect(CardName.SUPERCAPACITORS)) {
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

    this.tableau.forEach((card) => card.onProductionPhase?.(this));
    // Turn off CEO OPG actions that were activated this generation
    for (const card of this.playedCards) {
      if (isCeoCard(card)) {
        card.opgActionIsActive = false;
      }
    }
  }

  private doneWorldGovernmentTerraforming(): void {
    this.game.deferredActions.runAll(() => this.game.doneWorldGovernmentTerraforming());
  }

  public worldGovernmentTerraforming(): void {
    const action = new OrOptions();
    action.title = 'Select action for World Government Terraforming';
    action.buttonLabel = 'Confirm';
    const game = this.game;
    if (game.getTemperature() < constants.MAX_TEMPERATURE) {
      action.options.push(
        new SelectOption('Increase temperature', 'Increase').andThen(() => {
          game.increaseTemperature(this, 1);
          game.log('${0} acted as World Government and increased temperature', (b) => b.player(this));
          return undefined;
        }),
      );
    }
    if (game.getOxygenLevel() < constants.MAX_OXYGEN_LEVEL) {
      action.options.push(
        new SelectOption('Increase oxygen', 'Increase').andThen(() => {
          game.increaseOxygenLevel(this, 1);
          game.log('${0} acted as World Government and increased oxygen level', (b) => b.player(this));
          return undefined;
        }),
      );
    }
    if (game.canAddOcean()) {
      action.options.push(
        new SelectSpace('Add an ocean', game.board.getAvailableSpacesForOcean(this))
          .andThen((space) => {
            game.addOcean(this, space);
            game.log('${0} acted as World Government and placed an ocean', (b) => b.player(this));
            return undefined;
          }),
      );
    }
    if (game.getVenusScaleLevel() < constants.MAX_VENUS_SCALE && game.gameOptions.venusNextExtension) {
      action.options.push(
        new SelectOption('Increase Venus scale', 'Increase').andThen(() => {
          game.increaseVenusScaleLevel(this, 1);
          game.log('${0} acted as World Government and increased Venus scale', (b) => b.player(this));
          return undefined;
        }),
      );
    }

    MoonExpansion.ifMoon(game, (moonData) => {
      if (game !== undefined) {
        // 月球扩不配提世界政府
        return;
      }
      if (moonData.habitatRate < constants.MAXIMUM_HABITAT_RATE) {
        action.options.push(
          new SelectOption('Increase the Moon habitat rate', 'Increase').andThen(() => {
            MoonExpansion.raiseHabitatRate(this, 1);
            return undefined;
          }),
        );
      }

      if (moonData.miningRate < constants.MAXIMUM_MINING_RATE) {
        action.options.push(
          new SelectOption('Increase the Moon mining rate', 'Increase').andThen(() => {
            MoonExpansion.raiseMiningRate(this, 1);
            return undefined;
          }),
        );
      }

      if (moonData.logisticRate < constants.MAXIMUM_LOGISTICS_RATE) {
        action.options.push(
          new SelectOption('Increase the Moon logistics rate', 'Increase').andThen(() => {
            MoonExpansion.raiseLogisticRate(this, 1);
            return undefined;
          }),
        );
      }
    });

    this.setWaitingFor(action, () => {
      this.doneWorldGovernmentTerraforming();
    });
  }

  public dealForDraft(quantity: number, cards: Array<ICard>): void {
    cards.push(...this.game.projectDeck.drawN(this.game, quantity, 'bottom'));
  }

  /**
   * Ask the player to draft from a set of cards.
   *
   * @param initialDraft when true, this is part of the first generation draft.
   * @param passTo  The player _this_ player passes remaining cards to.
   * @param passedCards The cards received from the draw, or from the prior player. If empty, it's the first
   *   step in the draft, and cards have to be dealt.
   */
  public askPlayerToDraft(initialDraft: boolean, passTo: IPlayer, passedCards?: Array<IProjectCard | ICorporationCard>): void {
    let cardsToDraw = 4;
    let cardsToKeep = 1;

    let cards: Array<IProjectCard | ICorporationCard> = [];
    if (passedCards === undefined) {
      if (initialDraft) {
        cardsToDraw = 5;
      } else {
        if (LunaProjectOffice.isActive(this) || this.isCorporation(CardName._TERRALABS_RESEARCH_)) {
          cardsToDraw = 5;
          cardsToKeep = 2;
        }
        if (this.isCorporation(CardName.MARS_MATHS)) {
          cardsToDraw = 5;
          cardsToKeep = 2;
        }
      }
      this.dealForDraft(cardsToDraw, cards);
    } else {
      cards = passedCards;
    }
    const messageTitle = cardsToKeep === 1 ?
      'Select a card to keep and pass the rest to ${0}' :
      'Select two cards to keep and pass the rest to ${0}';
    this.setWaitingFor(
      new SelectCard(
        message(messageTitle, (b) => b.player(passTo)),
        'Keep',
        cards,
        {min: cardsToKeep, max: cardsToKeep, played: false})
        .andThen((selected: (Array<IProjectCard |ICorporationCard>)) => {
          this.draftedCards.push(selected[0]);
          cards = cards.filter((card) => card !== selected[0]);
          if (cardsToKeep === 2) {
            this.draftedCards.push(selected[1]);
            cards = cards.filter((card) => card !== selected[1]);
          }
          this.game.playerIsFinishedWithDraftingPhase(initialDraft, this, cards);
          return undefined;
        }),
    );
  }

  /**
   * @return {number} the number of avaialble megacredits. Which is just a shorthand for megacredits,
   * plus any units of heat available thanks to Helion (and Stormcraft, by proxy).
   */
  public spendableMegacredits(): number {
    let total = this.megaCredits;
    if (this.canUseHeatAsMegaCredits) total += this.availableHeat();
    if (this.canUseTitaniumAsMegacredits) total += this.titanium * (this.titaniumValue - 1);
    return total;
  }

  // draftVariant 决定是买轮抽好的牌， 还是从牌库发牌，如果有轮抽阶段，就是在轮抽阶段已经发好牌了
  public runResearchPhase(draftVariant: boolean): void {
    let dealtCards: Array<IProjectCard> = [];
    if (draftVariant) {
      dealtCards = this.draftedCards as Array<IProjectCard>;
      this.draftedCards = [];
    } else {
      let cardsToDraw = 4;
      if (this.isCorporation(CardName.MARS_MATHS)) {
        cardsToDraw = 5;
      }
      if ((LunaProjectOffice.isActive(this) || this.isCorporation(CardName._TERRALABS_RESEARCH_))) {
        cardsToDraw = 5;
      }
      this.dealForDraft(cardsToDraw, dealtCards);
    }

    let cardsToKeep = 4;
    if (LunaProjectOffice.isActive(this) || this.isCorporation(CardName._TERRALABS_RESEARCH_)) {
      // If Luna Project is active, they get to keep the 5 cards they drafted
      cardsToKeep = 5;
    }

    // TODO(kberg): Using .execute to rely on directly calling setWaitingFor is not great.
    const action = new ChooseCards(this, dealtCards, {paying: true, keepMax: cardsToKeep}).execute();
    this.setWaitingFor(action, () => this.game.playerIsFinishedWithResearchPhase(this));
  }

  public getCardCost(card: IProjectCard): number {
    let cost = card.cost;
    cost -= this.colonies.cardDiscount;

    this.tableau.forEach((playedCard) => {
      cost -= playedCard.getCardDiscount?.(this, card) ?? 0;
    });

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
      plants: card.tags.includes(Tag.BUILDING) && this.cardIsInEffect(CardName.MARTIAN_LUMBER_CORP),
      titanium: this.lastCardPlayed === CardName.LAST_RESORT_INGENUITY || card.tags.includes(Tag.SPACE),
      lunaTradeFederationTitanium: this.canUseTitaniumAsMegacredits,
      seeds: card.tags.includes(Tag.PLANT) || card.name === CardName.GREENERY_STANDARD_PROJECT,
      floaters: card.tags.includes(Tag.VENUS),
      microbes: card.tags.includes(Tag.PLANT),
      lunaArchivesScience: card.tags.includes(Tag.MOON),
      // TODO(kberg): add this.isCorporation(CardName.SPIRE)
      spireScience: card.type === CardType.STANDARD_PROJECT,
      // TODO(kberg): add this.isCorporation(CardName.AURORAI)
      auroraiData: card.type === CardType.STANDARD_PROJECT,
      graphene: card.tags.includes(Tag.CITY) || card.tags.includes(Tag.SPACE),
      kuiperAsteroids: card.name === CardName.AQUIFER_STANDARD_PROJECT || card.name === CardName.ASTEROID_STANDARD_PROJECT,
      corruption: card.tags.includes(Tag.EARTH) && this.cardIsInEffect(CardName.FRIENDS_IN_HIGH_PLACES),
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
    const card = this.tableau.find((card) => card.name === name);
    return card?.resourceCount ?? 0;
  }

  public getSpendable(SpendableResource: SpendableCardResource): number {
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
      const card = this.tableau.find((card) => card.name === name);
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
    if (payment.corruption > 0) {
      UnderworldExpansion.loseCorruption(this, payment.corruption);
    }

    if (payment.megaCredits > 0 || payment.steel > 0 || payment.titanium > 0) {
      PathfindersExpansion.addToSolBank(this);
    }
  }

  public playCard(selectedCard: IProjectCard, payment?: Payment, cardAction: CardAction = 'add'): void {
    ColoniesHandler.onCardPlayed(this.game, selectedCard);

    if (selectedCard.type !== CardType.PROXY) {
      this.lastCardPlayed = selectedCard.name;
      this.game.log('${0} played ${1}', (b) => b.player(this).card(selectedCard));
    }

    // Play the card
    const action = selectedCard.play(this);
    this.defer(action, Priority.DEFAULT);

    if (payment !== undefined) {
      this.pay(payment);

      // 连月的逻辑
      // 获取支付费用,作为一个全局变量储存起来,也需要序列化
      if (this.isCorporation(CardName.LUNA_CHAIN)) {
        const lunaChain = this.getCorporation(CardName.LUNA_CHAIN) as LunaChain;
        // console.log('连月的逻辑', payment.megaCredits, lunaChain.lastPay);
        if (payment.megaCredits === lunaChain.lastPay) {
          this.stock.add(Resource.MEGACREDITS, 3, {log: true});
        } else {
          lunaChain.lastPay = payment.megaCredits;
        }
        this.game.log('${0} now need to pay ${1} to trigger this effect', (b) => b.player(this).number(payment.megaCredits));
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

      // Remove card from Self Replicating Robots
      const card = this.playedCards.find((card) => card.name === CardName.SELF_REPLICATING_ROBOTS);
      if (card instanceof SelfReplicatingRobots) {
        for (const targetCard of card.targetCards) {
          if (targetCard.card.name === selectedCard.name) {
            const index = card.targetCards.indexOf(targetCard);
            card.targetCards.splice(index, 1);
          }
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
    case 'action-only':
      break;
    }

    // See DeclareCloneTag for why this skips cards with clone tags.
    if (!selectedCard.tags.includes(Tag.CLONE) && cardAction !== 'action-only') {
      this.onCardPlayed(selectedCard);
    }

    return undefined;
  }

  private triggerOtherCorpEffects(playedCorporationCard: ICorporationCard) {
    // trigger other corp's effects, e.g. SaturnSystems, PharmacyUnion, Splice
    for (const somePlayer of this.game.getPlayers()) {
      for (const corporation of somePlayer.corporations) {
        if (somePlayer === this && corporation.name === playedCorporationCard.name) {
          continue;
        }
        if (corporation.onCorpCardPlayed === undefined) {
          continue;
        }
        this.defer(corporation.onCorpCardPlayed(this, playedCorporationCard, somePlayer));
      }
    }
  }

  public onCardPlayed(card: IProjectCard) {
    if (card.type === CardType.PROXY) {
      return;
    }
    for (const playedCard of this.playedCards) {
      /* A player responding to their own cards played. */
      const actionFromPlayedCard = playedCard.onCardPlayed?.(this, card);
      this.defer(actionFromPlayedCard);
    }

    TurmoilHandler.applyOnCardPlayedEffect(this, card);

    /* A player responding to any other player's card played, for corp effects. */
    for (const somePlayer of this.game.getPlayersInGenerationOrder()) {
      for (const corporationCard of somePlayer.corporations) {
        const actionFromPlayedCard = corporationCard.onCardPlayed?.(this, card);
        this.defer(actionFromPlayedCard);
      }
      for (const someCard of somePlayer.playedCards) {
        const actionFromPlayedCard = someCard.onCardPlayedFromAnyPlayer?.(somePlayer, this, card);
        this.defer(actionFromPlayedCard);
      }
    }

    PathfindersExpansion.onCardPlayed(this, card);
  }

  /* Visible for testing */
  public playActionCard(): PlayerInput {
    const isvip = GameLoader.getUserByPlayer(this)?.isvip() || 0;
    const cards = this.getPlayableActionCards();
    const max = isvip > 0 && this.game.getPlayers().length === 1 ? cards.length : 1;
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

  public playAdditionalCorporationCard(corporationCard: ICorporationCard): void {
    if (this.corporations.length === 0) {
      throw new Error('Cannot add additional corporation when it does not have a starting corporation.');
    }
    return this._playCorporationCard(corporationCard, true);
  }

  public playCorporationCard(corporationCard: ICorporationCard): void {
    if (this.corporations.length > 0) {
      throw new Error('Cannot add additional corporation without specifying it explicitly.');
    }
    return this._playCorporationCard(corporationCard, false);
  }

  private _playCorporationCard(corporationCard: ICorporationCard, additionalCorp = false): void {
    this.corporations.push(corporationCard);

    // There is a simpler way to deal with this block, but I'd rather not deal with the fallout of getting it wrong.
    if (additionalCorp) {
      this.megaCredits += corporationCard.startingMegaCredits;
      this.cardCost = Merger.setCardCost(this);
    } else {
      this.megaCredits = corporationCard.startingMegaCredits;
      if (corporationCard.cardCost !== undefined) {
        this.cardCost = corporationCard.cardCost;
      }
    }

    if (additionalCorp === false && corporationCard.name !== CardName.BEGINNER_CORPORATION) {
      const diff = this.cardsInHand.length * this.cardCost;
      this.stock.deduct(Resource.MEGACREDITS, diff);
    }
    this.game.log('${0} played ${1}', (b) => b.player(this).card(corporationCard));
    // Calculating this before playing the corporation card, which might change the player's hand size.
    const numberOfCardInHand = this.cardsInHand.length;
    corporationCard.play(this);
    if (corporationCard.initialAction !== undefined || corporationCard.firstAction !== undefined) {
      this.pendingInitialActions.push(corporationCard);
    }
    if (additionalCorp === false) {
      this.game.log('${0} kept ${1} project cards', (b) => b.player(this).number(numberOfCardInHand));
    }

    this.triggerOtherCorpEffects(corporationCard);
    ColoniesHandler.onCardPlayed(this.game, corporationCard);
    PathfindersExpansion.onCardPlayed(this, corporationCard);

    if (!additionalCorp) {
      this.game.playerIsFinishedWithResearchPhase(this);
    }
  }

  public drawCard(count?: number, options?: DrawOptions): undefined {
    return DrawCards.keepAll(this, count, options).execute();
  }

  public drawCardKeepSome(count: number, options: AllOptions): void {
    this.game.defer(DrawCards.keepSome(this, count, options));
  }

  public discardPlayedCard(card: IProjectCard) {
    const found = inplaceRemove(this.playedCards, card);
    if (found === false) {
      console.error(`Error: card ${card.name} not in ${this.id}'s hand`);
      return;
    }
    this.game.projectDeck.discard(card);
    card.onDiscard?.(this);
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
    let floaters = this.getCorporation(CardName.STORMCRAFT_INCORPORATED)?.resourceCount ?? 0;
    floaters += this.getCorporation(CardName._STORMCRAFT_INCORPORATED_)?.resourceCount ?? 0;
    return this.heat + (floaters * 2);
  }

  public spendHeat(amount: number, cb: () => (undefined | PlayerInput) = () => undefined) : PlayerInput | undefined {
    const stormcraft = <StormCraftIncorporated> (this.getCorporation(CardName.STORMCRAFT_INCORPORATED) || this.getCorporation(CardName._STORMCRAFT_INCORPORATED_) );
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
    if ((this.canAfford(this.milestoneCost()) || this.cardIsInEffect(CardName.VANALLEN))) {
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
      vanAllen.stock.add(Resource.MEGACREDITS, 3, {log: true, from: this});
    }
    if (!this.cardIsInEffect(CardName.VANALLEN)) { // Why isn't this an else clause to the statement above?
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
    const stagedProtests = owner.playedCards.find((card) => card.name === CardName.STAGED_PROTESTS);
    return stagedProtests?.generationUsed === this.game.generation;
  }

  private milestoneCost() {
    if (this.isCorporation(CardName.NIRGAL_ENTERPRISES)) {
      return 0;
    }
    return this.isStagedProtestsActive() ? MILESTONE_COST + 8 : MILESTONE_COST;
  }

  // Public for tests.
  public awardFundingCost() {
    if (this.isCorporation(CardName.NIRGAL_ENTERPRISES)) {
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
      const action = new OrOptions();
      action.title = 'Place any final greenery from plants';
      action.buttonLabel = 'Confirm';
      action.options.push(
        new SelectSpace(
          'Select space for greenery tile',
          this.game.board.getAvailableSpacesForGreenery(this))
          .andThen((space) => {
            // Do not raise oxygen or award TR for final greenery placements
            this.game.addGreenery(this, space, false);
            this.stock.deduct(Resource.PLANTS, this.plantsNeededForGreenery);

            this.takeActionForFinalGreenery();

            // Resolve Philares deferred actions
            if (this.game.deferredActions.length > 0) resolveFinalGreeneryDeferredActions();
            return undefined;
          }));
      action.options.push(
        new SelectOption('Don\'t place a greenery').andThen(() => {
          this.game.playerIsDoneWithGame(this);
          return undefined;
        }),
      );
      this.setWaitingForSafely(action);
      return;
    }

    if (this.game.deferredActions.length > 0) {
      resolveFinalGreeneryDeferredActions();
    } else {
      this.game.playerIsDoneWithGame(this);
    }
  }

  private getPlayableCeoCards(): Array<IProjectCard> {
    return this.ceoCardsInHand.filter((card) => card.canPlay?.(this) === true);
  }

  public getPlayableCards(): Array<PlayableCard> {
    const candidateCards: Array<IProjectCard> = [...this.cardsInHand];
    // Self Replicating robots check
    const card = this.playedCards.find((card) => card.name === CardName.SELF_REPLICATING_ROBOTS);
    if (card instanceof SelfReplicatingRobots) {
      for (const targetCard of card.targetCards) {
        candidateCards.push(targetCard.card);
      }
    }

    const playableCards: Array<PlayableCard> = [];
    for (const card of candidateCards) {
      card.warnings.clear();
      const canPlay = this.canPlay(card);
      if (canPlay !== false) {
        playableCards.push({
          card,
          details: canPlay,
        });
      }
    }
    return playableCards;
  }

  public affordOptionsForCard(card: IProjectCard): CanAffordOptions {
    let trSource: TRSource | undefined = undefined;
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
    const cost = this.getCardCost(card);
    const paymentOptionsForCard = this.paymentOptionsForCard(card);
    return {
      cost,
      ...paymentOptionsForCard,
      reserveUnits: MoonExpansion.adjustedReserveCosts(this, card),
      tr: trSource,
    };
  }

  public canPlay(card: IProjectCard): boolean | YesAnd {
    const options = this.affordOptionsForCard(card);
    const canAfford = this.newCanAfford(options);
    if (!canAfford.canAfford) {
      return false;
    }
    const canPlay = card.canPlay(this, options);
    if (canPlay === false) {
      return false;
    }
    if (canAfford.redsCost > 0) {
      if (typeof canPlay === 'boolean') {
        return {redsCost: canAfford.redsCost};
      } else {
        return {...canPlay, redsCost: canAfford.redsCost};
      }
    }
    return canPlay;
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
      corruption: this.underworldData.corruption,
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
   * @param {Payment} payment the resources being paid.
   * @param {PaymentOptions} options any configuration defining the accepted form of payment.
   * @return {number} a number representing the value of payment in M€.
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
      corruption: options?.corruption ?? false,
    };

    // HOOK: Luna Trade Federation
    if (usable.titanium === false && payment.titanium > 0 && this.isCorporation(CardName.LUNA_TRADE_FEDERATION)) {
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
  public newCanAfford(o: number | CanAffordOptions): {redsCost: number, canAfford: boolean} {
    const options: CanAffordOptions = typeof(o) === 'number' ? {cost: o} : {...o};

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
    return this.newCanAfford(o).canAfford;
  }

  private getStandardProjects(): Array<IStandardProjectCard> {
    const gameOptions = this.game.gameOptions;
    return new GameCards(gameOptions)
      .getStandardProjects()
      .filter((card) => {
        switch (card.name) {
        // sell patents is not displayed as a card
        case CardName.SELL_PATENTS_STANDARD_PROJECT:
          return false;
        // For buffer gas, show ONLY IF in solo AND 63TR mode
        case CardName.BUFFER_GAS_STANDARD_PROJECT:
          return this.game.isSoloMode() && gameOptions.soloTR;
        case CardName.AIR_SCRAPPING_STANDARD_PROJECT:
          return gameOptions.altVenusBoard === false;
        case CardName.AIR_SCRAPPING_STANDARD_PROJECT_VARIANT:
          return gameOptions.altVenusBoard === true;
        case CardName.MOON_HABITAT_STANDARD_PROJECT_V2:
        case CardName.MOON_MINE_STANDARD_PROJECT_V2:
        case CardName.MOON_ROAD_STANDARD_PROJECT_V2:
          return gameOptions.moonStandardProjectVariant === true;
        case CardName.EXCAVATE_STANDARD_PROJECT:
          return gameOptions.underworldExpansion === true;
        case CardName.COLLUSION_STANDARD_PROJECT:
          return gameOptions.underworldExpansion === true && gameOptions.turmoilExtension === true;
        default:
          return true;
        }
      })
      .sort((a, b) => a.cost - b.cost);
  }

  public getStandardProjectOption(): SelectCard<IStandardProjectCard> {
    const standardProjects: Array<IStandardProjectCard> = this.getStandardProjects();

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
          return new SelectAmount(card[0].name, 'Save', 0, Math.floor(this.megaCredits / 9)).andThen((amount: number) => {
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
    if (this.game.phase === Phase.PRELUDES && this.cardIsInEffect(CardName.HEAD_START)) {
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
   * @param {boolean} saveBeforeTakingAction when true, the game state is saved. Default is `true`. This
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

    const headStartIsInEffect = this.headStartIsInEffect();

    if (!headStartIsInEffect) {
      // Prelude cards have to be played first
      if (this.preludeCardsInHand.length > 0) {
        game.phase = Phase.PRELUDES;

        const selectPrelude = PreludesExpansion.playPrelude(this, this.preludeCardsInHand);

        this.setWaitingFor(selectPrelude, () => {
          if (this.preludeCardsInHand.length === 0 && !this.headStartIsInEffect()) {
            game.playerIsFinishedTakingActions();
            return;
          }

          this.takeAction();
        });
        return;
      }

      if (this.ceoCardsInHand.length > 0) {
        // The CEO phase occurs between the Prelude phase and before the Action phase.
        // All CEO cards are played before players take their first normal actions.
        game.phase = Phase.CEOS;
        const playableCeoCards = this.getPlayableCeoCards();
        for (let i = playableCeoCards.length - 1; i >= 0; i--) {
          // start from the end of the list and work backwards, we're removing items as we go.
          const card = this.ceoCardsInHand[i];
          this.playCard(card);
        }
        // Null out ceoCardsInHand, anything left was unplayable.
        this.ceoCardsInHand = [];
        this.takeAction(); // back to top
        return;
      } else if (game.phase === Phase.PRELUDES || game.phase === Phase.CEOS) {
        game.phase = Phase.ACTION;
      }

      if (game.hasPassedThisActionPhase(this) || this.actionsTakenThisRound >= this.availableActionsThisRound + 1 || (game.getPlayers().length === 1 && this.actionsTakenThisRound >= this.availableActionsThisRound)) {
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
    const vitor = this.getCorporation(CardName.VITOR);
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

            this.deferInitialAction(corp);
            this.pendingInitialActions.splice(this.pendingInitialActions.indexOf(corp), 1);
            return undefined;
          });
        orOptions.options.push(option);
      });


      this.setWaitingFor(orOptions, () => {
        this.incrementActionsTaken();
        this.timer.rebate(constants.BONUS_SECONDS_PER_ACTION * 1000);
        this.takeAction();
      });
      return;
    }

    this.setWaitingFor(this.getActions(), () => {
      this.incrementActionsTaken();
      this.takeAction();
    });
  }

  // TODO(kberg): perhaps move to Card
  public deferInitialAction(corp: ICorporationCard) {
    this.defer(() => {
      if (corp.initialAction) {
        return corp.initialAction(this);
      } else if (corp.firstAction !== undefined) {
        getBehaviorExecutor().execute(corp.firstAction, this, corp);
      }
      return undefined;
    });
  }

  private incrementActionsTaken(): void {
    this.actionsTakenThisRound++;
    this.actionsTakenThisGame++;
  }

  // Return possible mid-game actions like play a card and fund an award, but not play prelude card.
  public getActions() {
    const action = new OrOptions();
    action.id = this.generateId();
    action.title = this.actionsTakenThisRound === 0 ?
      'Take your first action' : 'Take your next action';
    action.buttonLabel = 'Take action';

    // 单人的时候 第二动就不显示撤回了
    if (this.actionsTakenThisRound >= this.availableActionsThisRound && this.game.getPlayers().length > 1 ) {
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
    for (const somePlayer of this.game.getPlayers()) {
      const chaosCorp = somePlayer.getCorporation(CardName.CHAOS);
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
        const wildtags = [];
        for (let index = 0; index < bonus; index++) {
          wildtags.push(Tag.WILD);
        }
        chaosCorp.tags = wildtags;
      }
    }

    // VanAllen can claim milestones for free:
    const claimableMilestones = this.claimableMilestones();
    if (claimableMilestones.length > 0) {
      const milestoneOption = new OrOptions();
      milestoneOption.title = 'Claim a milestone';
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
    const brotherhood = this.getCorporation(CardName.BROTHERHOOD_OF_MUTANTS);
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

    const turmoilInput = TurmoilHandler.partyAction(this);
    if (turmoilInput !== undefined) {
      action.options.push(turmoilInput);
    }

    if (this.getPlayableActionCards().length > 0) {
      action.options.push(this.playActionCard());
    }

    if (CeoExtension.ceoActionIsUsable(this)) {
      action.options.push(this.playCeoOPGAction());
    }

    const playableCards = this.getPlayableCards();
    if (playableCards.length !== 0) {
      action.options.push(new SelectProjectCardToPlay(this, playableCards));
    }

    const coloniesTradeAction = this.colonies.coloniesTradeAction();
    if (coloniesTradeAction !== undefined) {
      action.options.push(coloniesTradeAction);
    }

    // If you can pay to add a delegate to a party.
    TurmoilUtil.ifTurmoil(this.game, (turmoil) => {
      const input = turmoil.getSendDelegateInput(this);
      if (input !== undefined) {
        action.options.push(input);
      }
    });

    if (this.game.getPlayers().length > 1 &&
      this.actionsTakenThisRound > 0 &&
      !this.game.gameOptions.fastModeOption &&
      this.allOtherPlayersHavePassed() === false) {
      action.options.push(this.endTurnOption());
    }

    const fundingCost = this.awardFundingCost();
    if (this.canAfford(fundingCost) && !this.game.allAwardsFunded()) {
      const remainingAwards = new OrOptions();
      remainingAwards.title = message('Fund an award (${0} M€)', (b) => b.number(fundingCost)),
      remainingAwards.buttonLabel = 'Confirm';
      remainingAwards.options = this.game.awards
        .filter((award: IAward) => this.game.hasBeenFunded(award) === false)
        .map((award: IAward) => this.fundAward(award));
      action.options.push(remainingAwards);
    }

    action.options.push(this.getStandardProjectOption());

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
    const players = game.getPlayers();
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
    if (this.waitingFor !== undefined) {
      const message = 'Overwriting a waitingFor: ' + this.waitingFor.type + ' id:' + this.id;
      console.warn(message, this.waitingFor, input);
      if (THROW_WAITING_FOR) {
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


  // This was only built for the Philares/Final Greenery case. Might not work elsewhere.
  public setWaitingForSafely(input: PlayerInput, cb: () => void = () => {}): void {
    if (this.waitingFor === undefined) {
      this.setWaitingFor(input, cb);
    } else {
      const oldcb = this.waitingForCb;
      this.waitingForCb =
        oldcb === undefined ?
          cb :
          () => {
            oldcb();
            this.setWaitingForSafely(input, cb);
          };
    }
  }

  // 体退新增规则：如果是排名模式，则必须玩家人数为2才行
  public canExitFun(game:Game):boolean {
    return this.canExit && game.phase === Phase.ACTION && game.activePlayer === this && game.getPlayers().length > 1 && (!game.isRankMode() || game.getPlayers().length === 2);
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
      corporations: this.corporations.map((corporation) => {
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
      canUsePlantsAsMegaCredits: this.canUsePlantsAsMegacredits,
      // Luna Trade Federation
      canUseTitaniumAsMegacredits: this.canUseTitaniumAsMegacredits,
      // This generation / this round
      canUseCorruptionAsMegacredits: this.canUseCorruptionAsMegacredits,
      // This generation / this round
      actionsTakenThisRound: this.actionsTakenThisRound,
      actionsThisGeneration: Array.from(this.actionsThisGeneration),
      pendingInitialActions: this.pendingInitialActions.map((c) => c.name),
      // Cards
      dealtCorporationCards: this.dealtCorporationCards.map(serializedCardName),
      dealtPreludeCards: this.dealtPreludeCards.map(serializedCardName),
      dealtCeoCards: this.dealtCeoCards.map((c) => c.name),
      dealtProjectCards: this.dealtProjectCards.map(serializedCardName),
      cardsInHand: this.cardsInHand.map(serializedCardName),
      preludeCardsInHand: this.preludeCardsInHand.map(serializedCardName),
      ceoCardsInHand: this.ceoCardsInHand.map((c) => c.name),
      draftedCards: this.draftedCards.map(serializedCardName),
      playedCards: this.playedCards.map(serializePlayedCard),
      cardCost: this.cardCost,
      cardDiscount: this.colonies.cardDiscount,
      // Colonies
      // TODO(kberg): consider a ColoniesSerializer or something.
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
      scienceTagCount: this.scienceTagCount,
      // Ecoline
      plantsNeededForGreenery: this.plantsNeededForGreenery,
      // Lawsuit
      removingPlayers: this.removingPlayers,
      // Playwrights
      removedFromPlayCards: this.removedFromPlayCards.map(serializePlayedCard),
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
    };

    return result;
  }

  public static deserialize(d: SerializedPlayer): Player {
    const player = new Player(d.name, d.color, d.beginner, Number(d.handicap), d.id);

    Object.assign(player, d); // 对象属性需要慎重使用，尤其是需要反序列化的， 需要先清空 如 player.corporations
    player.actionsTakenThisGame = player.actionsTakenThisGame ?? 0;
    player.canUsePlantsAsMegacredits = d.canUsePlantsAsMegaCredits;
    player.canUseTitaniumAsMegacredits = d.canUseTitaniumAsMegacredits;
    player.colonies.cardDiscount = d.cardDiscount;
    player.colonies.tradeDiscount = d.colonyTradeDiscount;
    player.colonies.tradeOffset = d.colonyTradeOffset;
    player.colonies.setFleetSize(d.fleetSize);
    player.colonies.victoryPoints = d.colonyVictoryPoints;
    player.victoryPointsByGeneration = d.victoryPointsByGeneration ?? new Array(20).fill(0);


    player.production.override(Units.of({
      energy: d.energyProduction,
      heat: d.heatProduction,
      megacredits: d.megaCreditProduction,
      plants: d.plantProduction,
      steel: d.steelProduction,
      titanium: d.titaniumProduction,
    }));

    player.colonies.tradesThisGeneration = d.tradesThisTurn ?? d.tradesThisGeneration ?? 0;

    player.lastCardPlayed = d.lastCardPlayed !== undefined ?
      ((d.lastCardPlayed as unknown as IProjectCard).name || d.lastCardPlayed ):
      undefined;

    // Rebuild removed from play cards (Playwrights, Odyssey)
    player.removedFromPlayCards = cardsFromJSON(d.removedFromPlayCards.map((x) => x.name));

    player.actionsThisGeneration = new Set<CardName>(d.actionsThisGeneration);

    if (d.pickedCorporationCard !== undefined) {
      player.pickedCorporationCard = newCorporationCard(d.pickedCorporationCard.name);
    }
    if (d.pickedCorporationCard2 !== undefined) {
      player.pickedCorporationCard2 = newCorporationCard(d.pickedCorporationCard2.name);
    }

    // Rebuild corporation card
    const corporations = d.corporations || [];
    if (corporations.length === 0 ) {
      if (d.corpCard !== undefined) {
        corporations.push(d.corpCard);
      }
      if (d.corpCard2 !== undefined) {
        corporations.push(d.corpCard2);
      }
    }
    // This shouldn't happen
    player.corporations = [];
    if (corporations !== undefined) {
      for (const corporation of corporations) {
        const card = newCorporationCard(corporation.name);
        if (card === undefined) {
          continue;
        }
        if (corporation.resourceCount !== undefined) {
          card.resourceCount = corporation.resourceCount;
        }
        if (corporation.data !== undefined) {
          card.data = corporation.data;
        }
        card.deserialize?.(corporation);
        player.corporations.push(card);
      }
    }

    player.pendingInitialActions = [];
    if (d.pendingInitialActions !== undefined) {
      player.pendingInitialActions = player.corporations.filter((card) => {
        return d.pendingInitialActions?.find( (name) => name === card.name) !== undefined;
      });
    } else {
      if (player.corporations[0] !== undefined &&
        player.corporations[0].initialAction !== undefined &&
            d.corpInitialActionDone === false
      ) {
        player.pendingInitialActions.push(player.corporations[0]);
      }
      if (player.corporations[1] !== undefined &&
        player.corporations[1].initialAction !== undefined &&
            d.corp2InitialActionDone === false
      ) {
        player.pendingInitialActions.push(player.corporations[1]);
      }
    }

    player.dealtCorporationCards = corporationCardsFromJSON(d.dealtCorporationCards.map((x) => x.name));
    player.dealtPreludeCards = cardsFromJSON(d.dealtPreludeCards.map((x) => x.name));
    player.dealtCeoCards = ceosFromJSON(d.dealtCeoCards);
    player.dealtProjectCards = cardsFromJSON(d.dealtProjectCards.map((x) => x.name));
    player.cardsInHand = cardsFromJSON(d.cardsInHand.map((x) => x.name));
    player.preludeCardsInHand = cardsFromJSON(d.preludeCardsInHand.map((x) => x.name)) as Array<IPreludeCard>;
    player.ceoCardsInHand = ceosFromJSON(d.ceoCardsInHand);
    player.playedCards = d.playedCards.map((element: SerializedCard) => deserializeProjectCard(element));
    player.draftedCards = cardsFromJSON(d.draftedCards.map((x) => x.name));

    player.timer = Timer.deserialize(d.timer);

    if (d.underworldData !== undefined) {
      player.underworldData = d.underworldData;
    }

    return player;
  }

  public getOpponents(): Array<IPlayer> {
    return this.game.getPlayers().filter((p) => p !== this);
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
    if (this.getUserRank()?.userId === userRank.userId) GameLoader.getInstance().addOrUpdateUserRank(userRank);
  }
}
