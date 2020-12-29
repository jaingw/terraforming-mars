
import {ColonyName} from './colonies/ColonyName';
import {ResourceType} from './ResourceType';
import {Player} from './Player';

export interface SerializedColony {
    colonies: Array<Player>;
    description: string;
    name: ColonyName;
    isActive: boolean;
    resourceType?: ResourceType;
    trackPosition: number;
    visitor: undefined | Player;
}

