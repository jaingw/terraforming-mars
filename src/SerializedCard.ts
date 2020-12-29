import {Resources} from './Resources';
import {Tags} from './cards/Tags';

export interface SerializedCard {
  allTags?: Array<Tags>;
  bonusResource?: Resources;
  isDisabled?: boolean;
  name: string;
  resourceCount?: number;
}

export interface SerializedRobotCard {
  card: SerializedCard;
  resourceCount: number;
}
