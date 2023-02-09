import {CardName} from '../common/cards/CardName';
import {Resources} from '../common/Resources';
import {Tag} from '../common/cards/Tag';

export type SerializedCard = {
  name: CardName;
  resourceCount?: number;

  // for corp card
  allTags?: Array<Tag>; // For Aridor   IdoFront
  isDisabled?: boolean; // For Pharmacy Union
  isUsed?: boolean; // For BrotherhoodOfMutants

  // for project card
  bonusResource?: Resources | Array<Resources>; // For Robotic Workforce / Mining Area / Mining Rights / Specialized Settlement
  cloneTag?: Tag; // For Pathfinders' clone tag

}

export type SerializedRobotCard = {
  card: SerializedCard;
  resourceCount: number;
}
