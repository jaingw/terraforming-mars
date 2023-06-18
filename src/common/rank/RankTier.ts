// 段位
import {RankTiers} from '../rank/RankTiers';
import {TierName} from '../rank/TierName';

export class RankTier {
  constructor(
        public name: TierName,
        public measurement: 'star' | 'value', // 展示方式为星星或者数字
        public maxStars: number,
        public stars: number = 0,
        public value: number = 0,
  ) {
  }
}

// 返回CHALLENGER需要的星星数量  33
function getChallengerValue(): number {
  let res = 1; // 晋级需要+1
  RankTiers.filter((rankTier) => rankTier.name !== TierName.CHALLENGER).forEach((rankTier) => res += rankTier.maxStars);
  return res;
}


export const challengerStar = getChallengerValue();
