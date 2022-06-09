import {IAward} from './IAward';
import {Player} from '../Player';
import {SerializedPlayerId} from '../SerializedPlayer';

export interface FundedAward {
  award: IAward;
  player: Player;
}

// export interface SerializedFundedAward {
export interface SerializedFundedAward {
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
    if (element.award.name === 'DesertSettler') {
      element.award.name = 'Desert Settler';
    }
    if (element.award.name === 'EstateDealer') {
      element.award.name = 'Estate Dealer';
    }
    if (element.award.name === 'Entrepeneur') {
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
      // eslint-disable-next-line no-throw-literal
      throw 'Player or Award not found when rebuilding Claimed Award'+ element.award.name;
    }
  });
}
