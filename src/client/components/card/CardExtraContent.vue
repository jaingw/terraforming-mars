<template>
   <div class="card-extra-content-container">
      <div v-if="lifeFound()" class="little-green-men" />
      <div v-if="isMiningTileOnSteel()" class="mined-metal mined-steel" />
      <div v-if="isMiningTileOnTitanium()" class="mined-metal mined-titanium" />
      <div v-if="awardCards(card)" :class="awardClass(card)" />
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {Resources} from '@/common/Resources';

export default Vue.extend({
  name: 'CardExtraContent',
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
  },
  methods: {
    isMiningTileOnSteel() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resources.STEEL);
    },
    isMiningTileOnTitanium() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resources.TITANIUM);
    },
    lifeFound() {
      return this.card.name === CardName.SEARCH_FOR_LIFE && this.card.resources !== undefined && this.card.resources > 0;
    },
    awardCards: function(card: CardModel): boolean {
      return card.name === CardName.STARCORE_MINING || card.name === CardName.EM_DRIVE;
    },
    awardClass: function(card: CardModel): string {
      if (card.name === CardName.STARCORE_MINING) {
        return 'naming-award  naming-award-starcore';
      }
      if (card.name === CardName.EM_DRIVE) {
        return 'naming-award  naming-award-emdrive';
      }
      return '';
    },
  },
});

</script>

