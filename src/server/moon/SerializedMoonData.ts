import {SerializedBoard} from '../boards/SerializedBoard';
import {PlayerId} from '../../common/Types';
import {SerializedPlayerId} from '../SerializedPlayer';

export interface SerializedMoonData {
  moon: SerializedBoard;
  habitatRate: number;
  miningRate: number;
  logisticRate: number;
  lunaFirstPlayer: SerializedPlayerId | undefined;
  lunaProjectOfficeLastGeneration: number | undefined;
  lunaFirstPlayerId: PlayerId | undefined;
}
