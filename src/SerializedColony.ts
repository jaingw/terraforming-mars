
import { ColonyName } from "./colonies/ColonyName";
import { ResourceType } from "./ResourceType";
import { Player } from "./Player";

export interface SerializedColony {
    name: ColonyName;
    description: string;
    isActive: boolean;
    visitor: undefined | Player;
    trackPosition: number;
    colonies: Array<Player>;
    resourceType?: ResourceType;
}

