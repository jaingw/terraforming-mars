import {CardName} from './common/cards/CardName';
import {Resources} from './common/Resources';
import {Tags} from './common/cards/Tags';

export interface SerializedCard {
  name: CardName;
  resourceCount?: number;

  // for corp card
  allTags?: Array<Tags>; // For Aridor   IdoFront
  isDisabled?: boolean; // For Pharmacy Union
  isUsed?: boolean; // For BrotherhoodOfMutants

  // for project card
  bonusResource?: Resources | Array<Resources>; // For Robotic Workforce / Mining Area / Mining Rights / Specialized Settlement
  cloneTag?: Tags; // For Pathfinders' clone tag

}

export interface SerializedRobotCard {
  card: SerializedCard;
  resourceCount: number;
}
