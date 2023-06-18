import {CardModel} from '../../common/models/CardModel';
import {ColonyModel} from '../../common/models/ColonyModel';
import {Color} from '../../common/Color';
import {Game} from '../Game';
import {GameOptions} from '../GameOptions';
import {SimpleGameModel} from '../../common/models/SimpleGameModel';
import {ICard} from '../cards/ICard';
import {isIProjectCard} from '../cards/IProjectCard';
import {isICloneTagCard} from '../cards/pathfinders/ICloneTagCard';
import {Board} from '../boards/Board';
import {ISpace} from '../boards/ISpace';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputModel} from '../../common/models/PlayerInputModel';
import {PlayerInputType} from '../../common/input/PlayerInputType';
import {PlayerBlockModel, PlayerViewModel, Protection, PublicPlayerModel} from '../../common/models/PlayerModel';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectCard} from '../inputs/SelectCard';
import {SelectPayment} from '../inputs/SelectPayment';
import {SelectProjectCardToPlay} from '../inputs/SelectProjectCardToPlay';
import {SelectPlayer} from '../inputs/SelectPlayer';
import {SelectSpace} from '../inputs/SelectSpace';
import {SpaceHighlight, SpaceModel} from '../../common/models/SpaceModel';
import {TileType} from '../../common/TileType';
import {Resource} from '../../common/Resource';
import {
  ClaimedMilestoneModel,
  MilestoneScore,
} from '../../common/models/ClaimedMilestoneModel';
import {FundedAwardModel, AwardScore} from '../../common/models/FundedAwardModel';
import {getTurmoilModel} from '../models/TurmoilModel';
import {SelectDelegate} from '../inputs/SelectDelegate';
import {SelectColony} from '../inputs/SelectColony';
import {SelectProductionToLose} from '../inputs/SelectProductionToLose';
import {ShiftAresGlobalParameters} from '../inputs/ShiftAresGlobalParameters';
import {GameLoader} from '../database/GameLoader';
import {SpectatorModel} from '../../common/models/SpectatorModel';
import {Units} from '../../common/Units';
import {OrOptions} from '../inputs/OrOptions';
import {SelectPartyToSendDelegate} from '../inputs/SelectPartyToSendDelegate';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';
import {GameModel} from '../../common/models/GameModel';
import {TurmoilUtil} from '../turmoil/TurmoilUtil';
import {createPathfindersModel} from './PathfindersModel';
import {MoonExpansion} from '../moon/MoonExpansion';
import {MoonModel} from '../../common/models/MoonModel';
import {CardName} from '../../common/cards/CardName';
import {Tag} from '../../common/cards/Tag';
import {SelectGlobalCard} from '../inputs/SelectGlobalCard';
import {isICorporationCard} from '../cards/corporation/ICorporationCard';
import {IColony} from '../colonies/IColony';
import {AresHandler} from '../ares/AresHandler';
import {StaticGlobalEventProperties} from '../turmoil/globalEvents/GlobalEvent';
import {AwardScorer} from '../awards/AwardScorer';
import {Phase} from '../../common/Phase';

export class Server {
  public static getSimpleGameModel(game: Game, userId : string = ''): SimpleGameModel {
    const user = GameLoader.getInstance().userIdMap.get(userId);
    return {
      activePlayer: game.activePlayer.color,
      id: game.id,
      phase: game.phase,
      players: game.getAllPlayers().map((player) => {
        return {
          id: player.id,
          name: player.name,
          color: player.exited? Color.GRAY : player.color,
        };
      }),
      spectatorId: game.spectatorId,
      createtime: game.createtime?.slice(5, 16),
      updatetime: game.updatetime?.slice(5, 16),
      gameAge: game.gameAge,
      saveId: game.lastSaveId,
      rollback: user && user.canRollback(),
      rollbackNum: user && user.getRollbackNum(),
      delete: user && user.canDelete(),
      gameOptions: game.gameOptions,
      lastSoloGeneration: game.lastSoloGeneration(),
      heatFor: game.gameOptions.heatFor,
      breakthrough: game.gameOptions.breakthrough,
      expectedPurgeTimeMs: game.expectedPurgeTimeMs(),
    };
  }

  public static getGameModel(game: Game): GameModel {
    const turmoil = getTurmoilModel(game);

    return {
      aresData: game.aresData,
      awards: this.getAwards(game),
      colonies: this.getColonies(game.colonies),
      deckSize: game.projectDeck.drawPile.length,
      discardedColonies: game.discardedColonies.map((c) => c.name),
      expectedPurgeTimeMs: game.expectedPurgeTimeMs(),
      gameAge: game.gameAge,
      gameOptions: this.getGameOptionsAsModel(game.gameOptions),
      generation: game.getGeneration(),
      isSoloModeWin: game.isSoloModeWin(),
      lastSoloGeneration: game.lastSoloGeneration(),
      milestones: this.getMilestones(game),
      moon: this.getMoonModel(game),
      oceans: game.board.getOceanCount(),
      oxygenLevel: game.getOxygenLevel(),
      passedPlayers: game.getPassedPlayers(),
      pathfinders: createPathfindersModel(game),
      phase: game.phase,
      spaces: this.getSpaces(game.board),
      spectatorId: game.spectatorId,
      temperature: game.getTemperature(),
      isTerraformed: game.marsIsTerraformed(),
      turmoil: turmoil,
      undoCount: game.undoCount,
      venusScaleLevel: game.getVenusScaleLevel(),
      step: game.lastSaveId,
      corporationsToDraft: this.getCards(game.getPlayers()[0], game._corporationsToDraft),
      quitPlayers: game.getQuitPlayers(),
    };
  }

  public static getPlayerModel(player: Player, playerBlockModel: PlayerBlockModel): PlayerViewModel {
    const game = player.game;
    const block = playerBlockModel.block;
    const isme = playerBlockModel.isme;
    const showhandcards = playerBlockModel.showhandcards;
    try {
      const user = GameLoader.getUserByPlayer(player);
      const userName = user ? user.name : '';
      const players: Array<PublicPlayerModel> = game.getAllPlayers().map(this.getPlayer);
      const thisPlayerIndex = players.findIndex((p) => p.color === player.color);
      const thisPlayer: PublicPlayerModel = players[thisPlayerIndex];

      return {
        cardsInHand: (block && !showhandcards ) ? []:this.getCards(player, player.cardsInHand, {showCalculatedCost: true}),
        ceoCardsInHand: this.getCards(player, player.ceoCardsInHand),
        dealtCorporationCards: block? []:this.getCards(player, player.dealtCorporationCards),
        dealtPreludeCards: block? []:this.getCards(player, player.dealtPreludeCards),
        dealtCeoCards: this.getCards(player, player.dealtCeoCards),
        dealtProjectCards: block? []:this.getCards(player, player.dealtProjectCards),
        draftedCards: block? []:this.getCards(player, player.draftedCards, {showCalculatedCost: true}),
        game: this.getGameModel(player.game),
        id: player.id,
        pickedCorporationCard: block? []:player.pickedCorporationCard ? this.getCards(player, [player.pickedCorporationCard]) : [],
        pickedCorporationCard2: block? []:player.pickedCorporationCard2 ? this.getCards(player, [player.pickedCorporationCard2]) : [],

        preludeCardsInHand: block? []:this.getCards(player, player.preludeCardsInHand),
        thisPlayer: thisPlayer,
        waitingFor: block? undefined: this.getWaitingFor(player, player.getWaitingFor()),
        players: players,

        // jaing
        undoing: player.undoing,
        gameId: game.id,
        block: block,
        canExit: player.canExitFun(game),
        userName: userName,
        exited: player.exited,
        isme: isme,
        isvip: GameLoader.getUserByPlayer(player)?.isvip() || 0,
      };
    } catch (err) {
      console.warn('error get player', err);
      return { } as PlayerViewModel;
    }
  }

  // NOT
  public static getSpectatorModel(game: Game): SpectatorModel {
    return {
      color: Color.NEUTRAL,
      id: game.spectatorId,
      game: this.getGameModel(game),
      players: game.getPlayersInGenerationOrder().map(this.getPlayer),
      thisPlayer: undefined,
    };
  }

  public static getPlayerBlock(player: Player, userId:string|null) :PlayerBlockModel {
    let block = false;
    let isme = false;
    let showhandcards = false;
    const user = GameLoader.getUserByPlayer(player);
    if (user !== undefined ) {
      showhandcards = user.showhandcards;
      if (user.id !== userId) {
        block = true;
      } else {
        isme = true;
      }
    }
    return {
      block: block,
      isme: isme,
      showhandcards: showhandcards,
    } as PlayerBlockModel;
  }

  public static getSelfReplicatingRobotsTargetCards(player: Player): Array<CardModel> {
    return player.getSelfReplicatingRobotsTargetCards().map((targetCard) => {
      const model: CardModel = {
        resources: targetCard.resourceCount,
        name: targetCard.card.name,
        calculatedCost: player.getCardCost(targetCard.card),
        isDisabled: false,
        reserveUnits: Units.EMPTY, // I wonder if this could just be removed.
        isSelfReplicatingRobotsCard: true,
      };
      return model;
    });
  }

  public static getMilestones(game: Game): Array<ClaimedMilestoneModel> {
    const allMilestones = game.milestones;
    const claimedMilestones = game.claimedMilestones;
    const milestoneModels: Array<ClaimedMilestoneModel> = [];

    for (const milestone of allMilestones) {
      const claimed = claimedMilestones.find(
        (m) => m.milestone.name === milestone.name,
      );
      let scores: Array<MilestoneScore> = [];
      if (claimed === undefined && claimedMilestones.length < 3) {
        scores = game.getPlayers().map((player) => ({
          playerColor: player.color,
          playerScore: milestone.getScore(player),
        }));
      }

      milestoneModels.push({
        playerName: claimed === undefined ? '' : claimed.player.name,
        playerColor: claimed === undefined ? '' : claimed.player.color,
        name: milestone.name,
        scores,
      });
    }

    return milestoneModels;
  }

  public static getAwards(game: Game): Array<FundedAwardModel> {
    const fundedAwards = game.fundedAwards;
    const awardModels: Array<FundedAwardModel> = [];

    for (const award of game.awards) {
      const funded = fundedAwards.find((a) => a.award.name === award.name);
      const scorer = new AwardScorer(game, award);
      let scores: Array<AwardScore> = [];
      if (fundedAwards.length < 3 || funded !== undefined) {
        scores = game.getPlayers().map((player) => ({
          playerColor: player.color,
          playerScore: scorer.get(player),
        }));
      }

      awardModels.push({
        playerName: funded === undefined ? '' : funded.player.name,
        playerColor: funded === undefined ? '' : funded.player.color,
        name: award.name,
        scores: scores,
      });
    }

    return awardModels;
  }

  public static getCorporationCard(player: Player, corp2 : boolean = false): CardModel | undefined {
    const card = corp2? player.corporations[1] : player.corporations[0];
    if (card === undefined) return undefined;

    let discount = card.cardDiscount === undefined ? undefined : (Array.isArray(card.cardDiscount) ? card.cardDiscount : [card.cardDiscount]);

    // Too bad this is hard-coded
    if (card.name === CardName.CRESCENT_RESEARCH_ASSOCIATION) {
      discount = [{tag: Tag.MOON, amount: player.tags.count(Tag.MOON)}];
    }
    if (card.name === CardName.MARS_DIRECT) {
      discount = [{tag: Tag.MARS, amount: player.tags.count(Tag.MARS)}];
    }

    return {
      name: card.name,
      resources: card.resourceCount,
      isDisabled: card.isDisabled || false,
      warning: card.warning,
      discount: discount,
      reserveUnits: Units.EMPTY,
      cloneTag: isICloneTagCard(card) ? card.cloneTag : undefined,
    };
  }

  public static getWaitingFor(
    player: Player,
    waitingFor: PlayerInput | undefined,
  ): PlayerInputModel | undefined {
    if (waitingFor === undefined) {
      return undefined;
    }
    const playerInputModel: PlayerInputModel = {
      id: undefined,
      title: waitingFor.title,
      buttonLabel: waitingFor.buttonLabel,
      inputType: waitingFor.inputType,
      amount: undefined,
      options: undefined,
      cards: undefined,
      max: undefined,
      min: undefined,
      canUseSteel: undefined,
      canUseTitanium: undefined,
      canUseLunaTradeFederationTitanium: undefined,
      canUseHeat: undefined,
      canUseSeeds: undefined,
      canUseData: undefined,
      players: undefined,
      availableSpaces: undefined,
      maxByDefault: undefined,
      microbes: undefined,
      floaters: undefined,
      science: undefined,
      seeds: undefined,
      data: undefined,
      coloniesModel: undefined,
      payProduction: undefined,
      aresData: undefined,
      selectBlueCardAction: false,
      availableParties: undefined,
      turmoil: undefined,
      globalEventCards: undefined,
      showReset: player.game.inputsThisRound > 0 && player.game.resettable === true && player.game.phase === Phase.ACTION,
    };
    if (waitingFor instanceof OrOptions) {
      playerInputModel.id = (waitingFor as OrOptions).id;
    }
    switch (waitingFor.inputType) {
    case PlayerInputType.AND_OPTIONS:
    case PlayerInputType.OR_OPTIONS:
    case PlayerInputType.SELECT_INITIAL_CARDS:
      playerInputModel.options = [];
      if (waitingFor.options !== undefined) {
        for (const option of waitingFor.options) {
          const subOption = this.getWaitingFor(player, option);
          if (subOption !== undefined) {
            playerInputModel.options.push(subOption);
          }
        }
      } else {
        throw new Error('required options not defined');
      }
      break;
    case PlayerInputType.SELECT_PROJECT_CARD_TO_PLAY:
      const spctp: SelectProjectCardToPlay = waitingFor as SelectProjectCardToPlay;
      playerInputModel.cards = this.getCards(player, spctp.cards, {showCalculatedCost: true, reserveUnits: spctp.reserveUnits});
      playerInputModel.microbes = player.getSpendableMicrobes();
      playerInputModel.floaters = player.getSpendableFloaters();
      playerInputModel.canUseHeat = player.canUseHeatAsMegaCredits;
      playerInputModel.canUseLunaTradeFederationTitanium = player.canUseTitaniumAsMegacredits;
      playerInputModel.science = player.getSpendableScienceResources();
      playerInputModel.seeds = player.getSpendableSeedResources();
      break;
    case PlayerInputType.SELECT_CARD:
      const selectCard = waitingFor as SelectCard<ICard>;
      playerInputModel.cards = this.getCards(player, selectCard.cards, {
        showCalculatedCost: selectCard.config.played === false || selectCard.config.played === CardName.SELF_REPLICATING_ROBOTS,
        showResources: selectCard.config.played === true || selectCard.config.played === CardName.SELF_REPLICATING_ROBOTS,
        enabled: selectCard.config.enabled,
      });
      playerInputModel.max = selectCard.config.max;
      playerInputModel.min = selectCard.config.min;
      playerInputModel.showOnlyInLearnerMode = selectCard.config.enabled?.every((p: boolean) => p === false);
      playerInputModel.selectBlueCardAction = selectCard.config.selectBlueCardAction;
      playerInputModel.showOwner = selectCard.config.showOwner === true;
      break;

    case PlayerInputType.SELECT_GLOBAL_CARD:
      const selectEventCard = waitingFor as SelectGlobalCard<IGlobalEvent>;

      playerInputModel.globalEventCards = selectEventCard.cards.map((x) => {
        return {name: x.name} as StaticGlobalEventProperties;
      });
      playerInputModel.max = selectEventCard.maxCardsToSelect;
      playerInputModel.min = selectEventCard.minCardsToSelect;
      break;
    case PlayerInputType.SELECT_COLONY:
      const selectColony = waitingFor as SelectColony;
      playerInputModel.coloniesModel = this.getColonyModel( selectColony.colonies, selectColony.showTileOnly);
      break;
    case PlayerInputType.SELECT_PAYMENT:
      const sp = waitingFor as SelectPayment;
      playerInputModel.amount = sp.amount;
      playerInputModel.canUseSteel = sp.canUseSteel;
      playerInputModel.canUseTitanium = sp.canUseTitanium;
      playerInputModel.canUseHeat = sp.canUseHeat;
      playerInputModel.canUseLunaTradeFederationTitanium = sp.canUseLunaTradeFederationTitanium;
      playerInputModel.canUseSeeds = sp.canUseSeeds;
      playerInputModel.seeds = player.getSpendableSeedResources();
      playerInputModel.canUseData = sp.canUseData;
      playerInputModel.data = player.getSpendableData();
      break;
    case PlayerInputType.SELECT_PLAYER:
      playerInputModel.players = (waitingFor as SelectPlayer).players.map(
        (player) => player.id,
      );
      break;
    case PlayerInputType.SELECT_SPACE:
      playerInputModel.availableSpaces = (waitingFor as SelectSpace).availableSpaces.map(
        (space) => space.id,
      );
      break;
    case PlayerInputType.SELECT_AMOUNT:
      playerInputModel.min = (waitingFor as SelectAmount).min;
      playerInputModel.max = (waitingFor as SelectAmount).max;
      playerInputModel.maxByDefault = (waitingFor as SelectAmount).maxByDefault;
      break;
    case PlayerInputType.SELECT_DELEGATE:
      playerInputModel.players = (waitingFor as SelectDelegate).players.map(
        (player) => {
          if (player === 'NEUTRAL') {
            return 'NEUTRAL';
          } else {
            return player.color;
          }
        },
      );
      break;
    case PlayerInputType.SELECT_PARTY_TO_SEND_DELEGATE:
      playerInputModel.availableParties = (waitingFor as SelectPartyToSendDelegate).availableParties;
      if (player.game !== undefined) {
        playerInputModel.turmoil = getTurmoilModel(player.game);
      }
      break;
    case PlayerInputType.SELECT_PRODUCTION_TO_LOSE:
      const _player = (waitingFor as SelectProductionToLose).player;
      playerInputModel.payProduction = {
        cost: (waitingFor as SelectProductionToLose).unitsToLose,
        units: {
          megacredits: _player.production.megacredits,
          steel: _player.production.steel,
          titanium: _player.production.titanium,
          plants: _player.production.plants,
          energy: _player.production.energy,
          heat: _player.production.heat,
        },
      };
      break;
    case PlayerInputType.SHIFT_ARES_GLOBAL_PARAMETERS:
      AresHandler.ifAres((waitingFor as ShiftAresGlobalParameters).player.game, (aresData) => {
        playerInputModel.aresData = aresData;
      });
      break;
    }
    return playerInputModel;
  }

  public static getCards(
    player: Player,
    cards: Array<ICard>,
    options: {
      showResources?: boolean,
      showCalculatedCost?: boolean,
      reserveUnits?: Array<Units>,
      enabled?: Array<boolean>, // If provided, then the cards with false in `enabled` are not selectable and grayed out
    } = {},
  ): Array<CardModel> {
    return cards.map((card, index) => {
      let discount = card.cardDiscount === undefined ? undefined : (Array.isArray(card.cardDiscount) ? card.cardDiscount : [card.cardDiscount]);

      // Too bad this is hard-coded
      if (card.name === CardName.CRESCENT_RESEARCH_ASSOCIATION) {
        discount = [{tag: Tag.MOON, amount: player.tags.count(Tag.MOON)}];
      }
      if (card.name === CardName.MARS_DIRECT) {
        discount = [{tag: Tag.MARS, amount: player.tags.count(Tag.MARS)}];
      }

      const isDisabled = isICorporationCard(card) ? (card.isDisabled || false) : (options.enabled?.[index] === false);

      const model: CardModel = {
        resources: options.showResources ? card.resourceCount : undefined,
        name: card.name,
        calculatedCost: options.showCalculatedCost ? (isIProjectCard(card) && card.cost !== undefined ? player.getCardCost(card) : undefined) : card.cost,
        isDisabled: isDisabled,
        warning: card.warning,
        reserveUnits: options.reserveUnits ? options.reserveUnits[index] : Units.EMPTY,
        bonusResource: isIProjectCard(card) ? card.bonusResource : undefined,
        discount: discount,
        cloneTag: isICloneTagCard(card) ? card.cloneTag : undefined,
      };
      return model;
    });
  }

  public static getPlayer(player: Player): PublicPlayerModel {
    const game = player.game;
    return {
      actionsTakenThisRound: player.actionsTakenThisRound,
      actionsTakenThisGame: player.actionsTakenThisGame,
      actionsThisGeneration: Array.from(player.getActionsThisGeneration()),
      availableBlueCardActionCount: player.getAvailableBlueActionCount(),
      cardCost: player.cardCost,
      cardDiscount: player.colonies.cardDiscount,
      cardsInHandNbr: player.cardsInHand.length,
      citiesCount: player.game.getCitiesCount(player),
      coloniesCount: player.getColoniesCount(),
      color: player.color,
      corporationCard: Server.getCorporationCard(player),
      corporationCard2: Server.getCorporationCard(player, true),
      energy: player.energy,
      energyProduction: player.production.energy,
      fleetSize: player.colonies.getFleetSize(),
      heat: player.heat,
      heatProduction: player.production.heat,
      id: player.id,
      influence: TurmoilUtil.ifTurmoilElse(game, (turmoil) => turmoil.getPlayerInfluence(player), () => 0),
      isActive: player.id === game.activePlayer.id,
      lastCardPlayed: player.lastCardPlayed,
      megaCredits: player.megaCredits,
      megaCreditProduction: player.production.megacredits,
      name: player.name,
      noTagsCount: player.getNoTagsCount(),
      plants: player.plants,
      plantProduction: player.production.plants,
      protectedResources: Server.getResourceProtections(player),
      protectedProduction: Server.getProductionProtections(player),
      tableau: Server.getCards(player, player.tableau, {showResources: true}),
      selfReplicatingRobotsCards: Server.getSelfReplicatingRobotsTargetCards(player),
      steel: player.steel,
      steelProduction: player.production.steel,
      steelValue: player.getSteelValue(),
      tags: player.tags.getAllTags(),
      terraformRating: player.getTerraformRating(),
      timer: player.timer.serialize(),
      titanium: player.titanium,
      titaniumProduction: player.production.titanium,
      titaniumValue: player.getTitaniumValue(),
      tradesThisGeneration: player.colonies.tradesThisGeneration,
      victoryPointsBreakdown: player.getVictoryPoints(),
      victoryPointsByGeneration: player.victoryPointsByGeneration,
      waitingFor: player.getWaitingFor() === undefined? undefined : {},

      // undoing: false,
      // gameId: '',
      // block: false,
      // canExit: false,
      // userName: '',
      // isme: false,
      // showhandcards: false,

      exited: player.exited,
      isvip: GameLoader.getUserByPlayer(player)?.isvip() || 0,
      rankValue: GameLoader.getUserRankByPlayer(player)?.getRankValue() || -1, // 天梯 这个是传入playerInfo的数据
      rankTier: GameLoader.getUserRankByPlayer(player)?.getTier() || undefined,
    } as any as PublicPlayerModel;
  }

  private static getResourceProtections(player: Player) {
    const protection: Record<Resource, Protection> = {
      megacredits: 'off',
      steel: 'off',
      titanium: 'off',
      plants: 'off',
      energy: 'off',
      heat: 'off',
    };

    if (player.alloysAreProtected()) {
      protection.steel = 'on';
      protection.titanium = 'on';
    }

    if (player.plantsAreProtected()) {
      protection.plants = 'on';
    } else if (player.cardIsInEffect(CardName.BOTANICAL_EXPERIENCE)) {
      protection.plants = 'half';
    }

    return protection;
  }

  private static getProductionProtections(player: Player) {
    const defaultProteection = player.cardIsInEffect(CardName.PRIVATE_SECURITY) ? 'on' : 'off';
    const protection: Record<Resource, Protection> = {
      megacredits: defaultProteection,
      steel: defaultProteection,
      titanium: defaultProteection,
      plants: defaultProteection,
      energy: defaultProteection,
      heat: defaultProteection,
    };

    if (player.alloysAreProtected()) {
      protection.steel = 'on';
      protection.titanium = 'on';
    }

    return protection;
  }

  public static getColonies(colonies: Array<IColony>, isActive: boolean = true): Array<ColonyModel> {
    return colonies.map(
      (colony): ColonyModel => ({
        colonies: colony.colonies.map(
          (player): Color => player.color,
        ),
        isActive: isActive && colony.isActive,
        name: colony.name,
        trackPosition: colony.trackPosition,
        visitor:
          colony.visitor === undefined ?
            undefined :
            colony.visitor.color,
      }),
    );
  }

  // Oceans can't be owned so they shouldn't have a color associated with them
  // Land claim can have a color on a space without a tile
  private static getColor(space: ISpace): Color | undefined {
    if (
      (space.tile === undefined || space.tile.tileType !== TileType.OCEAN) &&
    space.player !== undefined
    ) {
      return space.player.color;
    }
    if (space.tile?.protectedHazard === true) {
      return Color.BRONZE;
    }
    return undefined;
  }

  private static getSpaces(board: Board): Array<SpaceModel> {
    const volcanicSpaceIds = board.getVolcanicSpaceIds();
    const noctisCitySpaceIds = board.getNoctisCitySpaceId();

    return board.spaces.map((space) => {
      let highlight: SpaceHighlight = undefined;
      if (volcanicSpaceIds.includes(space.id)) {
        highlight = 'volcanic';
      } else if (noctisCitySpaceIds === space.id) {
        highlight = 'noctis';
      }
      return {
        x: space.x,
        y: space.y,
        id: space.id,
        bonus: space.bonus,
        spaceType: space.spaceType,
        tileType: space.tile && space.tile.tileType,
        color: this.getColor(space),
        highlight: highlight,
      };
    });
  }

  public static getGameOptionsAsModel(options: GameOptions): GameOptions {
    return options;
  // return {
  //   altVenusBoard: options.altVenusBoard,
  //   aresExtension: options.aresExtension,
  //   boardName: options.boardName,
  //    bannedCards: options.bannedCards,
    //     ceoExtension: options.ceoExtension,
  //   coloniesExtension: options.coloniesExtension,
  //   communityCardsOption: options.communityCardsOption,
  //   corporateEra: options.corporateEra,
  //   draftVariant: options.draftVariant,
  //   _corporationsDraft: options._corporationsDraft,
  //   escapeVelocityMode: options.escapeVelocityMode,
  //   escapeVelocityThreshold: options.escapeVelocityThreshold,
  //   escapeVelocityPeriod: options.escapeVelocityPeriod,
  //   escapeVelocityPenalty: options.escapeVelocityPenalty,
  //   fastModeOption: options.fastModeOption,
  //   includeVenusMA: options.includeVenusMA,
  //   initialDraftVariant: options.initialDraftVariant,
  //   moonExpansion: options.moonExpansion,
  //   pathfindersExpansion: options.pathfindersExpansion,
  //   preludeExtension: options.preludeExtension,
  //   promoCardsOption: options.promoCardsOption,
  //   politicalAgendasExtension: options.politicalAgendasExtension,
  //   removeNegativeGlobalEventsOption: options.removeNegativeGlobalEventsOption,
  //   showOtherPlayersVP: options.showOtherPlayersVP,
  //   showTimers: options.showTimers,
  //   shuffleMapOption: options.shuffleMapOption,
  //   solarPhaseOption: options.solarPhaseOption,
  //   soloTR: options.soloTR,
  //   randomMA: options.randomMA,
  //   turmoilExtension: options.turmoilExtension,
  //   venusNextExtension: options.venusNextExtension,
  //   requiresMoonTrackCompletion: options.requiresMoonTrackCompletion,
  //   requiresVenusTrackCompletion: options.requiresVenusTrackCompletion,
  //    twoCorpsVariant: options.twoCorpsVariant,
  //   undoOption: options.undoOption,
  // };
  }

  private static getColonyModel(colonies: Array<IColony>, showTileOnly: boolean) : Array<ColonyModel> {
    return colonies.map(
      (colony): ColonyModel => ({
        colonies: colony.colonies.map(
          (player) => player.color,
        ),
        isActive: colony.isActive && showTileOnly === false,
        name: colony.name,
        trackPosition: colony.trackPosition,
        visitor:
          colony.visitor === undefined ?
            undefined :
            colony.visitor.color,
      }),
    );
  }

  private static getMoonModel(game: Game): MoonModel | undefined {
    return MoonExpansion.ifElseMoon(game, (moonData) => {
      return {
        logisticsRate: moonData.logisticRate,
        miningRate: moonData.miningRate,
        colonyRate: moonData.colonyRate,
        spaces: this.getSpaces(moonData.moon),
      };
    }, () => undefined);
  }
}
