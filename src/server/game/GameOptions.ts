import * as constants from '../../common/constants';
import {BoardName} from '../../common/boards/BoardName';
import {CardName} from '../../common/cards/CardName';
import {ColonyName} from '../../common/colonies/ColonyName';
import {GameId} from '../../common/Types';
import {RandomMAOptionType} from '../../common/ma/RandomMAOptionType';
import {AgendaStyle} from '../../common/turmoil/Types';
import {Expansion} from '../../common/cards/GameModule';
import {EscapeVelocityOptions} from '../../common/game/NewGameConfig';

export type GameOptions = {
  boardName: BoardName;
  clonedGamedId: GameId | undefined;

  // Configuration
  undoOption: boolean;
  rankOption: boolean; // 天梯
  showTimers: boolean;
  fastModeOption: boolean;
  showOtherPlayersVP: boolean;

  // Extensions -- Deprecated, except when importing JSON
  corporateEra: boolean;
  venusNextExtension: boolean;
  coloniesExtension: boolean;
  preludeExtension: boolean;
  prelude2Expansion: boolean;
  turmoilExtension: boolean;
  promoCardsOption: boolean;
  communityCardsOption: boolean;
  erosCardsOption: boolean;
  aresExtension: boolean;
  aresHazards: boolean;
  aresExtremeVariant: boolean;
  politicalAgendasExtension: AgendaStyle;
  solarPhaseOption: boolean;
  removeNegativeGlobalEventsOption: boolean;
  moonExpansion: boolean;
  pathfindersExpansion: boolean;
  ceoExtension: boolean;
  starWarsExpansion: boolean;
  underworldExpansion: boolean;
  commissionCardsOption: boolean;
  deltaProjectExpansion: boolean;
  expansions: Record<Expansion, boolean>,

  // Variants
  draftVariant: boolean;
  initialDraftVariant: boolean;
  initialCorpDraftVariant: boolean; // 双公司时初始轮抽公司
  preludeDraftVariant: boolean;
  ceosDraftVariant: boolean;
  // corporationsDraft: boolean;
  startingCorporations: number;
  shuffleMapOption: boolean;
  randomMA: RandomMAOptionType;
  includeFanMA: boolean;
  modularMA: boolean;
  /** Solo victory by getting TR 63 by game end */
  soloTR: boolean;
  customCorporationsList: ReadonlyArray<CardName>;
  bannedCards: ReadonlyArray<CardName>;
  includedCards: ReadonlyArray<CardName>;
  customColoniesList: ReadonlyArray<ColonyName>;
  customPreludes: ReadonlyArray<CardName>;
  customCeos: ReadonlyArray<CardName>;
  startingCeos: number;
  heatFor: boolean; //  七热升温
  breakthrough: boolean;// 界限突破
  doubleCorp: boolean; // 双将
  startingPreludes: number;
  /** Moon must be completed to end the game */
  requiresMoonTrackCompletion: boolean;
  /** Venus must be completed to end the game */
  requiresVenusTrackCompletion: boolean;
  /** Standard projects cost more MC and do not require steel or titanium */
  moonStandardProjectVariant: boolean;
  /** Standard projects can be paid for with steel or titanium at a 1MC loss per alloy */
  moonStandardProjectVariant1: boolean;
  altVenusBoard: boolean;
  escapeVelocity?: EscapeVelocityOptions;
  rankTimeLimit?: number; // 天梯 玩家超时限制
  rankTimePerGeneration?: number; // 天梯 每时代额外加成
  seed: string|undefined;
}

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  altVenusBoard: false,
  aresExtension: false,
  aresHazards: true,
  aresExtremeVariant: false,
  boardName: BoardName.THARSIS,
  bannedCards: [],
  includedCards: [],
  ceoExtension: false,
  clonedGamedId: undefined,
  coloniesExtension: false,
  communityCardsOption: false,
  erosCardsOption: false,
  corporateEra: true,
  customCeos: [],
  customColoniesList: [],
  customCorporationsList: [],
  customPreludes: [],
  draftVariant: false,
  escapeVelocity: undefined,
  expansions: {
    corpera: false,
    promo: false,
    venus: false,
    colonies: false,
    prelude: false,
    prelude2: false,
    turmoil: false,
    community: false,
    ares: false,
    moon: false,
    pathfinders: false,
    ceo: false,
    starwars: false,
    underworld: false,
    breakthrough: false,
    eros: false,
    commission: false,
    deltaProject: false,
  },
  fastModeOption: false,
  includeFanMA: false,
  initialDraftVariant: false,
  modularMA: false,
  moonExpansion: false,
  moonStandardProjectVariant: false,
  moonStandardProjectVariant1: false,
  pathfindersExpansion: false,
  politicalAgendasExtension: 'Standard',
  preludeDraftVariant: false,
  ceosDraftVariant: false,
  preludeExtension: false,
  prelude2Expansion: false,
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
  startingCeos: constants.CEO_CARDS_DEALT_PER_PLAYER,
  startingCorporations: constants.CORPORATION_CARDS_DEALT_PER_PLAYER,
  startingPreludes: constants.PRELUDE_CARDS_DEALT_PER_PLAYER,
  starWarsExpansion: false,
  turmoilExtension: false,
  underworldExpansion: false,
  commissionCardsOption: false,
  deltaProjectExpansion: false,
  undoOption: false,
  venusNextExtension: false,
  heatFor: false,
  breakthrough: false,
  doubleCorp: false,
  initialCorpDraftVariant: false,
  rankOption: false, // 天梯
  rankTimeLimit: constants.DEFAULT_RANK_TIME_LIMIT, // 天梯
  rankTimePerGeneration: constants.DEFAULT_RANK_TIME_PER_GENERATION, // 天梯 每时代额外加成
  seed: '',
};
