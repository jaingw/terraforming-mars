import {SerializedBoard} from '../boards/SerializedBoard';
import {SerializedPlayerId} from '../SerializedPlayer';

export interface SerializedMoonData {
  moon: SerializedBoard;
  habitatRate: number;
  miningRate: number;
  logisticRate: number;
  lunaFirstPlayer: SerializedPlayerId | undefined;
  lunaProjectOfficeLastGeneration: number | undefined;
}
