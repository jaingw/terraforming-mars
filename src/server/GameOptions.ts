import * as constants from '../common/constants';
import {BoardName} from '../common/boards/BoardName';
import {CardName} from '../common/cards/CardName';
import {ColonyName} from '../common/colonies/ColonyName';
import {GameId} from '../common/Types';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';
import {AgendaStyle} from '../common/turmoil/Types';

export type GameOptions = {
  boardName: BoardName;
  clonedGamedId: GameId | undefined;

  // Configuration
  undoOption: boolean;
  rankOption: boolean; // 天梯
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
  ceoExtension: boolean;

  // Variants
  draftVariant: boolean;
  initialDraftVariant: boolean;
  initialCorpDraftVariant: boolean; // 双公司时初始轮抽公司
  _corporationsDraft: boolean;// NOT
  startingCorporations: number;
  shuffleMapOption: boolean;
  randomMA: RandomMAOptionType;
  includeFanMA: boolean;
  soloTR: boolean; // Solo victory by getting TR 63 by game end
  customCorporationsList: Array<CardName>;
  bannedCards: Array<CardName>;
  customColoniesList: Array<ColonyName>;
  customPreludes: Array<CardName>;
  customCeos: Array<CardName>;
  startingCeos: number;
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
  twoCorpsVariant: boolean;
  rankTimeLimit?: number; // 天梯 玩家超时限制
  rankTimePerGeneration?: number; // 天梯 每时代额外加成

}

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  altVenusBoard: false,
  aresExtension: false,
  aresHazards: true,
  boardName: BoardName.THARSIS,
  bannedCards: [],
  ceoExtension: false,
  clonedGamedId: undefined,
  coloniesExtension: false,
  communityCardsOption: false,
  erosCardsOption: false,
  corporateEra: true,
  _corporationsDraft: false, // NOT
  customCeos: [],
  customColoniesList: [],
  customCorporationsList: [],
  customPreludes: [],
  draftVariant: false,
  escapeVelocityMode: false, // When true, escape velocity is enabled.
  escapeVelocityThreshold: constants.DEFAULT_ESCAPE_VELOCITY_THRESHOLD, // Time in minutes a player has to complete a game.
  escapeVelocityPeriod: constants.DEFAULT_ESCAPE_VELOCITY_PERIOD, // VP a player loses for every `escapeVelocityPenalty` minutes after `escapeVelocityThreshold`.
  escapeVelocityPenalty: constants.DEFAULT_ESCAPE_VELOCITY_PENALTY,
  fastModeOption: false,
  includeVenusMA: true,
  includeFanMA: false,
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
  startingCeos: 3,
  startingCorporations: 2,
  turmoilExtension: false,
  undoOption: false,
  venusNextExtension: false,
  heatFor: false,
  breakthrough: false,
  doubleCorp: false,
  initialCorpDraftVariant: true,
  twoCorpsVariant: false,
  rankOption: false, // 天梯
  rankTimeLimit: constants.DEFAULT_RANK_TIME_LIMIT, // 天梯
  rankTimePerGeneration: constants.DEFAULT_RANK_TIME_PER_GENERATION, // 天梯 每时代额外加成
};
