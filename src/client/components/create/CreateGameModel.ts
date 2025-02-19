/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-27 14:10:20
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-28 14:05:41
 * @Description:
 */
import {CardName} from '@/common/cards/CardName';
import {ColonyName} from '@/common/colonies/ColonyName';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';
import {GameId} from '@/common/Types';
import {AgendaStyle} from '@/common/turmoil/Types';
import {BoardNameType, NewPlayerModel} from '@/common/game/NewGameConfig';

export type CreateGameModel = {
  isvip: boolean;
  initialCorpDraftVariant: boolean;
  erosCardsOption: boolean;
  heatFor: boolean;
  breakthrough: boolean;
  doubleCorp: boolean; // 双将
  randomMACheckbox: boolean;// 上传设置之后选中随机里程碑的按钮
  rankOption: boolean; // 是否开启天梯
  rankTimeLimit: number; // 天梯时间限制
  rankTimePerGeneration: number; // 天梯每时代时间限制

  allOfficialExpansions: boolean;
  altVenusBoard: boolean;
  aresExtension: boolean;
  bannedCards: Array<CardName>;
  board: BoardNameType;
  boards: Array<BoardNameType>;
  ceoExtension: boolean;
  clonedGameId: GameId | undefined;
  colonies: boolean;
  communityCardsOption: boolean;
  commissionCardsOption: boolean;
  corporateEra: boolean;
  customCeos: Array<CardName>;
  customColonies: Array<ColonyName>;
  customCorporations: Array<CardName>;
  customPreludes: Array<CardName>;
  draftVariant: boolean;
  escapeVelocityBonusSeconds: number;
  escapeVelocityMode: boolean;
  escapeVelocityPenalty: number;
  escapeVelocityPeriod: number;
  escapeVelocityThreshold: number;
  fastModeOption: boolean;
  firstIndex: number;
  includedCards: Array<CardName>;
  includeFanMA: boolean;
  includeVenusMA: boolean;
  initialDraft: boolean;
  moonExpansion: boolean;
  moonStandardProjectVariant: boolean;
  moonStandardProjectVariant1: boolean;
  pathfindersExpansion: boolean;
  players: Array<NewPlayerModel>;
  playersCount: number;
  politicalAgendasExtension: AgendaStyle;
  prelude: boolean;
  preludeDraftVariant: boolean | undefined;
  prelude2Expansion: boolean;
  promoCardsOption: boolean;
  randomFirstPlayer: boolean;
  randomMA: RandomMAOptionType;
  removeNegativeGlobalEventsOption: boolean;
  requiresMoonTrackCompletion: boolean;
  requiresVenusTrackCompletion: boolean;
  seed: string|undefined;
  seededGame: boolean;
  showBannedCards: boolean;
  showColoniesList: boolean;
  showCorporationList: boolean;
  showIncludedCards: boolean;
  showOtherPlayersVP: boolean;
  showPreludesList: boolean;
  showTimers: boolean;
  shuffleMapOption: boolean;
  solarPhaseOption: boolean;
  soloTR: boolean;
  startingCeos: number;
  startingCorporations: number;
  startingPreludes: number;
  starWarsExpansion: boolean,
  turmoil: boolean;
  // twoCorpsVariant: boolean;
  underworldExpansion: boolean,
  undoOption: boolean;
  venusNext: boolean;
}
