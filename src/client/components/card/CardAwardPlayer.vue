<template>
     <div v-if="isAwardCards(name)" :class="awardClass" :style="awardStyle(name)">
     <span class="award-name">{{ awardName(name)}}</span>
     </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardName} from '@/common/cards/CardName';

type IAward = {
  name: string;
  top?: number;
  left?: number;
}
const awardMapping: Map<CardName, IAward> = new Map<CardName, IAward>([
  [CardName.STARCORE_MINING, {name: '钝钝'}],
  [CardName.EM_DRIVE, {name: 'ddxy'}],
  [CardName.INCITE_ENDER, {name: 'Ender', top: 6, left: 80}],
  [CardName.CHAOS, {name: '天使', top: 6, left: -26}],
  [CardName.TRADE_NAVIGATOR, {name: '霞', top: 68, left: 123}],
  [CardName.BROTHERHOOD_OF_MUTANTS, {name: 'ddxy', top: 68, left: 123}],
  [CardName.SPACE_MONSTER_PARK, {name: '半仙', top: 257, left: 59}],
  [CardName.ENERGY_STATION, {name: '霞', top: 62, left: 151}],
  [CardName.LUNA_CHAIN, {name: '明月', top: 68, left: 123}],
  [CardName.WG_PARTNERSHIP, {name: '囧囧', top: 223, left: 61}],
]);


export default Vue.extend({
  name: 'CardAwardPlayer',
  props: {
    name: {
      type: String as () => CardName,
      required: true,
    },
  },
  methods: {
    isAwardCards: function(name: CardName): boolean {
      return awardMapping.has(name);
    },
    awardName: function(name: CardName): string {
      return awardMapping.get(name)?.name || '';
    },
    awardStyle: function(name: CardName): {top?: string, left?: string} {
      const award = awardMapping.get(name);
      const styleObj: {top?: string, left?: string} = {};
      if (award?.top !== undefined) styleObj.top = `${award.top}px`;
      if (award?.left !== undefined) styleObj.left = `${award.left}px`;
      return styleObj;
    },
  },
  computed: {
    awardClass(): string {
      return 'naming-award  naming-award-blank';
    },
  },
});

</script>

