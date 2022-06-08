import {CardModel} from '../common/models/CardModel';
import {ColonyModel} from '../common/models/ColonyModel';
import {Color} from '../common/Color';
import {Game, GameOptions} from '../Game';
import {SimpleGameModel} from '../common/models/SimpleGameModel';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {isICloneTagCard} from '../cards/pathfinders/ICloneTagCard';
import {Board} from '../boards/Board';
import {ISpace} from '../boards/ISpace';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputModel} from '../common/models/PlayerInputModel';
import {PlayerInputTypes} from '../common/input/PlayerInputTypes';
import {PlayerViewModel, PublicPlayerModel, PlayerBlockModel} from '../common/models/PlayerModel';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectCard} from '../inputs/SelectCard';
import {SelectHowToPay} from '../inputs/SelectHowToPay';
import {SelectHowToPayForProjectCard} from '../inputs/SelectHowToPayForProjectCard';
import {SelectPlayer} from '../inputs/SelectPlayer';
import {SelectSpace} from '../inputs/SelectSpace';
import {SpaceHighlight, SpaceModel} from '../common/models/SpaceModel';
import {TileType} from '../common/TileType';
import {Resources} from '../common/Resources';
import {CardType} from '../common/cards/CardType';
import {
  ClaimedMilestoneModel,
  IMilestoneScore,
} from '../common/models/ClaimedMilestoneModel';
import {FundedAwardModel, IAwardScore} from '../common/models/FundedAwardModel';
import {getTurmoilModel} from '../models/TurmoilModel';
import {SelectDelegate} from '../inputs/SelectDelegate';
import {SelectColony} from '../inputs/SelectColony';
import {SelectProductionToLose} from '../inputs/SelectProductionToLose';
import {ShiftAresGlobalParameters} from '../inputs/ShiftAresGlobalParameters';
import {GameLoader} from '../database/GameLoader';
import {SpectatorModel} from '../common/models/SpectatorModel';
import {Units} from '../common/Units';
import {OrOptions} from '../inputs/OrOptions';
import {SelectPartyToSendDelegate} from '../inputs/SelectPartyToSendDelegate';
import {IGlobalEvent, StaticGlobalEventProperties} from '../turmoil/globalEvents/IGlobalEvent';
import {GameModel} from '../common/models/GameModel';
import {TurmoilUtil} from '../turmoil/TurmoilUtil';
import {createPathfindersModel} from './PathfindersModel';
import {MoonExpansion} from '../moon/MoonExpansion';
import {MoonModel} from '../common/models/MoonModel';
import { IColony } from '@/colonies/IColony';

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
      gameOptions: this.getGameOptionsAsModel(game.gameOptions),
      lastSoloGeneration: game.lastSoloGeneration(),
      heatFor: game.heatFor,
      breakthrough: game.breakthrough,
    };
  }

  public static getGameModel(game: Game): GameModel {
    const turmoil = getTurmoilModel(game);

    return {
      aresData: game.aresData,
      awards: this.getAwards(game),
      colonies: this.getColonies(game.colonies),
      deckSize: game.dealer.deck.length,
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
      const thisPlayerIndex: number = players.findIndex((p) => p.color === player.color);
      const thisPlayer: PublicPlayerModel = players[thisPlayerIndex];

      return {
        cardsInHand: (block && !showhandcards ) ? []:this.getCards(player, player.cardsInHand, {showNewCost: true}),
        dealtCorporationCards: block? []:this.getCards(player, player.dealtCorporationCards),
        dealtPreludeCards: block? []:this.getCards(player, player.dealtPreludeCards),
        dealtProjectCards: block? []:this.getCards(player, player.dealtProjectCards),
        draftedCards: block? []:this.getCards(player, player.draftedCards, {showNewCost: true}),
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
        showhandcards: showhandcards,
        isvip: GameLoader.getUserByPlayer(player)?.isvip() || 0,
      };
    } catch (err) {
      console.warn('error get player', err);
      return { } as PlayerViewModel;
    }
  }

  public static getSpectatorModel(game: Game): SpectatorModel {
    return {
      color: Color.NEUTRAL,
      id: game.spectatorId ?? '',
      game: this.getGameModel(game),
      players: game.getPlayersInGenerationOrder().map(this.getPlayer),
      thisPlayer: undefined,
    };
  }

  public static getPlayerBlock(player: Player, userId:string) :PlayerBlockModel {
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
    return player.getSelfReplicatingRobotsTargetCards().map((targetCard) => ({
      resources: targetCard.resourceCount,
      resourceType: undefined, // Card on SRR cannot gather its own resources (if any)
      name: targetCard.card.name,
      calculatedCost: player.getCardCost(targetCard.card),
      cardType: CardType.ACTIVE,
      isDisabled: false,
      reserveUnits: Units.EMPTY, // I wonder if this could just be removed.
    }));
  }

  public static getMilestones(game: Game): Array<ClaimedMilestoneModel> {
    const allMilestones = game.milestones;
    const claimedMilestones = game.claimedMilestones;
    const milestoneModels: Array<ClaimedMilestoneModel> = [];

    for (const milestone of allMilestones) {
      const claimed = claimedMilestones.find(
        (m) => m.milestone.name === milestone.name,
      );
      let scores: Array<IMilestoneScore> = [];
      if (claimed === undefined && claimedMilestones.length < 3) {
        scores = game.getPlayers().map((player) => ({
          playerColor: player.color,
          playerScore: milestone.getScore(player),
        }));
      }

      milestoneModels.push({
        player_name: claimed === undefined ? '' : claimed.player.name,
        player_color: claimed === undefined ? '' : claimed.player.color,
        name: milestone.name,
        description: milestone.description,
        scores,
      });
    }

    return milestoneModels;
  }

  public static getAwards(game: Game): Array<FundedAwardModel> {
    const allAwards = game.awards;
    const fundedAwards = game.fundedAwards;
    const awardModels: Array<FundedAwardModel> = [];

    for (const award of allAwards) {
      const funded = fundedAwards.find(
        (a) => a.award.name === award.name,
      );
      let scores: Array<IAwardScore> = [];
      if (fundedAwards.length < 3 || funded !== undefined) {
        scores = game.getPlayers().map((player) => ({
          playerColor: player.color,
          playerScore: award.getScore(player),
        }));
      }

      awardModels.push({
        player_name: funded === undefined ? '' : funded.player.name,
        player_color: funded === undefined ? '' : funded.player.color,
        name: award.name,
        description: award.description,
        scores: scores,
      });
    }

    return awardModels;
  }

  public static getCorporationCard(player: Player, corp2 : boolean = false): CardModel | undefined {
    const corp = corp2? player.corpCard2 : player.corpCard;
    if (corp === undefined) return undefined;
    return {
      name: corp.name,
      resources: corp.resourceCount,
      cardType: CardType.CORPORATION,
      isDisabled: corp.isDisabled,
      warning: corp.warning,
      discount: corp.cardDiscount === undefined ? undefined : (Array.isArray(corp.cardDiscount) ? corp.cardDiscount : [corp.cardDiscount]),
    } as CardModel;
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
      maxCardsToSelect: undefined,
      minCardsToSelect: undefined,
      canUseSteel: undefined,
      canUseTitanium: undefined,
      canUseHeat: undefined,
      canUseSeeds: undefined,
      players: undefined,
      availableSpaces: undefined,
      min: undefined,
      max: undefined,
      maxByDefault: undefined,
      microbes: undefined,
      floaters: undefined,
      science: undefined,
      seeds: undefined,
      coloniesModel: undefined,
      payProduction: undefined,
      aresData: undefined,
      selectBlueCardAction: false,
      availableParties: undefined,
      turmoil: undefined,
      globalEventCards: undefined,
    };
    if (waitingFor instanceof OrOptions) {
      playerInputModel.id = (waitingFor as OrOptions).id;
    }
    switch (waitingFor.inputType) {
    case PlayerInputTypes.AND_OPTIONS:
    case PlayerInputTypes.OR_OPTIONS:
    case PlayerInputTypes.SELECT_INITIAL_CARDS:
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
    case PlayerInputTypes.SELECT_HOW_TO_PAY_FOR_PROJECT_CARD:
      const shtpfpc: SelectHowToPayForProjectCard = waitingFor as SelectHowToPayForProjectCard;
      playerInputModel.cards = this.getCards(player, shtpfpc.cards, {showNewCost: true, reserveUnits: shtpfpc.reserveUnits});
      playerInputModel.microbes = shtpfpc.microbes;
      playerInputModel.floaters = shtpfpc.floaters;
      playerInputModel.canUseHeat = shtpfpc.canUseHeat;
      playerInputModel.science = shtpfpc.scienceResources;
      playerInputModel.seeds = shtpfpc.seedResources;
      break;
    case PlayerInputTypes.SELECT_CARD:
      const selectCard = waitingFor as SelectCard<ICard>;
      playerInputModel.cards = this.getCards(player, selectCard.cards, {
        showNewCost: !selectCard.played,
        showResources: selectCard.played,
        enabled: selectCard.enabled,
      });
      playerInputModel.maxCardsToSelect = selectCard.maxCardsToSelect;
      playerInputModel.minCardsToSelect = selectCard.minCardsToSelect;
      playerInputModel.showOnlyInLearnerMode = selectCard.enabled?.every((p: boolean) => p === false);
      playerInputModel.selectBlueCardAction = selectCard.selectBlueCardAction;
      if (selectCard.showOwner) {
        playerInputModel.showOwner = true;
      }
      break;

    case PlayerInputTypes.SELECT_GLOBAL_CARD:
      const selectEventCard = waitingFor as SelectCard<IGlobalEvent>;

      playerInputModel.globalEventCards = selectEventCard.cards.map((x) => {
        return {name: x.name} as StaticGlobalEventProperties;
      });
      playerInputModel.maxCardsToSelect = selectEventCard.maxCardsToSelect;
      playerInputModel.minCardsToSelect = selectEventCard.minCardsToSelect;
      break;
    case PlayerInputTypes.SELECT_COLONY:
      playerInputModel.coloniesModel = this.getColonyModel( (waitingFor as SelectColony).colonies);
      break;
    case PlayerInputTypes.SELECT_HOW_TO_PAY:
      playerInputModel.amount = (waitingFor as SelectHowToPay).amount;
      playerInputModel.canUseSteel = (waitingFor as SelectHowToPay).canUseSteel;
      playerInputModel.canUseTitanium = (waitingFor as SelectHowToPay).canUseTitanium;
      playerInputModel.canUseHeat = (waitingFor as SelectHowToPay).canUseHeat;
      playerInputModel.canUseSeeds = (waitingFor as SelectHowToPay).canUseSeeds;
      playerInputModel.seeds = player.getSpendableSeedResources();
      break;
    case PlayerInputTypes.SELECT_PLAYER:
      playerInputModel.players = (waitingFor as SelectPlayer).players.map(
        (player) => player.id,
      );
      break;
    case PlayerInputTypes.SELECT_SPACE:
      playerInputModel.availableSpaces = (waitingFor as SelectSpace).availableSpaces.map(
        (space) => space.id,
      );
      break;
    case PlayerInputTypes.SELECT_AMOUNT:
      playerInputModel.min = (waitingFor as SelectAmount).min;
      playerInputModel.max = (waitingFor as SelectAmount).max;
      playerInputModel.maxByDefault = (waitingFor as SelectAmount).maxByDefault;
      break;
    case PlayerInputTypes.SELECT_DELEGATE:
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
    case PlayerInputTypes.SELECT_PARTY_TO_SEND_DELEGATE:
      playerInputModel.availableParties = (waitingFor as SelectPartyToSendDelegate).availableParties;
      if (player.game !== undefined) {
        playerInputModel.turmoil = getTurmoilModel(player.game);
      }
      break;
    case PlayerInputTypes.SELECT_PRODUCTION_TO_LOSE:
      const _player = (waitingFor as SelectProductionToLose).player;
      playerInputModel.payProduction = {
        cost: (waitingFor as SelectProductionToLose).unitsToLose,
        units: {
          megacredits: _player.getProduction(Resources.MEGACREDITS),
          steel: _player.getProduction(Resources.STEEL),
          titanium: _player.getProduction(Resources.TITANIUM),
          plants: _player.getProduction(Resources.PLANTS),
          energy: _player.getProduction(Resources.ENERGY),
          heat: _player.getProduction(Resources.HEAT),
        },
      };
      break;
    case PlayerInputTypes.SHIFT_ARES_GLOBAL_PARAMETERS:
      playerInputModel.aresData = (waitingFor as ShiftAresGlobalParameters).aresData;
      break;
    }
    return playerInputModel;
  }

  public static getCards(
    player: Player,
    cards: Array<ICard>,
    options: {
    showResources?: boolean,
    showNewCost?: boolean,
    reserveUnits?: Array<Units>,
    enabled?: Array<boolean>, // If provided, then the cards with false in `enabled` are not selectable and grayed out
  } = {},
  ): Array<CardModel> {
    return cards.map((card, index) => ({
      resources: options.showResources ? card.resourceCount : undefined,
      resourceType: card.resourceType,
      name: card.name,
      calculatedCost: options.showNewCost ? (card.cost === undefined ? undefined : player.getCardCost(card as IProjectCard)) : card.cost,
      cardType: card.cardType,
      isDisabled: options.enabled?.[index] === false,
      warning: card.warning,
      reserveUnits: options.reserveUnits ? options.reserveUnits[index] : Units.EMPTY,
      bonusResource: (card as IProjectCard).bonusResource,
      discount: card.cardDiscount === undefined ? undefined : (Array.isArray(card.cardDiscount) ? card.cardDiscount : [card.cardDiscount]),
      cloneTag: isICloneTagCard(card) ? card.cloneTag : undefined,
    }));
  }

  public static getPlayer(player: Player): PublicPlayerModel {
    const game = player.game;
    return {
      actionsTakenThisRound: player.actionsTakenThisRound,
      actionsTakenThisGame: player.actionsTakenThisGame,
      actionsThisGeneration: Array.from(player.getActionsThisGeneration()),
      availableBlueCardActionCount: player.getAvailableBlueActionCount(),
      cardCost: player.cardCost,
      cardDiscount: player.cardDiscount,
      cardsInHandNbr: player.cardsInHand.length,
      citiesCount: player.game.getCitiesCount(player),
      coloniesCount: player.getColoniesCount(),
      color: player.color,
      corporationCard: Server.getCorporationCard(player),
      corporationCard2: Server.getCorporationCard(player, true),
      energy: player.energy,
      energyProduction: player.getProduction(Resources.ENERGY),
      fleetSize: player.getFleetSize(),
      heat: player.heat,
      heatProduction: player.getProduction(Resources.HEAT),
      id: player.id,
      influence: TurmoilUtil.ifTurmoilElse(game, (turmoil) => turmoil.getPlayerInfluence(player), () => 0),
      isActive: player.id === game.activePlayer.id,
      lastCardPlayed: player.lastCardPlayed,
      megaCredits: player.megaCredits,
      megaCreditProduction: player.getProduction(Resources.MEGACREDITS),
      name: player.name,
      noTagsCount: player.getNoTagsCount(),
      plants: player.plants,
      plantProduction: player.getProduction(Resources.PLANTS),
      plantsAreProtected: player.plantsAreProtected(),
      playedCards: Server.getCards(player, player.playedCards, {showResources: true}),
      selfReplicatingRobotsCards: Server.getSelfReplicatingRobotsTargetCards(player),
      steel: player.steel,
      steelProduction: player.getProduction(Resources.STEEL),
      steelValue: player.getSteelValue(),
      tags: player.getAllTags(),
      terraformRating: player.getTerraformRating(),
      timer: player.timer.serialize(),
      titanium: player.titanium,
      titaniumProduction: player.getProduction(Resources.TITANIUM),
      titaniumValue: player.getTitaniumValue(),
      tradesThisGeneration: player.tradesThisGeneration,
      victoryPointsBreakdown: player.getVictoryPoints(),
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
    } as any as PublicPlayerModel;
  }

  public static getColonies(colonies: Array<IColony>): Array<ColonyModel> {
    return colonies.map(
      (colony): ColonyModel => ({
        colonies: colony.colonies.map(
          (player): Color => player.color,
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
    const noctisCitySpaceIds = board.getNoctisCitySpaceIds();

    return board.spaces.map((space) => {
      let highlight: SpaceHighlight = undefined;
      if (volcanicSpaceIds.includes(space.id)) {
        highlight = 'volcanic';
      } else if (noctisCitySpaceIds.includes(space.id)) {
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
  //   cardsBlackList: options.cardsBlackList,
  //   coloniesExtension: options.coloniesExtension,
  //   communityCardsOption: options.communityCardsOption,
  //   corporateEra: options.corporateEra,
  //   draftVariant: options.draftVariant,
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
  //   removeNegativeGlobalEvents: options.removeNegativeGlobalEventsOption,
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
  //   undoOption: options.undoOption,
  // };
  }

  private static getColonyModel(colonies: Array<IColony>) : Array<ColonyModel> {
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
