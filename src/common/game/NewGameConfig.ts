import {BoardName} from '../boards/BoardName';
import {RandomBoardOption} from '../boards/RandomBoardOption';
import {CardName} from '../cards/CardName';
import {ColonyName} from '../colonies/ColonyName';
import {Color} from '../Color';
import {RandomMAOptionType} from '../ma/RandomMAOptionType';
import {AgendaStyle} from '../turmoil/Types';
import {GameId} from '../Types';
import {Expansion} from '../cards/GameModule';
import type {GameOptionsModel} from '../models/GameOptionsModel';

export type BoardNameType = BoardName | RandomBoardOption;

export interface NewPlayerModel {
  name: string;
  color: Color;
  beginner: boolean;
  handicap: number;
  first: boolean;
}

export type EscapeVelocityOptions = {
  /** Time in minutes a player has to complete a game. */
  thresholdMinutes: number;
  /** Number of seconds a player gets back with every action. */
  bonusSectionsPerAction: number;
  /** Period in minutes after `thresholdMinutes` after which player loses `penaltyVPPerPeriod` VP. */
  penaltyPeriodMinutes: number;
  /** VP a player loses for every `penaltyPeriodMinutes` minutes after `thresholdMinutes`. */
  penaltyVPPerPeriod: number;
};

/**
 * Like GameOptions, but the data structure sent from the new game page.
 */
export interface NewGameConfig {
  players: Array<NewPlayerModel>;
  expansions: Record<Expansion, boolean>,
  board: BoardNameType;
  seed: string|undefined;
  randomFirstPlayer: boolean;

  // boardName: BoardName;
  clonedGamedId: GameId | undefined;

  // Configuration
  undoOption: boolean;
  rankOption: boolean; // 天梯
  showTimers: boolean;
  fastModeOption: boolean;
  showOtherPlayersVP: boolean;

  // Extensions
  // aresHazards: boolean;
  aresExtremeVariant: boolean;
  politicalAgendasExtension: AgendaStyle;
  solarPhaseOption: boolean;
  removeNegativeGlobalEventsOption: boolean;
  modularMA: boolean;

  // jaing
  userId: string;
  initialCorpDraftVariant: boolean; // 双公司时初始轮抽公司
  heatFor: boolean; //  七热升温
  doubleCorp: boolean; // 双将

  // Variants
  draftVariant: boolean;
  initialDraft: boolean; // initialDraftVariant: boolean;
  preludeDraftVariant: boolean;
  ceosDraftVariant: boolean;
  startingCorporations: number;
  shuffleMapOption: boolean;
  randomMA: RandomMAOptionType;
  includeFanMA: boolean,
  soloTR: boolean; // Solo victory by getting TR 63 by game end
  customCorporationsList: Array<CardName>;
  bannedCards: Array<CardName>;
  includedCards: Array<CardName>;
  customColoniesList: Array<ColonyName>;
  customPreludes: Array<CardName>;
  requiresMoonTrackCompletion: boolean; // Moon must be completed to end the game
  requiresVenusTrackCompletion: boolean; // Venus must be completed to end the game
  moonStandardProjectVariant: boolean;
  moonStandardProjectVariant1: boolean;
  altVenusBoard: boolean;
  escapeVelocity: EscapeVelocityOptions | undefined;
  customCeos: Array<CardName>;
  startingCeos: number;
  rankTimeLimit: number | undefined,
  rankTimePerGeneration: number | undefined;
  startingPreludes: number;
}

/**
 * Converts a NewGameConfig (without players) to GameOptionsModel for display purposes.
 *
 * Maps field name differences between the two types:
 * - `board` → `boardName`
 * - `initialDraft` → `initialDraftVariant`
 *
 * Extra fields from NewGameConfig are spread onto the result, preserving them
 * for consumers that access them via `as any` (e.g. GameSetupDetail.vue).
 */
export function newGameConfigToGameOptionsModel(config: Omit<NewGameConfig, 'players'>): GameOptionsModel {
  return {
    ...config,
    boardName: config.board as BoardName,
    initialDraftVariant: config.initialDraft,
  };
}
