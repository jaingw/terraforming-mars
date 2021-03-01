import {Resources} from './Resources';
import {Tags} from './cards/Tags';
import {CardName} from './CardName';

export interface SerializedCard {
  allTags?: Array<Tags>;
  bonusResource?: Resources;
  isDisabled?: boolean;
  name: CardName;
  resourceCount?: number;
}

export interface SerializedRobotCard {
  card: SerializedCard;
  resourceCount: number;
}
