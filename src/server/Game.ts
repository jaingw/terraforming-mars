import * as constants from '../common/constants';
import {BeginnerCorporation} from './cards/corporation/BeginnerCorporation';
import {Board} from './boards/Board';
import {CardName} from '../common/cards/CardName';
import {ClaimedMilestone, serializeClaimedMilestones, deserializeClaimedMilestones} from './milestones/ClaimedMilestone';
import {IColony} from './colonies/IColony';
import {ColonyDealer} from './colonies/ColonyDealer';
import {Color} from '../common/Color';
import {ICorporationCard, isICorporationCard} from './cards/corporation/ICorporationCard';
import {Database} from './database/Database';
import {FundedAward, serializeFundedAwards, deserializeFundedAwards} from './awards/FundedAward';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';
import {Space} from './boards/Space';
import {Tile} from './Tile';
import {LogMessageBuilder} from './logs/LogMessageBuilder';
import {LogHelper} from './LogHelper';
import {LogMessage} from '../common/logs/LogMessage';
import {milestoneManifest} from './milestones/Milestones';
import {awardManifest} from './awards/Awards';
import {PartyHooks} from './turmoil/parties/PartyHooks';
import {Phase} from '../common/Phase';
import {IPlayer} from './IPlayer';
import {Player} from './Player';
import {PlayerId, GameId, SpectatorId, SpaceId} from '../common/Types';
import {PlayerInput} from './PlayerInput';
import {CardResource} from '../common/CardResource';
import {Resource} from '../common/Resource';
import {AndThen, DeferredAction, SimpleDeferredAction} from './deferredActions/DeferredAction';
import {Priority} from './deferredActions/Priority';
import {DeferredActionsQueue} from './deferredActions/DeferredActionsQueue';
import {SelectPaymentDeferred} from './deferredActions/SelectPaymentDeferred';
import {SelectInitialCards} from './inputs/SelectInitialCards';
import {PlaceOceanTile} from './deferredActions/PlaceOceanTile';
import {RemoveColonyFromGame} from './deferredActions/RemoveColonyFromGame';
import {GainResources} from './deferredActions/GainResources';
import {SerializedGame} from './SerializedGame';
import {SpaceBonus} from '../common/boards/SpaceBonus';
import {TileType} from '../common/TileType';
import {Turmoil} from './turmoil/Turmoil';
import {TurmoilUtil} from './turmoil/TurmoilUtil';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';
import {AresHandler} from './ares/AresHandler';
import {AresData, deserializeAresData} from '../common/ares/AresData';
import {getDate} from './UserUtil';
import {BREAKTHROUGH_CARD_MANIFEST} from './cards/breakthrough/BreakthroughCardManifest';
import {GameSetup} from './GameSetup';
import {GameCards} from './GameCards';
import {GlobalParameter} from '../common/GlobalParameter';
import {AresSetup} from './ares/AresSetup';
import {MoonData} from './moon/MoonData';
import {MoonExpansion} from './moon/MoonExpansion';
import {TurmoilHandler} from './turmoil/TurmoilHandler';
import {SeededRandom} from '../common/utils/Random';
import {chooseMilestonesAndAwards} from './ma/MilestoneAwardSelector';
import {OrOptions} from './inputs/OrOptions';
import {BoardType} from './boards/BoardType';
import {MultiSet} from 'mnemonist';
import {SelectOption} from './inputs/SelectOption';
import {SelectCard} from './inputs/SelectCard';
import {GrantVenusAltTrackBonusDeferred} from './venusNext/GrantVenusAltTrackBonusDeferred';
import {PathfindersExpansion} from './pathfinders/PathfindersExpansion';
import {PathfindersData} from './pathfinders/PathfindersData';
import {AddResourcesToCard} from './deferredActions/AddResourcesToCard';
import {IShortData} from './database/IDatabase';
import {ColonyDeserializer} from './colonies/ColonyDeserializer';
import {DEFAULT_GAME_OPTIONS, GameOptions} from './game/GameOptions';
import {IPathfindersData} from './pathfinders/IPathfindersData';
import {CorporationDeck, PreludeDeck, ProjectDeck, CeoDeck} from './cards/Deck';
import {Logger} from './logs/Logger';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {addDays, stringToNumber} from './database/utils';
import {Tag} from '../common/cards/Tag';
import {IGame, Score} from './IGame';
import {CardManifest} from './cards/ModuleManifest';
import {MarsBoard} from './boards/MarsBoard';
import {UnderworldData} from './underworld/UnderworldData';
import {UnderworldExpansion} from './underworld/UnderworldExpansion';
import {Dealer} from './Dealer';
import {getNewSkills, UserRank} from '../common/rank/RankManager';
import {getSeasonId, getWinnerPointsReward} from '../common/rank/SeasonManager';
import {SendDelegateToArea} from './deferredActions/SendDelegateToArea';
import {InputError} from './inputs/InputError';
import {BuildColony} from './deferredActions/BuildColony';
import {newInitialDraft, newStandardDraft} from './Draft';
import {sum, toID, toName} from '../common/utils/utils';
import {SelectSpace} from './inputs/SelectSpace';
import {maybeRenamedMilestone} from '../common/ma/MilestoneName';
import {maybeRenamedAward} from '../common/ma/AwardName';
import {Eris} from './cards/community/Eris';
import {AresHazards} from './ares/AresHazards';
import {hazardSeverity} from '../common/AresTileType';
import {IStandardProjectCard} from './cards/IStandardProjectCard';

// Can be overridden by tests

let createGameLog: () => Array<LogMessage> = () => [];

export function setGameLog(f: () => Array<LogMessage>) {
  createGameLog = f;
}

export enum LoadState {
  HALFLOADED = 'halfloaded',
  LOADING = 'loading',
  LOADED = 'loaded'
}

export class Game implements IGame, Logger {
  public exitedPlayers: Array<IPlayer> = [];// 体退玩家list 必须放在第一位 避免数据库序列化丢失数据
  public id: GameId;
  public gameOptions: GameOptions;
  private _players: ReadonlyArray<IPlayer> = [];
  public get players(): ReadonlyArray<IPlayer> {
    return this._players;
  }
  private set players(_players: ReadonlyArray<IPlayer>) {
    this._players = _players;
    this.playersInGenerationOrder = this._players;
  }
  // The API makes this readonly.
  public playersInGenerationOrder: ReadonlyArray<IPlayer> = [];

  // Game-level data
  public loadState : string = LoadState.HALFLOADED;
  public lastSaveId: number = 0;
  private clonedGamedId: string | undefined;
  public rng: SeededRandom;
  public spectatorId: SpectatorId | undefined;
  public deferredActions: DeferredActionsQueue = new DeferredActionsQueue();
  public createdTime: Date = new Date(0);
  // 前端需要根据gameAge 和 undoCount 来判断是否刷新, undoCount 用于获取其他玩家撤回的刷新
  public gameAge: number = 0; // Each log event increases it
  public gameLog: Array<LogMessage> = createGameLog();
  public undoCount: number = 0; // Each undo increases it， 不入库，所以不会大于1
  public inputsThisRound = 0;
  public resettable: boolean = false; // 显示reset按钮 ， 用不上的属性
  public globalsPerGeneration: Array<Partial<Record<GlobalParameter, number>>> = [];

  public generation: number = 1;
  public phase: Phase = Phase.RESEARCH;
  public projectDeck: ProjectDeck;
  public preludeDeck: PreludeDeck;
  public ceoDeck: CeoDeck;
  public corporationDeck: CorporationDeck;
  public board: MarsBoard;
  public createtime :string = getDate();
  public updatetime :string = getDate();
  private firstExited : boolean = false;// 本时代起始玩家体退 跳过世界政府，时代结束不替换起始玩家

  // Global parameters
  private oxygenLevel: number = constants.MIN_OXYGEN_LEVEL;
  private temperature: number = constants.MIN_TEMPERATURE;
  private venusScaleLevel: number = constants.MIN_VENUS_SCALE;

  // Player data
  public activePlayer: IPlayer;
  /** Players that are done with the game after final greenery placement. */
  private donePlayers: Set<IPlayer> = new Set<IPlayer>();// 结束游戏时已放完最后的绿化
  private passedPlayers: Set<IPlayer> = new Set<IPlayer>();
  private researchedPlayers: Set<IPlayer> = new Set<IPlayer>();
  /** The first player of this generation. */
  public first: IPlayer;

  // Drafting
  public draftRound: number = 1; // 轮抽到几张牌了
  public initialDraftIteration: number = 1;// 初始轮抽轮次：第一次5张为1,第二次5张为2，前序为3, 公司为4

  // Milestones and awards
  public claimedMilestones: Array<ClaimedMilestone> = [];
  public milestones: Array<IMilestone> = [];
  public fundedAwards: Array<FundedAward> = [];
  public awards: Array<IAward> = [];

  // Expansion-specific data
  public colonies: Array<IColony> = [];
  public discardedColonies: Array<IColony> = []; // Not serialized
  public turmoil: Turmoil | undefined;
  public aresData: AresData | undefined;
  public moonData: MoonData | undefined;
  public pathfindersData: PathfindersData | undefined;
  public underworldData: UnderworldData = UnderworldExpansion.initializeGameWithoutUnderworld();
  public inTurmoil: boolean = false;

  // Card-specific data
  // Mons Insurance promo corp
  public monsInsuranceOwner?: IPlayer;
  // Crash Site promo project
  public someoneHasRemovedOtherPlayersPlants: boolean = false;
  // United Nations Mission One community corp
  public unitedNationsMissionOneOwner: PlayerId | undefined = undefined;
  // 玩家的行动是否动过牌库， 是的话禁止撤回
  public cardDrew: boolean = false;
  // 星际领航者的殖民判定
  public finishFirstTrading: boolean = false;
  // Energy Station 判定
  public energyStationOwner?: IPlayer;
  // WG Partnership 判断
  public wgPartnershipOwner?: IPlayer;

  // Syndicate Pirate Raids
  public syndicatePirateRaider?: PlayerId;
  // Gagarin Mobile Base
  public gagarinBase: Array<SpaceId> = [];
  // St. Joseph of Cupertino Mission
  stJosephCathedrals: Array<SpaceId> = [];
  // Mars Nomads
  nomadSpace: SpaceId | undefined = undefined;
  // Trade Embargo
  public tradeEmbargo: boolean = false;
  // Behold The Emperor
  public beholdTheEmperor: boolean = false;
  // Double Down
  public inDoubleDown: boolean = false;
  // Vermin
  public verminInEffect: boolean = false;
  public exploitationOfVenusInEffect: boolean = false;

  /* The set of tags available in this game. */
  public tags: ReadonlyArray<Tag>;

  // Rank Mode
  public quitPlayers: Set<IPlayer> = new Set<IPlayer>;// 天梯 玩家申请退出游戏 所有人均同意则废弃游戏
  public endGameInProgress: boolean = false; // 锁 避免同时多次访问`endGame`
  public underworldDraftEnabled = false;

  private constructor(
    id: GameId,
    players: Array<IPlayer>,
    first: IPlayer,
    gameOptions: GameOptions,
    rng: SeededRandom,
    board: MarsBoard,
    projectDeck: ProjectDeck,
    corporationDeck: CorporationDeck,
    preludeDeck: PreludeDeck,
    ceoDeck: CeoDeck,
    tags: ReadonlyArray<Tag>) {
    this.id = id;
    this.gameOptions = {...gameOptions};
    this._players = players;
    const playerIds = players.map(toID);
    if (playerIds.includes(first.id) === false) {
      throw new Error('Cannot find first player ' + first.id + ' in [' + playerIds + ']');
    }
    if (new Set(playerIds).size !== players.length) {
      throw new Error('Duplicate player found: [' + playerIds + ']');
    }
    const colors = players.map((p) => p.color);
    if (new Set(colors).size !== players.length) {
      throw new Error('Duplicate color found: [' + colors + ']');
    }

    this.first = first; // To satisfy the constructor.
    this.setFirstPlayer(first);
    this.rng = rng;
    this.projectDeck = projectDeck;
    this.corporationDeck = corporationDeck;
    this.preludeDeck = preludeDeck;
    this.ceoDeck = ceoDeck;
    this.board = board;

    this.players.forEach((player) => {
      player.setup(this);
      if (player.tableau.has(CardName.MONS_INSURANCE)) this.monsInsuranceOwner = player;
      if (player.tableau.has(CardName.ENERGY_STATION)) this.energyStationOwner = player;
      if (player.tableau.has(CardName.WG_PARTNERSHIP)) this.wgPartnershipOwner = player;
    });

    this.tags = tags;

    this.activePlayer = first;
  }

  private setFirstPlayer(first: IPlayer) {
    this.first = first;
    const e = [...this.players, ...this.players];
    const idx = e.findIndex((p) => p.id === this.first.id);
    this.playersInGenerationOrder = e.slice(idx, idx + this.players.length);
  }

  // 从数据库加载 ，跳过初始化环节
  public static rebuild(id: GameId,
    players: Array<IPlayer>,
    firstPlayer: IPlayer,
    gameOptions: GameOptions = {...DEFAULT_GAME_OPTIONS},
    seed = 0): Game {
    if (gameOptions.clonedGamedId !== undefined) {
      throw new Error('Cloning should not come through this execution path.');
    }
    const rng = new SeededRandom(seed);
    const board = GameSetup.newBoard(gameOptions, rng);

    const projectDeck = new ProjectDeck([], [], rng);

    const corporationDeck = new CorporationDeck([], [], rng);
    const preludeDeck = new PreludeDeck([], [], rng);
    const ceoDeck = new CeoDeck([], [], rng);
    const game: Game = new Game(id, players, firstPlayer, gameOptions, rng, board, projectDeck, corporationDeck, preludeDeck, ceoDeck, []);
    return game;
  }

  public static newInstance(id: GameId,
    players: Array<IPlayer>,
    firstPlayer: IPlayer,
    options: Partial<GameOptions> = {},
    seed = 0,
    spectatorId: SpectatorId | undefined = undefined): Game {
    if (options.expansions === undefined) {
      options.expansions = {
        corpera: options.corporateEra ?? false,
        venus: options.venusNextExtension ?? false,
        colonies: options.coloniesExtension ?? false,
        prelude: options.preludeExtension ?? false,
        prelude2: options.prelude2Expansion ?? false,
        turmoil: options.turmoilExtension ?? false,
        promo: options.promoCardsOption ?? false,
        community: options.communityCardsOption ?? false,
        ares: options.aresExtension ?? false,
        moon: options.moonExpansion ?? false,
        pathfinders: options.pathfindersExpansion ?? false,
        ceo: options.ceoExtension ?? false,
        starwars: options.starWarsExpansion ?? false,
        underworld: options.underworldExpansion ?? false,
        breakthrough: options.breakthrough ?? false,
        eros: options.erosCardsOption ?? false,
        commission: options.commissionCardsOption ?? false,
      };
    }
    const gameOptions = {...DEFAULT_GAME_OPTIONS, ...options};
    if (gameOptions.clonedGamedId !== undefined) {
      throw new Error('Cloning should not come through this execution path.');
    }
    const rng = new SeededRandom(seed);
    const board = GameSetup.newBoard(gameOptions, rng);
    const gameCards = new GameCards(gameOptions);

    const projectDeck = new ProjectDeck(gameCards.getProjectCards(), [], rng);
    projectDeck.shuffle();

    const corporationCards = gameCards.getCorporationCards();
    // corporationCards 作为全部可选公司卡，需将customCorporationCards中的卡添加到corporationCards中
    const breakCardNames = CardManifest.keys(BREAKTHROUGH_CARD_MANIFEST.corporationCards);
    const customCorporationCards = gameOptions.customCorporationsList.filter((cardName) => {
      // 过滤掉初始公司,突破公司，不兼容的公司
      if (cardName === CardName.BEGINNER_CORPORATION) return false;
      const corpC = GameCards.isCorpCompatibleWith(cardName, gameOptions);
      const breakC = breakCardNames.find((k) => k === cardName);
      if (breakC !== undefined) return false;
      if (corpC !== undefined ) {
        // 自选公司中  兼容已选扩展、未在选中扩展中的公司   添加进去
        if (corporationCards.find((x)=> x.name === corpC.name) === undefined) {
          corporationCards.push(corpC);
        }
        return true;
      }
      return false;
    });
    if (gameOptions.breakthrough) {
      const breakCards = CardManifest.values(BREAKTHROUGH_CARD_MANIFEST.corporationCards);
      corporationCards.forEach((card, index) => {
        const cardFactory = breakCards.find((cardFactory) => cardFactory.cardName_ori === card.name);
        if (cardFactory !== undefined) {
          corporationCards.splice(index, 1, new cardFactory.Factory() );
        }
      });
      customCorporationCards.forEach((cardName, index ) => {
        const cardFactory = breakCards.find((cardFactory) => cardFactory.cardName_ori === cardName);
        if (cardFactory !== undefined) {
          customCorporationCards.splice(index, 1, new cardFactory.Factory().name);
        }
      });
    }
    // customCorporationCards洗牌之后会在最上面
    const corporationDeck = new CorporationDeck(corporationCards, [], rng);
    corporationDeck.shuffle(customCorporationCards);


    const preludeDeck = new PreludeDeck(gameCards.getPreludeCards(), [], rng);
    preludeDeck.shuffle(gameOptions.customPreludes);

    const ceoDeck = new CeoDeck(gameCards.getCeoCards(), [], rng);
    ceoDeck.shuffle(gameOptions.customCeos);

    const tags = new Set<Tag>();
    for (const deck of [projectDeck, corporationDeck, preludeDeck, ceoDeck]) {
      for (const card of deck.drawPile) {
        for (const tag of card.tags) {
          tags.add(tag);
        }
      }
    }

    const game: Game = new Game(id, players, firstPlayer, gameOptions, rng, board, projectDeck, corporationDeck, preludeDeck, ceoDeck, Array.from(tags));


    if (players.length === 1) {
      gameOptions.draftVariant = false;
      gameOptions.initialDraftVariant = false;
      gameOptions.preludeDraftVariant = false;
      gameOptions.randomMA = RandomMAOptionType.NONE;

      // Single player game player starts with 14TR
      players[0].setTerraformRating(14);
    }
    game.spectatorId = spectatorId;
    // This evaluation of created time doesn't match what's stored in the database, but that's fine.
    game.createdTime = new Date();
    // Initialize Ares data
    if (gameOptions.aresExtension) {
      game.aresData = AresSetup.initialData(gameOptions.aresHazards, players);
    }

    const {milestones, awards} = chooseMilestonesAndAwards(gameOptions);
    game.milestones = milestones.map(milestoneManifest.createOrThrow);
    game.awards = awards.map(awardManifest.createOrThrow);

    // Add colonies stuff
    if (gameOptions.coloniesExtension) {
      const colonyDealer = new ColonyDealer(rng, gameOptions);
      colonyDealer.drawColonies(players.length);
      game.colonies = colonyDealer.colonies;
      game.discardedColonies = colonyDealer.discardedColonies;
    }

    // Add Turmoil stuff
    if (gameOptions.turmoilExtension) {
      game.turmoil = Turmoil.newInstance(game, gameOptions.politicalAgendasExtension);
    }

    // Must configure this before solo placement.
    if (gameOptions.underworldExpansion) {
      game.underworldData = UnderworldExpansion.initialize(rng);
    }

    // and 2 neutral cities and forests on board
    if (players.length === 1) {
      //  Setup solo player's starting tiles
      GameSetup.setupNeutralPlayer(game);
    }

    // Setup Ares hazards
    if (gameOptions.aresExtension && gameOptions.aresHazards) {
      AresSetup.setupHazards(game);
    }

    if (gameOptions.moonExpansion) {
      game.moonData = MoonExpansion.initialize(gameOptions, rng);
    }

    if (gameOptions.pathfindersExpansion) {
      game.pathfindersData = PathfindersExpansion.initialize(game);
    }

    // Failsafe for exceeding corporation pool
    // (I do not think this is necessary any further given how corporation cards are stored now)
    const minCorpsRequired = players.length * gameOptions.startingCorporations;

    if (minCorpsRequired > corporationDeck.drawPile.length) {
      gameOptions.startingCorporations = 2;
    }

    // Initialize each player:
    // Give them their corporation cards, other cards, starting production,
    // handicaps.
    for (const player of game.playersInGenerationOrder) {
      player.heatForTemperature = gameOptions.heatFor ? 7 : 8;
      player.setTerraformRating(player.terraformRating + player.handicap);
      if (!gameOptions.corporateEra) {
        player.production.override({
          megacredits: 1,
          steel: 1,
          titanium: 1,
          plants: 1,
          energy: 1,
          heat: 1,
        });
      }

      if (!player.beginner ||
        // Bypass beginner choice if any extension is choosen
        gameOptions.ceoExtension ||
        gameOptions.preludeExtension ||
        gameOptions.prelude2Expansion ||
        gameOptions.venusNextExtension ||
        gameOptions.coloniesExtension ||
        gameOptions.turmoilExtension ||
        gameOptions.initialDraftVariant ||
        gameOptions.preludeDraftVariant ||
        gameOptions.underworldExpansion ||
        gameOptions.moonExpansion) {
        player.dealtCorporationCards.push(...corporationDeck.drawN(game, gameOptions.startingCorporations));
        if (gameOptions.initialDraftVariant === false) {
          // 发牌
          player.dealtProjectCards.push(...projectDeck.drawN(game, 10));
        }
        if (gameOptions.preludeExtension) {
          gameOptions.startingPreludes = Math.max(gameOptions.startingPreludes ?? 0, constants.PRELUDE_CARDS_DEALT_PER_PLAYER);
          player.dealtPreludeCards.push(...preludeDeck.drawN(game, gameOptions.startingPreludes));
          // player.dealtPreludeCards.push(...preludeDeck.drawN(game, 36));
        }
        if (gameOptions.ceoExtension) {
          const max = Math.min(gameOptions.startingCeos, Math.floor(ceoDeck.drawPile.length / players.length));
          player.dealtCeoCards.push(...ceoDeck.drawN(game, max));
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

    // 天梯
    if (game.isRankMode() && game.gameOptions.rankTimeLimit !== undefined && game.gameOptions.rankTimePerGeneration !== undefined) {
      game.generation === 1 ?
        game.log('This game is Rank Mode. You will have ${0} minutes at beginning!', (b) => b.number(game.gameOptions.rankTimeLimit || 0)) :
        game.log('You get extra ${0} minutes this generation.', (b) => b.number(game.gameOptions.rankTimePerGeneration || 0));
    }

    // 设置phase并提前保存，此时还没有派发轮抽手牌，避免重启之后手牌变化
    if (game.gameOptions.initialDraftVariant) {
      game.phase = Phase.INITIALDRAFTING;
    }
    Database.getInstance().saveGame(game);

    game.gotoInitialPhase();
    return game;
  }

  /** Properly starts the game with the project draft, or initial research phase. */
  private gotoInitialPhase(): void {
    // Initial Draft
    if (this.gameOptions.initialDraftVariant) {
      this.phase = Phase.INITIALDRAFTING;
      newInitialDraft(this).startDraft(true);
    } else {
      this.gotoInitialResearchPhase();
    }
  }

  public async save(): Promise<void> {
    /*
      * Because we save at the start of a player's takeAction, we need to
      * save the game in the database before increasing lastSaveId so that
      * reloading it doesn't create another new save on top of it, like this:
      *
      * increment -> save -> reload -> increment -> save
      *
      */
    this.lastSaveId += 1;
    this.updatetime = getDate();
    this.cardDrew = false;
    await Database.getInstance().saveGame(this); // jiang  GameLoader.getInstance().saveGame(this);  old     Database.getInstance().saveGame(this);
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

  public serialize(): SerializedGame {
    const result: SerializedGame = {
      exitedPlayers: Array.from(this.exitedPlayers).map((p) => p.serialize()),
      activePlayer: this.activePlayer.serializeId(),
      awards: this.awards.map((a) => {
        return {name: a.name} as IAward;
      }),
      beholdTheEmperor: this.beholdTheEmperor,
      board: this.board.serialize(),
      claimedMilestones: serializeClaimedMilestones(this.claimedMilestones),
      ceoDeck: this.ceoDeck.serialize(),
      colonies: this.colonies.map((colony) => colony.serialize()),
      corporationDeck: this.corporationDeck.serialize(),
      createdTimeMs: this.createdTime.getTime(),
      currentSeed: this.rng.current,
      deferredActions: [],
      donePlayers: Array.from(this.donePlayers).map((p) => p.serializeId()),
      draftRound: this.draftRound,
      exploitationOfVenusInEffect: this.exploitationOfVenusInEffect,
      first: this.first.serializeId(),
      fundedAwards: serializeFundedAwards(this.fundedAwards),
      gagarinBase: this.gagarinBase,
      stJosephCathedrals: this.stJosephCathedrals,
      nomadSpace: this.nomadSpace,
      gameAge: this.gameAge,
      gameLog: this.gameLog,
      gameOptions: this.gameOptions,
      generation: this.generation,
      globalsPerGeneration: this.globalsPerGeneration,
      id: this.id,
      initialDraftIteration: this.initialDraftIteration,
      lastSaveId: this.lastSaveId,
      milestones: this.milestones.map((m) => {
        return {name: m.name} as IMilestone;
      }),
      monsInsuranceOwner: this.monsInsuranceOwner?.serializeId(),
      energyStationOwner: this.energyStationOwner?.serializeId(),
      wgPartnershipOwner: this.wgPartnershipOwner?.serializeId(),
      moonData: MoonData.serialize(this.moonData),
      oxygenLevel: this.oxygenLevel,
      passedPlayers: Array.from(this.passedPlayers).map((p) => p.serializeId()),
      pathfindersData: PathfindersData.serialize(this.pathfindersData),
      phase: this.phase,
      players: this.players.map((p) => p.serialize()),
      preludeDeck: this.preludeDeck.serialize(),
      projectDeck: this.projectDeck.serialize(),
      researchedPlayers: Array.from(this.researchedPlayers).map((p) => p.serializeId()),
      seed: this.rng.seed,
      someoneHasRemovedOtherPlayersPlants: this.someoneHasRemovedOtherPlayersPlants,
      spectatorId: this.spectatorId,
      syndicatePirateRaider: this.syndicatePirateRaider,
      tags: this.tags,
      temperature: this.temperature,
      tradeEmbargo: this.tradeEmbargo,
      underworldData: this.underworldData,
      undoCount: this.undoCount,
      venusScaleLevel: this.venusScaleLevel,
      verminInEffect: this.verminInEffect,
      createtime: this.createtime,
      updatetime: this.updatetime,
      breakthrough: this.gameOptions.breakthrough,
      cardDrew: this.cardDrew,
      heatFor: this.gameOptions.heatFor,
      loadState: this.loadState,
      firstExited: this.firstExited,
      finishFirstTrading: this.finishFirstTrading,
      // unDraftedCards: this.unDraftedCards,
      unitedNationsMissionOneOwner: this.unitedNationsMissionOneOwner,
      quitPlayers: Array.from(this.quitPlayers).map((p) => p.serializeId()),
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
    return this.getAllPlayers().length === 1;
  }

  // Function to retrieve a player by it's id
  public getPlayerById(id: PlayerId): IPlayer {
    let player = this.players.find((p) => p.id === id);
    if (player === undefined) {
      player = this.exitedPlayers.find((p) => p.id === id);
    }
    if (player === undefined) {
      throw new Error(`player ${id} does not exist on game ${this.id}`);
    }
    return player;
  }

  public defer<T>(action: DeferredAction<T>, priority?: Priority): AndThen<T> {
    if (priority !== undefined) {
      action.priority = priority;
    }
    this.deferredActions.push(action);
    return action;
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
          moonData.habitatRate === constants.MAXIMUM_HABITAT_RATE &&
          moonData.miningRate === constants.MAXIMUM_MINING_RATE &&
          moonData.logisticRate === constants.MAXIMUM_LOGISTICS_RATE;
        globalParametersMaxed = globalParametersMaxed && moonMaxed;
      }
    });

    // Solo games with Venus needs Venus maxed to end the game.
    if (this.isSoloMode() && this.gameOptions.venusNextExtension) {
      return globalParametersMaxed && venusMaxed;
    }
    // Option "requiresVenusTrackCompletion" also makes maximizing Venus a game-end requirement
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
    if (!this.isSoloMode()) {
      return false;
    }
    // Solo TR victory condition
    if (this.gameOptions.soloTR) {
      return this.players[0].terraformRating >= 63;
    }

    // Complete terraforing victory condition.
    if (!this.marsIsTerraformed()) {
      return false;
    }

    // Ares Extreme: Solo player must remove all unprotected hazards to win
    if (this.gameOptions.aresExtension && this.gameOptions.aresExtremeVariant) {
      const unprotectedHazardsRemaining = Eris.getAllUnprotectedHazardSpaces(this);
      if (unprotectedHazardsRemaining.length > 0) return false;
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

  public fundAward(player: IPlayer, award: IAward): void {
    if (this.allAwardsFunded()) {
      throw new Error('All awards already funded');
    }
    this.log('${0} funded ${1} award',
      (b) => b.player(player).award(award));

    if (this.hasBeenFunded(award)) {
      throw new Error(award.name + ' cannot is already funded.');
    }
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

  private playerHasPickedCorporationCard(player: IPlayer, corporationCard: ICorporationCard, corporationCard2: ICorporationCard | undefined) {
    // TODO(kberg): I think we can get rid of this weird validation at a later time.
    player.pickedCorporationCard = corporationCard;
    player.pickedCorporationCard2 = corporationCard2;
    if (this.players.every((p) => p.pickedCorporationCard !== undefined)) {
      if (this.gameOptions.doubleCorp) {
        const game = this;
        const chooseFirstCorp = function() {
          for (const somePlayer of game.playersInGenerationOrder) {
            if (somePlayer.playedCards.corporations().length === 0) {
              if (somePlayer.pickedCorporationCard === undefined || somePlayer.pickedCorporationCard2 === undefined) {
                throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
              }
              somePlayer.setWaitingFor(new SelectCard(
                'Select corp card to play first',
                'Play',
                [somePlayer.pickedCorporationCard, somePlayer.pickedCorporationCard2],
              ).andThen((foundCards: ReadonlyArray<ICorporationCard>) => {
                if (somePlayer.pickedCorporationCard === undefined || somePlayer.pickedCorporationCard2 === undefined) {
                  throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
                }
                somePlayer.playCorporationCard( foundCards[0]);
                somePlayer.playCorporationCard( somePlayer.pickedCorporationCard.name === foundCards[0].name ? somePlayer.pickedCorporationCard2 : somePlayer.pickedCorporationCard);
                somePlayer.pickedCorporationCard = undefined;
                somePlayer.pickedCorporationCard2 = undefined;
                game.playerIsFinishedWithResearchPhase(somePlayer);
                return undefined;
              })
              , () => {
                chooseFirstCorp();
              },
              );
              break;
            }
          }
        };
        chooseFirstCorp();
      } else {
        for (const somePlayer of this.playersInGenerationOrder) {
          if (somePlayer.pickedCorporationCard === undefined) {
            throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
          }
          somePlayer.playCorporationCard(somePlayer.pickedCorporationCard);
          this.playerIsFinishedWithResearchPhase(somePlayer);
        }
      }
    }
  }


  private selectInitialCards(player: IPlayer): PlayerInput {
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
      if (startingMegaCredits < 0) {
        player.cardsInHand = [];
        player.preludeCardsInHand = [];
        player.ceoCardsInHand = [];
        throw new InputError('Too many cards selected');
      }
      this.playerHasPickedCorporationCard(player, corporationCard, corporationCard2);
      return undefined;
    });
  }

  public hasPassedThisActionPhase(player: IPlayer): boolean {
    return this.passedPlayers.has(player);
  }

  // Public for testing.
  public incrementFirstPlayer(): void {
    if (this.firstExited) {
      this.firstExited = false;
      return;
    }
    let firstIndex = this.players.map(toID).indexOf(this.first.id);
    if (firstIndex === -1) {
      throw new Error('Didn\'t even find player');
    }
    firstIndex = (firstIndex + 1) % this.players.length;
    const first = this.players[firstIndex];
    this.setFirstPlayer(first);
  }

  // Only used in the prelude The New Space Race.
  public overrideFirstPlayer(newFirstPlayer: IPlayer): void {
    if (newFirstPlayer.game.id !== this.id) {
      throw new Error(`player ${newFirstPlayer.id} is not part of this game`);
    }
    this.setFirstPlayer(newFirstPlayer);
  }

  /**
   * 两种方式调用 1、非初始轮抽，开局发完牌调用该方法；2、初始轮抽完，调用该方法
   * 初始轮抽选完牌后会将 phase 置为Phase.RESEARCH 并保存， 重新load时可以直接调用该方法选择买牌
   */
  public gotoInitialResearchPhase(save:boolean = false): void {
    this.phase = Phase.RESEARCH;
    if (save) {
      this.save();
    }
    for (const player of this.players) {
      if (player.pickedCorporationCard === undefined && player.dealtCorporationCards.length > 0) {
        player.setWaitingFor(this.selectInitialCards(player));
      }
    }
    if (this.players.length === 1 && this.gameOptions.coloniesExtension) {
      this.players[0].production.add(Resource.MEGACREDITS, -2);
      this.defer(new RemoveColonyFromGame(this.players[0]));
    }
  }

  public gotoResearchPhase(): void {
    this.phase = Phase.RESEARCH;
    this.researchedPlayers.clear();

    // 非轮抽这时还没有发牌，不能保存
    if (this.gameOptions.draftVariant && this.players.length > 1 ) {
      this.save();
    }
    this.players.forEach((player) => {
      player.runResearchPhase();
    });
  }

  private gotoDraftPhase(): void {
    this.phase = Phase.DRAFTING;
    this.draftRound = 1;
    newStandardDraft(this).startDraft(true);
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
      player.colonies.cardDiscount = 0; // Iapetus reset hook
      player.runProductionPhase();
    });
    this.postProductionPhase();
  }

  private postProductionPhase(): void {
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.postProductionPhase());
      return;
    }
    if (this.gameIsOver()) {
      console.log('postProductionPhase takeNextFinalGreeneryAction  ' + this.id);
      this.log('Final greenery placement', (b) => b.forNewGeneration());
      // chaos生产之后会需要选择资源，先选完再执行放树
      this.deferredActions.runAll(() => this.takeNextFinalGreeneryAction());
      return;
    } else {
      this.players.forEach((player) => {
        player.colonies.returnTradeFleets();
      });
    }

    // solar Phase Option
    this.phase = Phase.SOLAR;

    // Maybe spawn a new hazard on Mars every 3 generations
    if (this.gameOptions.aresExtension && this.gameOptions.aresExtremeVariant && this.generation % 3 === 0) {
      const direction = Math.floor(this.rng.nextInt(2)) === 0 ? 'top' : 'bottom';
      const tileType = this.board.getOceanSpaces().length >= 3 ? TileType.EROSION_MILD : TileType.DUST_STORM_MILD;

      AresHazards.randomlyPlaceHazard(this, tileType, direction);
    }

    if (this.gameOptions.solarPhaseOption && ! this.marsIsTerraformed()) {
      this.gotoWorldGovernmentTerraforming();
      return;
    }
    this.gotoEndGeneration();
  }

  private endGenerationForColonies() {
    if (this.gameOptions.coloniesExtension) {
      this.colonies.forEach((colony) => {
        colony.endGeneration(this);
      });
      // Syndicate Pirate Raids hook. Also see Colony.ts and Player.ts
      this.syndicatePirateRaider = undefined;
      // Trade embargo hook.
      this.tradeEmbargo = false;
    }
  }

  private gotoEndGeneration() {
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.gotoEndGeneration());
      return;
    }

    this.endGenerationForColonies();
    UnderworldExpansion.endGeneration(this);

    TurmoilUtil.ifTurmoil(this, (turmoil) => {
      // this.phase = Phase.TURMOIL;
      this.inTurmoil = true;
      turmoil.endGeneration(this);
      // Behold The Emperor hook
      this.beholdTheEmperor = false;
    });

    // turmoil.endGeneration might have added actions.
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.startGeneration());
    } else {
      this.inTurmoil = false;
      this.startGeneration();
    }
  }

  private updatePlayerVPForTheGeneration(): void {
    this.players.forEach((player) => {
      player.victoryPointsByGeneration.push(player.getVictoryPoints().total);
    });
  }

  private updateGlobalsForTheGeneration(): void {
    if (!Array.isArray(this.globalsPerGeneration)) {
      this.globalsPerGeneration = [];
    }
    this.globalsPerGeneration.push({});
    const entry = this.globalsPerGeneration[this.globalsPerGeneration.length - 1];
    entry[GlobalParameter.TEMPERATURE] = this.temperature;
    entry[GlobalParameter.OXYGEN] = this.oxygenLevel;
    entry[GlobalParameter.OCEANS] = this.board.getOceanSpaces().length;
    if (this.gameOptions.venusNextExtension) {
      entry[GlobalParameter.VENUS] = this.venusScaleLevel;
    }
    MoonExpansion.ifMoon(this, (moonData) => {
      entry[GlobalParameter.MOON_HABITAT_RATE] = moonData.habitatRate;
      entry[GlobalParameter.MOON_MINING_RATE] = moonData.miningRate;
      entry[GlobalParameter.MOON_LOGISTICS_RATE] = moonData.logisticRate;
    });
  }

  private startGeneration() {
    this.phase = Phase.INTERGENERATION;
    this.updatePlayerVPForTheGeneration();
    this.updateGlobalsForTheGeneration();
    this.generation++;
    this.log('Generation ${0}', (b) => b.forNewGeneration().number(this.generation));
    this.incrementFirstPlayer();
    // TradeNavigator
    this.finishFirstTrading = false;
    this.players.forEach((player) => {
      player.hasIncreasedTerraformRatingThisGeneration = false;
      player.heatProductionStepsIncreasedThisGeneration = 0;
      if (player.tableau.has(CardName.PRESERVATION_PROGRAM)) {
        player.preservationProgram = true;
      }
    });

    if (this.gameOptions.draftVariant && this.players.length > 1 ) {
      this.gotoDraftPhase();
    } else {
      this.gotoResearchPhase();
    }
  }

  private gotoWorldGovernmentTerraforming() {
    if (this.firstExited) {
      this.gotoEndGeneration();
      return;
    }
    this.worldGovernmentTerraforming();
  }

  public worldGovernmentTerraformingInput(player: IPlayer): OrOptions {
    const orOptions = new OrOptions()
      .setTitle('Select action for World Government Terraforming')
      .setButtonLabel('Confirm');
    if (this.getTemperature() < constants.MAX_TEMPERATURE) {
      orOptions.options.push(
        new SelectOption('Increase temperature', 'Increase').andThen(() => {
          this.increaseTemperature(player, 1);
          this.log('${0} acted as World Government and increased temperature', (b) => b.player(player));
          return undefined;
        }),
      );
    }
    if (this.getOxygenLevel() < constants.MAX_OXYGEN_LEVEL) {
      orOptions.options.push(
        new SelectOption('Increase oxygen', 'Increase').andThen(() => {
          this.increaseOxygenLevel(player, 1);
          this.log('${0} acted as World Government and increased oxygen level', (b) => b.player(player));
          return undefined;
        }),
      );
    }
    if (this.canAddOcean()) {
      orOptions.options.push(
        new SelectSpace('Add an ocean', this.board.getAvailableSpacesForOcean(player))
          .andThen((space) => {
            this.addOcean(player, space);
            this.log('${0} acted as World Government and placed an ocean', (b) => b.player(player));
            return undefined;
          }),
      );
    }
    if (this.getVenusScaleLevel() < constants.MAX_VENUS_SCALE && this.gameOptions.venusNextExtension) {
      orOptions.options.push(
        new SelectOption('Increase Venus scale', 'Increase').andThen(() => {
          this.increaseVenusScaleLevel(player, 1);
          this.log('${0} acted as World Government and increased Venus scale', (b) => b.player(player));
          return undefined;
        }),
      );
    }

    if (this.gameOptions.aresExtension && this.gameOptions.aresExtremeVariant && this.isSoloMode()) {
      // TODO(kberg): move the eris method elsewhere
      const unprotectedHazardSpaces = Eris.getAllUnprotectedHazardSpaces(this);

      if (unprotectedHazardSpaces.length > 0) {
        orOptions.options.push(
          new SelectSpace(
            'Remove an unprotected hazard',
            unprotectedHazardSpaces).andThen((space) => {
            space.tile = undefined;
            this.log('${0} acted as World Government and removed a hazard tile', (b) => b.player(player));
            return undefined;
          }),
        );
      }
    }

    MoonExpansion.ifMoon(this, (moonData) => {
      if (this !== undefined) {
        // 月球扩不配提世界政府
        return;
      }
      if (moonData.habitatRate < constants.MAXIMUM_HABITAT_RATE) {
        orOptions.options.push(
          new SelectOption('Increase the Moon habitat rate', 'Increase').andThen(() => {
            MoonExpansion.raiseHabitatRate(player, 1);
            return undefined;
          }),
        );
      }

      if (moonData.miningRate < constants.MAXIMUM_MINING_RATE) {
        orOptions.options.push(
          new SelectOption('Increase the Moon mining rate', 'Increase').andThen(() => {
            MoonExpansion.raiseMiningRate(player, 1);
            return undefined;
          }),
        );
      }

      if (moonData.logisticRate < constants.MAXIMUM_LOGISTICS_RATE) {
        orOptions.options.push(
          new SelectOption('Increase the Moon logistics rate', 'Increase').andThen(() => {
            MoonExpansion.raiseLogisticRate(player, 1);
            return undefined;
          }),
        );
      }
    });

    return orOptions;
  }

  public worldGovernmentTerraforming(): void {
    const player = this.first;
    const input = this.worldGovernmentTerraformingInput(player);
    player.setWaitingFor(input, () => {
      this.gotoEndGeneration();
    });
  }

  private allPlayersHavePassed(): boolean {
    for (const player of this.players) {
      if (!this.hasPassedThisActionPhase(player)) {
        return false;
      }
    }
    return true;
  }

  public playerHasPassed(player: IPlayer): void {
    this.passedPlayers.add(player);
  }

  public hasResearched(player: IPlayer): boolean {
    return this.researchedPlayers.has(player);
  }

  public playerIsFinishedWithResearchPhase(player: IPlayer): void {
    this.deferredActions.runAllFor(player, () => {
      this.researchedPlayers.add(player);
      if (this.researchedPlayers.size === this.players.length) {
        this.researchedPlayers.clear();
        this.phase = Phase.ACTION;
        this.passedPlayers.clear();
        this.potentiallyChangeFirstPlayer();

        this.startActionsForPlayer(this.first);
      }
    });
  }

  public getPlayerBefore(player: IPlayer): IPlayer {
    const playerIndex = this.players.indexOf(player);
    if (playerIndex === -1) {
      throw new Error(`Player ${player.id} not in game ${this.id}`);
    }

    // Go to the end of the array if stand at the start
    return this.players[(playerIndex === 0) ? this.players.length - 1 : playerIndex - 1];
  }

  public getPlayerAfter(player: IPlayer): IPlayer {
    const playerIndex = this.players.indexOf(player);

    if (playerIndex === -1) {
      throw new Error(`Player ${player.id} not in game ${this.id}`);
    }

    // Go to the beginning of the array if we reached the end
    return this.players[(playerIndex + 1 >= this.players.length) ? 0 : playerIndex + 1];
  }

  public playerIsFinishedTakingActions(): void {
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.playerIsFinishedTakingActions());
      return;
    }

    this.inputsThisRound = 0;

    // This next section can be done more simply.
    if (this.allPlayersHavePassed()) {
      this.gotoProductionPhase();
      return;
    }

    const nextPlayer = this.getPlayerAfter(this.activePlayer);
    if (!this.hasPassedThisActionPhase(nextPlayer)) {
      this.startActionsForPlayer(nextPlayer);
    } else {
      // Recursively find the next player
      this.activePlayer = nextPlayer;
      this.playerIsFinishedTakingActions();
    }
  }

  private async gotoEndGame(): Promise<void> {
    console.log('gotoEndGame ' + this.id);
    // 储存终局计分到数据库 暂时不替换为`getSortedPlayers`因为目前不能获得玩家顺位
    const scores: Array<Score> = [];
    const players = this.getAllPlayers();

    const timeOutPlayer = this.checkTimeOutPlayer(); // 判断是否有玩家超时
    const allPlayerQuit = this.quitPlayers.size === players.length;


    // 存入数据库的最终Phase
    this.phase = this.shouldGoToTimeOutPhase() ?
      Phase.TIMEOUT :
      this.isRankMode() && allPlayerQuit ?
        Phase.ABANDON :
        Phase.END;
    // this.phase = Phase.END;
    if (this.phase === Phase.END) await this.save(); // 只有正常结束的才会保留，超时放弃的这种的直接清除了
    // jiang    const gameLoader = GameLoader.getInstance();
    // await gameLoader.saveGame(this);
    // gameLoader.completeGame(this);
    // gameLoader.mark(this.id);
    // gameLoader.maintenance();

    // Log id or cloned game id
    if (this.clonedGamedId !== undefined && this.clonedGamedId.startsWith('#')) {
      const clonedGamedId = this.clonedGamedId;
      this.log('This game was a clone from game ${0}', (b) => b.rawString(clonedGamedId));
    } else {
      const id = this.id;
      this.log('This game id was ${0}', (b) => b.rawString(id));
    }

    if (this.phase === Phase.END) {
      Database.getInstance().cleanGame(this.id).catch((err) => {
        console.error(err);
      });
    } else { // 异常结束的，数据库里没必要保留吧
      Database.getInstance().cleanGameAllSaves(this.id);
    }

    players.forEach((player) => {
      const corporation = player.playedCards.filter(isICorporationCard).map(toName).join('|');
      const vpb = player.getVictoryPoints();
      scores.push({corporation: corporation,
        playerScore: vpb.total, player: player.name, userId: player.userId});
    });
    if (this.players.length > 1) {
      Database.getInstance().saveGameResults(this.id, players.length, this.generation, this.gameOptions, scores);
    }

    const sortedPlayers = this.getSortedPlayers(); // 玩家排名，包含体退玩家，尽管目前排名模式不能体退
    // 天梯 更新段位和排名
    if (this.isRankMode() && this.players.length > 1) {
      const currentSeason = await Database.getInstance().getCurrentSeason();
      const currentSeasonId = currentSeason?.seasonId || getSeasonId();
      const userRanks: Array<UserRank> = [];
      const rankedPlayers: Array<IPlayer> = [];
      // const timeOutPlayer = this.checkTimeOutPlayer();
      let timeOutUserRank: UserRank | undefined = undefined; // 超时玩家的UserRank
      sortedPlayers.forEach((player) => {
        const userRank = player.getUserRank();
        if (userRank !== undefined) {
          userRanks.push(userRank);
          rankedPlayers.push(player);
          if (player === timeOutPlayer) timeOutUserRank = userRank;
        }
      });

      if (this.phase === Phase.ABANDON) {
        // 玩家放弃游戏，无事发生
        console.log('all players quit the game');
      } else {
        // 过滤掉赛季不匹配的玩家（历史赛季数据只读）
        const validIndices: number[] = [];
        const validUserRanks: Array<UserRank> = [];
        for (let i = 0; i < userRanks.length; i++) {
          if (userRanks[i].seasonId === currentSeasonId) {
            validIndices.push(i);
            validUserRanks.push(userRanks[i]);
          } else {
            console.warn(`[Rank] Skipping player ${rankedPlayers[i].userId}: season mismatch (expected ${currentSeasonId}, got ${userRanks[i].seasonId})`);
          }
        }

        if (validUserRanks.length > 0) {
          const userNewRanks = getNewSkills(validUserRanks, timeOutUserRank);
          const winnerPoints = getWinnerPointsReward(validUserRanks.length);
          console.log(`gotoEndGame before userRanks ${JSON.stringify(validUserRanks)} , after ${JSON.stringify(userNewRanks)}`);
          for (let i = 0; i < userNewRanks.length; i++) {
            const originalIndex = validIndices[i];
            // 胜者（第一名）获得额外积分
            if (i === 0) {
              userNewRanks[i].points = (userNewRanks[i].points || 0) + winnerPoints;
              console.log(`[Rank] Winner ${userNewRanks[i].userId} earned ${winnerPoints} point(s) in ${validUserRanks.length}p game`);
            }
            rankedPlayers[originalIndex].addOrUpdateUserRank(userNewRanks[i]);
            Database.getInstance().updateUserRank(userNewRanks[i]);
          }
        }
      }
    }

    // 存储所有已登录玩家的对局结果（天梯 & 休闲均保存）
    // is_rank 字段标记是否为天梯对局，用于后续查询过滤
    // @param position 玩家名次，写入数据库时 +1（从 1 开始）
    sortedPlayers.forEach((player, position) => {
      const newUserRank = player.getUserRank();
      if (player.userId === undefined) return; // table `user_game_results` pk: user_id + game_id
      const playerIndex = players.indexOf(player);
      const isTimeoutPlayer = timeOutPlayer !== undefined && player === timeOutPlayer;
      Database.getInstance().saveUserGameResult(player.userId, this.id, this.phase, scores[playerIndex], players.length, this.generation, this.createtime, position+1, this.isRankMode(), newUserRank, isTimeoutPlayer);
    });

    return;
  }

  // 天梯 获取按照终局排名的玩家列表，包含所有玩家
  public getSortedPlayers() {
    const players = this.getAllPlayers();
    players.sort(function(a:IPlayer, b:IPlayer) {
      if (a.getVictoryPoints().total < b.getVictoryPoints().total) return -1;
      if (a.getVictoryPoints().total > b.getVictoryPoints().total) return 1;
      if (a.megaCredits < b.megaCredits) return -1;
      if (a.megaCredits > b.megaCredits) return 1;
      return 0;
    });
    return players.reverse();
  }

  // Part of final greenery placement.
  public canPlaceGreenery(player: IPlayer): boolean {
    return !this.donePlayers.has(player) &&
            player.plants >= player.plantsNeededForGreenery &&
            this.board.getAvailableSpacesForGreenery(player).length > 0;
  }

  // Called when a player cannot or chose not to place any more greeneries.
  public playerIsDoneWithGame(player: IPlayer): void {
    this.donePlayers.add(player);
    // Go back in to find someone else to play final greeneries.
    console.log('playerIsDoneWithGame takeNextFinalGreeneryAction ' + this.id);
    this.takeNextFinalGreeneryAction();
  }

  /**
   * Find the next player who might be able to place a final greenery and ask them.
   *
   * If nobody can add a greenery, end the game.
   */
  public /* for testing */ takeNextFinalGreeneryAction(): void {
    for (const player of this.playersInGenerationOrder) {
      if (this.donePlayers.has(player)) {
        console.log('takeNextFinalGreeneryAction donePlayers ' + this.id + ' ' + player.name);
        continue;
      }

      // You many not place greeneries in solo mode unless you have already won the game
      // (e.g. completed global parameters, reached TR63.)
      if (this.isSoloMode() && !this.isSoloModeWin()) {
        this.log('Final greenery phase is skipped since you did not complete the win condition.', (b) => b.forNewGeneration());
        continue;
      }

      if (this.canPlaceGreenery(player)) {
        console.log('takeNextFinalGreeneryAction can place greenery ' + this.id + ' ' + player.name);
        this.activePlayer = player;
        player.takeActionForFinalGreenery();
        return;
      } else if (player.getWaitingFor() !== undefined) {
        console.log('takeNextFinalGreeneryAction waiting for ' + this.id + ' ' + player.name);
        return;
      } else {
        console.log('takeNextFinalGreeneryAction done ' + this.id + ' ' + player.name);
        this.donePlayers.add(player);
      }
    }
    this.updatePlayerVPForTheGeneration();
    this.updateGlobalsForTheGeneration();
    this.gotoEndGame().catch((error) => {
      console.error('gotoEndGame failed:', error);
    });
  }

  private startActionsForPlayer(player: IPlayer) {
    this.activePlayer = player;
    player.actionsTakenThisGame++;
    player.actionsTakenThisRound = 0;

    // Save the game state after changing the current player
    // Increment the save id
    this.save();

    player.takeAction();
  }

  public increaseOxygenLevel(player: IPlayer, increments: -2 | -1 | 1 | 2): void {
    if (this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL) {
      return undefined;
    }

    // PoliticalAgendas Reds P3 && Magnetic Field Stimulation Delays hook
    if (increments < 0) {
      this.oxygenLevel = Math.max(constants.MIN_OXYGEN_LEVEL, this.oxygenLevel + increments);
      return undefined;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, constants.MAX_OXYGEN_LEVEL - this.oxygenLevel);

    if (this.phase !== Phase.SOLAR) {
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.OXYGEN, steps);
      player.onGlobalParameterIncrease(GlobalParameter.OXYGEN, steps);
      player.increaseTerraformRating(steps, {log: true});
    }

    // wg hook
    if (this.phase === Phase.SOLAR && this.wgPartnershipOwner) {
      TurmoilHandler.onGlobalParameterIncrease(this.wgPartnershipOwner, GlobalParameter.OXYGEN, steps);
      this.wgPartnershipOwner.increaseTerraformRating(steps, {log: true});
    }

    if (this.oxygenLevel < constants.OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS &&
      this.oxygenLevel + steps >= constants.OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS) {
      this.increaseTemperature(player, 1);
    }

    this.oxygenLevel += steps;

    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onOxygenChange(this, aresData);
    });
  }

  public getOxygenLevel(): number {
    return this.oxygenLevel;
  }

  public increaseVenusScaleLevel(player: IPlayer, increments: -1 | 1 | 2 | 3): number {
    if (this.venusScaleLevel >= constants.MAX_VENUS_SCALE) {
      return 0;
    }

    // PoliticalAgendas Reds P3 hook
    if (increments === -1) {
      this.venusScaleLevel = Math.max(constants.MIN_VENUS_SCALE, this.venusScaleLevel + increments * 2);
      return -1;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, (constants.MAX_VENUS_SCALE - this.venusScaleLevel) / 2);
    const execute = (player: IPlayer) => {
      if (this.venusScaleLevel < constants.VENUS_LEVEL_FOR_CARD_BONUS &&
        this.venusScaleLevel + steps * 2 >= constants.VENUS_LEVEL_FOR_CARD_BONUS) {
        player.drawCard();
      }
      if (this.venusScaleLevel < constants.VENUS_LEVEL_FOR_TR_BONUS &&
        this.venusScaleLevel + steps * 2 >= constants.VENUS_LEVEL_FOR_TR_BONUS) {
        player.increaseTerraformRating();
      }
      const foundCard = player.playedCards.get(CardName.VENUS_UNIVERSITY);
      if (foundCard !== undefined) {
        player.drawCard(steps);
      }
      if (this.gameOptions.altVenusBoard) {
        const newValue = this.venusScaleLevel + steps * 2;
        const minimalBaseline = Math.max(this.venusScaleLevel, constants.ALT_VENUS_MINIMUM_BONUS);
        const maximumBaseline = Math.min(newValue, constants.MAX_VENUS_SCALE);
        const standardResourcesGranted = Math.max((maximumBaseline - minimalBaseline) / 2, 0);

        const grantWildResource = this.venusScaleLevel + (steps * 2) >= constants.MAX_VENUS_SCALE;
        // The second half of this expression removes any increases earler than 16-to-18.
        if (grantWildResource || standardResourcesGranted > 0) {
          this.defer(new GrantVenusAltTrackBonusDeferred(player, standardResourcesGranted, grantWildResource));
        }
      }
      for (const card of player.playedCards) {
        card.onGlobalParameterIncrease?.(player, GlobalParameter.VENUS, steps);
      }
      if (this.exploitationOfVenusInEffect) {
        player.stock.add(Resource.MEGACREDITS, steps * 2, {log: true});
      }
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.VENUS, steps);
      player.onGlobalParameterIncrease(GlobalParameter.VENUS, steps);
      player.increaseTerraformRating(steps);
    };

    if (this.phase !== Phase.SOLAR) {
      execute(player);
    }

    // wg hook
    if (this.phase === Phase.SOLAR && this.wgPartnershipOwner) {
      execute(this.wgPartnershipOwner);
    }

    // Check for Aphrodite corporation
    const aphrodite = this.players.find((player) => player.tableau.has(CardName.APHRODITE));
    if (aphrodite !== undefined) {
      aphrodite.megaCredits += steps * 2;
    }
    const _aphrodite_ = this.players.find((player) => player.playedCards.has(CardName._APHRODITE_));
    if (_aphrodite_ !== undefined) {
      _aphrodite_.plants += steps * 2;
    }
    this.venusScaleLevel += steps * 2;

    return steps;
  }

  public getVenusScaleLevel(): number {
    return this.venusScaleLevel;
  }

  public increaseTemperature(player: IPlayer, increments: -2 | -1 | 1 | 2 | 3): undefined {
    if (this.temperature >= constants.MAX_TEMPERATURE) {
      return undefined;
    }

    if (increments === -2 || increments === -1) {
      this.temperature = Math.max(constants.MIN_TEMPERATURE, this.temperature + increments * 2);
      return undefined;
    }

    // Literal typing makes |increments| a const
    const steps = Math.min(increments, (constants.MAX_TEMPERATURE - this.temperature) / 2);
    const execute = (player: IPlayer) => {
      // 热公司突破：任何人升温得1热。
      const helion = this.players.find((player) => player.playedCards.has(CardName._HELION_));
      if (helion !== undefined) {
        player.heat += steps * 1;
      }

      // BONUS FOR HEAT PRODUCTION AT -20 and -24
      if (this.temperature < constants.TEMPERATURE_BONUS_FOR_HEAT_1 &&
        this.temperature + steps * 2 >= constants.TEMPERATURE_BONUS_FOR_HEAT_1) {
        player.production.add(Resource.HEAT, 1, {log: true});
      }
      if (this.temperature < constants.TEMPERATURE_BONUS_FOR_HEAT_2 &&
        this.temperature + steps * 2 >= constants.TEMPERATURE_BONUS_FOR_HEAT_2) {
        player.production.add(Resource.HEAT, 1, {log: true});
      }
      // 群友扩hook,热泉微生物hook
      const foundCard = player.playedCards.get(CardName.HYDROTHERMAL_VENT_ARCHAEA);
      if (foundCard !== undefined) {
        player.addResourceTo(foundCard, steps);
      }
      for (const card of player.playedCards) {
        card.onGlobalParameterIncrease?.(player, GlobalParameter.TEMPERATURE, steps);
      }
      player.onGlobalParameterIncrease(GlobalParameter.TEMPERATURE, steps);
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.TEMPERATURE, steps);
      player.increaseTerraformRating(steps);
    };

    if (this.phase !== Phase.SOLAR) {
      execute(player);
    }

    // wg hook
    if (this.phase === Phase.SOLAR && this.wgPartnershipOwner) {
      execute(this.wgPartnershipOwner);
    }

    // BONUS FOR OCEAN TILE AT 0
    if (this.temperature < constants.TEMPERATURE_FOR_OCEAN_BONUS && this.temperature + steps * 2 >= constants.TEMPERATURE_FOR_OCEAN_BONUS) {
      this.defer(new PlaceOceanTile(player, {title: 'Select space for ocean from temperature increase'}));
    }

    this.temperature += steps * 2;

    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onTemperatureChange(this, aresData);
    });
    UnderworldExpansion.onTemperatureChange(this, steps);
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

  // addTile applies to the Mars board, but not the Moon board, see MoonExpansion.addTile for placing
  // a tile on The Moon.
  public addTile(
    player: IPlayer,
    space: Space,
    tile: Tile): void {
    // Part 1, basic validation checks.

    if (space.tile !== undefined) {
      let allow = false;
      if (tile.tileType === TileType.NEW_HOLLAND) {
        allow = true;
      } else if (this.gameOptions.aresExtension) {
        allow = true;
      } else if (this.gameOptions.pathfindersExpansion) {
        allow = true;
      }
      if (!allow) {
        throw new Error('Selected space is occupied');
      }
    }

    // Land claim a player can claim land for themselves
    if (space.player !== undefined && space.player !== player) {
      throw new Error('This space is land claimed by ' + space.player.name);
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

    TurmoilHandler.resolveTilePlacementCosts(player);

    // Part 3. Setup for bonuses
    const initialTileType = space.tile?.tileType;
    const coveringExistingTile = space.tile !== undefined;
    const arcadianCommunityBonus = space.player === player && (player.tableau.has(CardName.ARCADIAN_COMMUNITIES) || player.tableau.has(CardName._ARCADIAN_COMMUNITIES_));

    // Part 4. Place the tile
    this.simpleAddTile(player, space, tile);

    // Part 5. Collect the bonuses
    if (this.phase !== Phase.SOLAR || this.wgPartnershipOwner) {
      this.grantPlacementBonuses(player, space, coveringExistingTile, arcadianCommunityBonus);

      AresHandler.ifAres(this, (aresData) => {
        AresHandler.maybeIncrementMilestones(aresData, player, space, hazardSeverity(initialTileType));
      });
    }
    if (this.phase === Phase.SOLAR ) {
      space.player = undefined;
    }


    // Clear out underworld components.
    UnderworldExpansion.onTilePlaced(this, space);

    for (const p of this.players) {
      for (const playedCard of p.tableau) {
        playedCard.onTilePlaced?.(p, player, space, BoardType.MARS);
      }
    }

    if (initialTileType !== undefined) {
      AresHandler.ifAres(this, () => {
        AresHandler.grantBonusForRemovingHazard(player, initialTileType);
      });
    }
  }

  // arcadianCommunityBonus 是否被玩家标记占领,影响拉屎公司的奖励
  public grantPlacementBonuses(player: IPlayer, space: Space, coveringExistingTile: boolean = false, arcadianCommunityBonus: boolean = false) {
    // console.log('grantPlacementBonuses:'+ space.id + space.player?.name +' coveringExistingTile:' + coveringExistingTile);
    if (!coveringExistingTile) {
      this.grantSpaceBonuses(player, space);
    }

    this.board.getAdjacentSpaces(space).forEach((adjacentSpace) => {
      if (Board.isOceanSpace(adjacentSpace)) {
        player.megaCredits += player.oceanBonus;
      }
    });

    // TODO(kberg): these might not apply for some bonuses, e.g. Frontier Town.
    // https://boardgamegeek.com/thread/3344366/article/44658730#44658730
    if (space.tile !== undefined) {
      AresHandler.ifAres(this, () => {
        AresHandler.earnAdjacencyBonuses(player, space);
      });

      TurmoilHandler.resolveTilePlacementBonuses(player, space.spaceType);

      if (arcadianCommunityBonus) {
        this.defer(new GainResources(player, Resource.MEGACREDITS, {count: 3}));
      }

      if (space.undergroundResources === 'place6mc') {
        this.defer(new GainResources(player, Resource.MEGACREDITS, {count: 6}));
      }
    }
  }

  public simpleAddTile(player: IPlayer, space: Space, tile: Tile) {
    space.tile = tile;
    if (tile.tileType === TileType.OCEAN ||
      tile.tileType === TileType.MARTIAN_NATURE_WONDERS ||
      tile.tileType === TileType.REY_SKYWALKER) {
      space.player = undefined;
    } else {
      space.player = player;
    }
    LogHelper.logTilePlacement(player, space, tile.tileType);
  }

  public grantSpaceBonuses(player: IPlayer, space: Space) {
    const bonuses = MultiSet.from(space.bonus);
    bonuses.forEachMultiplicity((count: number, bonus: SpaceBonus) => {
      this.grantSpaceBonus(player, bonus, count);
    });
  }

  public grantSpaceBonus(player: IPlayer, spaceBonus: SpaceBonus, count: number = 1) {
    switch (spaceBonus) {
    case SpaceBonus.DRAW_CARD:
      player.drawCard(count);
      break;
    case SpaceBonus.PLANT:
      player.stock.add(Resource.PLANTS, count, {log: true});
      break;
    case SpaceBonus.STEEL:
      player.stock.add(Resource.STEEL, count, {log: true});
      break;
    case SpaceBonus.TITANIUM:
      player.stock.add(Resource.TITANIUM, count, {log: true});
      break;
    case SpaceBonus.HEAT:
      player.stock.add(Resource.HEAT, count, {log: true});
      break;
    case SpaceBonus.OCEAN:
      // Hellas special requirements ocean tile
      if (this.canAddOcean()) {
        this.defer(new PlaceOceanTile(player, {title: 'Select space for ocean from placement bonus'}));
        this.defer(new SelectPaymentDeferred(player, constants.HELLAS_BONUS_OCEAN_COST, {title: 'Select how to pay for placement bonus ocean'}));
      }
      break;
    case SpaceBonus.MICROBE:
      this.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: count}));
      break;
    case SpaceBonus.ANIMAL:
      this.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: count}));
      break;
    case SpaceBonus.DATA:
      this.defer(new AddResourcesToCard(player, CardResource.DATA, {count: count}));
      break;
    case SpaceBonus.ENERGY_PRODUCTION:
      player.production.add(Resource.ENERGY, count, {log: true});
      break;
    case SpaceBonus.SCIENCE:
      this.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: count}));
      break;
    case SpaceBonus.TEMPERATURE:
      if (this.getTemperature() < constants.MAX_TEMPERATURE) {
        this.defer(new SelectPaymentDeferred(
          player,
          constants.VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST,
          {title: 'Select how to pay for placement bonus temperature'}))
          .andThen(() => this.increaseTemperature(player, 1));
      }
      break;
    case SpaceBonus.ENERGY:
      player.stock.add(Resource.ENERGY, count, {log: true});
      break;
    case SpaceBonus.ASTEROID:
      this.defer(new AddResourcesToCard(player, CardResource.ASTEROID, {count: count}));
      break;
    case SpaceBonus.DELEGATE:
      TurmoilUtil.ifTurmoil(this, () => this.defer(new SendDelegateToArea(player)));
      break;
    case SpaceBonus.COLONY:
      this.defer(new SelectPaymentDeferred(
        player,
        constants.TERRA_CIMMERIA_COLONY_COST,
        {title: 'Select how to pay for building a colony'}))
        .andThen(() => this.defer(new BuildColony(player)));
      break;
    default:
      throw new Error('Unhandled space bonus ' + spaceBonus + '. Report this exact error, please.');
    }
  }

  public addGreenery(
    player: IPlayer, space: Space,
    shouldRaiseOxygen: boolean = true): undefined {
    this.addTile(player, space, {
      tileType: TileType.GREENERY,
    });

    // Turmoil Greens ruling policy
    PartyHooks.applyGreensRulingPolicy(player, space);

    // 增强呼吸作用hook
    if ((player.playedCards.get(CardName.RESPIRATION_ENHANCE) !== undefined) &&
        this.getTemperature() < constants.MAX_TEMPERATURE &&
        shouldRaiseOxygen) {
      const orOptions = new OrOptions();
      orOptions.options.push(new SelectOption('Increase temperature', 'Increase').andThen(() => {
        this.increaseTemperature(player, 1);
        this.log('${0} enhanced respiration and increased temperature', (b) => b.player(player));
        return undefined;
      }));

      if ( this.getOxygenLevel() < constants.MAX_OXYGEN_LEVEL) {
        orOptions.options.push(new SelectOption('Increase oxygen', 'Increase').andThen(() => {
          this.increaseOxygenLevel(player, 1);
          this.log('${0} increased oxygen level', (b) => b.player(player));
          return undefined;
        }));
        orOptions.title = 'Select a parameter to increase';
      } else {
        orOptions.options.push(new SelectOption('Do not increase temperature', 'Increase').andThen(() => {
          return undefined;
        }));
        orOptions.title = 'Select to increase temperature or not';
      }

      this.defer(new SimpleDeferredAction(
        player,
        () => {
          return orOptions;
        },
      ));
      return undefined;
    }

    if (player.playedCards.has(CardName.PROWLER) && this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL) {
      player.increaseTerraformRating(1);
    }

    if (shouldRaiseOxygen) this.increaseOxygenLevel(player, 1);
    return undefined;
  }

  public addCity(
    player: IPlayer, space: Space,
    cardName: CardName | undefined = undefined): void {
    this.addTile(player, space, {
      tileType: TileType.CITY,
      card: cardName,
    });
  }

  public canAddOcean(): boolean {
    return this.board.getOceanSpaces().length < constants.MAX_OCEAN_TILES;
  }

  public canRemoveOcean(): boolean {
    const count = this.board.getOceanSpaces().length;
    return count > 0 && count < constants.MAX_OCEAN_TILES;
  }

  public addOcean(player: IPlayer, space: Space): void {
    if (this.canAddOcean() === false) return;

    this.addTile(player, space, {
      tileType: TileType.OCEAN,
    });
    // TODO: 在这里判断一下奖励
    // TODO: 将世界政府的受益人变成对应玩家
    if (this.phase !== Phase.SOLAR && this.phase !== Phase.INTERGENERATION) {
      TurmoilHandler.onGlobalParameterIncrease(player, GlobalParameter.OCEANS);
      player.onGlobalParameterIncrease(GlobalParameter.OCEANS, 1);
      player.increaseTerraformRating();
    }

    // wg hook
    if (this.phase === Phase.SOLAR && this.wgPartnershipOwner) {
      TurmoilHandler.onGlobalParameterIncrease(this.wgPartnershipOwner, GlobalParameter.OCEANS);
      this.wgPartnershipOwner.increaseTerraformRating();
    }
    AresHandler.ifAres(this, (aresData) => {
      AresHandler.onOceanPlaced(aresData, player);
    });
  }

  public removeTile(spaceId: SpaceId): void {
    const space = this.board.getSpaceOrThrow(spaceId);
    space.tile = undefined;
    space.player = undefined;
  }


  // 包含体退玩家
  public getAllPlayers(): Array<IPlayer> {
    return this.playersInGenerationOrder.concat(this.exitedPlayers);
  }
  /**
   * Returns the Player holding this card, or throws.
   */
  public getCardPlayerOrThrow(name: CardName): IPlayer {
    const player = this.getCardPlayerOrUndefined(name);
    if (player === undefined) {
      throw new Error(`No player has played ${name}`);
    }
    return player;
  }

  /**
   * Returns the Player holding this card, or throws.
   */
  public getCardPlayerOrUndefined(name: CardName): IPlayer | undefined {
    for (const player of this.players) {
      for (const card of player.tableau) {
        if (card.name === name) {
          return player;
        }
      }
    }
    return undefined;
  }

  private potentiallyChangeFirstPlayer() {
    for (const player of this.players) {
      // Check cards player has in hand
      for (const card of [...player.preludeCardsInHand, ...player.cardsInHand]) {
        if (card.name === CardName.THE_NEW_SPACE_RACE) {
          this.phase = Phase.PRELUDES;
          this.log(
            '${0} has ${1}, which is played before any other Prelude and makes them first player.',
            (b) => b.player(player).card(card));
          player.playCard(card);
        }
      }
    }
  }

  public getStandardProjects(): Array<IStandardProjectCard> {
    const gameOptions = this.gameOptions;
    return new GameCards(gameOptions)
      .getStandardProjects()
      .filter((card) => {
        switch (card.name) {
        // sell patents is not displayed as a card
        case CardName.SELL_PATENTS_STANDARD_PROJECT:
          return false;
          // For buffer gas, show ONLY IF in solo AND 63TR mode
        case CardName.BUFFER_GAS_STANDARD_PROJECT:
          return this.isSoloMode() && gameOptions.soloTR;
        case CardName.AIR_SCRAPPING_STANDARD_PROJECT:
          return gameOptions.altVenusBoard === false;
        case CardName.AIR_SCRAPPING_STANDARD_PROJECT_VARIANT:
          return gameOptions.altVenusBoard === true;
        case CardName.MOON_HABITAT_STANDARD_PROJECT_VARIANT_2:
        case CardName.MOON_MINE_STANDARD_PROJECT_VARIANT_2:
        case CardName.MOON_ROAD_STANDARD_PROJECT_VARIANT_2:
          return gameOptions.moonStandardProjectVariant === true;
        case CardName.MOON_HABITAT_STANDARD_PROJECT_VARIANT_1:
        case CardName.MOON_MINE_STANDARD_PROJECT_VARIANT_1:
        case CardName.MOON_ROAD_STANDARD_PROJECT_VARIANT_1:
          return gameOptions.moonStandardProjectVariant1 === true;
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

  public log(message: string, f?: (builder: LogMessageBuilder) => void, options?: {reservedFor?: IPlayer}) {
    if (options !== undefined && options.reservedFor !== undefined) {
      // 玩家独有的日志会暴露敏感信息，其他玩家可以看到 该种日志一律隐藏
      return;
    }
    const builder = new LogMessageBuilder(message);
    f?.(builder);
    const logMessage = builder.build();
    logMessage.playerId = options?.reservedFor?.id;
    if (!message || !logMessage) {
      // TODO(kberg): throw
      console.error('Log message is undefined. Message: ' + message);
      return;
    }
    this.gameLog.push(logMessage);
    this.gameAge++;
  }

  public discardForCost(cardCount: 1 | 2, toPlace: TileType) {
    // This method uses drawOrThrow, which means if there are really no more cards, it breaks the game.
    // I predict it will be an exceedingly rare problem.
    if (cardCount === 1) {
      const card = this.projectDeck.drawOrThrow(this);
      this.projectDeck.discard(card);
      this.log('Drew and discarded ${0} to place a ${1}', (b) => b.card(card, {cost: true}).tileType(toPlace));
      return card.cost;
    } else {
      const card1 = this.projectDeck.drawOrThrow(this);
      this.projectDeck.discard(card1);
      const card2 = this.projectDeck.drawOrThrow(this);
      this.projectDeck.discard(card2);
      this.log('Drew and discarded ${0} and ${1} to place a ${2}', (b) => b.card(card1, {cost: true}).card(card2, {cost: true}).tileType(toPlace));
      return card1.cost + card2.cost;
    }
  }

  public expectedPurgeTimeMs(): number {
    if (this.createdTime.getTime() === 0) {
      return 0;
    }
    const days = stringToNumber(process.env.MAX_GAME_DAYS, 10);
    return addDays(this.createdTime, days).getTime();
  }

  // Function used to rebuild each objects
  public loadFromJSON(d: SerializedGame, fullLoad:boolean = true): Game {
    if (!fullLoad) {
      return this.loadFromJSONHalf(d);
    }
    // TODO(kberg): Remove by 2025-08-01
    if (d.gameOptions.expansions === undefined) {
      d.gameOptions.expansions = {
        corpera: d.gameOptions.corporateEra,
        venus: d.gameOptions.venusNextExtension,
        colonies: d.gameOptions.coloniesExtension,
        prelude: d.gameOptions.preludeExtension,
        prelude2: d.gameOptions.prelude2Expansion,
        turmoil: d.gameOptions.turmoilExtension,
        promo: d.gameOptions.promoCardsOption,
        community: d.gameOptions.communityCardsOption,
        ares: d.gameOptions.aresExtension,
        moon: d.gameOptions.moonExpansion,
        pathfinders: d.gameOptions.pathfindersExpansion,
        ceo: d.gameOptions.ceoExtension,
        starwars: d.gameOptions.starWarsExpansion,
        underworld: d.gameOptions.underworldExpansion,
        eros: d.gameOptions.erosCardsOption,
        commission: d.gameOptions.commissionCardsOption,
        breakthrough: d.gameOptions.breakthrough,
      };
    }
    // Assign each attributes
    const o = Object.assign(this, d);
    this.nomadSpace = d.nomadSpace;
    // Brand new deferred actions queue
    this.deferredActions = new DeferredActionsQueue();


    this.gameOptions.starWarsExpansion = this.gameOptions.starWarsExpansion ?? false;
    this.gameOptions.bannedCards = this.gameOptions.bannedCards ?? [];
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

    this.rng = new SeededRandom(d.seed, d.currentSeed);

    // Rebuild dealer object to be sure that cards are in the same order
    if (d.dealer !== undefined) {
      const dealer = Dealer.deserialize(d.dealer);
      this.projectDeck = new ProjectDeck(dealer.deck, dealer.discarded, this.rng);
      this.corporationDeck = new CorporationDeck(dealer.corporationCards, [], this.rng);
      this.preludeDeck = new PreludeDeck(dealer.preludeDeck, [], this.rng);
    } else {
      // TODO(kberg): Delete this conditional when `d.dealer` is removed.
      if (d.projectDeck === undefined || d.corporationDeck === undefined || d.preludeDeck === undefined) {
        throw new Error('Wow');
      }
      this.projectDeck = ProjectDeck.deserialize(d.projectDeck, this.rng);
      this.corporationDeck = CorporationDeck.deserialize(d.corporationDeck, this.rng);
      this.preludeDeck = PreludeDeck.deserialize(d.preludeDeck, this.rng);
      this.ceoDeck = CeoDeck.deserialize(d.ceoDeck || {drawPile: [], discardPile: []}, this.rng);
    }

    // Rebuild every player objects
    this._players = d.players.map((element: SerializedPlayer) => {
      const player : IPlayer = Player.deserialize(element);
      player.setup(this);
      return player;
    });
    this.players.forEach((player) => {
      player.setup(this);
    });
    this.playersInGenerationOrder = this._players;
    if (d.exitedPlayers === undefined) {
      d.exitedPlayers = [];
    }
    this.exitedPlayers = d.exitedPlayers.map((element: SerializedPlayer) => {
      const player : IPlayer = Player.deserialize(element);
      player.setup(this);
      return player;
    });

    this.board = GameSetup.deserializeBoard(this.getAllPlayers(), this.gameOptions, d);
    this.resettable = true;
    this.spectatorId = d.spectatorId;
    this.createdTime = new Date(d.createdTimeMs);
    this.tags = d.tags || [];
    this.milestones = [];
    this.awards = [];

    d.milestones.forEach((element: IMilestone | string) => {
      let milestoneName = typeof element === 'string' ? element : element.name;
      milestoneName = maybeRenamedMilestone(milestoneName);

      const milestone = milestoneManifest.create(milestoneName);
      if (milestone !== undefined) {
        this.milestones.push(milestone);
      }
    });

    d.awards.forEach((element: IAward | string) => {
      let awardName = typeof element === 'string' ? element : element.name;
      awardName = maybeRenamedAward(awardName);

      const award = awardManifest.create(awardName);
      if (award !== undefined) {
        this.awards.push(award);
      }
    });

    if (this.gameOptions.aresExtension) {
      this.aresData = deserializeAresData(d.aresData);
    }
    // Reload colonies elements if needed
    if (this.gameOptions.coloniesExtension) {
      this.colonies = ColonyDeserializer.deserializeAndFilter(d.colonies, this.getAllPlayers());
      const colonyDealer = new ColonyDealer(this.rng, this.gameOptions);
      colonyDealer.restore(this.colonies);
      this.discardedColonies = colonyDealer.discardedColonies;

      // this.discardedColonies = d.discardedColonies.map((x) => getColonyByName(x.name)!);
      // this.colonies = deserializeColonies(d.colonies, this.getAllPlayers());
    }

    // Reload turmoil elements if needed
    if (d.turmoil && this.gameOptions.turmoilExtension) {
      this.turmoil = Turmoil.deserialize(d.turmoil, this.getAllPlayers());
    }

    // Reload moon elements if needed
    if (d.moonData !== undefined && this.gameOptions.moonExpansion === true) {
      this.moonData = MoonData.deserialize(d.moonData, this.getAllPlayers());
    }

    if (d.pathfindersData !== undefined && this.gameOptions.pathfindersExpansion === true) {
      this.pathfindersData = IPathfindersData.deserialize(d.pathfindersData);
    }

    // Rebuild claimed milestones
    this.claimedMilestones = deserializeClaimedMilestones(d.claimedMilestones, this.getAllPlayers(), this.milestones);
    // Rebuild funded awards
    this.fundedAwards = deserializeFundedAwards(d.fundedAwards, this.getAllPlayers(), this.awards);

    if (d.underworldData !== undefined) {
      this.underworldData = d.underworldData;
    }
    // Rebuild passed players set
    this.passedPlayers = new Set<IPlayer>();
    d.passedPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.passedPlayers.add(player);
      }
    });

    // Rebuild done players set
    this.donePlayers = new Set<IPlayer>();
    d.donePlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.donePlayers.add(player);
      }
    });

    // Rebuild researched players set
    this.researchedPlayers = new Set<IPlayer>();
    d.researchedPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.researchedPlayers.add(player);
      }
    });

    //   player.draftHand = cardsFromJSON(cardNames);


    // Mons insurance
    if (d.monsInsuranceOwner !== undefined) {
      this.monsInsuranceOwner = this.players.find((player) => player.id === d.monsInsuranceOwner?.id);
    }
    if (d.energyStationOwner !== undefined) {
      this.energyStationOwner = this.players.find((player) => player.id === d.energyStationOwner?.id);
    }
    if (d.wgPartnershipOwner !== undefined) {
      this.wgPartnershipOwner = this.players.find((player) => player.id === d.wgPartnershipOwner?.id);
    }

    // Define who was the first player for this generation
    const first = this.players.find((player) => player.id === d.first.id);
    if (first === undefined) {
      throw new Error('No Player found when rebuilding First Player');
    }
    this.first = first;
    this.setFirstPlayer(first);

    // Define who is the active player and init the take action phase
    let active = this.players.find((player) => player.id === d.activePlayer.id);
    if (active === undefined) {
      active = this.exitedPlayers.find((player) => player.id === d.activePlayer.id);
    }
    if (active === undefined) {
      throw new Error('No Player found when rebuilding Active Player');
    }
    this.activePlayer = active;
    this.tradeEmbargo = d.tradeEmbargo ?? false;
    this.beholdTheEmperor = d.beholdTheEmperor ?? false;
    this.globalsPerGeneration = d.globalsPerGeneration ?? [];
    this.verminInEffect = d.verminInEffect ?? false; // TODO(kberg): remove ?? false by 2025-08-01
    this.exploitationOfVenusInEffect = d.exploitationOfVenusInEffect ?? false; // TODO(kberg): remove ?? false by 2025-08-01
    // Still in Draft or Research of generation 1
    if (this.generation === 1 && this.players.some((p) => p.playedCards.filter(isICorporationCard).length === 0)) {
      if (this.phase === Phase.INITIALDRAFTING) {
        newInitialDraft(this).startDraft(false);
      } else {
        this.gotoInitialResearchPhase();
      }
    } else if (this.phase === Phase.DRAFTING) {
      newStandardDraft(this).startDraft(false);
    } else if (this.phase === Phase.RESEARCH) {
      // this.gotoResearchPhase();
      // 避免重复save 这里去除了gotoResearchPhase方法的保存逻辑
      this.researchedPlayers.clear();
      this.players.forEach((player) => {
        player.runResearchPhase();
      });
    } else {
      // We should be in ACTION phase, let's prompt the active player for actions
      this.activePlayer.takeAction(/* saveBeforeTakingAction */ false);
    }

    // Rebuild quit players set
    if (d.quitPlayers === undefined) {
      d.quitPlayers = [];
    }
    this.quitPlayers = new Set<IPlayer>();
    d.quitPlayers.forEach((element: SerializedPlayerId) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.quitPlayers.add(player);
      }
    });

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
    this._players = d.players.map((element: SerializedPlayer) => {
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

  public async rollback() {
    if (this.lastSaveId > 0 ) {
      await Database.getInstance().cleanGameSave(this.id, this.lastSaveId);
      await Database.getInstance().restoreGame(this.id, this.lastSaveId-1, this, 'manager');
    }
  }

  public delete() {
    Database.getInstance().cleanGameAllSaves(this.id);
  }

  public exitPlayer(player : IPlayer) {
    if (player.canExitFun(this)) {
      if (this.first === player) {
        this.firstExited = false;// 两个人连续体退时
        this.incrementFirstPlayer();
        this.firstExited = true;
      }
      if (this.monsInsuranceOwner !== undefined && this.monsInsuranceOwner === player) {
        this.monsInsuranceOwner = undefined;
      }

      if (this.energyStationOwner !== undefined && this.energyStationOwner === player) {
        this.energyStationOwner = undefined;
      }

      if (this.wgPartnershipOwner !== undefined && this.wgPartnershipOwner === player) {
        this.wgPartnershipOwner = undefined;
      }
      player.exited = true;
      player.setWaitingFor(undefined, undefined);
      player.timer.stop();
      this.exitedPlayers.push(player);
      this.passedPlayers.add(player);

      this.log('${0} resigned this game', (b) => b.player(player));
      if (this.allPlayersHavePassed()) {
        this._players = this._players.filter((p) => p.id !== player.id);
        this.gotoProductionPhase();
        return;
      } else {
        // playerIsFinishedTakingActions 会调用 getNextPlayer, 移除player之后会调用失败，所以先获取getPreviousPlayer
        const pre = this.getPlayerBefore(player);
        if (pre === undefined) {
          throw new Error('Did not find player');
        }
        this.activePlayer = pre;
        this._players = this._players.filter((p) => p.id !== player.id);
        this._players.forEach((p) => p.setup(this));
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

  public isRankMode(): boolean {
    return this.gameOptions.rankOption;
  }

  // 判断是否有玩家超时,返回超时的玩家 （是否可能出现多个？）
  public checkTimeOutPlayer(): IPlayer | undefined {
    if (this.isRankMode() && this.gameOptions.rankTimeLimit !== undefined && this.gameOptions.rankTimePerGeneration !== undefined) {
      // 超时时间 = 基础时限 + 每时代的时间增量 * (当前时代数 - 1)
      const timeLimit = Number(this.gameOptions.rankTimeLimit) + Number(this.gameOptions.rankTimePerGeneration) * Math.max(Number(this.generation) - 1, 0);
      for (const player of this.getAllPlayers()) {
        if (player.timer.getElapsedTimeInMinutes() >= timeLimit) return player;
      }
    }
    return undefined;
  }

  // 天梯 排名模式中强行结束游戏
  // 1. 判断是否游戏超时，如果超时的话，会直接结束游戏，并将超时玩家设为唯一败方
  // 2. 判断是否所有玩家都放弃游戏，是的话游戏作废，所有人分数不变
  public async checkRankModeEndGame(playerId: string) {
    if (!this.isRankMode()) return;
    const playerLength = this.getAllPlayers().length;

    this.quitPlayers.add(this.getPlayerById(playerId as PlayerId));

    if (this.phase === Phase.END || this.phase === Phase.ABANDON || this.phase === Phase.TIMEOUT) {
      return;
    } else if (this.quitPlayers.size === playerLength) {
      await this.gotoRankModeEndGame();
    } else if (this.shouldGoToTimeOutPhase()) {
      this.checkTimeOutPlayer()?.timer.stop(); // 结束计数器
      await this.gotoRankModeEndGame();
    }
  }

  public shouldGoToTimeOutPhase() {
    // FIXME: 游戏在初始选卡时的计时器和选完卡打牌时的好像不一样，先多加几个条件确保不会在初始选卡时超时
    return this.isRankMode() && ((this.phase !== Phase.RESEARCH && this.phase !== Phase.INITIALDRAFTING) || this.generation !== 1) && this.checkTimeOutPlayer() !== undefined;
  }

  private async gotoRankModeEndGame() {
    try {
      this.endGameInProgress = true; // 在异步函数之前设置为true
      this.updatePlayerVPForTheGeneration();
      console.log('await gotoEndGame');
      await this.gotoEndGame();
    } catch (error) {
      console.error('gotoEndGame failed:', error);
      this.endGameInProgress = false;
    } finally {
      // this.endGameInProgress = false; // 如果成功了，不需要解锁
    }
  }

  public getQuitPlayers():Array<Color> {
    return Array.from(this.quitPlayers).map((x) => x.color);
  }

  public getActionCount() {
    return sum(this.players.map((p) => p.actionsTakenThisGame));
  }
}
