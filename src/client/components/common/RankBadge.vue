<template>
  <div class="rank-badge" :class="{ 'rank-badge--vertical': vertical }">
    <div class="rank-badge__icon">
      <RankTier :rankTier="rankTier" :showNumber="false"/>
    </div>
    <div v-if="showName" class="rank-badge__info">
      <span class="rank-badge__name" :style="nameStyle">{{ $t(rankTier.name) }}</span>
      <span v-if="showStars && rankTier.measurement === 'star'" class="rank-badge__stars">
        {{ rankTier.stars }}/{{ rankTier.maxStars }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RankTier from '@/client/components/RankTier.vue';
import {RankTier as RankTierType} from '@/common/rank/RankTier';
import {getTierColor} from '@/client/utils/rankUtils';

export default Vue.extend({
  name: 'RankBadge',
  components: {
    RankTier,
  },
  props: {
    rankTier: {
      type: Object as () => RankTierType,
      required: true,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    showStars: {
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    tierColor(): string {
      return getTierColor(this.rankTier.name);
    },
    nameStyle(): Record<string, string> {
      return {
        color: this.tierColor,
      };
    },
  },
});
</script>

<style scoped>
.rank-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-badge--vertical {
  flex-direction: column;
  gap: 6px;
}

.rank-badge__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.rank-badge__name {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: monospace;
}

.rank-badge__stars {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}
</style>
