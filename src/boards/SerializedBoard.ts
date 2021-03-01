import {IAdjacencyBonus} from '../ares/IAdjacencyBonus';
import {ITile} from '../ITile';
import {Player} from '../Player';
import {SpaceBonus} from '../SpaceBonus';
import {SpaceType} from '../SpaceType';
import {SpaceId} from './ISpace';

export interface SerializedBoard {
  spaces: Array<SerializedSpace>;
}

export interface SerializedSpace {
  id: SpaceId;
  spaceType: SpaceType;
  tile?: ITile;
  player?: Player;
  bonus: Array<SpaceBonus>;
  adjacency?: IAdjacencyBonus,
  x: number;
  y: number;
}
