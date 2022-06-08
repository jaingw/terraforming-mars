import {Player} from '../Player';
import {MoonBoard} from './MoonBoard';
import {SerializedMoonData} from './SerializedMoonData';

export interface IMoonData {
  moon: MoonBoard;
  colonyRate: number;
  miningRate: number;
  logisticRate: number;
  lunaFirstPlayer: Player | undefined;
  lunaProjectOfficeLastGeneration: number | undefined;
}

export namespace IMoonData {
  export function serialize(moonData: IMoonData | undefined): SerializedMoonData | undefined {
    if (moonData === undefined) {
      return undefined;
    }
    return {
      moon: moonData.moon.serialize(),
      colonyRate: moonData.colonyRate,
      miningRate: moonData.miningRate,
      logisticRate: moonData.logisticRate,
      lunaFirstPlayer: moonData.lunaFirstPlayer?.serializeId(),
      lunaProjectOfficeLastGeneration: moonData.lunaProjectOfficeLastGeneration,
    };
  }

  export function deserialize(moonData: SerializedMoonData, players: Array<Player>): IMoonData {
    let lunaFirstPlayer = undefined;
    if (moonData.lunaFirstPlayer !== undefined ) {
      lunaFirstPlayer = players.find((p) => p.id === moonData.lunaFirstPlayer!.id);
      if ( lunaFirstPlayer === undefined) {
        throw new Error(`player ${moonData.lunaFirstPlayer.id} not found`);
      }
    }
    return {
      colonyRate: moonData.colonyRate,
      logisticRate: moonData.logisticRate,
      miningRate: moonData.miningRate,
      moon: MoonBoard.deserialize(moonData.moon, players),
      lunaFirstPlayer: lunaFirstPlayer,
      lunaProjectOfficeLastGeneration: moonData.lunaProjectOfficeLastGeneration,
    };
  }
}
