import {IAward} from './IAward';
import {IPlayer} from '../IPlayer';
import {SerializedPlayerId} from '../SerializedPlayer';
import {AwardName, maybeRenamedAward} from '../../common/ma/AwardName';

export type FundedAward = {
  award: IAward;
  player: IPlayer;
}

export type SerializedFundedAward = {
  award: IAward;
  player: SerializedPlayerId;
}

export function serializeFundedAwards(fundedAwards: Array<FundedAward>) : Array<SerializedFundedAward> {
  return fundedAwards.map((fundedAward) => {
    return {
      award: {name: fundedAward.award.name} as IAward,
      player: fundedAward.player.serializeId(),
    };
  });
}

export function deserializeFundedAwards(
  fundedAwards: Array<SerializedFundedAward>,
  players: Array<IPlayer>,
  awards: Array<IAward>): Array<FundedAward> {
  const loadedAwards = new Set<AwardName>();
  const filtered: Array<SerializedFundedAward> = [];
  for (const fundedAward of fundedAwards) {
    const awardName = maybeRenamedAward(fundedAward.award.name);
    if (loadedAwards.has(awardName)) {
      console.error('Found duplicate award: ' + awardName);
      continue;
    }
    filtered.push(fundedAward);
    loadedAwards.add(awardName);
  }
  return filtered.map((element: SerializedFundedAward) => {
    const player = players.find((player) => player.id === element.player.id);
    const awardName = maybeRenamedAward(element.award.name);
    const award = awards.find((award) => award.name === awardName);
    if (player && award) {
      return {
        player: player,
        award: award,
      };
    } else {
      throw new Error(`Player ${element.player.id} or Award not found when rebuilding Funded Award ${element.award.name}`);
    }
  });
}
