import {CardName} from '../common/cards/CardName';
import {Resource} from '../common/Resource';
import {Tag} from '../common/cards/Tag';

export type SerializedCard = {
  name: CardName;
  resourceCount?: number;

  // for corp card
  allTags?: Array<Tag>; // For Aridor   IdoFront
    isDisabled?: boolean; // For Pharmacy Union and CEO Cards.
  isUsed?: boolean; // For BrotherhoodOfMutants

  // for project card
  bonusResource?: Resource | Array<Resource>; // For Robotic Workforce / Mining Area / Mining Rights / Specialized Settlement
  cloneTag?: Tag; // For Pathfinders' clone tag

  opgActionIsActive?: boolean; // For CEO Cards.
}

export type SerializedRobotCard = {
  card: SerializedCard;
  resourceCount: number;
}
