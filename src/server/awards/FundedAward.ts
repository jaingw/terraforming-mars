import {IAward} from './IAward';
import {Player} from '../Player';
import {SerializedPlayerId} from '../SerializedPlayer';
import {AwardName} from '../../common/ma/AwardName';

export type FundedAward = {
  award: IAward;
  player: Player;
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
  players: Array<Player>,
  awards: Array<IAward>): Array<FundedAward> {
  return fundedAwards.map((element: SerializedFundedAward) => {
    // Rebuild funded awards
    if (element.award.name === 'DesertSettler' as AwardName) {
      element.award.name = 'Desert Settler';
    }
    if (element.award.name === 'EstateDealer' as AwardName) {
      element.award.name = 'Estate Dealer';
    }
    if (element.award.name === 'Entrepeneur' as AwardName) {
      element.award.name = 'Entrepreneur';
    }
    const player = players.find((player) => player.id === element.player.id);
    const award = awards.find((award) => award.name === element.award.name);
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
