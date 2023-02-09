import {expect} from 'chai';
import {SimpleDeferredAction} from '../../src/server/deferredActions/DeferredAction';
import {DeferredActionsQueue} from '../../src/server/deferredActions/DeferredActionsQueue';
import {TestPlayer} from '../TestPlayer';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {setCustomGameOptions} from '../TestingUtils';
import {Game} from '../../src/server/Game';

describe('DeferredActionsQueue', () => {
  it('runs actions for player', () => {
    const redPlayer = TestPlayer.RED.newPlayer();
    const bluePlayer = TestPlayer.BLUE.newPlayer();
    Game.newInstance('gid', [redPlayer], redPlayer, setCustomGameOptions({}));
    const queue = new DeferredActionsQueue();
    const expectedInput = new SelectOption('foo', 'bar', () => undefined);
    queue.push(new SimpleDeferredAction(redPlayer, () => expectedInput));
    queue.push(new SimpleDeferredAction(bluePlayer, () => undefined));
    let finished = false;
    expect(queue.length).eq(2);
    queue.runAllFor(redPlayer, () => {
      finished = true;
    });
    expect(redPlayer.getWaitingFor()).eq(expectedInput);
    redPlayer.process({type: 'option'});
    expect(redPlayer.getWaitingFor()).eq(undefined);
    expect(finished).eq(true);
    expect(queue.length).eq(1);
  });
});
