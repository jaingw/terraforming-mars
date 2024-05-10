<template>
  <div class="player-timer" v-bind:class="timeState">
    <template v-if="hasHours()">
        <div class="player-timer-hours">{{ getHours() }}</div>
        <div class="timer-delimiter">:</div>
    </template>
    <div class="player-timer-minutes">{{ getMinutes() }}</div>
    <div class="timer-delimiter">:</div>
    <div class="player-timer-seconds">{{ getSeconds() }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Timer} from '@/common/Timer';
import {TimerModel} from '@/common/models/TimerModel';
// import {PreferencesManager} from '@/client/utils/PreferencesManager';

export default Vue.extend({
  name: 'PlayerTimer',
  props: {
    timer: {
      type: Object as () => TimerModel,
    },
    live: {
      type: Boolean,
    },
    playerId: { // identify for each player
      type: String,
    },
    rankMode: { // 天梯 是否是排位模式
      type: Boolean,
    },
    finalRankTimeLimit: { // 天梯 限时 单位为分钟
      type: String,
    },
  },
  data() {
    return {
      finalRankTimeLimitMinute: Number(this.finalRankTimeLimit),
      timerText: '',
      timeState: '', // 显示倒计时颜色
    };
  },
  mounted() {
    this.updateTimer();
  },
  watch: {
    timerText: {
      handler() {
        if (this.live) {
          setTimeout(() => {
            this.updateTimer();
          }, 1000);
        }
      },
    },
  },
  methods: {
    updateTimer() {
      // 排名模式 启动倒计时
      if (this.rankMode) {
        this.timerText = Timer.toString(this.timer, this.finalRankTimeLimitMinute);
        if (Timer.getMinutes(this.timer, this.finalRankTimeLimitMinute) <= 5) { // 剩余时间小于5分钟，显示红色时间
          this.timeState = 'text-red-500';
        } else if (Timer.getMinutes(this.timer, this.finalRankTimeLimitMinute) <= 15) { // 剩余时间小于15分钟，显示橙色时间
          this.timeState = 'text-orange-500';
        } else if (Timer.getMinutes(this.timer, this.finalRankTimeLimitMinute) <= 30) { // 剩余时间小于30分钟，显示黄色时间
          this.timeState = 'text-yellow-600';
        }
      } else {
        this.timerText = Timer.toString(this.timer);
      }
    },
    hasHours() {
      if (this.timerText.split(':').length > 2) {
        return 1;
      }
      return 0;
    },
    getHours(): string {
      if (this.hasHours()) {
        return this.timerText.split(':')[0];
      }
      return '';
    },
    getMinutes(): string {
      if (this.hasHours()) {
        return this.timerText.split(':')[1];
      }
      return this.timerText.split(':')[0];
    },
    getSeconds(): string {
      if (this.hasHours()) {
        return this.timerText.split(':')[2];
      }
      return this.timerText.split(':')[1];
    },
  },
});
</script>
