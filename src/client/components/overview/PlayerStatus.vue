<template>
      <div class="player-status" v-on:click="changeDisplay">
        <div class="player-status-bottom">
          <div :class="getLabelAndTimerClasses()">
            <div :class="getActionStatusClasses()"><span v-i18n>{{ actionLabel }}</span></div>
            <div class="player-status-timer" v-if="showTimer && display==='timer'"><player-timer :timer="timer" :live="liveTimer" :player-id="playerId" :rank-mode="rankMode" :finalRankTimeLimit="finalRankTimeLimit"/></div>
            <RankTier v-if="display==='tier'" :rankTier="rankTier" :showNumber="false" class="ml-2"/>
          </div>
        </div>
      </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {ActionLabel} from '@/client/components/overview/ActionLabel';
import PlayerTimer from '@/client/components/overview/PlayerTimer.vue';
import {TimerModel} from '@/common/models/TimerModel';
import RankTier from '@/client/components/RankTier.vue';

export default Vue.extend({
  name: 'player-status',
  props: {
    timer: {
      type: Object as () => TimerModel,
    },
    actionLabel: {
      type: String,
    },
    showTimer: {
      type: Boolean,
    },
    liveTimer: {
      type: Boolean,
    },
    rankTier: {
      type: Object,
    },
    playerId: {
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
      display: 'timer',
    };
  },
  components: {
    PlayerTimer,
    RankTier,
  },
  methods: {
    getLabelAndTimerClasses(): string {
      const classes = [];
      const baseClass = 'player-action-status-container';
      classes.push(baseClass);
      if (!this.showTimer) {
        classes.push('no-timer');
      }
      if (this.rankTier!==undefined) {
        classes.push('player-action-status-container-rank');
      }
      if (this.actionLabel === ActionLabel.PASSED || this.actionLabel === ActionLabel.RESIGNED) {
        classes.push(`${baseClass}--passed`);
      } else if (this.actionLabel === ActionLabel.ACTIVE || this.actionLabel === ActionLabel.DRAFTING || this.actionLabel === ActionLabel.RESEARCHING) {
        classes.push(`${baseClass}--active`);
      }
      return classes.join(' ');
    },
    getActionStatusClasses(): string {
      const classes: Array<string> = ['player-action-status'];
      if (this.actionLabel === ActionLabel.NONE) {
        classes.push('visibility-hidden');
      }
      return classes.join(' ');
    },
    changeDisplay(): void {
      if (this.display==='timer' && this.rankTier!==undefined) this.display = 'tier';
      else this.display = 'timer';
      console.log(this.rankTier);
    },
  },
});

</script>

