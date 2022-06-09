import * as constants from './common/constants';
import {BeginnerCorporation} from './cards/corporation/BeginnerCorporation';
import {Board} from './boards/Board';
import {BoardName} from './common/boards/BoardName';
import {CardFinder} from './CardFinder';
import {CardName} from './common/cards/CardName';
import {CardType} from './common/cards/CardType';
import {ClaimedMilestone, serializeClaimedMilestones, deserializeClaimedMilestones} from './milestones/ClaimedMilestone';
import {IColony} from './colonies/IColony';
import {ColonyDealer, deserializeColonies, serializeColonies, getColonyByName} from './colonies/ColonyDealer';
import {ColonyName} from './common/colonies/ColonyName';
import {Color} from './common/Color';
import {ICorporationCard} from './cards/corporation/ICorporationCard';
import {Database} from './database/Database';
import {Dealer} from './Dealer';
import {ElysiumBoard} from './boards/ElysiumBoard';
import {FundedAward, serializeFundedAwards, deserializeFundedAwards} from './awards/FundedAward';
import {HellasBoard} from './boards/HellasBoard';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';
import {IProjectCard} from './cards/IProjectCard';
import {ISpace} from './boards/ISpace';
import {ITile} from './ITile';
import {LogBuilder} from './LogBuilder';
import {LogHelper} from './LogHelper';
import {LogMessage} from './common/logs/LogMessage';
import {ALL_MILESTONES} from './milestones/Milestones';
import {ALL_AWARDS} from './awards/Awards';
import {OriginalBoard} from './boards/OriginalBoard';
import {PartyHooks} from './turmoil/parties/PartyHooks';
import {Phase} from './common/Phase';
import {Player} from './Player';
import {GameId, SpectatorId, SpaceId} from './common/Types';
import {PlayerInput} from './PlayerInput';
import {ResourceType} from './common/ResourceType';
import {Resources} from './common/Resources';
import {DeferredAction, Priority} from './deferredActions/DeferredAction';
import {DeferredActionsQueue} from './deferredActions/DeferredActionsQueue';
import {SelectHowToPayDeferred} from './deferredActions/SelectHowToPayDeferred';
import {SelectInitialCards} from './inputs/SelectInitialCards';
import {PlaceOceanTile} from './deferredActions/PlaceOceanTile';
import {RemoveColonyFromGame} from './deferredActions/RemoveColonyFromGame';
import {GainResources} from './deferredActions/GainResources';
import {SerializedGame} from './SerializedGame';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {SpaceBonus} from './common/boards/SpaceBonus';
import {SpaceName} from './SpaceName';
import {SpaceType} from './common/boards/SpaceType';
import {Tags} from './common/cards/Tags';
import {TileType} from './common/TileType';
import {Turmoil} from './turmoil/Turmoil';
import {TurmoilUtil} from './turmoil/TurmoilUtil';
import {RandomMAOptionType} from './common/ma/RandomMAOptionType';
import {AresHandler} from './ares/AresHandler';
import {IAresData} from './common/ares/IAresData';
import {getDate} from './UserUtil';
import {BREAKTHROUGH_CARD_MANIFEST} from './cards/breakthrough/BreakthroughCardManifest';
import {AgendaStyle} from './common/turmoil/Types';
import {GameSetup} from './GameSetup';
import {CardLoader} from './CardLoader';
import {GlobalParameter} from './common/GlobalParameter';
import {AresSetup} from './ares/AresSetup';
import {IMoonData} from './moon/IMoonData';
import {MoonExpansion} from './moon/MoonExpansion';
import {TurmoilHandler} from './turmoil/TurmoilHandler';
import {Random} from './Random';
import {Card} from './cards/Card';
import {MilestoneAwardSelector} from './MilestoneAwardSelector';
import {OrOptions} from './inputs/OrOptions';
import {BoardType} from './boards/BoardType';
import {Multiset} from './utils/Multiset';
import {SelectOption} from './inputs/SelectOption';
import {SelectCard} from './inputs/SelectCard';
import {GrantVenusAltTrackBonusDeferred} from './venusNext/GrantVenusAltTrackBonusDeferred';
import {PathfindersExpansion} from './pathfinders/PathfindersExpansion';
import {IPathfindersData} from './pathfinders/IPathfindersData';
import {ArabiaTerraBoard} from './boards/ArabiaTerraBoard';
import {AddResourcesToCard} from './deferredActions/AddResourcesToCard';
import {isProduction} from './utils/server';
import {GlobalEvent} from './turmoil/globalEvents/IGlobalEvent';
import {IShortData} from './database/IDatabase';
import {VastitasBorealisBoard} from './boards/VastitasBorealisBoard';

export enum LoadState {
  HALFLOADED = 'halfloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export interface Score {
  corporation: String;
  corporation2?: String;
  playerScore: number;
  player: String;
  userId: String|undefined;
}

export interface GameOptions {
  boardName: BoardName;
  clonedGamedId: GameId | undefined;

  // Configuration
  undoOption: boolean;
  showTimers: boolean;
  fastModeOption: boolean;
  showOtherPlayersVP: boolean;

  // Extensions
  corporateEra: boolean;
  venusNextExtension: boolean;
  coloniesExtension: boolean;
  preludeExtension: boolean;
  turmoilExtension: boolean;
  promoCardsOption: boolean;
  communityCardsOption: boolean;
  erosCardsOption: boolean;
  aresExtension: boolean;
  aresHazards: boolean;
  politicalAgendasExtension: AgendaStyle;
  solarPhaseOption: boolean;
  removeNegativeGlobalEventsOption: boolean;
  includeVenusMA: boolean;
  moonExpansion: boolean;
  pathfindersExpansion: boolean;

  // Variants
  draftVariant: boolean;
  initialDraftVariant: boolean;
  initialCorpDraftVariant: boolean; // 双公司时初始轮抽公司
  startingCorporations: number;
  shuffleMapOption: boolean;
  randomMA: RandomMAOptionType;
  soloTR: boolean; // Solo victory by getting TR 63 by game end
  customCorporationsList: Array<CardName>;
  cardsBlackList: Array<CardName>;
  customColoniesList: Array<ColonyName>;
  heatFor: boolean; //  七热升温
  breakthrough: boolean;// 界限突破
  doubleCorp: boolean; // 双将
  requiresMoonTrackCompletion: boolean; // Moon must be completed to end the game
  requiresVenusTrackCompletion: boolean; // Venus must be completed to end the game
  moonStandardProjectVariant: boolean;
  altVenusBoard: boolean;
  escapeVelocityMode: boolean;
  escapeVelocityThreshold?: number;
  escapeVelocityPeriod?: number;
  escapeVelocityPenalty?: number;
}

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  altVenusBoard: false,
  aresExtension: false,
  aresHazards: true,
  boardName: BoardName.ORIGINAL,
  cardsBlackList: [],
  clonedGamedId: undefined,
  coloniesExtension: false,
  communityCardsOption: false,
  erosCardsOption: false,
  corporateEra: true,
  customColoniesList: [],
  customCorporationsList: [],
  draftVariant: false,
  escapeVelocityMode: false, // When true, escape velocity is enabled.
  escapeVelocityThreshold: constants.DEFAULT_ESCAPE_VELOCITY_THRESHOLD, // Time in minutes a player has to complete a game.
  escapeVelocityPeriod: constants.DEFAULT_ESCAPE_VELOCITY_PERIOD, // VP a player loses for every `escapeVelocityPenalty` minutes after `escapeVelocityThreshold`.
  escapeVelocityPenalty: constants.DEFAULT_ESCAPE_VELOCITY_PENALTY,
  fastModeOption: false,
  includeVenusMA: true,
  initialDraftVariant: false,
  moonExpansion: false,
  moonStandardProjectVariant: false,
  pathfindersExpansion: false,
  politicalAgendasExtension: AgendaStyle.STANDARD,
  preludeExtension: false,
  promoCardsOption: false,
  randomMA: RandomMAOptionType.NONE,
  requiresMoonTrackCompletion: false,
  removeNegativeGlobalEventsOption: false,
  requiresVenusTrackCompletion: false,
  showOtherPlayersVP: false,
  showTimers: true,
  shuffleMapOption: false,
  solarPhaseOption: false,
  soloTR: false,
  startingCorporations: 2,
  turmoilExtension: false,
  undoOption: false,
  venusNextExtension: false,
  heatFor: false,
  breakthrough: false,
  doubleCorp: false,
  initialCorpDraftVariant: true,
};

export class Game {
  // Game-level data
  public exitedPlayers: Array<Player> = [];// 体退玩家list 必须放在第一位 避免数据库序列化丢失数据
  public loadState : string = LoadState.HALFLOADED;
  public lastSaveId: number = 0;
  private clonedGamedId: string | undefined;
  public rng: Random;
  public spectatorId: SpectatorId | undefined;
  public deferredActions: DeferredActionsQueue = new DeferredActionsQueue();
  public gameAge: number = 0; // Each log event increases it
  public gameLog: Array<LogMessage> = [];
  public undoCount: number = 0; // Each undo increases it

  public generation: number = 1;
  public phase: Phase = Phase.RESEARCH;
  public dealer: Dealer;
  public board: Board;
  public soloMode: boolean = false;
  public heatFor: boolean = false;
  public breakthrough: boolean = false;
  public createtime :string = getDate();
  public updatetime :string = getDate();
  private static stringifyPlayers : Map<Player, boolean> = new Map();
  private firstExited : boolean = false;// 本时代起始玩家体退 跳过世界政府，时代结束不替换起始玩家

  // Global parameters
  private oxygenLevel: number = constants.MIN_OXYGEN_LEVEL;
  private temperature: number = constants.MIN_TEMPERATURE;
  private venusScaleLevel: number = constants.MIN_VENUS_SCALE;

  // Player data
  public activePlayer: Player;
  private donePlayers: Set<Player> = new Set<Player>();// 结束游戏时已放完最后的绿化
  private passedPlayers: Set<Player> = new Set<Player>();
  private researchedPlayers: Set<Player> = new Set<Player>();
  private draftedPlayers: Set<Player> = new Set<Player>();

  // Drafting
  private draftRound: number = 1; // 轮抽到几张牌了
  // Used when drafting the first 10 project cards.
  private initialDraftIteration: number = 1; // 初始轮抽轮次：第一次5张为1,第二次5张为2，前序为3, 公司为4
  private unDraftedCards: Map<Player, Array<IProjectCard | ICorporationCard>> = new Map();

  // Milestones and awards
  public claimedMilestones: Array<ClaimedMilestone> = [];
  public milestones: Array<IMilestone> = [];
  public fundedAwards: Array<FundedAward> = [];
  public awards: Array<IAward> = [];

  // Expansion-specific data
  public colonies: Array<IColony> = [];
  public colonyDealer: ColonyDealer | undefined = undefined;
  public turmoil: Turmoil | undefined;
  public aresData: IAresData | undefined;
  public moonData: IMoonData | undefined;
  public pathfindersData: IPathfindersData | undefined;

  // Card-specific data
  // Mons Insurance promo corp
  public monsInsuranceOwner: Player | undefined = undefined;
  // Crash Site promo project
  public someoneHasRemovedOtherPlayersPlants: boolean = false;
  // United Nations Mission One community corp
  public unitedNationsMissionOneOwner: string | undefined = undefined;
  // 玩家的行动是否动过牌库， 是的话禁止撤回
  public cardDrew: boolean = false;
  // 星际领航者的殖民判定
  public finishFirstTrading: boolean = false;
  // Syndicate Pirate Raids
  public syndicatePirateRaider: string | undefined = undefined;

  private constructor(
    public id: string,
    private players: Array<Player>,
    private first: Player,
    public gameOptions: GameOptions,
    rng: Random,
    board: Board,
    dealer: Dealer) {
    const playerIds = players.map((p) => p.id);
    if (playerIds.includes(first.id) === false) {
      throw new Error('Cannot find first player ' + first.id + ' in ' + playerIds);
    }
    if (new Set(playerIds).size !== players.length) {
      throw new Error('Duplicate player found: ' + playerIds);
    }
    const colors = players.map((p) => p.color);
    if (new Set(colors).size !== players.length) {
      throw new Error('Duplicate color found: ' + colors);
    }

    this.rng = rng;
    this.dealer = dealer;
    this.board = board;

    this.players.forEach((player) => {
      player.game = this;
    });
    this.activePlayer = first;
    this.heatFor = gameOptions.heatFor || false;
    this.breakthrough = gameOptions.breakthrough || false;
  }

  public static newInstance(id: GameId,
    players: Array<Player>,
    firstPlayer: Player,
    gameOptions: GameOptions = {...DEFAULT_GAME_OPTIONS},
    seed: number = 0,
    spectatorId: SpectatorId | undefined = undefined,
    rebuild: boolean = true): Game {
    if (gameOptions.clonedGamedId !== undefined) {
      throw new Error('Cloning should not come through this execution path.');
    }

    const rng = new Random(seed);
    const board = GameSetup.newBoard(gameOptions, rng);
    const cardLoader = new CardLoader(gameOptions);
    const dealer = Dealer.newInstance(cardLoader);

    const game: Game = new Game(id, players, firstPlayer, gameOptions, rng, board, dealer);

    // Single player game player starts with 14TR
    if (players.length === 1) {
      game.soloMode = true;
      gameOptions.draftVariant = false;
      gameOptions.initialDraftVariant = false;
      gameOptions.randomMA = RandomMAOptionType.NONE;

      players[0].setTerraformRating(14);
      players[0].terraformRatingAtGenerationStart = 14;
    }
    game.spectatorId = spectatorId;
    // Initialize Ares data
    if (gameOptions.aresExtension) {
      game.aresData = AresSetup.initialData(gameOptions.aresExtension, gameOptions.aresHazards, players);
    }

    const milestonesAwards = MilestoneAwardSelector.chooseMilestonesAndAwards(gameOptions);
    game.milestones = milestonesAwards.milestones;
    game.awards = milestonesAwards.awards;

    // Add colonies stuff
    if (gameOptions.coloniesExtension) {
      game.colonyDealer = new ColonyDealer(rng);
      const communityColoniesSelected = GameSetup.includesCommunityColonies(gameOptions);
      const allowCommunityColonies = gameOptions.communityCardsOption || communityColoniesSelected;

      game.colonies = game.colonyDealer.drawColonies(players.length, gameOptions.customColoniesList, gameOptions.venusNextExtension, gameOptions.turmoilExtension, allowCommunityColonies);
    }

    // Add Turmoil stuff
    if (gameOptions.turmoilExtension) {
      game.turmoil = Turmoil.newInstance(game, gameOptions.politicalAgendasExtension);
    }

    // and 2 neutral cities and forests on board
    if (players.length === 1) {
      //  Setup solo player's starting tiles
      GameSetup.setupNeutralPlayer(game);
    }

    // Setup Ares hazards
    if (gameOptions.aresExtension && gameOptions.aresHazards) {
      AresSetup.setupHazards(game, players.length);
    }

    if (gameOptions.moonExpansion) {
      game.moonData = MoonExpansion.initialize();
    }

    if (gameOptions.pathfindersExpansion) {
      game.pathfindersData = PathfindersExpansion.initialize(gameOptions);
    }

    // Setup custom corporation list
    let corporationCards = game.dealer.corporationCards;

    const minCorpsRequired = players.length * gameOptions.startingCorporations;
    if (gameOptions.customCorporationsList && gameOptions.customCorporationsList.length >= minCorpsRequired) {
      const customCorporationCards: ICorporationCard[] = [];
      const cardFinder = new CardFinder();
      for (const corp of gameOptions.customCorporationsList) {
        // const customCorp = corporationCards.find((cf) => cf.name === corp);
        // 过滤掉不兼容的公司卡 和初始公司卡
        const customCorp = cardFinder.getCorporationCardByName(corp, gameOptions);
        if (customCorp && customCorp.name !== CardName.BEGINNER_CORPORATION) customCorporationCards.push(customCorp);
      }
      if (customCorporationCards.length >= minCorpsRequired) {
        corporationCards = customCorporationCards;
      }
    }

    if (game.breakthrough) {
      corporationCards.forEach((card, index) => {
        const cardFactory = BREAKTHROUGH_CARD_MANIFEST.corporationCards.cards.find((cardFactory) => cardFactory.cardName_ori === card.name);
        if (cardFactory !== undefined) {
          corporationCards.splice(index, 1, new cardFactory.Factory() );
        }
      });
    }

    corporationCards = Dealer.shuffle(corporationCards);

    // Failsafe for exceding corporation pool
    if (gameOptions.startingCorporations * players.length > corporationCards.length) {
      gameOptions.startingCorporations = 2;
    }

    // Initialize each player:
    // Give them their corporation cards, other cards, starting production,
    // handicaps.
    for (const player of game.getPlayersInGenerationOrder()) {
      player.heatForTemperature = game.heatFor ? 7 : 8;
      player.setTerraformRating(player.getTerraformRating() + player.handicap);
      if (!gameOptions.corporateEra) {
        GameSetup.setStartingProductions(player);
      }

      if (!player.beginner ||
        // Bypass beginner choice if any extension is choosen
        gameOptions.preludeExtension ||
        gameOptions.venusNextExtension ||
        gameOptions.coloniesExtension ||
        gameOptions.turmoilExtension ||
        gameOptions.initialDraftVariant) {
        for (let i = 0; i < gameOptions.startingCorporations; i++) {
          const corpCard = corporationCards.pop();
          if (corpCard !== undefined) {
            player.dealtCorporationCards.push(corpCard);
          } else {
            throw new Error('No corporation card dealt for player');
          }
        }
        if (gameOptions.initialDraftVariant === false) {
          for (let i = 0; i < 10; i++) {
            player.dealtProjectCards.push(dealer.dealCard(game));
          }
        }
        if (gameOptions.preludeExtension) {
          for (let i = 0; i < 4; i++) {
            player.dealtPreludeCards.push(dealer.dealPreludeCard());
          }
        }
      } else {
        game.playerHasPickedCorporationCard(player, new BeginnerCorporation(), undefined);
      }
    }

    // Print game_id if solo game
    if (players.length === 1) {
      game.log('The id of this game is ${0}', (b) => b.rawString(id));
    }

    players.forEach((player) => {
      game.log('Good luck ${0}!', (b) => b.player(player), {reservedFor: player});
    });

    game.log('Generation ${0}', (b) => b.forNewGeneration().number(game.generation));

    // Initial Draft
    if (gameOptions.initialDraftVariant) {
      game.phase = Phase.INITIALDRAFTING;
      game.runDraftRound(true);
    } else {
      game.gotoInitialResearchPhase();
    }

    // Save initial game state
    Game.stringifyPlayers.clear();
    if (!rebuild) {
      Database.getInstance().saveGameState(game.id, game.lastSaveId, game.toJSON(), game.toShortJSON());
    }
    return game;
  }

  public save(): void {
    /*
      * Because we save at the start of a player's takeAction, we need to
      * save the game in the database before increasing lastSaveId so that
      * reloading it doesn't create another new save on top of it, like this:
      *
      * increment -> save -> reload -> increment -> save
      *
      */
    this.lastSaveId += 1;
    Game.stringifyPlayers.clear();
    this.updatetime = getDate();
    this.cardDrew = false;
    Database.getInstance().saveGameState(this.id, this.lastSaveId, this.toJSON(), this.toShortJSON());
  }
  public toShortJSON(): string {
    return JSON.stringify({
      id: this.id,
      phase: this.phase,
      createtime: this.createtime,
      updatetime: this.updatetime,
      gameAge: this.gameAge,
      lastSaveId: this.lastSaveId,
      //  id name color exited userId
      players: this.getAllPlayers().map((x) => ({
        id: x.id,
        name: x.name,
        color: x.color,
        exited: x.exited,
        userId: x.userId,
      } as SerializedPlayer)),
    } as IShortData);
  }

  public toJSON(): string {
    return JSON.stringify(this.serialize());
  }
  public serialize(): SerializedGame {
    const result: SerializedGame = {
      exitedPlayers: Array.from(this.exitedPlayers).map((p) => p.serialize()),
      activePlayer: this.activePlayer.serializeId(),
      awards: this.awards.map((a) => {
        return {name: a.name} as IAward;
      }),
      board: this.board.serialize(),
      claimedMilestones: serializeClaimedMilestones(this.claimedMilestones),
      clonedGamedId: this.clonedGamedId,
      colonies: serializeColonies(this.colonies),
      // Dealer 的殖民地是初始状态没有玩家殖民  不需要处理序列化
      colonyDealer: this.colonyDealer ? {discardedColonies: this.colonyDealer?.discardedColonies.map((x) => ({name: x.name}))} as ColonyDealer : undefined,
      currentSeed: this.rng.current,
      dealer: this.dealer.serialize(),
      deferredActions: [],
      donePlayers: Array.from(this.donePlayers).map((p) => p.serializeId()),
      draftedPlayers: Array.from(this.draftedPlayers).map((p) => p.serializeId()),
      draftRound: this.draftRound,
      first: this.first.serializeId(),
      fundedAwards: serializeFundedAwards(this.fundedAwards),
      gameAge: this.gameAge,
      gameLog: this.gameLog,
      gameOptions: this.gameOptions,
      generation: this.generation,
      id: this.id,
      initialDraftIteration: this.initialDraftIteration,
      lastSaveId: this.lastSaveId,
      milestones: this.milestones.map((m) => {
        return {name: m.name} as IMilestone;
      }),
      monsInsuranceOwner: this.monsInsuranceOwner?.serializeId(),
      moonData: IMoonData.serialize(this.moonData),
      oxygenLevel: this.oxygenLevel,
      passedPlayers: Array.from(this.passedPlayers).map((p) => p.serializeId()),
      pathfindersData: IPathfindersData.serialize(this.pathfindersData),
      phase: this.phase,
      players: this.players.map((p) => p.serialize()),
      researchedPlayers: Array.from(this.researchedPlayers).map((p) => p.serializeId()),
      seed: this.rng.seed,
      someoneHasRemovedOtherPlayersPlants: this.someoneHasRemovedOtherPlayersPlants,
      spectatorId: this.spectatorId,
      syndicatePirateRaider: this.syndicatePirateRaider,
      temperature: this.temperature,
      undoCount: this.undoCount,
      venusScaleLevel: this.venusScaleLevel,

      createtime: this.createtime,
      updatetime: this.updatetime,
      breakthrough: this.breakthrough,
      cardDrew: this.cardDrew,
      heatFor: this.heatFor,
      loadState: this.loadState,
      firstExited: this.firstExited,
      finishFirstTrading: this.finishFirstTrading,
      soloMode: this.soloMode,
      // unDraftedCards: this.unDraftedCards,
      unitedNationsMissionOneOwner: this.unitedNationsMissionOneOwner,
    };
    if (this.aresData !== undefined) {
      result.aresData = this.aresData;
    }
    if (this.turmoil !== undefined) {
      result.turmoil = this.turmoil.serialize();
    }
    return result;
  }

  public isSoloMode() :boolean {
    return this.soloMode;
  }

  // Function to retrieve a player by it's id
  public getPlayerById(id: string): Player {
    let player = this.players.find((p) => p.id === id);
    if (player === undefined) {
      player = this.exitedPlayers.find((p) => p.id === id);
    }
    if (player === undefined) {
      throw new Error(`player ${id} does not exist on game ${this.id}`);
    }
    return player;
  }

  // Function to return an array of players from an array of player ids
  public getPlayersById(ids: Array<string>): Array<Player> {
    return ids.map((id) => this.getPlayerById(id));
  }

  public defer(action: DeferredAction, priority?: Priority | number): void {
    if (priority !== undefined) {
      action.priority = priority;
    }
    this.deferredActions.push(action);
  }

  public milestoneClaimed(milestone: IMilestone): boolean {
    return this.claimedMilestones.some(
      (claimedMilestone) => claimedMilestone.milestone.name === milestone.name,
    );
  }

  public marsIsTerraformed(): boolean {
    const oxygenMaxed = this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL;
    const temperatureMaxed = this.temperature >= constants.MAX_TEMPERATURE;
    const oceansMaxed = !this.canAddOcean();
    let globalParametersMaxed = oxygenMaxed && temperatureMaxed && oceansMaxed;
    const venusMaxed = this.getVenusScaleLevel() === constants.MAX_VENUS_SCALE;

    MoonExpansion.ifMoon(this, (moonData) => {
      if (this.gameOptions.requiresMoonTrackCompletion) {
        const moonMaxed =
          moonData.colonyRate === constants.MAXIMUM_COLONY_RATE &&
          moonData.miningRate === constants.MAXIMUM_MINING_RATE &&
          moonData.logisticRate === constants.MAXIMUM_LOGISTICS_RATE;
        globalParametersMaxed = globalParametersMaxed && moonMaxed;
      }
    });

    // Solo games with Venus needs Venus maxed to end the game.
    if (this.isSoloMode() && this.gameOptions.venusNextExtension) {
      return globalParametersMaxed && venusMaxed;
    }
    // new option "requiresVenusTrackCompletion" also makes maximizing Venus a game-end requirement
    if (this.gameOptions.venusNextExtension && this.gameOptions.requiresVenusTrackCompletion) {
      return globalParametersMaxed && venusMaxed;
    }
    return globalParametersMaxed;
  }

  public lastSoloGeneration(): number {
    let lastGeneration = 14;
    const options = this.gameOptions;
    if (options.preludeExtension) {
      lastGeneration -= 2;
    }

    // Only add 2 more generations when using the track completion option
    // and not the solo TR option.
    //
    // isSoloModeWin backs this up.
    if (options.moonExpansion) {
      if (!options.soloTR && options.requiresMoonTrackCompletion) {
        lastGeneration += 2;
      }
    }
    return lastGeneration;
  }

  public isSoloModeWin(): boolean {
    if (!this.soloMode) {
      return false;
    }
    // Solo TR victory condition
    if (this.gameOptions.soloTR) {
      return this.players[0].getTerraformRating() >= 63;
    }

    // Complete terraforing victory condition.
    if (!this.marsIsTerraformed()) {
      return false;
    }

    // This last conditional doesn't make much sense to me. It's only ever really used
    // on the client at components/GameEnd.ts. Which is probably why it doesn't make
    // obvious sense why when this generation is earlier than the last generation
    // of the game means "true, is solo mode win."
    return this.generation <= this.lastSoloGeneration();
  }

  public getAwardFundingCost(): number {
    return 8 + (6 * this.fundedAwards.length);
  }

  public fundAward(player: Player, award: IAward): void {
    if (this.allAwardsFunded()) {
      throw new Error('All awards already funded');
    }
    this.log('${0} funded ${1} award',
      (b) => b.player(player).award(award));

    this.fundedAwards.push({
      award: award,
      player: player,
    });
  }

  public hasBeenFunded(award: IAward): boolean {
    return this.fundedAwards.some(
      (fundedAward) => fundedAward.award.name === award.name,
    );
  }

  public allAwardsFunded(): boolean {
    // Awards are disabled for 1 player games
    if (this.players.length === 1) return true;

    return this.fundedAwards.length >= constants.MAX_AWARDS;
  }

  public allMilestonesClaimed(): boolean {
    // Milestones are disabled for 1 player games
    if (this.players.length === 1) return true;

    return this.claimedMilestones.length >= constants.MAX_MILESTONES;
  }

  private playerHasPickedCorporationCard(player: Player, corporationCard: ICorporationCard, corporationCard2: ICorporationCard | undefined) {
    player.pickedCorporationCard = corporationCard;
    player.pickedCorporationCard2 = corporationCard2;
    // if all players picked corporationCard
    if (this.players.every((p) => p.pickedCorporationCard !== undefined)) {
      if (this.gameOptions.doubleCorp) {
        const game = this;
        const chooseFirstCorp = function() {
          for (const somePlayer of game.getPlayers()) {
            if (somePlayer.corpCard === undefined) {
              somePlayer.setWaitingFor(new SelectCard(
                'Select corp card to play first',
                'Play',
                [somePlayer.pickedCorporationCard!, somePlayer.pickedCorporationCard2!],
                (foundCards: Array<ICorporationCard>) => {
                  game.playCorporationCard(somePlayer, foundCards[0], false);
                  game.playCorporationCard(somePlayer, somePlayer.pickedCorporationCard?.name === foundCards[0].name ? somePlayer.pickedCorporationCard2! : somePlayer.pickedCorporationCard!, true);
                  game.playerIsFinishedWithResearchPhase(somePlayer);
                  return undefined;
                },
              ), () => {
                chooseFirstCorp();
              });
              break;
            }
          }
        };
        chooseFirstCorp();
      } else {
        for (const somePlayer of this.getPlayersInGenerationOrder()) {
          this.playCorporationCard(somePlayer, somePlayer.pickedCorporationCard!, false);
          this.playerIsFinishedWithResearchPhase(somePlayer);
        }
      }
    }
  }

  private playCorporationCard(player: Player, corporationCard: ICorporationCard, corp2 : boolean): void {
    corp2 ? player.corpCard2 = corporationCard : player.corpCard = corporationCard;
    if (corporationCard.name === CardName.BEGINNER_CORPORATION) {
      player.megaCredits = corporationCard.startingMegaCredits;
    }
    corporationCard.play(player);
    this.log('${0} played ${1}', (b) => b.player(player).card(corporationCard));

    // trigger other corp's effect, e.g. SaturnSystems,PharmacyUnion,Splice
    for (const somePlayer of this.getPlayersInGenerationOrder()) {
      if (somePlayer.corpCard !== undefined && somePlayer.corpCard !== corporationCard && somePlayer.corpCard.onCorpCardPlayed !== undefined) {
        this.defer(new DeferredAction(
          player,
          () => {
            return somePlayer.corpCard!.onCorpCardPlayed!(player, corporationCard) || undefined;
          },
        ));
      }
      if (somePlayer.corpCard2 !== undefined && somePlayer.corpCard2 !== corporationCard && somePlayer.corpCard2.onCorpCardPlayed !== undefined) {
        this.defer(new DeferredAction(
          player,
          () => {
            return somePlayer.corpCard2!.onCorpCardPlayed!(player, corporationCard) || undefined;
          },
        ));
      }
    }

    // Activate some colonies
    if (this.gameOptions.coloniesExtension && corporationCard.resourceType !== undefined) {
      this.colonies.forEach((colony) => {
        if (colony.resourceType !== undefined && colony.resourceType === corporationCard.resourceType) {
          colony.isActive = true;
        }
      });

      // Check for Venus colony
      if (corporationCard.tags.includes(Tags.VENUS)) {
        const venusColony = this.colonies.find((colony) => colony.name === ColonyName.VENUS);
        if (venusColony) venusColony.isActive = true;
      }
    }

    PathfindersExpansion.onCardPlayed(player, corporationCard);

    player.dealtCorporationCards = [];
    player.dealtPreludeCards = [];
    player.dealtProjectCards = [];
  }

  private pickCorporationCard(player: Player): PlayerInput {
    return new SelectInitialCards(player, this.gameOptions.doubleCorp, (corporationCard: ICorporationCard, corporationCard2: ICorporationCard | undefined) => {
      if (corporationCard.cardCost !== undefined) {
        player.cardCost = corporationCard.cardCost;
      }
      if (corporationCard2?.cardCost !== undefined) {
        // 双公司 买牌费用平均一下
        if (player.cardCost === constants.CARD_COST) {
          player.cardCost = corporationCard2.cardCost;
        } else if (corporationCard2.cardCost !== constants.CARD_COST) {
          player.cardCost = (corporationCard2.cardCost + player.cardCost) /2;
        }
      }

      // 起始资金
      let startingMegaCredits = corporationCard.startingMegaCredits;
      if (corporationCard2 !== undefined) {
        startingMegaCredits += corporationCard2.startingMegaCredits - constants.STARTING_MEGA_CREDITS_SUB;
      }

      // 买完牌的资金
      if (corporationCard.name !== CardName.BEGINNER_CORPORATION) {
        const diff = player.cardsInHand.length * player.cardCost;
        startingMegaCredits -= diff;
      }
      player.megaCredits = startingMegaCredits;

      // Check for negative M€
      if (startingMegaCredits <= 0) {
        player.cardsInHand = [];
        player.preludeCardsInHand = [];
        throw new Error('Too many cards selected');
      }
      // discard all unpurchased cards
      player.dealtProjectCards.forEach((card) => {
        if (player.cardsInHand.includes(card) === false) {
          this.dealer.discard(card);
        }
      });

      this.playerHasPickedCorporationCard(player, corporationCard, corporationCard2); return undefined;
    });
  }

  public hasPassedThisActionPhase(player: Player): boolean {
    return this.passedPlayers.has(player);
  }

  private incrementFirstPlayer(): void {
    if (this.firstExited) {
      this.firstExited = false;
      return;
    }
    let firstIndex: number = this.players.map(function(x) {
      return x.id;
    }).indexOf(this.first.id);
    if (firstIndex === -1) {
      throw new Error('Didn\'t even find player');
    }
    if (firstIndex === this.players.length - 1) {
      firstIndex = 0;
    } else {
      firstIndex++;
    }
    this.first = this.players[firstIndex];
  }

  private runDraftRound(initialDraft: boolean = false): void {
    this.draftedPlayers.clear();
    this.players.forEach((player) => {
      if (this.draftRound === 1 ) {
        if (!initialDraft || this.initialDraftIteration === 1 || this.initialDraftIteration === 2 ) {
          player.runDraftPhase(initialDraft, this.getNextDraft(player).name);
        } else if (this.initialDraftIteration === 3) {
          player.runDraftPhase(initialDraft, this.getNextDraft(player).name, player.dealtPreludeCards);
        } else if ( this.initialDraftIteration === 4) {
          player.runDraftPhase(initialDraft, this.getNextDraft(player).name, player.dealtCorporationCards);
        }
      } else {
        const cards = this.unDraftedCards.get(this.getDraftCardsFrom(player));
        this.unDraftedCards.delete(this.getDraftCardsFrom(player));
        player.runDraftPhase(initialDraft, this.getNextDraft(player).name, cards);
      }
    });
  }

  /**
   * 两种方式调用 1、非初始轮抽，开局发完牌调用该方法；2、初始轮抽完，调用该方法
   * 初始轮抽选完牌后会将initialDraftVariant置为false并保存， 重载时可以直接调用该方法选择买牌
   */
  private gotoInitialResearchPhase(): void {
    this.phase = Phase.RESEARCH;
    for (const player of this.players) {
      if (player.pickedCorporationCard === undefined && player.dealtCorporationCards.length > 0) {
        player.setWaitingFor(this.pickCorporationCard(player));
      }
    }
    if (this.players.length === 1 && this.gameOptions.coloniesExtension) {
      this.players[0].addProduction(Resources.MEGACREDITS, -2);
      this.defer(new RemoveColonyFromGame(this.players[0]));
    }
  }

  private gotoResearchPhase(): void {
    this.phase = Phase.RESEARCH;
    this.researchedPlayers.clear();

    // 非轮抽这时还没有发牌，不能保存
    if (this.gameOptions.draftVariant && this.players.length > 1 ) {
      this.save();
    }
    this.players.forEach((player) => {
      player.runResearchPhase(this.gameOptions.draftVariant && this.players.length > 1 );
    });
  }

  private gotoDraftingPhase(): void {
    this.phase = Phase.DRAFTING;
    this.draftRound = 1;
    this.save();
    this.runDraftRound();
  }

  public gameIsOver(): boolean {
    if (this.isSoloMode()) {
      // Solo games continue until the designated generation end even if Mars is already terraformed
      return this.generation === this.lastSoloGeneration();
    }
    return this.marsIsTerraformed();
  }

  public isDoneWithFinalProduction(): boolean {
    return this.phase === Phase.END || (this.gameIsOver() && this.phase === Phase.PRODUCTION);
  }

  private gotoProductionPhase(): void {
    this.phase = Phase.PRODUCTION;
    this.passedPlayers.clear();
    this.someoneHasRemovedOtherPlayersPlants = false;
    this.players.forEach((player) => {
      player.cardDiscount = 0; // Iapetus reset hook
      player.runProductionPhase();
    });

    if (this.gameIsOver()) {
      this.log('Final greenery placement', (b) => b.forNewGeneration());
      this.gotoFinalGreeneryPlacement();
      return;
    }

    // solar Phase Option
    this.phase = Phase.SOLAR;
    if (this.gameOptions.solarPhaseOption && ! this.marsIsTerraformed()) {
      this.gotoWorldGovernmentTerraforming();
      return;
    }
    this.gotoEndGeneration();
  }

  private gotoEndGeneration() {
    if (this.gameOptions.coloniesExtension) {
      this.colonies.forEach((colony) => {
        colony.endGeneration(this);
      });
      // Syndicate Pirate Raids hook. Also see Colony.ts and Player.ts
      this.syndicatePirateRaider = undefined;
    }

    TurmoilUtil.ifTurmoil(this, (turmoil) => {
      turmoil.endGeneration(this);
    });

    // Resolve Turmoil deferred actions
    if (this.deferredActions.length > 0) {
      this.resolveTurmoilDeferredActions();
      return;
    }

    this.phase = Phase.INTERGENERATION;
    this.goToDraftOrResearch();
  }

  private resolveTurmoilDeferredActions() {
    this.deferredActions.runAll(() => this.goToDraftOrResearch());
  }

  private goToDraftOrResearch() {
    this.generation++;
    this.log('Generation ${0}', (b) => b.forNewGeneration().number(this.generation));
    this.incrementFirstPlayer();
    // TradeNavigator
    this.finishFirstTrading = false;
    this.players.forEach((player) => {
      player.hasIncreasedTerraformRatingThisGeneration = false;
      player.heatProductionStepsIncreasedThisGeneration = 0;
    });

    if (this.gameOptions.draftVariant && this.players.length > 1 ) {
      this.gotoDraftingPhase();
    } else {
      this.gotoResearchPhase();
    }
  }

  private gotoWorldGovernmentTerraforming() {
    if (this.firstExited) {
      this.doneWorldGovernmentTerraforming();
      return;
    }
    this.first.worldGovernmentTerraforming();
  }

  public doneWorldGovernmentTerraforming() {
    // Carry on to next phase
    this.gotoEndGeneration();
  }

  private allPlayersHavePassed(): boolean {
    for (const player of this.players) {
      if (!this.hasPassedThisActionPhase(player)) {
        return false;
      }
    }
    return true;
  }

  public playerHasPassed(player: Player): void {
    this.passedPlayers.add(player);
  }

  public hasResearched(player: Player): boolean {
    return this.researchedPlayers.has(player);
  }

  private hasDrafted(player: Player): boolean {
    return this.draftedPlayers.has(player);
  }

  private allPlayersHaveFinishedResearch(): boolean {
    for (const player of this.players) {
      if (!this.hasResearched(player)) {
        return false;
      }
    }
    return true;
  }

  private allPlayersHaveFinishedDraft(): boolean {
    for (const player of this.players) {
      if (!this.hasDrafted(player)) {
        return false;
      }
    }
    return true;
  }

  public playerIsFinishedWithResearchPhase(player: Player): void {
    this.deferredActions.runAllFor(player, () => {
      this.researchedPlayers.add(player);
      if (this.allPlayersHaveFinishedResearch()) {
        this.phase = Phase.ACTION;
        this.passedPlayers.clear();
        this.startActionsForPlayer(this.first);
      }
    });
  }

  public playerIsFinishedWithDraftingPhase(initialDraft: boolean, player: Player, cards : Array<ICorporationCard| IProjectCard>): void {
    this.draftedPlayers.add(player);
    this.unDraftedCards.set(player, cards);

    if (this.allPlayersHaveFinishedDraft() === false) {
      return;
    }

    // If more than 1 card are to be passed to the next player, that means we're still drafting
    if (cards.length > 1) {
      this.draftRound++;
      this.runDraftRound(initialDraft);
      return;
    }

    // Push last card for each player
    this.players.forEach((player) => {
      const lastCards = this.unDraftedCards.get(this.getDraftCardsFrom(player));
      if (lastCards !== undefined) {
        player.draftedCards.push(...lastCards);
      }

      if (initialDraft) {
        if (this.initialDraftIteration === 2) {
          player.dealtProjectCards = player.draftedCards as Array<IProjectCard>;
          player.draftedCards = [];
        } else if (this.initialDraftIteration === 3) {
          player.dealtPreludeCards = player.draftedCards as Array<IProjectCard>;
          player.draftedCards = [];
        } else if (this.initialDraftIteration === 4) {
          player.dealtCorporationCards = player.draftedCards as Array<ICorporationCard>;
          player.draftedCards = [];
        }
      }
    });

    if (initialDraft === false) {
      this.gotoResearchPhase();
      return;
    }

    if (this.initialDraftIteration === 1) {
      this.initialDraftIteration++;
      this.draftRound = 1;
      this.runDraftRound(true);
    } else if (this.initialDraftIteration === 2 && this.gameOptions.preludeExtension) {
      this.initialDraftIteration++;
      this.draftRound = 1;
      this.runDraftRound(true);
    } else if ((this.initialDraftIteration === 2 && !this.gameOptions.preludeExtension || this.initialDraftIteration === 3) &&
        this.gameOptions.doubleCorp && this.gameOptions.initialCorpDraftVariant) {
      this.initialDraftIteration = 4;
      this.draftRound = 1;
      this.runDraftRound(true);
    } else {
      this.phase = Phase.RESEARCH;
      this.save();
      this.gotoInitialResearchPhase();
    }
  }

  private getDraftCardsFrom(player: Player): Player {
    let nextPlayer: Player | undefined;

    // Change initial draft direction on second iteration
    if (this.generation === 1 && (this.initialDraftIteration === 2 || this.initialDraftIteration === 4)) {
      nextPlayer = this.getPlayerBefore(player);
    } else if (this.generation % 2 === 1) {
      nextPlayer = this.getPlayerAfter(player);
    } else {
      nextPlayer = this.getPlayerBefore(player);
    }

    if (nextPlayer !== undefined) {
      return nextPlayer;
    }
    return player;
  }

  private getNextDraft(player: Player): Player {
    let nextPlayer = this.getPlayerAfter(player);
    if (this.generation%2 === 1) {
      nextPlayer = this.getPlayerBefore(player);
    }
    // Change initial draft direction on second iteration
    if (this.initialDraftIteration === 2 && this.generation === 1) {
      nextPlayer = this.getPlayerAfter(player);
    }

    if (nextPlayer !== undefined) {
      return nextPlayer;
    }
    return player;
  }

  private getPlayerBefore(player: Player): Player | undefined {
    const playerIndex: number = this.players.indexOf(player);

    // The player was not found
    if (playerIndex === -1) {
      return undefined;
    }

    // Go to the end of the array if stand at the start
    return this.players[(playerIndex === 0) ? this.players.length - 1 : playerIndex - 1];
  }

  private getPlayerAfter(player: Player): Player | undefined {
    const playerIndex: number = this.players.indexOf(player);

    // The player was not found
    if (playerIndex === -1) {
      return undefined;
    }

    // Go to the beginning of the array if we reached the end
    return this.players[(playerIndex + 1 >= this.players.length) ? 0 : playerIndex + 1];
  }


  public playerIsFinishedTakingActions(): void {
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.playerIsFinishedTakingActions());
      return;
    }

    if (this.allPlayersHavePassed()) {
      this.gotoProductionPhase();
      return;
    }

    const nextPlayer = this.getPlayerAfter(this.activePlayer);

    // Defensive coding to fail fast, if we don't find the next
    // player we are in an unexpected game state
    if (nextPlayer === undefined) {
      throw new Error('Did not find player');
    }

    if (!this.hasPassedThisActionPhase(nextPlayer)) {
      this.startActionsForPlayer(nextPlayer);
    } else {
      // Recursively find the next player
      this.activePlayer = nextPlayer;
      this.playerIsFinishedTakingActions();
    }
  }

  private gotoEndGame(): void {
    this.phase = Phase.END;
    this.save();

    // Log id or cloned game id
    if (this.clonedGamedId !== undefined && this.clonedGamedId.startsWith('#')) {
      this.log('This game was a clone from game ' + this.clonedGamedId);
    } else {
      this.log('This game id was ' + this.id);
    }

    Database.getInstance().cleanSaves(this.id);
    const scores: Array<Score> = [];
    const players = this.getAllPlayers();
    players.forEach((player) => {
      let corponame: String = '';
      let corponame2: String = '';
      const vpb = player.getVictoryPoints();
      if (player.corpCard !== undefined) {
        corponame = player.corpCard.name;
      }
      if (player.corpCard2 !== undefined) {
        corponame2 = player.corpCard2.name;
      }
      scores.push({corporation: corponame, corporation2: corponame2, playerScore: vpb.total, player: player.name, userId: player.userId});
    });
    if (this.players.length > 1) {
      Database.getInstance().saveGameResults(this.id, players.length, this.generation, this.gameOptions, scores);
    }
    return;
  }

  // Part of final greenery placement.
  public canPlaceGreenery(player: Player): boolean {
    return !this.donePlayers.has(player) &&
            player.plants >= player.plantsNeededForGreenery &&
            this.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  // Called when a player has chosen not to place any more greeneries.
  public playerIsDoneWithGame(player: Player): void {
    this.donePlayers.add(player);
    this.gotoFinalGreeneryPlacement();
  }

  // Well, this isn't just "go to the final greenery placement". It finds the next player
  // who might be able to place a final greenery.
  // Rename to takeNextFinalGreeneryAction?

  public /* for testing */ gotoFinalGreeneryPlacement(): void {
    // this.getPlayers returns in turn order -- a necessary rule for final greenery placement.
    for (const player of this.getPlayersInGenerationOrder()) {
      if (this.donePlayers.has(player)) {
        continue;
      }
      if (this.canPlaceGreenery(player)) {
        this.startFinalGreeneryPlacement(player);
        return;
      } else if (player.getWaitingFor() !== undefined) {
        return;
      } else {
        this.donePlayers.add(player);
      }
    }
    this.gotoEndGame();
  }

  private startFinalGreeneryPlacement(player: Player) {
    this.activePlayer = player;
    player.takeActionForFinalGreenery();
  }

  private startActionsForPlayer(player: Player) {
    this.activePlayer = player;
    player.actionsTakenThisRound = 0;

    // Save the game state after changing the current player
    // Increment the save id
    this.save();

    player.takeAction();
  }

  public increaseOxygenLevel(player: Player, increments: -2 | -1 | 1 | 2): undefined {
    if (this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL) {
      return undefined;
    }

    // PoliticalAgendas Reds P3 && Magnetic Field Stimulation Delays hook
    if (increments < 0 ) {
      this.oxygenLevel = Math.max(constants.MIN_OXYGEN_LEVEL, this.oxygenLevel + increments);
      return undefined;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, constants.MAX_OXYGEN_LEVEL - this.oxygenLevel);

    if (this.phase !== Phase.SOLAR) {
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.OXYGEN, steps);
      player.increaseTerraformRatingSteps(steps);
    }
    if (this.oxygenLevel < 8 && this.oxygenLevel + steps >= 8) {
      this.increaseTemperature(player, 1);
    }

    this.oxygenLevel += steps;

    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onOxygenChange(this, aresData);
    });

    return undefined;
  }

  public getOxygenLevel(): number {
    return this.oxygenLevel;
  }

  public increaseVenusScaleLevel(player: Player, increments: -1 | 1 | 2 | 3): void {
    if (this.venusScaleLevel >= constants.MAX_VENUS_SCALE) {
      return;
    }

    // PoliticalAgendas Reds P3 hook
    if (increments === -1) {
      this.venusScaleLevel = Math.max(constants.MIN_VENUS_SCALE, this.venusScaleLevel + increments * 2);
      return;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, (constants.MAX_VENUS_SCALE - this.venusScaleLevel) / 2);

    if (this.phase !== Phase.SOLAR) {
      if (this.venusScaleLevel < 8 && this.venusScaleLevel + steps * 2 >= 8) {
        player.drawCard();
      }
      if (this.venusScaleLevel < 16 && this.venusScaleLevel + steps * 2 >= 16) {
        player.increaseTerraformRating();
      }
      const foundCard = player.playedCards.find((card) => card.name === CardName.VENUS_UNIVERSITY);
      if (foundCard !== undefined) {
        player.drawCard(steps);
      }
      if (this.gameOptions.altVenusBoard) {
        // The second half of this equation removes any increases earler than 16-to-18.

        const newValue = this.venusScaleLevel + steps * 2;
        const minimalBaseline = Math.max(this.venusScaleLevel, 16);
        const maximumBaseline = Math.min(newValue, 30);
        const standardResourcesGranted = Math.max((maximumBaseline - minimalBaseline) / 2, 0);

        const grantWildResource = this.venusScaleLevel + (steps * 2) >= 30;
        if (grantWildResource || standardResourcesGranted > 0) {
          this.defer(new GrantVenusAltTrackBonusDeferred(player, standardResourcesGranted, grantWildResource));
        }
      }
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.VENUS, steps);
      player.increaseTerraformRatingSteps(steps);
    }

    // Check for Aphrodite corporation
    const aphrodite = this.players.find((player) => player.isCorporation(CardName.APHRODITE));
    if (aphrodite !== undefined) {
      aphrodite.megaCredits += steps * 2;
    }
    const _aphrodite_ = this.players.find((player) => player.isCorporation(CardName._APHRODITE_));
    if (_aphrodite_ !== undefined) {
      _aphrodite_.plants += steps * 2;
    }
    this.venusScaleLevel += steps * 2;
  }

  public getVenusScaleLevel(): number {
    return this.venusScaleLevel;
  }

  public increaseTemperature(player: Player, increments: -2 | -1 | 1 | 2 | 3): undefined {
    if (this.temperature >= constants.MAX_TEMPERATURE) {
      return undefined;
    }

    if (increments === -2 || increments === -1) {
      this.temperature = Math.max(constants.MIN_TEMPERATURE, this.temperature + increments * 2);
      return undefined;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, (constants.MAX_TEMPERATURE - this.temperature) / 2);

    if (this.phase !== Phase.SOLAR) {
      // 热公司突破：任何人升温得1热。
      const helion = this.players.find((player) => player.isCorporation(CardName._HELION_));
      if (helion !== undefined) {
        player.heat += steps * 1;
      }

      // BONUS FOR HEAT PRODUCTION AT -20 and -24
      if (this.temperature < -24 && this.temperature + steps * 2 >= -24) {
        player.addProduction(Resources.HEAT, 1, {log: true});
      }
      if (this.temperature < -20 && this.temperature + steps * 2 >= -20) {
        player.addProduction(Resources.HEAT, 1, {log: true});
      }
      // 群友扩hook,热泉微生物hook
      const foundCard = player.playedCards.find((card) => card.name === CardName.HYDROTHERMAL_VENT_ARCHAEA);
      if (foundCard !== undefined) {
        player.addResourceTo(foundCard, steps);
      }
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.TEMPERATURE, steps);
      player.increaseTerraformRatingSteps(steps);
    }

    // BONUS FOR OCEAN TILE AT 0
    if (this.temperature < 0 && this.temperature + steps * 2 >= 0) {
      this.defer(new PlaceOceanTile(player, 'Select space for ocean from temperature increase'));
    }

    this.temperature += steps * 2;

    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onTemperatureChange(this, aresData);
    });

    return undefined;
  }

  public getTemperature(): number {
    return this.temperature;
  }

  public getGeneration(): number {
    return this.generation;
  }

  public getPassedPlayers():Array<Color> {
    return Array.from(this.passedPlayers).map((x) => x.color);
  }

  public getPlayer(name: string): Player {
    const player = this.players.find((player) => player.name === name);
    if (player === undefined) {
      throw new Error('Player not found');
    }
    return player;
  }

  public getCitiesOnMarsCount(): number {
    return this.board.spaces.filter(
      (space) => Board.isCitySpace(space) && space.spaceType !== SpaceType.COLONY).length;
  }

  public getCitiesCount(player?: Player): number {
    let cities = this.board.spaces.filter((space) => Board.isCitySpace(space));
    if (player !== undefined) cities = cities.filter(Board.ownedBy(player));
    return cities.length;
  }

  public getGreeneriesCount(player?: Player): number {
    let greeneries = this.board.spaces.filter((space) => Board.isGreenerySpace(space));
    if (player !== undefined) greeneries = greeneries.filter(Board.ownedBy(player));
    return greeneries.length;
  }

  public getSpaceCount(tileType: TileType, player: Player): number {
    return this.board.spaces.filter(Board.ownedBy(player))
      .filter((space) => space.tile?.tileType === tileType)
      .length;
  }

  // addTile applies to the Mars board, but not the Moon board, see MoonExpansion.addTile for placing
  // a tile on The Moon.
  public addTile(
    player: Player, spaceType: SpaceType,
    space: ISpace, tile: ITile): void {
    // Part 1, basic validation checks.

    if (space.tile !== undefined && !(this.gameOptions.aresExtension || this.gameOptions.pathfindersExpansion)) {
      throw new Error('Selected space is occupied');
    }

    // Land claim a player can claim land for themselves
    if (space.player !== undefined && space.player !== player) {
      throw new Error('This space is land claimed by ' + space.player.name);
    }

    let validSpaceType = space.spaceType === spaceType;
    if (space.spaceType === SpaceType.COVE && (spaceType === SpaceType.LAND || spaceType === SpaceType.OCEAN)) {
      // Cove is a valid type for land and also ocean.
      validSpaceType = true;
    }
    if (!validSpaceType) {
      throw new Error(`Select a valid location: ${space.spaceType} is not ${spaceType}`);
    }

    if (!AresHandler.canCover(space, tile)) {
      throw new Error('Selected space is occupied: ' + space.id);
    }

    // Oceans are not subject to Ares adjacency production penalties.
    const subjectToHazardAdjacency = tile.tileType !== TileType.OCEAN;

    AresHandler.ifAres(this, () => {
      AresHandler.assertCanPay(player, space, subjectToHazardAdjacency);
    });

    // Part 2. Collect additional fees.
    // Adjacency costs are before the hellas ocean tile because this is a mandatory cost.
    AresHandler.ifAres(this, () => {
      AresHandler.payAdjacencyAndHazardCosts(player, space, subjectToHazardAdjacency);
    });

    // Hellas special requirements ocean tile
    if (space.id === SpaceName.HELLAS_OCEAN_TILE &&
        this.canAddOcean() &&
        this.gameOptions.boardName === BoardName.HELLAS) {
      if (player.color !== Color.NEUTRAL) {
        this.defer(new PlaceOceanTile(player, 'Select space for ocean from placement bonus'));
        this.defer(new SelectHowToPayDeferred(player, constants.HELLAS_BONUS_OCEAN_COST, {title: 'Select how to pay for placement bonus ocean'}));
      }
    }

    TurmoilHandler.resolveTilePlacementCosts(player);

    // Part 3. Setup for bonuses
    const arcadianCommunityBonus = space.player === player && (player.isCorporation(CardName.ARCADIAN_COMMUNITIES) || player.isCorporation(CardName._ARCADIAN_COMMUNITIES_));
    const initialTileTypeForAres = space.tile?.tileType;
    const coveringExistingTile = space.tile !== undefined;

    // Part 4. Place the tile
    this.simpleAddTile(player, space, tile);

    // Part 5. Collect the bonuses
    if (this.phase !== Phase.SOLAR) {
      if (!coveringExistingTile) {
        this.grantSpaceBonuses(player, space);
      }

      this.board.getAdjacentSpaces(space).forEach((adjacentSpace) => {
        if (Board.isOceanSpace(adjacentSpace)) {
          player.megaCredits += player.oceanBonus;
        }
      });

      AresHandler.ifAres(this, (aresData) => {
        AresHandler.earnAdjacencyBonuses(aresData, player, space);
      });

      TurmoilHandler.resolveTilePlacementBonuses(player, spaceType);

      if (arcadianCommunityBonus) {
        this.defer(new GainResources(player, Resources.MEGACREDITS, {count: 3}));
      }
    } else {
      space.player = undefined;
    }

    this.players.forEach((p) => {
      p.corpCard?.onTilePlaced?.(p, player, space, BoardType.MARS);
      p.corpCard2?.onTilePlaced?.(p, player, space, BoardType.MARS);
      p.playedCards.forEach((playedCard) => {
        playedCard.onTilePlaced?.(p, player, space, BoardType.MARS);
      });
    });

    AresHandler.ifAres(this, () => {
      AresHandler.grantBonusForRemovingHazard(player, initialTileTypeForAres);
    });
  }

  public simpleAddTile(player: Player, space: ISpace, tile: ITile) {
    space.tile = tile;
    space.player = player;
    if (tile.tileType === TileType.OCEAN || tile.tileType === TileType.MARTIAN_NATURE_WONDERS) {
      space.player = undefined;
    }
    LogHelper.logTilePlacement(player, space, tile.tileType);
  }

  public grantSpaceBonuses(player: Player, space: ISpace) {
    const bonuses = new Multiset(space.bonus);
    bonuses.entries().forEach(([bonus, count]) => {
      this.grantSpaceBonus(player, bonus, count);
    });
  }

  public grantSpaceBonus(player: Player, spaceBonus: SpaceBonus, count: number = 1) {
    switch (spaceBonus) {
    case SpaceBonus.DRAW_CARD:
      player.drawCard(count);
      break;
    case SpaceBonus.PLANT:
      player.addResource(Resources.PLANTS, count, {log: true});
      break;
    case SpaceBonus.STEEL:
      player.addResource(Resources.STEEL, count, {log: true});
      break;
    case SpaceBonus.TITANIUM:
      player.addResource(Resources.TITANIUM, count, {log: true});
      break;
    case SpaceBonus.HEAT:
      player.addResource(Resources.HEAT, count, {log: true});
      break;
    case SpaceBonus.OCEAN:
      // ignore
      break;
    case SpaceBonus.MICROBE:
      this.defer(new AddResourcesToCard(player, ResourceType.MICROBE, {count: count}));
      break;
    case SpaceBonus.DATA:
      this.defer(new AddResourcesToCard(player, ResourceType.DATA, {count: count}));
      break;
    case SpaceBonus.ENERGY_PRODUCTION:
      player.addProduction(Resources.ENERGY, count);
      break;
    case SpaceBonus.SCIENCE:
      this.defer(new AddResourcesToCard(player, ResourceType.SCIENCE, {count: count}));
      break;
    case SpaceBonus.TEMPERATURE:
      if (this.getTemperature() < constants.MAX_TEMPERATURE) {
        this.defer(new DeferredAction(player, () => this.increaseTemperature(player, 1)));
        this.defer(new SelectHowToPayDeferred(
          player,
          constants.VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST,
          {title: 'Select how to pay for placement bonus temperature'}));
      }
      break;
    default:
      // TODO(kberg): Remove the isProduction condition after 2022-01-01.
      // I tried this once and broke the server, so I'm wrapping it in isProduction for now.
      if (!isProduction()) {
        throw new Error('Unhandled space bonus ' + spaceBonus);
      }
    }
  }

  public addGreenery(
    player: Player, spaceId: SpaceId,
    spaceType: SpaceType = SpaceType.LAND,
    shouldRaiseOxygen: boolean = true): undefined {
    this.addTile(player, spaceType, this.board.getSpace(spaceId), {
      tileType: TileType.GREENERY,
    });

    // Turmoil Greens ruling policy
    PartyHooks.applyGreensRulingPolicy(player, this.board.getSpace(spaceId));

    // 增强呼吸作用hook
    if ((player.playedCards.find((playedCard) => playedCard.name === CardName.RESPIRATION_ENHANCE) !== undefined) &&
        this.getTemperature() < constants.MAX_TEMPERATURE &&
        shouldRaiseOxygen) {
      const orOptions = new OrOptions();
      orOptions.options.push(new SelectOption('Increase temperature', 'Increase', () => {
        this.increaseTemperature(player, 1);
        this.log('${0} enhanced respiration and increased temperature', (b) => b.player(player));
        return undefined;
      }));

      if ( this.getOxygenLevel() < constants.MAX_OXYGEN_LEVEL) {
        orOptions.options.push(new SelectOption('Increase oxygen', 'Increase', () => {
          this.increaseOxygenLevel(player, 1);
          this.log('${0} increased oxygen level', (b) => b.player(player));
          return undefined;
        }));
        orOptions.title = 'Select a parameter to increase';
      } else {
        orOptions.options.push(new SelectOption('Do not increase temperature', 'Increase', () => {
          return undefined;
        }));
        orOptions.title = 'Select to increase temperature or not';
      }

      this.defer(new DeferredAction(
        player,
        () => {
          return orOptions;
        },
      ));
      return undefined;
    }

    if (shouldRaiseOxygen) return this.increaseOxygenLevel(player, 1);
    return undefined;
  }

  public addCityTile(
    player: Player, spaceId: SpaceId, spaceType: SpaceType = SpaceType.LAND,
    cardName: string | undefined = undefined): void {
    const space = this.board.getSpace(spaceId);
    this.addTile(player, spaceType, space, {
      tileType: TileType.CITY,
      card: cardName,
    });
  }

  public canAddOcean(): boolean {
    return this.board.getOceanCount() < constants.MAX_OCEAN_TILES;
  }

  public canRemoveOcean(): boolean {
    const count = this.board.getOceanCount();
    return count > 0 && count < constants.MAX_OCEAN_TILES;
  }

  public addOceanTile(
    player: Player, spaceId: SpaceId,
    spaceType: SpaceType = SpaceType.OCEAN): void {
    if (this.canAddOcean() === false) return;

    this.addTile(player, spaceType, this.board.getSpace(spaceId), {
      tileType: TileType.OCEAN,
    });
    if (this.phase !== Phase.SOLAR && this.phase !== Phase.INTERGENERATION) {
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.OCEANS);
      player.increaseTerraformRating();
    }
    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onOceanPlaced(aresData, player);
    });
  }

  public removeTile(spaceId: string): void {
    const space = this.board.getSpace(spaceId);
    space.tile = undefined;
    space.player = undefined;
  }

  // 不包含体退玩家  有玩家体退之后可能出错，慎用
  public getPlayers(): ReadonlyArray<Player> {
    return this.players;
  }

  // Players returned in play order starting with first player this generation.
  public getPlayersInGenerationOrder(): Array<Player> {
    // We always return them in turn order
    const ret: Array<Player> = [];
    let insertIdx: number = 0;
    for (const p of this.players) {
      if (p.id === this.first.id || insertIdx > 0) {
        ret.splice(insertIdx, 0, p);
        insertIdx ++;
      } else {
        ret.push(p);
      }
    }
    return ret;
  }

  // 包含体退玩家
  public getAllPlayers(): Array<Player> {
    return this.getPlayersInGenerationOrder().concat(this.exitedPlayers);
  }

  public getCardPlayer(name: CardName): Player {
    for (const player of this.players) {
      // Check cards player has played
      for (const card of player.playedCards) {
        if (card.name === name) {
          return player;
        }
      }
      // Check player corporation
      if (player.corpName(name as CardName)) {
        return player;
      }
    }
    throw new Error(`No player has played ${name}`);
  }

  public getCardsInHandByResource(player: Player, resourceType: ResourceType) {
    return player.cardsInHand.filter((card) => card.resourceType === resourceType);
  }

  public getCardsInHandByType(player: Player, cardType: CardType) {
    return player.cardsInHand.filter((card) => card.cardType === cardType);
  }

  public log(message: string, f?: (builder: LogBuilder) => void, options?: {reservedFor?: Player}) {
    if (options !== undefined && options.reservedFor !== undefined) {
      // 玩家独有的日志会暴露敏感信息，其他玩家可以看到 该种日志一律隐藏
      return;
    }
    const builder = new LogBuilder(message);
    if (f) {
      f(builder);
    }
    const logMessage = builder.build();
    logMessage.playerId = options?.reservedFor?.id;
    this.gameLog.push(logMessage);
    this.gameAge++;
  }

  public someoneCanHaveProductionReduced(resource: Resources, minQuantity: number = 1): boolean {
    // in soloMode you don't have to decrease resources
    if (this.isSoloMode()) return true;
    return this.getPlayers().some((p) => {
      if (p.getProduction(resource) < minQuantity) return false;
      // The pathfindersExpansion test is just an optimization for non-Pathfinders games.
      if (this.gameOptions.pathfindersExpansion && p.cardIsInEffect(CardName.PRIVATE_SECURITY)) return false;
      return true;
    });
  }

  public discardForCost(toPlace: TileType) {
    const card = this.dealer.dealCard(this);
    this.dealer.discard(card);
    this.log('Drew and discarded ${0} (cost ${1}) to place a ${2}', (b) => b.card(card).number(card.cost).tileType(toPlace));
    return card.cost;
  }

  public getSpaceByOffset(direction: -1 | 1, toPlace: TileType) {
    const cost = this.discardForCost(toPlace);

    const distance = Math.max(cost-1, 0); // Some cards cost zero.
    const space = this.board.getNthAvailableLandSpace(distance, direction, undefined /* player */,
      (space) => {
        const adjacentSpaces = this.board.getAdjacentSpaces(space);
        return adjacentSpaces.every((sp) => sp.tile?.tileType !== TileType.CITY) && // no cities nearby
            adjacentSpaces.some((sp) => this.board.canPlaceTile(sp)); // can place forest nearby
      });
    if (space === undefined) {
      throw new Error('Couldn\'t find space when card cost is ' + cost);
    }
    return space;
  }

  // Custom replacer to transform Map and Set to Array
  public _replacer(key: any, value: any) {
    // Prevent infinite loop because deferredActions contains game object.
    if (key === 'deferredActions') {
      return [];
    } else if (value instanceof Player ) {
      if (Game.stringifyPlayers.get(value) ) {
        return {id: value.id};
      } else {
        Game.stringifyPlayers.set(value, true);
        return value;
      }
    } else if (value instanceof Card ) {
      const result:any = {};
      for (key in value) {
        if (key !== 'properties') {
          result[key] = (value as any)[key];
        }
      }
      result.name=value.name;
      return result;
    } else if (value instanceof GlobalEvent ) {
      return {'name': value.name};
    } else if ( key === '_game' && value !== undefined) {
      return {id: value.id};
    } else if (key === 'metadata') {
      // IProjecctCard
      return undefined;
    } else if (key === 'moonData') {
      return IMoonData.serialize(value);
    } else if (value instanceof Set) {
      return Array.from(value);
    } else if (value instanceof Map) {
      return Array.from(value.entries());
    }
    return value;
  }


  // Function used to rebuild each objects
  public loadFromJSON(d: SerializedGame, fullLoad:boolean = true): Game {
    if (!fullLoad) {
      return this.loadFromJSONHalf(d);
    }
    // Assign each attributes
    const o = Object.assign(this, d);
    // const cardFinder = new CardFinder();

    // Brand new deferred actions queue
    this.deferredActions = new DeferredActionsQueue();

    // 以前的记录没有保存gameOptions 需要从game属性里获取
    if (d.gameOptions === undefined) {
      this.gameOptions = DEFAULT_GAME_OPTIONS;
    }
    if ( d.venusNextExtension !== undefined && d.gameOptions.venusNextExtension !== d.venusNextExtension ) {
      for (const key in this.gameOptions) {
        if ((this as any)[key] !== undefined) {
          (this.gameOptions as any)[key] = (this as any)[key];
        }
      }
    }
    for (const key in DEFAULT_GAME_OPTIONS) {
      if ((this.gameOptions as any)[key] === undefined) {
        (this.gameOptions as any)[key] = (DEFAULT_GAME_OPTIONS as any)[key];
      }
    }

    // 以前randomMA 是boolean类型
    if (this.gameOptions.randomMA !== RandomMAOptionType.LIMITED && this.gameOptions.randomMA !== RandomMAOptionType.UNLIMITED) {
      this.gameOptions.randomMA = RandomMAOptionType.NONE;
    }

    // Rebuild dealer object to be sure that we will have cards in the same order
    this.dealer = Dealer.deserialize(d.dealer);

    // Rebuild every player objects
    this.players = d.players.map((element: SerializedPlayer) => {
      const player : Player = Player.deserialize(element);
      player.game = this;
      return player;
    });
    if (d.exitedPlayers === undefined) {
      d.exitedPlayers = [];
    }
    this.exitedPlayers = d.exitedPlayers.map((element: SerializedPlayer) => {
      const player : Player = Player.deserialize(element);
      player.game = this;
      return player;
    });
    const playersForBoard = this.getAllPlayers().length !== 1 ? this.getAllPlayers() : [this.getAllPlayers()[0], GameSetup.neutralPlayerFor(d.id)];
    // Rebuild milestones, awards and board elements
    if (this.gameOptions.boardName === BoardName.ELYSIUM) {
      this.board = ElysiumBoard.deserialize(d.board, playersForBoard);
    } else if (this.gameOptions.boardName === BoardName.HELLAS) {
      this.board = HellasBoard.deserialize(d.board, playersForBoard);
    } else if (this.gameOptions.boardName === BoardName.ARABIA_TERRA) {
      this.board = ArabiaTerraBoard.deserialize(d.board, playersForBoard);
    } else if (this.gameOptions.boardName === BoardName.VASTITAS_BOREALIS) {
      this.board = VastitasBorealisBoard.deserialize(d.board, playersForBoard);
    } else {
      this.board = OriginalBoard.deserialize(d.board, playersForBoard);
    }

    this.rng = new Random(d.seed, d.currentSeed);

    this.milestones = [];
    this.awards = [];

    d.milestones.forEach((element: IMilestone | string) => {
      let milestoneName = typeof element === 'string' ? element : element.name;
      if ( milestoneName === 'Tactitian') {
        milestoneName = 'Tactician';
      }
      const foundMilestone = ALL_MILESTONES.find((milestone) => milestone.name === milestoneName);
      if (foundMilestone !== undefined) {
        this.milestones.push(foundMilestone);
      }
    });

    d.awards.forEach((element: IAward | string) => {
      let awardName = typeof element === 'string' ? element : element.name;
      if ( awardName === 'DesertSettler') {
        awardName = 'Desert Settler';
      }
      if (awardName === 'EstateDealer') {
        awardName = 'Estate Dealer';
      }
      if (awardName === 'Entrepeneur') {
        awardName = 'Entrepreneur';
      }
      const foundAward = ALL_AWARDS.find((award) => award.name === awardName);
      if (foundAward !== undefined) {
        this.awards.push(foundAward);
      }
    });

    if (this.gameOptions.aresExtension) {
      this.aresData = d.aresData;
    }
    // Reload colonies elements if needed
    if (this.gameOptions.coloniesExtension) {
      this.colonyDealer = new ColonyDealer(this.rng);

      if (d.colonyDealer !== undefined) {
        this.colonyDealer.discardedColonies = d.colonyDealer.discardedColonies.map((x) => getColonyByName(x.name)!);
        // this.colonyDealer.coloniesDeck = d.colonyDealer.coloniesDeck.map((x) => getColonyByName(x.name)!);
      }

      this.colonies = deserializeColonies(d.colonies, this.getAllPlayers());
    }

    // Reload turmoil elements if needed
    if (d.turmoil && this.gameOptions.turmoilExtension) {
      this.turmoil = Turmoil.deserialize(d.turmoil, this);
    }

    // Reload moon elements if needed
    if (d.moonData !== undefined && this.gameOptions.moonExpansion === true) {
      this.moonData = IMoonData.deserialize(d.moonData, this.getAllPlayers());
    }

    if (d.pathfindersData !== undefined && this.gameOptions.pathfindersExpansion === true) {
      this.pathfindersData = IPathfindersData.deserialize(d.pathfindersData);
    }

    // Rebuild claimed milestones
    this.claimedMilestones = deserializeClaimedMilestones(d.claimedMilestones, this.getAllPlayers(), this.milestones);
    // Rebuild funded awards
    this.fundedAwards = deserializeFundedAwards(d.fundedAwards, this.getAllPlayers(), this.awards);

    // Rebuild passed players set
    this.passedPlayers = new Set<Player>();
    d.passedPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.passedPlayers.add(player);
      }
    });

    // Rebuild done players set
    this.donePlayers = new Set<Player>();
    d.donePlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.donePlayers.add(player);
      }
    });

    // Rebuild researched players set
    this.researchedPlayers = new Set<Player>();
    d.researchedPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.researchedPlayers.add(player);
      }
    });

    // Rebuild drafted players set
    this.draftedPlayers = new Set<Player>();
    d.draftedPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.draftedPlayers.add(player);
      }
    });


    // Mons insurance
    if (d.monsInsuranceOwner) {
      this.monsInsuranceOwner = this.players.find((player) => player.id === d.monsInsuranceOwner!.id);
    }

    // Reinit undrafted cards map
    this.unDraftedCards = new Map<Player, IProjectCard[]>();

    // Define who was the first player for this generation
    const first = this.players.find((player) => player.id === d.first.id);
    if (first === undefined) {
      throw new Error('No Player found when rebuilding First Player');
    }
    this.first = first;

    // Define who is the active player and init the take action phase
    let active = this.players.find((player) => player.id === d.activePlayer.id);
    if (active === undefined) {
      active = this.exitedPlayers.find((player) => player.id === d.activePlayer.id);
    }
    if (active === undefined) {
      throw new Error('No Player found when rebuilding Active Player');
    }
    this.activePlayer = active;


    // Still in Draft or Research of generation 1
    if (this.generation === 1 && this.players.some((p) => p.corpCard === undefined)) {
      if (this.phase === Phase.INITIALDRAFTING) {
        this.draftRound = 1;
        this.initialDraftIteration = 1;
        this.runDraftRound(true);
      } else {
        this.gotoInitialResearchPhase();
      }
    } else if (this.phase === Phase.DRAFTING) {
      this.runDraftRound();
    } else if (this.phase === Phase.RESEARCH) {
      // this.gotoResearchPhase();
      // 避免重复save 这里去除了gotoResearchPhase方法的保存逻辑
      this.researchedPlayers.clear();
      this.players.forEach((player) => {
        player.runResearchPhase(this.gameOptions.draftVariant && this.players.length > 1 );
      });
    } else {
      // We should be in ACTION phase, let's prompt the active player for actions
      this.activePlayer.takeAction();
    }
    this.loadState = LoadState.LOADED;
    return o;
  }

  public loadFromJSONHalf(d: SerializedGame): Game {
    this.id = d.id,
    this.phase = d.phase,
    this.createtime = d.createtime,
    this.updatetime = d.updatetime,
    this.gameAge = d.gameAge,
    this.lastSaveId = d.lastSaveId,

    // Rebuild every player objects
    this.players = d.players.map((element: SerializedPlayer) => {
      return {
        id: element.id,
        name: element.name,
        color: element.color,
        exited: element.exited,
        userId: element.userId,
      } as any as Player;
    });
    if (d.exitedPlayers === undefined) {
      d.exitedPlayers = [];
    }
    this.exitedPlayers = d.exitedPlayers.map((element: SerializedPlayer) => {
      return {
        id: element.id,
        name: element.name,
        color: element.color,
        exited: element.exited,
        userId: element.userId,
      } as any as Player;
    });

    let active = this.players.find((player) => player.id === d.activePlayer.id);
    if (active === undefined) {
      active = this.exitedPlayers.find((player) => player.id === d.activePlayer.id);
    }
    if (active) {
      this.activePlayer = active;
    }
    this.loadState = LoadState.HALFLOADED;
    return this;
  }

  public rollback() {
    if (this.lastSaveId > 0 ) {
      Database.getInstance().cleanGameSave(this.id, this.lastSaveId);
      Database.getInstance().restoreGame(this.id, this.lastSaveId-1, this, 'manager');
    }
  }

  public delete() {
    Database.getInstance().cleanGame(this.id);
  }

  public exitPlayer(player : Player) {
    if (player.canExitFun(this)) {
      if (this.first === player) {
        this.firstExited = false;// 两个人连续体退时
        this.incrementFirstPlayer();
        this.firstExited = true;
      }
      if (this.monsInsuranceOwner !== undefined && this.monsInsuranceOwner === player) {
        this.monsInsuranceOwner = undefined;
      }
      player.exited = true;
      player.setWaitingFor(undefined, undefined);
      player.timer.stop();
      this.exitedPlayers.push(player);
      this.passedPlayers.add(player);
      if (this.gameOptions.turmoilExtension && this.turmoil) {
        if (this.turmoil.lobby.delete(player.id)) {
          this.turmoil.delegateReserve.push(player);
        }
      }

      this.log('${0} resigned this game', (b) => b.player(player));
      if (this.allPlayersHavePassed()) {
        this.players.splice(this.players.indexOf(player), 1);
        this.gotoProductionPhase();
        return;
      } else {
        // playerIsFinishedTakingActions 会调用 getNextPlayer, 移除player之后会调用失败，所以先获取getPreviousPlayer
        const pre = this.getPlayerBefore(player);
        if (pre === undefined) {
          throw new Error('Did not find player');
        }
        this.activePlayer = pre;
        this.players.splice(this.players.indexOf(player), 1);
        this.playerIsFinishedTakingActions();
      }
    } else {
      throw new Error('this player can\'t resign');
    }
  }

  public logIllegalState(description: string, metadata: {}) {
    const gameMetadata = {
      gameId: this.id,
      lastSaveId: this.lastSaveId,
      logAge: this.gameLog.length,
      currentPlayer: this.activePlayer.id,

      metadata: metadata,
    };
    console.warn('Illegal state: ' + description, JSON.stringify(gameMetadata, null, ' '));
  }
}
