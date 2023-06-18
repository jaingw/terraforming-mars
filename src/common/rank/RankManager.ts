import {TierName} from '../rank/TierName';
import {RankTiers} from '../rank/RankTiers';
import {DEFAULT_TIMEOUT_COMPENSATE, DEFAULT_TIMEOUT_PENALTY} from '../rank/constants';
import {RankTier, challengerStar} from '../rank/RankTier';
import {rate, Rating} from 'ts-trueskill';
const rankValueChangeRules = [
  [1, -1], // 2p
  [1, 0, -1],
  [2, 1, 0, -1],
  [2, 1, 0, -1, -2], // 5p
];

// 用户的排名数据，包含用户ID
export class UserRank {
  constructor(
      public userId: string,
      public rankValue: number,
      public mu: number,
      public sigma: number,
      public trueskill: number = 0,
  ) {}

  public getRankValue() {
    return this.rankValue;
  }

  public setRankValue(rankValue: number) {
    if (rankValue <= 0) rankValue = 0;
    if (rankValue > challengerStar) rankValue = challengerStar;
    this.rankValue = rankValue;
  }


  // 根据玩家人数更新玩家的分数，@param playerNumber: 玩家人数；@param playerPosition 结束游戏时的排位，从0开始
  public getRankValueDeltaByPosition(playerNumber: number, playerPosition: number): number {
    const p = Math.max(playerNumber - 2, 0); // 避免小于0
    const pos = Math.min(playerPosition, rankValueChangeRules[p].length);
    return rankValueChangeRules[p][pos]; // 返回增加/减少的对应分数
  }

  public setRankValueDeltaByPosition(playerNumber: number, playerPosition: number): void {
    const delta = this.getRankValueDeltaByPosition(playerNumber, playerPosition);
    const tier = this.getTier();

    // 暂时hardcode, 前面的段位或者最高段位不降星
    if ((tier.measurement === 'value' || tier.name === TierName.IRON || tier.name === TierName.BRONZE || tier.name === TierName.SILVER) && delta < 0) return;
    this.setRankValue(this.rankValue + delta); // 不低于0
  }

  public setRankValueDeltaByTimeOut(timeOut: boolean): void {
    const delta = timeOut ? DEFAULT_TIMEOUT_PENALTY : DEFAULT_TIMEOUT_COMPENSATE;
    // 如果超时，即便前面的段位也会降星
    this.setRankValue(this.rankValue + delta); // 不低于0
  }

  // 获得对应的段位
  public getTier() {
    let rankValue = this.rankValue;
    for (const rank of RankTiers) {
      if (rank.measurement === 'value') {
        // trueSkill分数的计算方式
        return new RankTier(rank.name, rank.measurement, rank.maxStars, rank.stars, this.trueskill); // 如果按照value，则取tierValue
      } else if (rankValue <= rank.maxStars) { // 如果小于最高星星数，则取对应段位
        return new RankTier(rank.name, rank.measurement, rank.maxStars, rankValue);
      } else { // 如果rankValue > rank.maxStars，则晋级
        rankValue = rankValue - rank.maxStars;
      }
    }

    return new RankTier(RankTiers[0].name, RankTiers[0].measurement, RankTiers[0].maxStars); // default state
  }
}


// 天梯 根据原始排位，给出更新后的排位，@param timeOutUser: 超时玩家自动判负
export function getNewSkills(userRanks: Array<UserRank>, timeOutUser: UserRank | undefined): Array<UserRank> {
  // ts-trueskill 4.0.0之后版本是 ES Module 版本的包，4.0.0之前是CommonJs规范的包
  // const {Rating, rate} = await import('ts-trueskill');
  const playerNumber = userRanks.length;
  const updatedRanks: Array<UserRank> = [];

  if (timeOutUser === undefined) { // 正常情况
    const ratings = userRanks.map((userRank) => [new Rating(userRank.mu, userRank.sigma)]); // Rating[][]
    const updatedRatings = rate(ratings);
    for (let i = 0; i < playerNumber; i++) {
      const userRank = userRanks[i];
      userRank.setRankValueDeltaByPosition(playerNumber, i);
      userRank.mu = updatedRatings[i][0].mu;
      userRank.sigma = updatedRatings[i][0].sigma;
      userRank.trueskill = userRank.mu - 3 * userRank.sigma;
      updatedRanks.push(userRank);
    }
  } else { // 超时情况 不会影响隐藏分，只扣表现分
    for (let i = 0; i < playerNumber; i++) {
      const userRank = userRanks[i];
      userRank.setRankValueDeltaByTimeOut(userRank === timeOutUser);
      updatedRanks.push(userRank);
    }
  }
  return updatedRanks;
}

