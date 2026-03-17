<template>
  <div class="ugs-root">
    <!-- Period toggle -->
    <div class="ugs-period-toggle">
      <button :class="['ugs-tab', period === 'allTime' && 'ugs-tab--active']"
        @click="period = 'allTime'">All Time</button>
      <button :class="['ugs-tab', period === 'recent3Months' && 'ugs-tab--active']"
        @click="period = 'recent3Months'">Last 3 Months</button>
    </div>

    <!-- Hero metrics row: Win Rate + Flee Rate -->
    <div class="ugs-hero">
      <div class="ugs-hero__cell">
        <div class="ugs-hero__label" v-i18n>Win Rate</div>
        <div class="ugs-hero__value" :class="activeStats.winRate >= 50 ? 'ugs-hero__value--good' : 'ugs-hero__value--warn'">
          {{ activeStats.winRate }}<span class="ugs-hero__unit">%</span>
        </div>
        <div class="ugs-hero__sub">{{ activeStats.wins }}W / {{ activeStats.losses }}L</div>
      </div>
      <div class="ugs-hero__divider"></div>
      <div class="ugs-hero__cell" :class="{'ugs-hero__cell--danger': activeStats.fleeRate > 10}">
        <div class="ugs-hero__label" v-i18n>Flee Rate</div>
        <div class="ugs-hero__value" :class="fleeRateClass">
          {{ activeStats.fleeRate }}<span class="ugs-hero__unit">%</span>
        </div>
        <div class="ugs-hero__sub" :class="activeStats.fleeRate > 10 ? 'text-red-400/70' : ''">
          {{ activeStats.fleeCount }} <span v-i18n>fled</span> / {{ activeStats.totalGames }} <span v-i18n>total</span>
        </div>
        <div v-if="activeStats.fleeRate > 20" class="ugs-flee-badge">
          <span class="ugs-flee-badge__icon">&#9888;</span>
          <span v-i18n>High flee rate</span>
        </div>
      </div>
    </div>

    <!-- Detailed grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-px bg-mars-border/30">
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Games Played</div>
        <div class="ugs-cell__value">{{ activeStats.totalGames }}</div>
      </div>
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Avg Score</div>
        <div class="ugs-cell__value text-mars-cyan">{{ activeStats.avgScore }}</div>
      </div>
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Avg Position</div>
        <div class="ugs-cell__value">#{{ activeStats.avgPosition }}</div>
      </div>
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Ranked Games</div>
        <div class="ugs-cell__value text-mars-amber">{{ activeStats.totalRankGames }}
          <span class="text-xs text-mars-text-faint ml-1">W:{{ activeStats.rankWins }}</span>
        </div>
      </div>
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Casual Games</div>
        <div class="ugs-cell__value text-mars-text-dim">{{ activeStats.totalGames - activeStats.totalRankGames }}</div>
      </div>
      <div class="ugs-cell">
        <div class="ugs-cell__label" v-i18n>Wins</div>
        <div class="ugs-cell__value text-mars-teal">{{ activeStats.wins }}
          <span class="text-xs text-mars-text-faint ml-1">L:{{ activeStats.losses }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Shared game stats display component.
 *
 * Used by both Me.vue (own profile) and UserProfile.vue (public profile).
 * Accepts the full IUserGameStats shape and handles period toggling internally.
 */
export default Vue.extend({
  name: 'UserGameStats',
  props: {
    /** allTime stats block */
    allTime: {
      type: Object,
      required: true,
    },
    /** recent3Months stats block */
    recent3Months: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      period: 'allTime' as 'allTime' | 'recent3Months',
    };
  },
  computed: {
    activeStats(): any {
      return this.period === 'recent3Months' ? this.recent3Months : this.allTime;
    },
    fleeRateClass(): string {
      const rate = this.activeStats.fleeRate;
      if (rate > 20) return 'ugs-hero__value--critical';
      if (rate > 10) return 'ugs-hero__value--danger';
      if (rate > 5) return 'ugs-hero__value--warn';
      return 'ugs-hero__value--safe';
    },
  },
});
</script>

<style scoped>
/* === Period toggle === */
.ugs-period-toggle {
  display: flex;
  border-bottom: 1px solid rgba(38,48,80,0.5);
}

.ugs-tab {
  flex: 1;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-family: monospace;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.ugs-tab:hover {
  color: #94a3b8;
  background: rgba(226,82,14,0.04);
}

.ugs-tab--active {
  color: #e2520e;
}

.ugs-tab--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #e2520e, #f97316);
}

/* === Hero metrics === */
.ugs-hero {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid rgba(38,48,80,0.5);
}

.ugs-hero__cell {
  flex: 1;
  padding: 20px 16px;
  text-align: center;
  position: relative;
  transition: background 0.3s ease;
}

.ugs-hero__cell--danger {
  background: rgba(239,68,68,0.06);
}

.ugs-hero__divider {
  width: 1px;
  background: rgba(38,48,80,0.5);
}

.ugs-hero__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 8px;
}

.ugs-hero__value {
  font-size: 36px;
  font-weight: 800;
  font-family: monospace;
  line-height: 1;
  margin-bottom: 6px;
}

.ugs-hero__unit {
  font-size: 18px;
  opacity: 0.6;
  margin-left: 1px;
}

.ugs-hero__value--good {
  color: #2dd4bf;
  text-shadow: 0 0 16px rgba(45,212,191,0.3);
}

.ugs-hero__value--warn {
  color: #f59e0b;
  text-shadow: 0 0 12px rgba(245,158,11,0.25);
}

.ugs-hero__value--safe {
  color: #94a3b8;
}

.ugs-hero__value--danger {
  color: #f87171;
  text-shadow: 0 0 14px rgba(248,113,113,0.3);
  animation: ugsFleeGlow 2.5s ease-in-out infinite;
}

.ugs-hero__value--critical {
  color: #ef4444;
  text-shadow: 0 0 20px rgba(239,68,68,0.5);
  animation: ugsFleePulse 1.5s ease-in-out infinite;
}

@keyframes ugsFleeGlow {
  0%, 100% { text-shadow: 0 0 14px rgba(248,113,113,0.3); }
  50% { text-shadow: 0 0 24px rgba(248,113,113,0.5); }
}

@keyframes ugsFleePulse {
  0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.5); transform: scale(1); }
  50% { text-shadow: 0 0 30px rgba(239,68,68,0.7); transform: scale(1.03); }
}

.ugs-hero__sub {
  font-size: 11px;
  font-family: monospace;
  color: #64748b;
  letter-spacing: 0.05em;
}

.ugs-flee-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 3px 10px;
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 2px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #ef4444;
  font-family: monospace;
  animation: ugsWarnBlink 3s ease-in-out infinite;
}

@keyframes ugsWarnBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ugs-flee-badge__icon {
  font-size: 12px;
}

/* === Grid cells === */
.ugs-cell {
  background: rgba(17,26,46,0.95);
  padding: 14px 12px;
  text-align: center;
}

.ugs-cell__label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 6px;
}

.ugs-cell__value {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  color: #e2e8f0;
}

/* === Mobile === */
@media (max-width: 640px) {
  .ugs-hero__cell {
    padding: 14px 10px;
  }

  .ugs-hero__value {
    font-size: 28px;
  }

  .ugs-hero__unit {
    font-size: 14px;
  }

  .ugs-cell {
    padding: 10px 8px;
  }

  .ugs-cell__value {
    font-size: 15px;
  }

  .ugs-cell__label {
    font-size: 9px;
  }
}
</style>
