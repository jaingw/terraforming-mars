import {ColonyName} from '../common/colonies/ColonyName';
import {Player} from '../Player';
import {SerializedColony} from '../SerializedColony';
import {SerializedPlayerId} from '../SerializedPlayer';
import {ALL_COLONIES_TILES, COMMUNITY_COLONIES_TILES_REMOVED} from './ColonyManifest';
import {IColony} from './IColony';

export class ColonyDeserializer {
  public static deserialize(serialized: SerializedColony | ColonyName, players:Array<Player>): IColony | undefined {
    const name = typeof(serialized) === 'string' ? serialized : serialized.name;
    const colonyTiles = ALL_COLONIES_TILES.concat(COMMUNITY_COLONIES_TILES_REMOVED);
    const factory = colonyTiles.find((cf) => cf.colonyName === name);
    if (factory === undefined) {
      console.warn(`colony ${name} not found`);
      return undefined;
    }

    const colony = new factory.Factory();
    if (typeof(serialized) !== 'string') {
      colony.isActive = serialized.isActive;
      colony.trackPosition = serialized.trackPosition;
      if (serialized.visitor) {
        const player = players.find((player) => player.id === serialized.visitor?.id);
        colony.visitor = player;
      }
      colony.colonies = [];
      serialized.colonies.forEach((element: SerializedPlayerId) => {
        const player = players.find((player) => player.id === element.id);
        if (player) {
          colony.colonies.push(player);
        }
      });
    }
    return colony;
  }

  public static deserializeAndFilter(serialized: Array<SerializedColony | ColonyName>, players:Array<Player>): Array<IColony> {
    const colonies: Array<IColony | undefined> = serialized.map((c) => this.deserialize(c, players)).filter((c) => c !== undefined);
    // as Array<Colony> is safe because filter removes the undefined colonies
    return colonies as Array<IColony>;
  }
}
