import {BoardName} from '../boards/BoardName';
import {RandomMAOptionType} from '../ma/RandomMAOptionType';
import {AgendaStyle} from '../turmoil/Types';
import {CardName} from '../cards/CardName';

export interface GameOptionsModel_ {
  aresExtension: boolean,
  altVenusBoard: boolean,
  boardName: BoardName,
  bannedCards: Array<CardName>;
  includedCards: Array<CardName>;
  ceoExtension: boolean,
  coloniesExtension: boolean,
  communityCardsOption: boolean,
  commissionCardsOption: boolean,
  corporateEra: boolean,
  draftVariant: boolean,
  escapeVelocityMode: boolean,
  escapeVelocityThreshold?: number,
  escapeVelocityBonusSeconds?: number,
  escapeVelocityPeriod?: number,
  escapeVelocityPenalty?: number,
  fastModeOption: boolean,
  includeFanMA: boolean,
  includeVenusMA: boolean,
  initialDraftVariant: boolean,
  moonExpansion: boolean,
  pathfindersExpansion: boolean,
  prelude2Expansion: boolean,
  preludeDraftVariant: boolean,
  preludeExtension: boolean,
  promoCardsOption: boolean,
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
  turmoilExtension: boolean,
  twoCorpsVariant: boolean,
  venusNextExtension: boolean,
  undoOption: boolean,
  underworldExpansion: boolean;
}
