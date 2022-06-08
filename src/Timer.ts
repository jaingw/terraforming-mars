import {SerializedTimer} from './SerializedTimer';

export class Clock {
  public now(): number {
    return Date.now();
  }
}
const REAL_CLOCK = new Clock();
export class Timer {
  // lastStoppedAt 虽然是个全局变量  理解成临时变量比较好， 每一个值的生效时间很短， 只在结束行动--开始行动之间  以及回退重新加载数据库时，其余时间这个值可以认为没有意义
  // 结束回合时这个值会被立即保存入库， 有较小的并发bug的可能 ， 比如 对局1玩家A结束行动计时 设置stop值， 对局2重载数据，  对局1玩家B开始行动计时
  private static lastStoppedAt: number = 0; // When was last time any Timer.stop() called

  private sumElapsed: number = 0; // Sum of elapsed closed time intervals
  private startedAt: number = 0; // When was current time interval started
  private running: boolean = false; // Is the timer currently running
  private afterFirstAction: boolean = false; // Are we already after first action (First action time measure is currently skipped.)

  private constructor(private clock: Clock) { }

  public static newInstance(clock: Clock = REAL_CLOCK): Timer {
    return new Timer(clock);
  }

  public toJSON() {
    return this.serialize();
  }

  public serialize(): SerializedTimer {
    return {
      sumElapsed: this.sumElapsed,
      startedAt: this.startedAt,
      running: this.running,
      afterFirstAction: this.afterFirstAction,
      lastStoppedAt: Timer.lastStoppedAt,
    };
  }

  public static deserialize(d: SerializedTimer | undefined): Timer {
    const timer = new Timer(REAL_CLOCK);
    if (d !== undefined) {
      timer.sumElapsed = d.sumElapsed || 0;
      timer.startedAt = d.startedAt || 0;
      timer.running = d.running || false;
      timer.afterFirstAction = d.afterFirstAction || false;

      Timer.lastStoppedAt = d.lastStoppedAt || 0;
    }
    return timer;
  }

  // start() is always called when the game is waiting for a player to supply input.
  public start() : void {
    this.running = true;
    // Timer is starting when previous timer was stopped. Normally it does not make any difference,
    // but this way undoing actions does not undo the timers.
    this.startedAt = Timer.lastStoppedAt === 0 ? this.clock.now() : Timer.lastStoppedAt;
  }

  // stop() is called immediately when player performs new input action.
  public stop() : void {
    this.running = false;
    Timer.lastStoppedAt = this.clock.now();
    if (!this.afterFirstAction) { // Skipping timer for first move in game
      this.afterFirstAction = true;
      return;
    }
    this.sumElapsed += Timer.lastStoppedAt - this.startedAt;
  }

  public getElapsed(): number {
    return this.sumElapsed + (this.running ? this.clock.now() - this.startedAt : 0);
  }

  public getElapsedTimeInMinutes(): number {
    const elapsedTimeInMin = this.getElapsed() / (60 * 1000);
    return elapsedTimeInMin;
  }

  // Converts Timer to [hhh:]mm:ss format based on current time. Used to display the timer.
  public static toString(d: SerializedTimer, clock: Clock = REAL_CLOCK) : string {
    const elapsed = d.sumElapsed + (d.running ? clock.now() - d.startedAt : 0);
    const elapsedDate = new Date(elapsed);
    const hours = elapsedDate.getUTCHours() + (elapsedDate.getUTCDate() - 1) * 24;
    if (hours > 0) {
      return String(hours) + elapsedDate.toISOString().substr(13, 6);
    }
    return elapsedDate.toISOString().substr(14, 5);
  }
}

