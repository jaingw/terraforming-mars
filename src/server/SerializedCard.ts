import {CardName} from '../common/cards/CardName';
import {Resource} from '../common/Resource';
import {Tag} from '../common/cards/Tag';
import {OneOrArray} from '../common/utils/types';
import {JSONValue} from '../common/Types';

export type SerializedCard = {
  name: CardName;
  resourceCount?: number;

  // for corp card
  allTags?: Array<Tag>; // For Aridor   IdoFront
  isDisabled?: boolean; // For Pharmacy Union and CEO Cards.
  isUsed?: boolean; // For BrotherhoodOfMutants
  lastPay?: number; // For LunaChain

  // for project card
  bonusResource?: OneOrArray<Resource>; // For Robotic Workforce / Mining Area / Mining Rights / Specialized Settlement
  cloneTag?: Tag; // For Pathfinders' clone tag

  opgActionIsActive?: boolean; // For CEO Cards.
  generationUsed?: number; // For CEO and Underworld Cards.
  targetCards?: Array<SerializedRobotCard>;
  data?: JSONValue;
}

export type SerializedRobotCard = {
  card: SerializedCard;
  resourceCount: number;
}
