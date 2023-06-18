import {TierName} from '../rank/TierName';
// import {RankTier} from '../rank/RankManager';
import {RankTier} from '../rank/RankTier';

export const RankTiers = [
  new RankTier(TierName.IRON, 'star', 3),
  new RankTier(TierName.BRONZE, 'star', 3),
  new RankTier(TierName.SILVER, 'star', 3),
  new RankTier(TierName.GOLD, 'star', 4),
  new RankTier(TierName.PLATINUM, 'star', 4),
  new RankTier(TierName.DIAMOND, 'star', 5),
  new RankTier(TierName.MASTER, 'star', 5),
  new RankTier(TierName.GRANDMASTER, 'star', 5),
  new RankTier(TierName.CHALLENGER, 'value', Infinity),
];
