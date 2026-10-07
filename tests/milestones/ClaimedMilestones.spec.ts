import {expect} from 'chai';
import {deserializeClaimedMilestones, serializeClaimedMilestones} from '../../src/server/milestones/ClaimedMilestone';
import {ClaimedMilestone, SerializedClaimedMilestone} from '../../src/server/milestones/ClaimedMilestone';
import {Diversifier} from '../../src/server/milestones/Diversifier';
import {Generalist} from '../../src/server/milestones/Generalist';
import {TestPlayer} from '../TestPlayer';

describe('ClaimedMilestones', () => {
  it('test serialization', () => {
    const bluePlayer = TestPlayer.BLUE.newPlayer();
    const redPlayer = TestPlayer.RED.newPlayer();
    const claimedMilestones: Array<ClaimedMilestone> = [
      {
        milestone: new Diversifier(),
        player: bluePlayer,
      }, {
        milestone: new Generalist(),
        player: redPlayer,
      },
    ];
    const serialized: Array<SerializedClaimedMilestone> = serializeClaimedMilestones(claimedMilestones);
    expect(serialized).to.deep.eq([
      {milestone: {name: 'Diversifier'}, player: {id: 'p-blue-id'}},
      {milestone: {name: 'Generalist'}, player: {id: 'p-red-id'}},
    ]);
    expect(serialized.every((claimedMilestone) => {
      return Object.keys(claimedMilestone).every((key) => key === 'milestone' || key === 'player');
    })).is.true;

    const diversifier = new Diversifier();
    const generalist = new Generalist();
    const deserialized = deserializeClaimedMilestones(
      serialized,
      [redPlayer, bluePlayer],
      [diversifier, generalist]);
    expect(deserialized[0].milestone === diversifier);
    expect(deserialized[0].player === bluePlayer);
    expect(deserialized[1].milestone === generalist);
    expect(deserialized[1].player === redPlayer);
  });
});
