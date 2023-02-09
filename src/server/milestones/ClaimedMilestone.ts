
import {Player} from '../Player';
import {IMilestone} from './IMilestone';
import {SerializedPlayerId} from '../SerializedPlayer';
import {MilestoneName} from '../../common/ma/MilestoneName';

export type ClaimedMilestone = {
  milestone: IMilestone;
  player: Player;
}

// export interface SerializedClaimedMilestone {
export type SerializedClaimedMilestone = {
  milestone: IMilestone;
  player: SerializedPlayerId;
}

export function serializeClaimedMilestones(claimedMilestones: Array<ClaimedMilestone>) : Array<SerializedClaimedMilestone> {
  return claimedMilestones.map((claimedMilestone) => {
    return {
      milestone: {name: claimedMilestone.milestone.name} as IMilestone,
      player: claimedMilestone.player.serializeId(),
    };
  });
}

export function deserializeClaimedMilestones(
  claimedMilestones: Array<SerializedClaimedMilestone>,
  players: Array<Player>,
  milestones: Array<IMilestone>): Array<ClaimedMilestone> {
  return claimedMilestones.map((element: SerializedClaimedMilestone) => {
    if (element.milestone.name === 'Tactitian' as MilestoneName) {
      element.milestone.name = 'Tactician';
    }
    const player = players.find((player) => player.id === element.player.id);
    const milestone = milestones.find((milestone) => milestone.name === element.milestone.name);
    if (player && milestone) {
      return {player, milestone};
    } else {
      throw new Error('Player or Milestone not found when rebuilding Claimed Milestone'+ element.milestone.name);
    }
  });
}
