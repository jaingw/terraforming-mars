
import {ColonyName} from './common/colonies/ColonyName';
import {SerializedPlayerId} from './SerializedPlayer';

export interface SerializedColony {
    colonies: Array<SerializedPlayerId>;
    name: ColonyName;
    isActive: boolean;
    trackPosition: number;
    visitor: undefined | SerializedPlayerId;
}

