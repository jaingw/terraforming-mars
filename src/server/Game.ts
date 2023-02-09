import * as constants from '../common/constants';
import {BeginnerCorporation} from './cards/corporation/BeginnerCorporation';
import {Board} from './boards/Board';
import {BoardName} from '../common/boards/BoardName';
import {CardName} from '../common/cards/CardName';
import {CardType} from '../common/cards/CardType';
import {ClaimedMilestone, serializeClaimedMilestones, deserializeClaimedMilestones} from './milestones/ClaimedMilestone';
import {IColony} from './colonies/IColony';
import {ColonyDealer} from './colonies/ColonyDealer';
import {Color} from '../common/Color';
import {ICorporationCard} from './cards/corporation/ICorporationCard';
import {Database} from './database/Database';
import {FundedAward, serializeFundedAwards, deserializeFundedAwards} from './awards/FundedAward';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';
import {IProjectCard} from './cards/IProjectCard';
import {ISpace} from './boards/ISpace';
import {Tile} from './Tile';
import {LogBuilder} from './logs/LogBuilder';
import {LogHelper} from './LogHelper';
import {LogMessage} from '../common/logs/LogMessage';
import {ALL_MILESTONES} from './milestones/Milestones';
import {ALL_AWARDS} from './awards/Awards';
import {PartyHooks} from './turmoil/parties/PartyHooks';
import {Phase} from '../common/Phase';
import {Player} from './Player';
import {PlayerId, GameId, SpectatorId} from '../common/Types';
import {PlayerInput} from './PlayerInput';
import {CardResource} from '../common/CardResource';
import {Resources} from '../common/Resources';
import {DeferredAction, Priority, SimpleDeferredAction} from './deferredActions/DeferredAction';
import {DeferredActionsQueue} from './deferredActions/DeferredActionsQueue';
import {SelectPaymentDeferred} from './deferredActions/SelectPaymentDeferred';
import {SelectInitialCards} from './inputs/SelectInitialCards';
import {PlaceOceanTile} from './deferredActions/PlaceOceanTile';
import {RemoveColonyFromGame} from './deferredActions/RemoveColonyFromGame';
import {GainResources} from './deferredActions/GainResources';
import {SerializedGame} from './SerializedGame';
import {SpaceBonus} from '../common/boards/SpaceBonus';
import {SpaceName} from './SpaceName';
import {SpaceType} from '../common/boards/SpaceType';
import {TileType} from '../common/TileType';
import {Turmoil} from './turmoil/Turmoil';
import {TurmoilUtil} from './turmoil/TurmoilUtil';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';
import {AresHandler} from './ares/AresHandler';
import {AresData} from '../common/ares/AresData';
import {getDate} from './UserUtil';
import {BREAKTHROUGH_CARD_MANIFEST} from './cards/breakthrough/BreakthroughCardManifest';
import {GameSetup} from './GameSetup';
import {GameCards} from './GameCards';
import {GlobalParameter} from '../common/GlobalParameter';
import {AresSetup} from './ares/AresSetup';
import {IMoonData} from './moon/IMoonData';
import {MoonExpansion} from './moon/MoonExpansion';
import {TurmoilHandler} from './turmoil/TurmoilHandler';
import {SeededRandom} from './Random';
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
import {isProduction} from './utils/server';
import {IShortData} from './database/IDatabase';
import {ColonyDeserializer} from './colonies/ColonyDeserializer';
import {DEFAULT_GAME_OPTIONS, GameOptions} from './GameOptions';
import {TheNewSpaceRace} from './cards/pathfinders/TheNewSpaceRace';
import {IPathfindersData} from './pathfinders/IPathfindersData';
import {CorporationDeck, PreludeDeck, ProjectDeck} from './cards/Deck';
import {Logger} from './logs/Logger';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {CardManifest} from './cards/ModuleManifest';
import {ColoniesHandler} from './colonies/ColoniesHandler';
import {Dealer} from './Dealer';

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
export class Game implements Logger {
  // Game-level data
  public exitedPlayers: Array<Player> = [];// 体退玩家list 必须放在第一位 避免数据库序列化丢失数据
  public loadState : string = LoadState.HALFLOADED;
  public lastSaveId: number = 0;
  private clonedGamedId: string | undefined;
  public rng: SeededRandom;
  public spectatorId: SpectatorId | undefined;
  public deferredActions: DeferredActionsQueue = new DeferredActionsQueue();
  public gameAge: number = 0; // Each log event increases it
  public gameLog: Array<LogMessage> = [];
  public undoCount: number = 0; // Each undo increases it

  public generation: number = 1;
  public phase: Phase = Phase.RESEARCH;
  public projectDeck: ProjectDeck;
  public preludeDeck: PreludeDeck;
  public corporationDeck: CorporationDeck;
  public board: Board;
  public heatFor: boolean = false;
  public breakthrough: boolean = false;
  public createtime :string = getDate();
  public updatetime :string = getDate();
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
  // The first player of this generation.
  private first: Player;

  // Drafting
  private draftRound: number = 1; // 轮抽到几张牌了
  // Used when drafting the first 10 project cards.
  private initialDraftIteration: number = 1; // 初始轮抽轮次：第一次5张为1,第二次5张为2，前序为3, 公司为4
  private unDraftedCards: Map<Player, Array<IProjectCard | ICorporationCard>> = new Map();
  // Used for corporation global draft: do we draft to next player or to player before
  private _corporationsDraftDirection: 'before' | 'after' = 'before';
  public _corporationsToDraft: Array<ICorporationCard> = [];

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
  public moonData: IMoonData | undefined;
  public pathfindersData: PathfindersData | undefined;

  // Card-specific data
  // Mons Insurance promo corp
  public monsInsuranceOwner?: Player;
  // Crash Site promo project
  public someoneHasRemovedOtherPlayersPlants: boolean = false;
  // United Nations Mission One community corp
  public unitedNationsMissionOneOwner: PlayerId | undefined = undefined;
  // 玩家的行动是否动过牌库， 是的话禁止撤回
  public cardDrew: boolean = false;
  // 星际领航者的殖民判定
  public finishFirstTrading: boolean = false;
  // Syndicate Pirate Raids
  public syndicatePirateRaider?: string;

  private constructor(
    public id: GameId,
    private players: Array<Player>,
    first: Player,
    public gameOptions: GameOptions,
    rng: SeededRandom,
    board: Board,
    projectDeck: ProjectDeck,
    corporationDeck: CorporationDeck,
    preludeDeck: PreludeDeck) {
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

    this.first = first;
    this.rng = rng;
    this.projectDeck = projectDeck;
    this.corporationDeck = corporationDeck;
    this.preludeDeck = preludeDeck;
    this.board = board;

    this.players.forEach((player) => {
      player.game = this;
      if (player.isCorporation(CardName.MONS_INSURANCE)) this.monsInsuranceOwner = player;
    });
    this.activePlayer = first;
    this.heatFor = gameOptions.heatFor || false;
    this.breakthrough = gameOptions.breakthrough || false;
  }

  public static newInstance(id: GameId,
    players: Array<Player>,
    firstPlayer: Player,
    gameOptions: GameOptions = {...DEFAULT_GAME_OPTIONS},
    seed = 0,
    spectatorId: SpectatorId | undefined = undefined,
    rebuild: boolean = true): Game {
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
          corporationCards.splice(index, 0, new cardFactory.Factory() );
        }
      });
      customCorporationCards.forEach((cardName ) => {
        const cardFactory = breakCards.find((cardFactory) => cardFactory.cardName_ori === cardName);
        if (cardFactory !== undefined) {
          customCorporationCards.push(new cardFactory.Factory().name);
        }
      });
    }

    // customCorporationCards洗牌之后会在最上面
    const corporationDeck = new CorporationDeck(corporationCards, [], rng);
    corporationDeck.shuffle(customCorporationCards);


    const preludeDeck = new PreludeDeck(gameCards.getPreludeCards(), [], rng);
    preludeDeck.shuffle(gameOptions.customPreludes);

    const game: Game = new Game(id, players, firstPlayer, gameOptions, rng, board, projectDeck, corporationDeck, preludeDeck);

    gameOptions._corporationsDraft = false;
    // Single player game player starts with 14TR
    if (players.length === 1) {
      gameOptions.draftVariant = false;
      gameOptions.initialDraftVariant = false;
      gameOptions._corporationsDraft = false;
      gameOptions.randomMA = RandomMAOptionType.NONE;

      players[0].setTerraformRating(14);
      players[0].terraformRatingAtGenerationStart = 14;
    }
    game.spectatorId = spectatorId;
    // Initialize Ares data
    if (gameOptions.aresExtension) {
      game.aresData = AresSetup.initialData(gameOptions.aresHazards, players);
    }

    const milestonesAwards = chooseMilestonesAndAwards(gameOptions);
    game.milestones = milestonesAwards.milestones;
    game.awards = milestonesAwards.awards;

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

    // Failsafe for exceeding corporation pool
    // (I do not think this is necessary any further given how corporation cards are stored now)
    const minCorpsRequired = players.length * gameOptions.startingCorporations;

    if (minCorpsRequired > corporationDeck.drawPile.length) {
      gameOptions.startingCorporations = 2;
    }

    // Initialize each player:
    // Give them their corporation cards, other cards, starting production,
    // handicaps.
    for (const player of game.getPlayersInGenerationOrder()) {
      player.heatForTemperature = game.heatFor ? 7 : 8;
      player.setTerraformRating(player.getTerraformRating() + player.handicap);
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
        gameOptions.preludeExtension ||
        gameOptions.venusNextExtension ||
        gameOptions.coloniesExtension ||
        gameOptions.turmoilExtension ||
        gameOptions.initialDraftVariant) {
        if (gameOptions._corporationsDraft === false) {
          for (let i = 0; i < gameOptions.startingCorporations; i++) {
            player.dealtCorporationCards.push(corporationDeck.draw(game));
          }
        }
        if (gameOptions.initialDraftVariant === false) {
          for (let i = 0; i < 10; i++) {
            player.dealtProjectCards.push(projectDeck.draw(game));
          }
        }
        if (gameOptions.preludeExtension) {
          for (let i = 0; i < constants.PRELUDE_CARDS_DEALT_PER_PLAYER; i++) {
            // 双公司的情况下 ， 不允许再加公司
            let prelude = preludeDeck.draw(game);
            if (gameOptions.doubleCorp && prelude.name === CardName.MERGER) {
              prelude = preludeDeck.draw(game);
            }
            player.dealtPreludeCards.push(prelude);
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

    // Do we draft corporations or do we start the game?
    // NOT  goto else
    if (gameOptions._corporationsDraft) {
      game.phase = Phase.CORPORATIONDRAFTING;
      for (let i = 0; i < gameOptions.startingCorporations * players.length; i++) {
        game._corporationsToDraft.push(game.corporationDeck.draw(game));
      }
      // First player should be the last player
      const playerStartingCorporationsDraft = game.getPlayerBefore(firstPlayer);
      playerStartingCorporationsDraft.runDraftCorporationPhase(playerStartingCorporationsDraft.name, game._corporationsToDraft);
    } else {
      game.gotoInitialPhase();
    }

    if (!rebuild) {
      Database.getInstance().saveGame(game);
    }
    return game;
  }

  // Function use to properly start the game: with project draft or with research phase
  public gotoInitialPhase(): void {
    // Initial Draft
    if (this.gameOptions.initialDraftVariant) {
      this.phase = Phase.INITIALDRAFTING;
      this.runDraftRound(true);
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
    await Database.getInstance().saveGame(this);
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
      colonies: this.colonies.map((colony) => colony.serialize()),
      corporationDeck: this.corporationDeck.serialize(),
      currentSeed: this.rng.current,
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
      temperature: this.temperature,
      undoCount: this.undoCount,
      venusScaleLevel: this.venusScaleLevel,
      // TODO 去掉这俩属性
      // _corporationsDraftDirection: this._corporationsDraftDirection,
      // corporationsToDraft: this._corporationsToDraft.map((c) => c.name),
      createtime: this.createtime,
      updatetime: this.updatetime,
      breakthrough: this.breakthrough,
      cardDrew: this.cardDrew,
      heatFor: this.heatFor,
      loadState: this.loadState,
      firstExited: this.firstExited,
      finishFirstTrading: this.finishFirstTrading,
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
    return this.getAllPlayers().length === 1;
  }

  // Function to retrieve a player by it's id
  public getPlayerById(id: PlayerId): Player {
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
  public getPlayersById(ids: Array<PlayerId>): Array<Player> {
    return ids.map((id) => this.getPlayerById(id));
  }

  public defer(action: DeferredAction, priority?: Priority): void {
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
          moonData.colonyRate === constants.MAXIMUM_HABITAT_RATE &&
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
    if (!this.isSoloMode()) {
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
    if (this.players.every((p) => p.pickedCorporationCard !== undefined)) {
      if (this.gameOptions.doubleCorp) {
        const game = this;
        const chooseFirstCorp = function() {
          for (const somePlayer of game.getPlayers()) {
            if (somePlayer.corporations[0] === undefined) {
              if (somePlayer.pickedCorporationCard === undefined || somePlayer.pickedCorporationCard2 === undefined) {
                throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
              }
              somePlayer.setWaitingFor(new SelectCard(
                'Select corp card to play first',
                'Play',
                [somePlayer.pickedCorporationCard, somePlayer.pickedCorporationCard2],
                (foundCards: Array<ICorporationCard>) => {
                  if (somePlayer.pickedCorporationCard === undefined || somePlayer.pickedCorporationCard2 === undefined) {
                    throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
                  }
                  game.playCorporationCard(somePlayer, foundCards[0]);
                  game.playCorporationCard(somePlayer, somePlayer.pickedCorporationCard.name === foundCards[0].name ? somePlayer.pickedCorporationCard2 : somePlayer.pickedCorporationCard);
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
          if (somePlayer.pickedCorporationCard === undefined) {
            throw new Error(`pickedCorporationCard is not defined for ${somePlayer.id}`);
          }
          this.playCorporationCard(somePlayer, somePlayer.pickedCorporationCard);
          this.playerIsFinishedWithResearchPhase(somePlayer);
        }
      }
    }
  }

  public playCorporationCard(player: Player, corporationCard: ICorporationCard ): void {
    player.corporations.push(corporationCard);
    if (corporationCard.name === CardName.BEGINNER_CORPORATION) {
      player.megaCredits = corporationCard.startingMegaCredits;
    }
    corporationCard.play(player);
    if (corporationCard.initialAction !== undefined || corporationCard.firstAction !== undefined) {
      player.pendingInitialActions.push(corporationCard);
    }

    this.log('${0} played ${1}', (b) => b.player(player).card(corporationCard));
    player.game.log('${0} kept ${1} project cards', (b) => b.player(player).number(player.cardsInHand.length));

    // trigger other corp's effect, e.g. SaturnSystems,PharmacyUnion,Splice
    this.triggerOtherCorpEffects(player, corporationCard);

    // Activate some colonies
    ColoniesHandler.onCardPlayed(this, corporationCard);

    PathfindersExpansion.onCardPlayed(player, corporationCard);

    player.dealtCorporationCards = [];
    player.dealtPreludeCards = [];
    player.dealtProjectCards = [];
  }

  public triggerOtherCorpEffects(player: Player, corporationCard: ICorporationCard) {
    for (const somePlayer of this.getPlayersInGenerationOrder()) {
      somePlayer.corporations.forEach((corpCard) => {
        if ( corpCard !== corporationCard && corpCard.onCorpCardPlayed !== undefined) {
          this.defer(new SimpleDeferredAction(
            player,
            () => {
              if (corpCard !== undefined && corpCard.onCorpCardPlayed !== undefined) {
                return corpCard.onCorpCardPlayed(player, corporationCard) || undefined;
              }
              return undefined;
            },
          ));
        }
      });
    }
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
          this.projectDeck.discard(card);
        }
      });

      this.playerHasPickedCorporationCard(player, corporationCard, corporationCard2); return undefined;
    });
  }

  public hasPassedThisActionPhase(player: Player): boolean {
    return this.passedPlayers.has(player);
  }

  // Public for testing.
  public incrementFirstPlayer(): void {
    if (this.firstExited) {
      this.firstExited = false;
      return;
    }
    let firstIndex = this.players.map((x) => x.id).indexOf(this.first.id);
    if (firstIndex === -1) {
      throw new Error('Didn\'t even find player');
    }
    firstIndex = (firstIndex + 1) % this.players.length;
    this.first = this.players[firstIndex];
  }

  // Only used in the prelude The New Space Race.
  public overrideFirstPlayer(newFirstPlayer: Player): void {
    if (newFirstPlayer.game.id !== this.id) {
      throw new Error(`player ${newFirstPlayer.id} is not part of this game`);
    }
    this.first = newFirstPlayer;
  }

  private runDraftRound(initialDraft: boolean = false): void {
    this.draftedPlayers.clear();
    this.players.forEach((player) => {
      if (this.draftRound === 1 ) {
        if (!initialDraft || this.initialDraftIteration === 1 || this.initialDraftIteration === 2 ) {
          player.askPlayerToDraft(initialDraft, this.giveDraftCardsTo(player).name);
        } else if (this.initialDraftIteration === 3) {
          player.askPlayerToDraft(initialDraft, this.giveDraftCardsTo(player).name, player.dealtPreludeCards);
        } else if ( this.initialDraftIteration === 4) {
          player.askPlayerToDraft(initialDraft, this.giveDraftCardsTo(player).name, player.dealtCorporationCards);
        }
      } else {
        const draftCardsFrom = this.getDraftCardsFrom(player);
        const cards = this.unDraftedCards.get(draftCardsFrom);
        this.unDraftedCards.delete(draftCardsFrom);
        player.askPlayerToDraft(initialDraft, this.giveDraftCardsTo(player).name, cards);
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
      this.players[0].production.add(Resources.MEGACREDITS, -2);
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
      player.colonies.cardDiscount = 0; // Iapetus reset hook
      player.runProductionPhase();
    });

    if (this.gameIsOver()) {
      this.log('Final greenery placement', (b) => b.forNewGeneration());
      // chaos生产之后会需要选择资源，先选完再执行放树
      this.deferredActions.runAll(() => this.gotoFinalGreeneryPlacement());
      return;
    } else {
      this.players.forEach((player) => {
        player.colonies.returnTradeFleets();
      });
    }

    // solar Phase Option
    this.phase = Phase.SOLAR;
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
    }
  }

  private gotoEndGeneration() {
    this.endGenerationForColonies();

    TurmoilUtil.ifTurmoil(this, (turmoil) => {
      turmoil.endGeneration(this);
    });

    // turmoil.endGeneration might have added actions.
    if (this.deferredActions.length > 0) {
      this.deferredActions.runAll(() => this.goToDraftOrResearch());
    } else {
      this.phase = Phase.INTERGENERATION;
      this.goToDraftOrResearch();
    }
  }

  private updateVPbyGeneration(): void {
    this.getPlayers().forEach((player) => {
      player.victoryPointsByGeneration.push(player.getVictoryPoints().total);
    });
  }

  private goToDraftOrResearch() {
    this.updateVPbyGeneration();
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
        TheNewSpaceRace.potentiallyChangeFirstPlayer(this);
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

  // Function use to manage corporation draft way  NOT
  public playerIsFinishedWithDraftingCorporationPhase(player: Player, cards : Array<ICorporationCard>): void {
    const nextPlayer = this._corporationsDraftDirection === 'after' ? this.getPlayerAfter(player) : this.getPlayerBefore(player);
    const passTo = this._corporationsDraftDirection === 'after' ? this.getPlayerAfter(nextPlayer) : this.getPlayerBefore(nextPlayer);

    // If more than 1 card are to be passed to the next player, that means we're still drafting
    if (cards.length > 1) {
      if ((this.draftRound + 1) % this.players.length === 0) {
        nextPlayer.runDraftCorporationPhase(nextPlayer.name, cards);
      } else if (this.draftRound % this.players.length === 0) {
        player.runDraftCorporationPhase(nextPlayer.name, cards);
        this._corporationsDraftDirection = this._corporationsDraftDirection === 'after' ? 'before' : 'after';
      } else {
        nextPlayer.runDraftCorporationPhase(passTo.name, cards);
      }
      this.draftRound++;
      return;
    }

    // Push last card to next player
    nextPlayer.draftedCorporations.push(...cards);

    this.players.forEach((player) => {
      player.dealtCorporationCards = player.draftedCorporations;
    });
    // Reset value to guarantee no impact on eventual futur drafts (projects or preludes)
    this.initialDraftIteration = 1;
    this.draftRound = 1;
    this.gotoInitialPhase();
  }

  private getDraftCardsFrom(player: Player): Player {
    // Special-case for the initial draft direction on second iteration
    if (this.generation === 1 && (this.initialDraftIteration === 2 || this.initialDraftIteration === 4)) {
      return this.getPlayerBefore(player);
    }

    return this.generation % 2 === 0 ? this.getPlayerBefore(player) : this.getPlayerAfter(player);
  }

  private giveDraftCardsTo(player: Player): Player {
    // Special-case for the initial draft direction on second iteration
    if (this.initialDraftIteration === 2 && this.generation === 1) {
      return this.getPlayerAfter(player);
    }

    return this.generation % 2 === 0 ? this.getPlayerAfter(player) : this.getPlayerBefore(player);
  }

  private getPlayerBefore(player: Player): Player {
    const playerIndex = this.players.indexOf(player);
    if (playerIndex === -1) {
      throw new Error(`Player ${player.id} not in game ${this.id}`);
    }

    // Go to the end of the array if stand at the start
    return this.players[(playerIndex === 0) ? this.players.length - 1 : playerIndex - 1];
  }

  private getPlayerAfter(player: Player): Player {
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
    this.phase = Phase.END;
    await this.save();

    // Log id or cloned game id
    if (this.clonedGamedId !== undefined && this.clonedGamedId.startsWith('#')) {
      const clonedGamedId = this.clonedGamedId;
      this.log('This game was a clone from game ${0}', (b) => b.rawString(clonedGamedId));
    } else {
      const id = this.id;
      this.log('This game id was ${0}', (b) => b.rawString(id));
    }

    Database.getInstance().cleanGame(this.id).catch((err) => {
      console.error(err);
    });
    const scores: Array<Score> = [];
    const players = this.getAllPlayers();
    players.forEach((player) => {
      const corporation = player.corporations.map((c) => c.name).join('|');
      const vpb = player.getVictoryPoints();
      scores.push({corporation: corporation,
        playerScore: vpb.total, player: player.name, userId: player.userId});
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

  // Called when a player cannot or chose not to place any more greeneries.
  public playerIsDoneWithGame(player: Player): void {
    this.donePlayers.add(player);
    // Go back in to find someone else to play final greeneries.
    this.gotoFinalGreeneryPlacement();
  }

  // Well, this isn't just "go to the final greenery placement". It finds the next player
  // who might be able to place a final greenery.
  // Rename to takeNextFinalGreeneryAction?

  public /* for testing */ gotoFinalGreeneryPlacement(): void {
    for (const player of this.getPlayersInGenerationOrder()) {
      if (this.donePlayers.has(player)) {
        continue;
      }

      // You many not place greeneries in solo mode unless you have already won the game
      // (e.g. completed global parameters, reached TR63.)
      if (this.isSoloMode() && !this.isSoloModeWin()) {
        continue;
      }

      if (this.canPlaceGreenery(player)) {
        this.activePlayer = player;
        player.takeActionForFinalGreenery();
        return;
      } else if (player.getWaitingFor() !== undefined) {
        return;
      } else {
        this.donePlayers.add(player);
      }
    }
    this.updateVPbyGeneration();
    this.gotoEndGame();
  }

  private startActionsForPlayer(player: Player) {
    this.activePlayer = player;
    player.actionsTakenThisRound = 0;

    // Save the game state after changing the current player
    // Increment the save id
    this.save();

    player.takeAction();
  }

  public increaseOxygenLevel(player: Player, increments: -2 | -1 | 1 | 2): void {
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
      player.increaseTerraformRatingSteps(steps);
    }
    if (this.oxygenLevel < 8 && this.oxygenLevel + steps >= 8) {
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

  public increaseVenusScaleLevel(player: Player, increments: -1 | 1 | 2 | 3): number {
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
        const newValue = this.venusScaleLevel + steps * 2;
        const minimalBaseline = Math.max(this.venusScaleLevel, 16);
        const maximumBaseline = Math.min(newValue, 30);
        const standardResourcesGranted = Math.max((maximumBaseline - minimalBaseline) / 2, 0);

        const grantWildResource = this.venusScaleLevel + (steps * 2) >= 30;
        // The second half of this expression removes any increases earler than 16-to-18.
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

    return steps;
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
        player.production.add(Resources.HEAT, 1, {log: true});
      }
      if (this.temperature < -20 && this.temperature + steps * 2 >= -20) {
        player.production.add(Resources.HEAT, 1, {log: true});
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
      this.defer(new PlaceOceanTile(player, {title: 'Select space for ocean from temperature increase'}));
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

  public getCitiesOffMarsCount(player?: Player): number {
    return this.getCitiesCount(player, (space) => space.spaceType === SpaceType.COLONY);
  }

  public getCitiesOnMarsCount(player?: Player): number {
    return this.getCitiesCount(player, (space) => space.spaceType !== SpaceType.COLONY);
  }

  public getCitiesCount(player?: Player, filter?: (space: ISpace) => boolean): number {
    let cities = this.board.spaces.filter(Board.isCitySpace);
    if (player !== undefined) cities = cities.filter(Board.ownedBy(player));
    if (filter) cities = cities.filter(filter);
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
    player: Player,
    space: ISpace,
    tile: Tile): void {
    // Part 1, basic validation checks.

    if (space.tile !== undefined && !(this.gameOptions.aresExtension || this.gameOptions.pathfindersExpansion)) {
      throw new Error('Selected space is occupied');
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

    // Hellas special requirements ocean tile
    if (space.id === SpaceName.HELLAS_OCEAN_TILE &&
        this.canAddOcean() &&
        this.gameOptions.boardName === BoardName.HELLAS) {
      if (player.color !== Color.NEUTRAL) {
        this.defer(new PlaceOceanTile(player, {title: 'Select space for ocean from placement bonus'}));
        this.defer(new SelectPaymentDeferred(player, constants.HELLAS_BONUS_OCEAN_COST, {title: 'Select how to pay for placement bonus ocean'}));
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

      TurmoilHandler.resolveTilePlacementBonuses(player, space.spaceType);

      if (arcadianCommunityBonus) {
        this.defer(new GainResources(player, Resources.MEGACREDITS, {count: 3}));
      }
    } else {
      space.player = undefined;
    }

    this.players.forEach((p) => {
      p.tableau.forEach((playedCard) => {
        playedCard.onTilePlaced?.(p, player, space, BoardType.MARS);
      });
    });

    AresHandler.ifAres(this, () => {
      AresHandler.grantBonusForRemovingHazard(player, initialTileTypeForAres);
    });
  }

  public simpleAddTile(player: Player, space: ISpace, tile: Tile) {
    space.tile = tile;
    space.player = player;
    if (tile.tileType === TileType.OCEAN || tile.tileType === TileType.MARTIAN_NATURE_WONDERS) {
      space.player = undefined;
    }
    LogHelper.logTilePlacement(player, space, tile.tileType);
  }

  public grantSpaceBonuses(player: Player, space: ISpace) {
    const bonuses = MultiSet.from(space.bonus);
    bonuses.forEachMultiplicity((count: number, bonus: SpaceBonus) => {
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
      this.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: count}));
      break;
    case SpaceBonus.ANIMAL:
      this.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: count}));
      break;
    case SpaceBonus.DATA:
      this.defer(new AddResourcesToCard(player, CardResource.DATA, {count: count}));
      break;
    case SpaceBonus.ENERGY_PRODUCTION:
      player.production.add(Resources.ENERGY, count, {log: true});
      break;
    case SpaceBonus.SCIENCE:
      this.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: count}));
      break;
    case SpaceBonus.TEMPERATURE:
      if (this.getTemperature() < constants.MAX_TEMPERATURE) {
        this.defer(new SimpleDeferredAction(player, () => this.increaseTemperature(player, 1)));
        this.defer(new SelectPaymentDeferred(
          player,
          constants.VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST,
          {title: 'Select how to pay for placement bonus temperature'}));
      }
      break;
    case SpaceBonus.ENERGY:
      player.addResource(Resources.ENERGY, count, {log: true});
      break;
    default:
      // TODO(kberg): Remove the isProduction condition after 2022-01-01.
      // I tried this once and broke the server, so I'm wrapping it in isProduction for now.
      if (!isProduction()) {
        throw new Error('Unhandled space bonus ' + spaceBonus + '. Report this exact error, please.');
      }
    }
  }

  public addGreenery(
    player: Player, space: ISpace,
    shouldRaiseOxygen: boolean = true): undefined {
    this.addTile(player, space, {
      tileType: TileType.GREENERY,
    });

    // Turmoil Greens ruling policy
    PartyHooks.applyGreensRulingPolicy(player, space);

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

      this.defer(new SimpleDeferredAction(
        player,
        () => {
          return orOptions;
        },
      ));
      return undefined;
    }

    if (shouldRaiseOxygen) this.increaseOxygenLevel(player, 1);
    return undefined;
  }

  public addCityTile(
    player: Player, space: ISpace,
    cardName: CardName | undefined = undefined): void {
    this.addTile(player, space, {
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

  public addOceanTile(player: Player, space: ISpace): void {
    if (this.canAddOcean() === false) return;

    this.addTile(player, space, {
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
    const ret: Array<Player> = [];
    let insertIdx = 0;
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
      for (const card of player.tableau) {
        if (card.name === name) {
          return player;
        }
      }
    }
    throw new Error(`No player has played ${name}`);
  }

  // Returns the player holding a card in hand. Return undefined when nobody has that card in hand.
  public getCardHolder(name: CardName): [Player | undefined, IProjectCard | undefined] {
    for (const player of this.players) {
      // Check cards player has in hand
      for (const card of [...player.preludeCardsInHand, ...player.cardsInHand]) {
        if (card.name === name) {
          return [player, card];
        }
      }
    }
    return [undefined, undefined];
  }

  public getCardsInHandByResource(player: Player, resourceType: CardResource) {
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
      if (p.production[resource] < minQuantity) return false;
      // The pathfindersExpansion test is just an optimization for non-Pathfinders games.
      if (this.gameOptions.pathfindersExpansion && p.cardIsInEffect(CardName.PRIVATE_SECURITY)) return false;
      return true;
    });
  }

  public discardForCost(cardCount: 1 | 2, toPlace: TileType) {
    if (cardCount === 1) {
      const card = this.projectDeck.draw(this);
      this.projectDeck.discard(card);
      this.log('Drew and discarded ${0} (cost ${1}) to place a ${2}', (b) => b.card(card).number(card.cost).tileType(toPlace));
      return card.cost;
    } else {
      const card1 = this.projectDeck.draw(this);
      this.projectDeck.discard(card1);
      const card2 = this.projectDeck.draw(this);
      this.projectDeck.discard(card2);
      this.log('Drew and discarded ${0} (cost ${1}) and ${2} (cost ${3}) to place a ${4}', (b) => b.card(card1).number(card1.cost).card(card2).number(card2.cost).tileType(toPlace));
      return card1.cost + card2.cost;
    }
  }

  public getSpaceByOffset(direction: -1 | 1, toPlace: TileType, cardCount: 1 | 2 = 1) {
    const cost = this.discardForCost(cardCount, toPlace);

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
    }

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

    this.board = GameSetup.deserializeBoard(this.getAllPlayers(), this.gameOptions, d);

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

    // this.corporationsToDraft = cardFinder.corporationCardsFromJSON(d.corporationsToDraft ?? []);
    // this.corporationsDraftDirection = d.corporationsDraftDirection ?? false;


    // Mons insurance
    if (d.monsInsuranceOwner !== undefined) {
      this.monsInsuranceOwner = this.players.find((player) => player.id === d.monsInsuranceOwner?.id);
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
    // TODO 如果已经选好牌了 可以不回到重新选牌
    if (this.generation === 1 && this.players.some((p) => p.corporations.length === 0 )) {
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
      this.activePlayer.takeAction(/* saveBeforeTakingAction */ false);
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
    Database.getInstance().cleanGameAllSaves(this.id);
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
