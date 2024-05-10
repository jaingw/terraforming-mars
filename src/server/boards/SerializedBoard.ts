import {AdjacencyBonus} from '../ares/AdjacencyBonus';
import {Tile} from '../Tile';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceType} from '../../common/boards/SpaceType';
import {PlayerId, SpaceId} from '../../common/Types';
import {UndergroundResourceToken} from '../../common/underworld/UndergroundResourceToken';
import {SerializedPlayerId} from '../SerializedPlayer';

export interface SerializedBoard {
  spaces: Array<SerializedSpace>;
}

export interface SerializedSpace {
  id: SpaceId;
  spaceType: SpaceType;
  tile?: Tile;
  player?: SerializedPlayerId;
  bonus: Array<SpaceBonus>;
  adjacency?: AdjacencyBonus,
  x: number;
  y: number;
  undergroundResources?: UndergroundResourceToken;
  excavator?: PlayerId;
  coOwner?: PlayerId;
}
