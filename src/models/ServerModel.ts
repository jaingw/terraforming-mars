import {CardModel} from './CardModel';
import {ColonyModel} from './ColonyModel';
import {Color} from '../Color';
import {Game, GameOptions} from '../Game';
import {SimpleGameModel} from './SimpleGameModel';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {Board} from '../boards/Board';
import {ISpace} from '../boards/ISpace';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputModel} from './PlayerInputModel';
import {PlayerInputTypes} from '../PlayerInputTypes';
import {PlayerModel, PlayerBlockModel} from './PlayerModel';
import {SelectAmount} from '../inputs/SelectAmount';
import {SelectCard} from '../inputs/SelectCard';
import {SelectHowToPay} from '../inputs/SelectHowToPay';
import {SelectHowToPayForProjectCard} from '../inputs/SelectHowToPayForProjectCard';
import {SelectPlayer} from '../inputs/SelectPlayer';
import {SelectSpace} from '../inputs/SelectSpace';
import {SpaceHighlight, SpaceModel} from './SpaceModel';
import {TileType} from '../TileType';
import {Resources} from '../Resources';
import {CardType} from '../cards/CardType';
import {
  ClaimedMilestoneModel,
  IMilestoneScore,
} from './ClaimedMilestoneModel';
import {FundedAwardModel, IAwardScore} from './FundedAwardModel';
import {
  getTurmoil,
} from './TurmoilModel';
import {SelectDelegate} from '../inputs/SelectDelegate';
import {SelectColony} from '../inputs/SelectColony';
import {SelectProductionToLose} from '../inputs/SelectProductionToLose';
import {ShiftAresGlobalParameters} from '../inputs/ShiftAresGlobalParameters';
import {Colony} from '../colonies/Colony';
import {GameLoader} from '../database/GameLoader';
import {SpectatorModel} from './SpectatorModel';
import {MoonModel} from './MoonModel';
import {Units} from '../Units';
import {OrOptions} from '../inputs/OrOptions';
import {SelectPartyToSendDelegate} from '../inputs/SelectPartyToSendDelegate';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';
import {GameModel} from './GameModel';

export class Server {
  public static getGameModel(game: Game, userId : string = ''): SimpleGameModel {
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

  public static getCommonGameModel(game: Game): GameModel {
    const turmoil = getTurmoil(game);

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
      moon: MoonModel.serialize(game),
      oceans: game.board.getOceansOnBoard(),
      oxygenLevel: game.getOxygenLevel(),
      passedPlayers: game.getPassedPlayers(),
      phase: game.phase,
      spaces: this.getSpaces(game.board),
      spectatorId: game.spectatorId,
      temperature: game.getTemperature(),
      isTerraformed: game.marsIsTerraformed(),
      turmoil: turmoil,
      undoCount: game.undoCount,
      venusScaleLevel: game.getVenusScaleLevel(),
    };
  }

  public static getPlayerModel(player: Player, playerBlockModel: PlayerBlockModel): PlayerModel {
    const game = player.game;
    const turmoil = getTurmoil(game);
    const block = playerBlockModel.block;
    const isme = playerBlockModel.isme;
    const showhandcards = playerBlockModel.showhandcards;
    try {
      const user = GameLoader.getUserByPlayer(player);
      const userName = user ? user.name : '';
      return {
        actionsTakenThisRound: player.actionsTakenThisRound,
        actionsThisGeneration: Array.from(player.getActionsThisGeneration()),
        availableBlueCardActionCount: player.getAvailableBlueActionCount(),
        cardCost: player.cardCost,
        cardsInHand: (block && !showhandcards ) ? []:this.getCards(player, player.cardsInHand, {showNewCost: true}),
        cardsInHandNbr: player.cardsInHand.length,
        citiesCount: player.getCitiesCount(),
        coloniesCount: player.getColoniesCount(),
        color: player.color,
        corporationCard: this.getCorporationCard(player, false),
        corporationCard2: this.getCorporationCard(player, true),
        game: this.getCommonGameModel(player.game),
        dealtCorporationCards: block? []:this.getCards(player, player.dealtCorporationCards),
        dealtPreludeCards: block? []:this.getCards(player, player.dealtPreludeCards),
        dealtProjectCards: block? []:this.getCards(player, player.dealtProjectCards),
        draftedCards: block? []:this.getCards(player, player.draftedCards, {showNewCost: true}),
        energy: player.energy,
        energyProduction: player.getProduction(Resources.ENERGY),
        fleetSize: player.getFleetSize(),
        heat: player.heat,
        heatProduction: player.getProduction(Resources.HEAT),
        id: player.id,
        influence: turmoil ? game.turmoil!.getPlayerInfluence(player) : 0,
        isActive: player.id === game.activePlayer.id,
        megaCredits: player.megaCredits,
        megaCreditProduction: player.getProduction(Resources.MEGACREDITS),
        name: player.name,
        noTagsCount: player.getNoTagsCount(),
        pickedCorporationCard: block? []:player.pickedCorporationCard ? this.getCards(player, [player.pickedCorporationCard]) : [],
        pickedCorporationCard2: block? []:player.pickedCorporationCard2 ? this.getCards(player, [player.pickedCorporationCard2]) : [],
        plants: player.plants,
        plantProduction: player.getProduction(Resources.PLANTS),
        plantsAreProtected: player.plantsAreProtected(),
        playedCards: this.getCards(player, player.playedCards, {showResources: true}),
        players: this.getPlayers(game.getAllPlayers(), game),
        preludeCardsInHand: block? []:this.getCards(player, player.preludeCardsInHand),
        selfReplicatingRobotsCards: this.getSelfReplicatingRobotsTargetCards(player),
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
        waitingFor: block? undefined: this.getWaitingFor(player, player.getWaitingFor()),

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
      return { } as PlayerModel;
    }
  }

  public static getSpectatorModel(game: Game): SpectatorModel {
    return {
      generation: game.generation,
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
      const scores: Array<IMilestoneScore> = [];
      if (claimed === undefined && claimedMilestones.length < 3) {
        game.getPlayers().forEach((player) => {
          scores.push({
            playerColor: player.color,
            playerScore: milestone.getScore(player),
          });
        });
      }

      milestoneModels.push({
        player_name: claimed === undefined ? '' : claimed.player.name,
        player_color: claimed === undefined ? '' : claimed.player.color,
        milestone,
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
      const scores: Array<IAwardScore> = [];
      if (fundedAwards.length < 3 || funded !== undefined) {
        game.getPlayers().forEach((player) => {
          scores.push({
            playerColor: player.color,
            playerScore: award.getScore(player),
          });
        });
      }

      awardModels.push({
        player_name: funded === undefined ? '' : funded.player.name,
        player_color: funded === undefined ? '' : funded.player.color,
        award,
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
      resources: player.getResourcesOnCard(corp),
      cardType: CardType.CORPORATION,
      isDisabled: corp.isDisabled,
      warning: corp.warning,
      discount: corp.cardDiscount,
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
      players: undefined,
      availableSpaces: undefined,
      min: undefined,
      max: undefined,
      maxByDefault: undefined,
      microbes: undefined,
      floaters: undefined,
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

      playerInputModel.globalEventCards = selectEventCard.cards;
      playerInputModel.maxCardsToSelect = selectEventCard.maxCardsToSelect;
      playerInputModel.minCardsToSelect = selectEventCard.minCardsToSelect;
      break;
    case PlayerInputTypes.SELECT_COLONY:
      playerInputModel.coloniesModel = (waitingFor as SelectColony).coloniesModel;
      break;
    case PlayerInputTypes.SELECT_HOW_TO_PAY:
      playerInputModel.amount = (waitingFor as SelectHowToPay).amount;
      playerInputModel.canUseSteel = (waitingFor as SelectHowToPay).canUseSteel;
      playerInputModel.canUseTitanium = (waitingFor as SelectHowToPay).canUseTitanium;
      playerInputModel.canUseHeat = (waitingFor as SelectHowToPay).canUseHeat;
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
        playerInputModel.turmoil = getTurmoil(player.game);
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
      resources: options.showResources ? player.getResourcesOnCard(card) : undefined,
      resourceType: card.resourceType,
      name: card.name,
      calculatedCost: options.showNewCost ? (card.cost === undefined ? undefined : player.getCardCost(card as IProjectCard)) : card.cost,
      cardType: card.cardType,
      isDisabled: options.enabled?.[index] === false,
      warning: card.warning,
      reserveUnits: options.reserveUnits ? options.reserveUnits[index] : Units.EMPTY,
      bonusResource: (card as IProjectCard).bonusResource,
      discount: card.cardDiscount,
    }));
  }
  public static getPlayers(players: Array<Player>, game: Game): Array<PlayerModel> {
    const turmoil = getTurmoil(game);

    const gameModel = this.getCommonGameModel(game);

    return players.map((player) => {
      return {
        actionsTakenThisRound: player.actionsTakenThisRound,
        actionsThisGeneration: Array.from(player.getActionsThisGeneration()),
        availableBlueCardActionCount: player.getAvailableBlueActionCount(),
        cardCost: player.cardCost,
        cardsInHandNbr: player.cardsInHand.length,
        citiesCount: player.getCitiesCount(),
        coloniesCount: player.getColoniesCount(),
        color: player.color,
        corporationCard: this.getCorporationCard(player, false),
        corporationCard2: this.getCorporationCard(player, true),
        energy: player.energy,
        energyProduction: player.getProduction(Resources.ENERGY),
        fleetSize: player.getFleetSize(),
        heat: player.heat,
        heatProduction: player.getProduction(Resources.HEAT),
        id: player.id,
        influence: turmoil ? game.turmoil!.getPlayerInfluence(player) : 0,
        isActive: player.id === game.activePlayer.id,
        megaCredits: player.megaCredits,
        megaCreditProduction: player.getProduction(Resources.MEGACREDITS),
        name: player.name,
        noTagsCount: player.getNoTagsCount(),
        plants: player.plants,
        plantProduction: player.getProduction(Resources.PLANTS),
        plantsAreProtected: player.plantsAreProtected(),
        playedCards: this.getCards(player, player.playedCards, {showResources: true}),
        selfReplicatingRobotsCards: this.getSelfReplicatingRobotsTargetCards(player),
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

        // TODO(kberg): Move commonGameData out of this version of getPlayers()
        // game: this.getCommonGameModel(player.game),
        // Fields that will be removed once this has its own private model.
        cardsInHand: [],
        dealtCorporationCards: [],
        dealtPreludeCards: [],
        dealtProjectCards: [],
        draftedCards: [],
        pickedCorporationCard: [],
        players: [],
        preludeCardsInHand: [],
        waitingFor: player.getWaitingFor() === undefined? undefined : {} as PlayerInputModel,

        // Remove these after 2021-05-05
        aresData: gameModel.aresData,
        awards: gameModel.awards,
        colonies: gameModel.colonies,
        deckSize: gameModel.deckSize,
        gameAge: gameModel.gameAge,
        gameOptions: gameModel.gameOptions,
        generation: gameModel.generation,
        isSoloModeWin: gameModel.isSoloModeWin,
        isTerraformed: gameModel.isTerraformed,
        lastSoloGeneration: gameModel.lastSoloGeneration,
        milestones: gameModel.milestones,
        moon: gameModel.moon,
        oceans: gameModel.oceans,
        oxygenLevel: gameModel.oxygenLevel,
        passedPlayers: gameModel.passedPlayers,
        phase: gameModel.phase,
        spaces: gameModel.spaces,
        spectatorId: gameModel.spectatorId,
        temperature: gameModel.temperature,
        turmoil: gameModel.turmoil,
        undoCount: gameModel.undoCount,
        venusScaleLevel: gameModel.venusScaleLevel,

        // undoing: false,
        // gameId: '',
        // block: false,
        // canExit: false,
        // userName: '',
        // isme: false,
        // showhandcards: false,

        exited: player.exited,
        isvip: GameLoader.getUserByPlayer(player)?.isvip() || 0,
      } as any as PlayerModel;
    });
  }

  public static getColonies(colonies: Array<Colony>): Array<ColonyModel> {
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
  public static getColor(space: ISpace): Color | undefined {
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

  public static getSpaces(board: Board): Array<SpaceModel> {
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
  //   aresExtension: options.aresExtension,
  //   boardName: options.boardName,
  //   cardsBlackList: options.cardsBlackList,
  //   coloniesExtension: options.coloniesExtension,
  //   communityCardsOption: options.communityCardsOption,
  //   corporateEra: options.corporateEra,
  //   draftVariant: options.draftVariant,
  //   fastModeOption: options.fastModeOption,
  //   includeVenusMA: options.includeVenusMA,
  //   initialDraftVariant: options.initialDraftVariant,
  //   moonExpansion: options.moonExpansion,
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
  //   requiresVenusTrackCompletion: options.requiresVenusTrackCompletion,
  // };
  }
}
