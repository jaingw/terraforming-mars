<template>
  <div class="user-info flex items-center gap-3">
    <!-- Avatar -->
    <div class="user-info__avatar flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold uppercase"
      :style="avatarStyle"
    >
      {{ avatarLetter }}
    </div>

    <!-- Info -->
    <div class="user-info__details flex-1 min-w-0">
      <!-- Name + Rank row -->
      <div class="flex items-center gap-2">
        <span class="user-info__name text-sm font-semibold text-mars-text truncate">{{ name }}</span>
        <span v-if="rankTier" class="user-info__rank flex-shrink-0">
          <RankTier :rankTier="rankTier" :showNumber="false" />
        </span>
      </div>

      <!-- Rank name -->
      <div v-if="rankTier" class="text-xs text-mars-text-faint uppercase tracking-wider font-mono mt-0.5">
        {{ rankTier.name }}
      </div>

      <!-- Stats row (only shown when data available) -->
      <div v-if="winRate !== undefined || fleeRate !== undefined" class="flex items-center gap-3 mt-1">
        <div class="flex items-center gap-1">
          <span class="text-xs text-mars-text-faint font-mono uppercase tracking-wider" v-i18n>Win</span>
          <span class="text-xs font-mono font-semibold" :class="winRateClass">{{ winRateDisplay }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs text-mars-text-faint font-mono uppercase tracking-wider" v-i18n>Flee</span>
          <span class="text-xs font-mono font-semibold" :class="fleeRateClass">{{ fleeRateDisplay }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {RankTier} from '@/common/rank/RankTier';
import RankTierComponent from '@/client/components/RankTier.vue';

export default Vue.extend({
  name: 'UserInfo',
  components: {
    RankTier: RankTierComponent,
  },
  props: {
    /** User display name */
    name: {
      type: String,
      required: true,
    },
    /** Optional RankTier object for rank display */
    rankTier: {
      type: Object as () => RankTier | null,
      default: null,
    },
    /** Recent win rate as percentage (0-100). Undefined if not available. */
    winRate: {
      type: Number,
      default: undefined,
    },
    /** Escape/flee rate as percentage (0-100). Undefined if not available. */
    fleeRate: {
      type: Number,
      default: undefined,
    },
    /** Custom avatar color. Defaults to mars-rust. */
    avatarColor: {
      type: String,
      default: '',
    },
  },
  computed: {
    avatarLetter(): string {
      return this.name ? this.name.charAt(0).toUpperCase() : '?';
    },
    avatarStyle(): Record<string, string> {
      const bg = this.avatarColor || '#c2410c';
      return {
        background: `linear-gradient(135deg, ${bg}, ${bg}88)`,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      };
    },
    winRateDisplay(): string {
      if (this.winRate === undefined) return '--';
      return this.winRate.toFixed(1) + '%';
    },
    fleeRateDisplay(): string {
      if (this.fleeRate === undefined) return '--';
      return this.fleeRate.toFixed(1) + '%';
    },
    winRateClass(): string {
      if (this.winRate === undefined) return 'text-mars-text-dim';
      if (this.winRate >= 50) return 'text-mars-teal';
      if (this.winRate >= 30) return 'text-mars-text-dim';
      return 'text-mars-red';
    },
    fleeRateClass(): string {
      if (this.fleeRate === undefined) return 'text-mars-text-dim';
      if (this.fleeRate <= 5) return 'text-mars-teal';
      if (this.fleeRate <= 15) return 'text-mars-yellow';
      return 'text-mars-red';
    },
  },
});
</script>
