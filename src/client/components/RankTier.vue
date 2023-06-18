<template>
  <div class='relative tier-container w-32' v-i18n>
  <div :class="'absolute left-0 tooltip tooltip-top tier-type tier-' + this.rankTier.name" :data-tooltip="$t(this.rankTier.name)"></div>
    <div class='absolute left-10 stars-container' v-if="this.rankTier.measurement==='star' && (this.showNumber===false || this.showNumber===undefined)">
      <span v-for="index in this.rankTier.stars" :key="'light'+index" class='tier-star star-light'></span>
      <span v-for="index in (this.rankTier.maxStars-this.rankTier.stars)" :key="'dark'+index" class='tier-star star-dark'></span>
    </div>
    <div class='absolute left-10 star-value-container' v-if="this.rankTier.measurement==='star' && this.showNumber===true">{{ this.rankTier.stars }}</div>
    <div class='absolute left-10 rank-value-container' v-if="this.rankTier.measurement==='value'">{{ displayRankValue }}</div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {RankTier} from '../../common/rank/RankTier';

export default Vue.extend({
  name: 'RankTier',
  props: {
    rankTier: {
      type: Object as () => RankTier,
    },
    showNumber: {
      type: Boolean,
    },
    // hideZeroTags: {
    //   type: Boolean,
    // },
    // isTopBar: {
    //   type: Boolean,
    //   default: false,
    // },
    // conciseTagsViewDefaultValue: {
    //   type: Boolean,
    //   required: false,
    //   default: true,
    // },
  },
  data() {
    return {
      displayRankValue: Math.round(this.rankTier?.value * 100 | 0), // 乘100，看起来刺激一点
    };
  },
});

</script>
