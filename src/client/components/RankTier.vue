<template>
  <div class='tier-container' v-i18n>
    <div :class="'tooltip tooltip-top tier-type tier-' + tierData().name" :data-tooltip="$t(tierData().name)"></div>
    <div class='tier-meta stars-container' v-if="tierData().measurement==='star' && showNumberFalse()">
      <span v-for="index in tierData().stars" :key="'light'+index" class='tier-star star-light'></span>
      <span v-for="index in (tierData().maxStars-tierData().stars)" :key="'dark'+index" class='tier-star star-dark'></span>
    </div>
    <div class='tier-meta star-value-container' v-if="tierData().measurement==='star' && showNumberTrue()">{{ tierData().stars }}</div>
    <div class='tier-meta rank-value-container' v-if="tierData().measurement==='value'">{{ displayRankValue }}</div>
  </div>
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue';
import {RankTier} from '../../common/rank/RankTier';

export default defineComponent({
  name: 'RankTier',
  props: {
    rankTier: {
      type: Object as PropType<RankTier>,
      required: true,
    },
    showNumber: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    tierData(): RankTier {
      return this.rankTier as RankTier;
    },
    showNumberFalse(): boolean {
      return !this.showNumber;
    },
    showNumberTrue(): boolean {
      return !!this.showNumber;
    },
  },
  computed: {
    displayRankValue(): number {
      const val = this.rankTier?.value;
      if (val === undefined || val === null) {
        return 0;
      }
      return Math.round(val * 100);
    },
  },
});

</script>
