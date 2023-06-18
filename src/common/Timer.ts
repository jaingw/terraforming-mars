import {SerializedTimer} from './SerializedTimer';

export class Clock {
  public now(): number {
    return Date.now();
  }
}
const REAL_CLOCK = new Clock();
export class Timer {
  // lastStoppedAt 虽然是个全局变量  理解成临时变量比较好， 每一个值的生效时间很短， 只在结束行动--开始行动之间  以及回退重新加载数据库时，其余时间这个值可以认为没有意义
  // 结束回合时这个值会被立即保存入库， 有较小的并发bug的可能 ， 比如 对局1玩家A结束行动计时 设置stop值， 对局2重载数据，  对局1玩家B开始行动计时，玩家B可以设置成对局2重载的值
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

      // Should this be `Math.max(Timer.lastStoppedAt, d.lastStoppedAt)`?
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
  public static toString(d: SerializedTimer, countDown: number = 0, clock: Clock = REAL_CLOCK) : string {
    let elapsed = d.sumElapsed + (d.running ? clock.now() - d.startedAt : 0);
    if (countDown > 0) elapsed = Math.max(countDown * 60 * 1000 - elapsed, 0); // 天梯 TODO: 考虑是否显示负数
    const elapsedDate = new Date(elapsed);
    if (elapsed >= 3600 * 1000) {
      return elapsedDate.toISOString().substr(11, 8);
    }
    return elapsedDate.toISOString().substr(14, 5);
  }

  // 获取分钟数 可以通过countDown设置倒计时
  public static getMinutes(d: SerializedTimer, countDown: number = 0, clock: Clock = REAL_CLOCK) : number {
    let elapsed = d.sumElapsed + (d.running ? clock.now() - d.startedAt : 0);
    if (countDown > 0) elapsed = countDown * 60 * 1000 - elapsed;

    return Math.max(elapsed / (60 * 1000), 0);
  }
}

