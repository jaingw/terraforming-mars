import {BoardName} from '../boards/BoardName';
import {RandomMAOptionType} from '../ma/RandomMAOptionType';
import {AgendaStyle} from '../turmoil/Types';
import {CardName} from '../cards/CardName';
import {Expansion} from '../cards/GameModule';
import {EscapeVelocityOptions} from '../game/NewGameConfig';

export interface GameOptionsModel {
  aresExtremeVariant: boolean,
  altVenusBoard: boolean,
  boardName: BoardName,
  bannedCards: ReadonlyArray<CardName>;
  expansions: Record<Expansion, boolean>,
  draftVariant: boolean,
  escapeVelocity?: EscapeVelocityOptions,
  fastModeOption: boolean,
  includedCards: ReadonlyArray<CardName>;
  includeFanMA: boolean,
  initialDraftVariant: boolean,
  preludeDraftVariant: boolean,
  ceosDraftVariant: boolean,
  politicalAgendasExtension: AgendaStyle,
  removeNegativeGlobalEventsOption: boolean,
  showOtherPlayersVP: boolean,
  showTimers: boolean,
  shuffleMapOption: boolean,
  solarPhaseOption: boolean,
  soloTR: boolean,
  randomMA: RandomMAOptionType,
  requiresMoonTrackCompletion: boolean,
  requiresVenusTrackCompletion: boolean,
  undoOption: boolean,
  rankOption: boolean; // 天梯
  rankTimeLimit?: number; // 天梯 玩家超时限制
  rankTimePerGeneration?: number; // 天梯 每时代额外加成
  doubleCorp: boolean; // 双将
  heatFor: boolean; //  七热升温
}
