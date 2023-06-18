import {expect} from 'chai';
import {TestPlayer} from './TestPlayer';
import {Game} from '../src/server/Game';
import {Timer} from '../src/common/Timer';
import {FakeClock} from './common/FakeClock';
import {getTestPlayer, testGame} from './TestGame';

let game: Game;
let player: TestPlayer;
let clock: FakeClock;
let timer: Timer;

describe('RankTimeLimit', function() {
  beforeEach(() => {
    [game] = testGame(1, {
      rankOption: true,
      rankTimeLimit: 20,
      rankTimePerGeneration: 10,
    });
    player = getTestPlayer(game, 0);
    (Timer as any).lastStoppedAt = 0;
    clock = new FakeClock();
    timer = Timer.newInstance(clock);
    player.timer = timer;

    // Trigger a vestigial start/stop pair to actually start/stop.
    timer.start();
    timer.stop();
  });

  it('sanity test', function() {
    timer.start();

    expect(game.checkTimeOutPlayer()).eq(undefined);

    game.generation = 1;
    clock.millis = 20 * 60 * 1000; // 一时代正好20分钟

    expect(player.timer.getElapsedTimeInMinutes()).eq(20);
    expect(game.checkTimeOutPlayer()).eq(player);

    clock.millis -= 1 * 1000; // 减1秒
    expect(game.checkTimeOutPlayer()).eq(undefined);
    expect(game.shouldGoToTimeOutPhase()).eq(false);

    game.generation = 5;
    clock.millis += 4 * 10 * 60 * 1000; // 差1秒到60分钟
    expect(game.checkTimeOutPlayer()).eq(undefined);

    clock.millis += 1000;
    expect(player.timer.getElapsedTimeInMinutes()).eq(60);
    expect(game.checkTimeOutPlayer()).eq(player);

    expect(game.shouldGoToTimeOutPhase()).eq(true);
  });
});
