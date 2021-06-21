import * as constants from './constants';
import {BeginnerCorporation} from './cards/corporation/BeginnerCorporation';
import {Board} from './boards/Board';
import {BoardName} from './boards/BoardName';
import {CardName} from './CardName';
import {CardType} from './cards/CardType';
import {ClaimedMilestone} from './milestones/ClaimedMilestone';
import {Colony} from './colonies/Colony';
import {ColonyDealer, loadColoniesFromJSON} from './colonies/ColonyDealer';
import {ColonyModel} from './models/ColonyModel';
import {ColonyName} from './colonies/ColonyName';
import {Color} from './Color';
import {CorporationCard} from './cards/corporation/CorporationCard';
import {Database} from './database/Database';
import {Dealer} from './Dealer';
import {ElysiumBoard} from './boards/ElysiumBoard';
import {FundedAward} from './awards/FundedAward';
import {HellasBoard} from './boards/HellasBoard';
import {IAward} from './awards/IAward';
import {ISerializable} from './ISerializable';
import {IMilestone} from './milestones/IMilestone';
import {IProjectCard} from './cards/IProjectCard';
import {ISpace, SpaceId} from './boards/ISpace';
import {ITile} from './ITile';
import {LogBuilder} from './LogBuilder';
import {LogHelper} from './LogHelper';
import {LogMessage} from './LogMessage';
import {ALL_MILESTONES} from './milestones/Milestones';
import {ALL_AWARDS} from './awards/Awards';
import {OriginalBoard} from './boards/OriginalBoard';
import {PartyHooks} from './turmoil/parties/PartyHooks';
import {Phase} from './Phase';
import {Player} from './Player';
import {PlayerInput} from './PlayerInput';
import {ResourceType} from './ResourceType';
import {Resources} from './Resources';
import {DeferredAction, Priority} from './deferredActions/DeferredAction';
import {DeferredActionsQueue} from './deferredActions/DeferredActionsQueue';
import {SelectHowToPayDeferred} from './deferredActions/SelectHowToPayDeferred';
import {SelectInitialCards} from './inputs/SelectInitialCards';
import {PlaceOceanTile} from './deferredActions/PlaceOceanTile';
import {RemoveColonyFromGame} from './deferredActions/RemoveColonyFromGame';
import {GainResources} from './deferredActions/GainResources';
import {SelectSpace} from './inputs/SelectSpace';
import {SerializedGame} from './SerializedGame';
import {SerializedPlayer} from './SerializedPlayer';
import {SpaceBonus} from './SpaceBonus';
import {SpaceName} from './SpaceName';
import {SpaceType} from './SpaceType';
import {Tags} from './cards/Tags';
import {TileType} from './TileType';
import {Turmoil} from './turmoil/Turmoil';
import {RandomMAOptionType} from './RandomMAOptionType';
import {AresHandler} from './ares/AresHandler';
import {IAresData} from './ares/IAresData';
import {getDate} from './UserUtil';
import {BREAKTHROUGH_CARD_MANIFEST} from './cards/breakthrough/BreakthroughCardManifest';
import {AgendaStyle} from './turmoil/PoliticalAgendas';
import {GameSetup} from './GameSetup';
import {CardLoader} from './CardLoader';
import {GlobalParameter} from './GlobalParameter';
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
import {StarcorePlunder} from './cards/eros/StarcorePlunder';
import {SelectCard} from './inputs/SelectCard';

export type GameId = string;
export type SpectatorId = string;

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

  // Variants
  draftVariant: boolean;
  initialDraftVariant: boolean;
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
  requiresVenusTrackCompletion: boolean; // Venus must be completed to end the game
  requiresMoonTrackCompletion: boolean; // Moon must be completed to end the game
}

const DEFAULT_GAME_OPTIONS: GameOptions = {
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
  fastModeOption: false,
  includeVenusMA: true,
  initialDraftVariant: false,
  moonExpansion: false,
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
};

export class Game implements ISerializable<SerializedGame> {
  // Game-level data
  public exitedPlayers: Array<Player> = [];// 体退玩家list 必须放在第一位 避免数据库序列化丢失数据
  public loadState : string = LoadState.HALFLOADED;
  public lastSaveId: number = 0;
  private clonedGamedId: string | undefined;
  public seed: number;
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
  public heatFor: boolean = false;;
  public breakthrough: boolean = false;;
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
  private initialDraftIteration: number = 1; // 初始轮抽轮次：第一次5张为1,第二次5张为2，前序为3
  private unDraftedCards: Map<Player, Array<IProjectCard>> = new Map();

  // Milestones and awards
  public claimedMilestones: Array<ClaimedMilestone> = [];
  public milestones: Array<IMilestone> = [];
  public fundedAwards: Array<FundedAward> = [];
  public awards: Array<IAward> = [];

  // Expansion-specific data
  public colonies: Array<Colony> = [];
  public colonyDealer: ColonyDealer | undefined = undefined;
  public turmoil: Turmoil | undefined;
  public aresData: IAresData | undefined;
  public moonData: IMoonData | undefined;

  // Card-specific data
  // Mons Insurance promo corp
  public monsInsuranceOwner: Player | undefined = undefined;
  // Crash Site promo project
  public someoneHasRemovedOtherPlayersPlants: boolean = false;
  // United Nations Mission One community corp
  public unitedNationsMissionOneOwner: string | undefined = undefined;
  // 玩家的行动是否动过牌库， 是的话禁止撤回
  public cardDrew: boolean = false;
  // 星核打出的时代数
  public starCoreGen = 0;
  // 星际领航者的殖民判定
  public finishFirstTrading: boolean = false;
  // Syndicate Pirate Raids
  public syndicatePirateRaider: string | undefined = undefined;

  private constructor(
    public id: string,
    private players: Array<Player>,
    private first: Player,
    public gameOptions: GameOptions,
    seed: number,
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

    this.seed = seed;
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
    const board = GameSetup.newBoard(gameOptions.boardName, gameOptions.shuffleMapOption, rng, gameOptions.venusNextExtension);
    const cardLoader = new CardLoader(gameOptions);
    const dealer = Dealer.newInstance(cardLoader);

    const game: Game = new Game(id, players, firstPlayer, gameOptions, seed, board, dealer);

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
      game.colonyDealer = new ColonyDealer();
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

    // Setup custom corporation list
    let corporationCards = game.dealer.corporationCards;

    const minCorpsRequired = players.length * gameOptions.startingCorporations;
    if (gameOptions.customCorporationsList && gameOptions.customCorporationsList.length >= minCorpsRequired) {
      const customCorporationCards: CorporationCard[] = [];
      for (const corp of gameOptions.customCorporationsList) {
        const customCorp = corporationCards.find((cf) => cf.name === corp);
        if (customCorp) customCorporationCards.push(customCorp);
      }
      if (customCorporationCards.length >= minCorpsRequired) {
        corporationCards = customCorporationCards;
      }
    }

    if (game.breakthrough) {
      corporationCards.forEach((card, index) => {
        const cardFactory = BREAKTHROUGH_CARD_MANIFEST.corporationCards.cards.find((cardFactory) => cardFactory.cardName_ori === card.name);
        if (cardFactory !== undefined) {
          corporationCards.splice(index, 1, new cardFactory.Factory() as CorporationCard);
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
    for (const player of game.getPlayers()) {
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
      Database.getInstance().saveGameState(game.id, game.lastSaveId, JSON.stringify(game, game.replacer));
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
    Database.getInstance().saveGameState(this.id, this.lastSaveId, JSON.stringify(this, this.replacer));
  }

  public serialize(): SerializedGame {
    const result: SerializedGame = {
      exitedPlayers: Array.from(this.exitedPlayers).map((p) => p.serialize()),
      activePlayer: this.activePlayer.serialize(),
      awards: this.awards,
      board: this.board.serialize(),
      claimedMilestones: this.claimedMilestones,
      colonies: this.colonies,
      colonyDealer: this.colonyDealer,
      dealer: this.dealer.serialize(),
      deferredActions: [],
      donePlayers: Array.from(this.donePlayers).map((p) => p.serialize()),
      draftedPlayers: Array.from(this.draftedPlayers).map((p) => p.serialize()),
      draftRound: this.draftRound,
      first: this.first.serialize(),
      fundedAwards: this.fundedAwards,
      gameAge: this.gameAge,
      gameLog: this.gameLog,
      gameOptions: this.gameOptions,
      generation: this.generation,
      id: this.id,
      initialDraftIteration: this.initialDraftIteration,
      lastSaveId: this.lastSaveId,
      milestones: this.milestones,
      monsInsuranceOwner: this.monsInsuranceOwner?.serialize(),
      moonData: IMoonData.serialize(this.moonData),
      oxygenLevel: this.oxygenLevel,
      passedPlayers: Array.from(this.passedPlayers).map((p) => p.serialize()),
      phase: this.phase,
      players: this.players.map((p) => p.serialize()),
      researchedPlayers: Array.from(this.researchedPlayers).map((p) => p.serialize()),
      seed: this.seed,
      someoneHasRemovedOtherPlayersPlants: this.someoneHasRemovedOtherPlayersPlants,
      spectatorId: this.spectatorId,
      syndicatePirateRaider: this.syndicatePirateRaider,
      temperature: this.temperature,
      undoCount: this.undoCount,
      venusScaleLevel: this.venusScaleLevel,
      venusNextExtension: this.gameOptions.venusNextExtension,
      createtime: this.createtime,
      updatetime: this.updatetime,
      breakthrough: this.breakthrough,
      heatFor: this.heatFor,
      loadState: this.loadState,
      firstExited: this.firstExited,
      soloMode: this.soloMode,
      unDraftedCards: this.unDraftedCards,
    };
    if (this.aresData !== undefined) {
      result.aresData = this.aresData;
    }
    if (this.clonedGamedId !== undefined) {
      result.clonedGamedId = this.clonedGamedId;
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

  public getColoniesModel(colonies: Array<Colony>) : Array<ColonyModel> {
    return colonies.map(
      (colony): ColonyModel => ({
        colonies: colony.colonies.map(
          (player) => player.color,
        ),
        isActive: colony.isActive,
        name: colony.name,
        trackPosition: colony.trackPosition,
        visitor:
              colony.visitor === undefined ?
                undefined :
                colony.visitor.color,
      }),
    );
  }

  public milestoneClaimed(milestone: IMilestone): boolean {
    return this.claimedMilestones.find(
      (claimedMilestone) => claimedMilestone.milestone.name === milestone.name,
    ) !== undefined;
  }

  public noOceansAvailable(): boolean {
    return this.board.getOceansOnBoard() >= constants.MAX_OCEAN_TILES;
  }

  public marsIsTerraformed(): boolean {
    const oxygenMaxed = this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL;
    const temperatureMaxed = this.temperature >= constants.MAX_TEMPERATURE;
    const oceansMaxed = this.board.getOceansOnBoard() === constants.MAX_OCEAN_TILES;
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
    return this.fundedAwards.find(
      (fundedAward) => fundedAward.award.name === award.name,
    ) !== undefined;
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

  private playerHasPickedCorporationCard(player: Player, corporationCard: CorporationCard, corporationCard2: CorporationCard | undefined) {
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
                (foundCards: Array<CorporationCard>) => {
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
        for (const somePlayer of this.getPlayers()) {
          this.playCorporationCard(somePlayer, somePlayer.pickedCorporationCard!, false);
          this.playerIsFinishedWithResearchPhase(somePlayer);
        }
      }
    }
  }

  private playCorporationCard(player: Player, corporationCard: CorporationCard, corp2 : boolean): void {
    corp2 ? player.corpCard2 = corporationCard : player.corpCard = corporationCard;
    if (corporationCard.name === CardName.BEGINNER_CORPORATION) {
      player.megaCredits = corporationCard.startingMegaCredits;
    }
    corporationCard.play(player);
    this.log('${0} played ${1}', (b) => b.player(player).card(corporationCard));

    // trigger other corp's effect, e.g. SaturnSystems,PharmacyUnion,Splice
    for (const somePlayer of this.getPlayers()) {
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

    player.dealtCorporationCards = [];
    player.dealtPreludeCards = [];
    player.dealtProjectCards = [];
  }

  private pickCorporationCard(player: Player): PlayerInput {
    return new SelectInitialCards(player, this.gameOptions.doubleCorp, (corporationCard: CorporationCard, corporationCard2: CorporationCard | undefined) => {
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

  private runDraftRound(initialDraft: boolean = false, preludeDraft: boolean = false): void {
    this.draftedPlayers.clear();
    this.players.forEach((player) => {
      if (this.draftRound === 1 && !preludeDraft) {
        player.runDraftPhase(initialDraft, this.getNextDraft(player).name);
      } else if (this.draftRound === 1 && preludeDraft) {
        player.runDraftPhase(initialDraft, this.getNextDraft(player).name, player.dealtPreludeCards);
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

    if (this.starCoreGen > 0 && this.generation - this.starCoreGen ===2) {
      this.players.forEach((x) => {
        const starcore = x.playedCards.find((y) => y.name === CardName.STARCORE_PLUNDER);
        if (starcore !== undefined) {
          (starcore as StarcorePlunder).destory(x);
        }
      });
      this.starCoreGen = 0;
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

    if (this.gameOptions.turmoilExtension) {
      this.turmoil?.endGeneration(this);
    }

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

  public playerIsFinishedWithDraftingPhase(initialDraft: boolean, player: Player, cards : Array<IProjectCard>): void {
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
          player.dealtProjectCards = player.draftedCards;
          player.draftedCards = [];
        } else if (this.initialDraftIteration === 3) {
          player.dealtPreludeCards = player.draftedCards;
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
      this.runDraftRound(true, true);
    } else {
      this.phase = Phase.RESEARCH;
      this.save();
      this.gotoInitialResearchPhase();
    }
  }

  private getDraftCardsFrom(player: Player): Player {
    let nextPlayer: Player | undefined;

    // Change initial draft direction on second iteration
    if (this.generation === 1 && this.initialDraftIteration === 2) {
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
    // Deferred actions hook
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

    Database.getInstance().cleanSaves(this.id, this.lastSaveId);
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
    for (const player of this.getPlayers()) {
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
    };
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

  public increaseOxygenLevel(player: Player, increments: -1 | 1 | 2): undefined {
    if (this.oxygenLevel >= constants.MAX_OXYGEN_LEVEL) {
      return undefined;
    }

    // PoliticalAgendas Reds P3 hook
    if (increments === -1) {
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

  public increaseVenusScaleLevel(player: Player, increments: -1 | 1 | 2 | 3): SelectSpace | undefined {
    if (this.venusScaleLevel >= constants.MAX_VENUS_SCALE) {
      return undefined;
    }

    // PoliticalAgendas Reds P3 hook
    if (increments === -1) {
      this.venusScaleLevel = Math.max(constants.MIN_VENUS_SCALE, this.venusScaleLevel + increments * 2);
      return undefined;
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

    return undefined;
  }

  public getVenusScaleLevel(): number {
    return this.venusScaleLevel;
  }

  public increaseTemperature(player: Player, increments: -2 | -1 | 1 | 2 | 3): undefined {
    if (increments === -2 || increments === -1) {
      this.temperature = Math.max(constants.MIN_TEMPERATURE, this.temperature + increments * 2);
      return undefined;
    }

    if (this.temperature >= constants.MAX_TEMPERATURE) {
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
        player.addProduction(Resources.HEAT, 1);
      }
      if (this.temperature < -20 && this.temperature + steps * 2 >= -20) {
        player.addProduction(Resources.HEAT, 1);
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

  public getCitiesInPlayOnMars(): number {
    return this.board.spaces.filter(
      (space) => Board.isCitySpace(space) && space.spaceType !== SpaceType.COLONY).length;
  }
  public getCitiesInPlay(): number {
    return this.board.spaces.filter((space) => Board.isCitySpace(space)).length;
  }
  public getSpaceCount(tileType: TileType, player: Player): number {
    return this.board.spaces.filter(
      (space) => space.tile !== undefined &&
                  space.tile.tileType === tileType &&
                  space.player !== undefined &&
                  space.player === player,
    ).length;
  }

  // addTile applies to the Mars board, but not the Moon board, see MoonExpansion.addTile for placing
  // a tile on The Moon.
  public addTile(
    player: Player, spaceType: SpaceType,
    space: ISpace, tile: ITile): void {
    // Part 1, basic validation checks.

    if (space.tile !== undefined && !this.gameOptions.aresExtension) {
      throw new Error('Selected space is occupied');
    }

    // Land claim a player can claim land for themselves
    if (space.player !== undefined && space.player !== player) {
      throw new Error('This space is land claimed by ' + space.player.name);
    }

    if (space.spaceType !== spaceType) {
      throw new Error(
        `Select a valid location ${space.spaceType} is not ${spaceType}`,
      );
    }
    AresHandler.ifAres(this, () => {
      if (!AresHandler.canCover(space, tile)) {
        throw new Error('Selected space is occupied: ' + space.id);
      }
    });

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
        this.board.getOceansOnBoard() < constants.MAX_OCEAN_TILES &&
        this.gameOptions.boardName === BoardName.HELLAS) {
      if (player.color !== Color.NEUTRAL) {
        this.defer(new PlaceOceanTile(player, 'Select space for ocean from placement bonus'));
        this.defer(new SelectHowToPayDeferred(player, 6, {title: 'Select how to pay for placement bonus ocean'}));
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
        const bonuses = new Multiset(space.bonus);
        bonuses.entries().forEach(([bonus, count]) => {
          this.grantSpaceBonus(player, bonus, count);
        });
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
    space.player = tile.tileType !== TileType.OCEAN ? player : undefined;
    LogHelper.logTilePlacement(player, space, tile.tileType);
  }

  public grantSpaceBonus(player: Player, spaceBonus: SpaceBonus, count: number = 1) {
    if (spaceBonus === SpaceBonus.DRAW_CARD) {
      player.drawCard(count);
    } else if (spaceBonus === SpaceBonus.PLANT) {
      player.addResource(Resources.PLANTS, count, {log: true});
    } else if (spaceBonus === SpaceBonus.STEEL) {
      player.addResource(Resources.STEEL, count, {log: true});
    } else if (spaceBonus === SpaceBonus.TITANIUM) {
      player.addResource(Resources.TITANIUM, count, {log: true});
    } else if (spaceBonus === SpaceBonus.HEAT) {
      player.addResource(Resources.HEAT, count, {log: true});
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

  public addOceanTile(
    player: Player, spaceId: SpaceId,
    spaceType: SpaceType = SpaceType.OCEAN): void {
    if (this.board.getOceansOnBoard() === constants.MAX_OCEAN_TILES) {
      return;
    }
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
  public getPlayers(): Array<Player> {
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
    return this.getPlayers().concat(this.exitedPlayers);
  }

  public getCardPlayer(name: string): Player {
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
    throw new Error('No player has played requested card');
  }
  public getCard(name: string): IProjectCard | undefined {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].playedCards.length; j++) {
        if (this.players[i].playedCards[j].name === name) {
          return this.players[i].playedCards[j];
        }
      }
    }
    return undefined;
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

  public someoneHasResourceProduction(resource: Resources, minQuantity: number = 1): boolean {
    // in soloMode you don't have to decrease resources
    return this.getPlayers().some((p) => p.getProduction(resource) >= minQuantity) || this.isSoloMode();
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
        return adjacentSpaces.filter((sp) => sp.tile?.tileType === TileType.CITY).length === 0 && // no cities nearby
            adjacentSpaces.find((sp) => this.board.canPlaceTile(sp)) !== undefined; // can place forest nearby
      });
    if (space === undefined) {
      throw new Error('Couldn\'t find space when card cost is ' + cost);
    }
    return space;
  }

  // Custom replacer to transform Map and Set to Array
  public replacer(key: any, value: any) {
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
    } if ( key === '_game' && value !== undefined) {
      return {id: value.id};
    } else if (key === 'metadata') {
      // IProjecctCard
      return undefined;
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
    } else {
      this.board = OriginalBoard.deserialize(d.board, playersForBoard);
    }


    this.milestones = [];
    this.awards = [];

    d.milestones.forEach((element: IMilestone) => {
      ALL_MILESTONES.forEach((ms: IMilestone) => {
        if ( element.name === 'Tactitian') {
          element.name = 'Tactician';
        }
        if (ms.name === element.name) {
          this.milestones.push(ms);
        }
      });
    });

    d.awards.forEach((element: IAward) => {
      if ( element.name === 'DesertSettler') {
        element.name = 'Desert Settler';
      }
      if (element.name === 'EstateDealer') {
        element.name = 'Estate Dealer';
      }
      if (element.name === 'Entrepeneur') {
        element.name = 'Entrepreneur';
      }
      ALL_AWARDS.forEach((award: IAward) => {
        if (award.name === element.name) {
          this.awards.push(award);
        }
      });
    });

    if (this.gameOptions.aresExtension) {
      this.aresData = d.aresData;
    }
    // Reload colonies elements if needed
    if (this.gameOptions.coloniesExtension) {
      this.colonyDealer = new ColonyDealer();

      if (d.colonyDealer !== undefined) {
        this.colonyDealer.discardedColonies = loadColoniesFromJSON(d.colonyDealer.discardedColonies, this.getAllPlayers());
      }

      this.colonies = loadColoniesFromJSON(d.colonies, this.getAllPlayers());
    }

    // Reload turmoil elements if needed
    if (d.turmoil && this.gameOptions.turmoilExtension) {
      this.turmoil = Turmoil.deserialize(d.turmoil, this);
    }

    // Reload moon elements if needed
    if (d.moonData !== undefined && this.gameOptions.moonExpansion === true) {
      this.moonData = IMoonData.deserialize(d.moonData, this.getAllPlayers());
    }

    // Rebuild claimed milestones
    this.claimedMilestones = d.claimedMilestones.map((element: ClaimedMilestone) => {
      if (element.milestone.name === 'Tactitian') {
        element.milestone.name = 'Tactician';
      }
      let player = this.players.find((player) => player.id === element.player.id);
      if (player === undefined) {
        player = this.exitedPlayers.find((player) => player.id === element.player.id);
      }
      const milestone = this.milestones.find((milestone) => milestone.name === element.milestone.name);
      if (player && milestone) {
        return {
          player: player,
          milestone: milestone,
        };
      } else {
        throw 'Player or Milestone not found when rebuilding Claimed Milestone'+ element.milestone.name;
      }
    });

    // Rebuild funded awards
    this.fundedAwards = d.fundedAwards.map((element: FundedAward) => {
      if (element.award.name === 'DesertSettler') {
        element.award.name = 'Desert Settler';
      }
      if (element.award.name === 'EstateDealer') {
        element.award.name = 'Estate Dealer';
      }
      if (element.award.name === 'Entrepeneur') {
        element.award.name = 'Entrepreneur';
      }
      let player = this.players.find((player) => player.id === element.player.id);
      if (player === undefined) {
        player = this.exitedPlayers.find((player) => player.id === element.player.id);
      }
      const award = this.awards.find((award) => award.name === element.award.name);
      if (player && award) {
        return {
          player: player,
          award: award,
        };
      } else {
        throw 'Player or Award not found when rebuilding Claimed Award'+ element.award.name;
      }
    });

    // Rebuild passed players set
    this.passedPlayers = new Set<Player>();
    d.passedPlayers.forEach((element: SerializedPlayer) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.passedPlayers.add(player);
      }
    });

    // Rebuild done players set
    this.donePlayers = new Set<Player>();
    d.donePlayers.forEach((element: SerializedPlayer) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.donePlayers.add(player);
      }
    });

    // Rebuild researched players set
    this.researchedPlayers = new Set<Player>();
    d.researchedPlayers.forEach((element: SerializedPlayer) => {
      const player = this.players.find((player) => player.id === element.id);
      if (player) {
        this.researchedPlayers.add(player);
      }
    });

    // Rebuild drafted players set
    this.draftedPlayers = new Set<Player>();
    d.draftedPlayers.forEach((element: SerializedPlayer) => {
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
      throw 'No Player found when rebuilding First Player';
    }
    this.first = first;

    // Define who is the active player and init the take action phase
    let active = this.players.find((player) => player.id === d.activePlayer.id);
    if (active === undefined) {
      active = this.exitedPlayers.find((player) => player.id === d.activePlayer.id);
    }
    if (active === undefined) {
      throw 'No Player found when rebuilding Active Player';
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
    console.warn('Illegal state: ' + description, JSON.stringify(gameMetadata, this.replacer, ' '));
  }
}
