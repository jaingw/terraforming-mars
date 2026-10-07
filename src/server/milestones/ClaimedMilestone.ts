
import {IPlayer} from '../IPlayer';
import {IMilestone} from './IMilestone';
import {SerializedPlayerId} from '../SerializedPlayer';
import {MilestoneName, maybeRenamedMilestone} from '../../common/ma/MilestoneName';

export type ClaimedMilestone = {
  milestone: IMilestone;
  player: IPlayer;
}

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
  players: Array<IPlayer>,
  milestones: Array<IMilestone>): Array<ClaimedMilestone> {
  const loadedMilestones = new Set<MilestoneName>();
  const filtered: Array<SerializedClaimedMilestone> = [];
  for (const claimedMilestone of claimedMilestones) {
    const milestoneName = maybeRenamedMilestone(claimedMilestone.milestone.name);
    if (loadedMilestones.has(milestoneName)) {
      console.error('Found duplicate milestone: ' + milestoneName);
      continue;
    }
    filtered.push(claimedMilestone);
    loadedMilestones.add(milestoneName);
  }
  return filtered.map((element: SerializedClaimedMilestone) => {
    const milestoneName = maybeRenamedMilestone(element.milestone.name);
    const player = players.find((player) => player.id === element.player.id);
    const milestone = milestones.find((milestone) => milestone.name === milestoneName);
    if (player && milestone) {
      return {player, milestone};
    } else {
      throw new Error('Player or Milestone not found when rebuilding Claimed Milestone' + element.milestone.name);
    }
  });
}
