import {SerializedBoard} from '../boards/SerializedBoard';
import {SerializedPlayerId} from '../SerializedPlayer';

export interface SerializedMoonData {
  moon: SerializedBoard;
  colonyRate: number;
  miningRate: number;
  logisticRate: number;
  lunaFirstPlayer: SerializedPlayerId | undefined;
  lunaProjectOfficeLastGeneration: number | undefined;
}
