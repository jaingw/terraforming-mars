/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-27 14:10:20
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2026-02-10 16:28:20
 * @Description:
 */
import {CardName} from '@/common/cards/CardName';
import {ColonyName} from '@/common/colonies/ColonyName';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';
import {GameId} from '@/common/Types';
import {AgendaStyle} from '@/common/turmoil/Types';
import {BoardNameType, NewPlayerModel} from '@/common/game/NewGameConfig';
import {Expansion} from '@/common/cards/GameModule';

export type CreateGameModel = {
  isvip: boolean;
  initialCorpDraftVariant: boolean;
  heatFor: boolean;
  doubleCorp: boolean; // 双将
  randomMACheckbox: boolean;// 上传设置之后选中随机里程碑的按钮
  rankOption: boolean; // 是否开启天梯
  rankTimeLimit: number; // 天梯时间限制
  rankTimePerGeneration: number; // 天梯每时代时间限制

  allOfficialExpansions: boolean;
  altVenusBoard: boolean;
  aresExtremeVariant: boolean;
  bannedCards: Array<CardName>;
  board: BoardNameType;
  boards: Array<BoardNameType>;
  ceosDraftVariant: boolean | undefined;
  clonedGameId: GameId | undefined;
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
  expansions: Record<Expansion, boolean>,
  fastModeOption: boolean;
  firstIndex: number;
  includedCards: Array<CardName>;
  includeFanMA: boolean;
  initialDraft: boolean;
  modularMA: boolean;
  moonStandardProjectVariant: boolean;
  moonStandardProjectVariant1: boolean;
  players: Array<NewPlayerModel>;
  playersCount: number;
  politicalAgendasExtension: AgendaStyle;
  preludeDraftVariant: boolean | undefined;
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
  // twoCorpsVariant: boolean;
  undoOption: boolean;
}
