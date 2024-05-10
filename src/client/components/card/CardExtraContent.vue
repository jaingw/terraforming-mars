<template>
   <div class="card-extra-content-container">
      <div v-if="lifeFound()" class="little-green-men" />
      <div v-if="isMiningTileOnSteel()" class="mined-metal mined-steel" />
      <div v-if="isMiningTileOnTitanium()" class="mined-metal mined-titanium" />
      <div v-if="awardCards(card)" :class="awardClass(card)" />
      <div v-if="isRulingPolicy(card)" class="card-extra-ruling-policy" >
        <div class="dominant-party-name">
          <div :class="'party-name party-name--'+partyNameToCss(card)" v-i18n>{{ card.data }}</div>
        </div>
        <agendas type="dominant-bonus" :id="getPolicy(card)"></agendas>
      </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {Resource} from '@/common/Resource';
import {PartyName} from '@/common/turmoil/PartyName';
import {MARS_FIRST_POLICY_1} from '@/server/turmoil/parties/MarsFirst';
import {SCIENTISTS_POLICY_1} from '@/server/turmoil/parties/Scientists';
import {UNITY_POLICY_1} from '@/server/turmoil/parties/Unity';
import {KELVINISTS_POLICY_1} from '@/server/turmoil/parties/Kelvinists';
import {REDS_POLICY_1} from '@/server/turmoil/parties/Reds';
import {GREENS_POLICY_1} from '@/server/turmoil/parties/Greens';
import Agendas from '@/client/components/turmoil/Agendas.vue';


export default Vue.extend({
  name: 'CardExtraContent',
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
  },
  components: {
    'agendas': Agendas,
  },
  methods: {
    isMiningTileOnSteel() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resource.STEEL);
    },
    isMiningTileOnTitanium() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resource.TITANIUM);
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
    isRulingPolicy: function(card: CardModel): boolean {
      return card.name === CardName.POLITICALREFORM && card.data !== undefined;
    },
    getPolicy: function(card: CardModel) {
      const data = card.data;
      if (data !== undefined) {
        switch (data) {
        case PartyName.MARS:
          return MARS_FIRST_POLICY_1.id;
        case PartyName.SCIENTISTS:
          return SCIENTISTS_POLICY_1.id;
        case PartyName.UNITY:
          return UNITY_POLICY_1.id;
        case PartyName.KELVINISTS:
          return KELVINISTS_POLICY_1.id;
        case PartyName.REDS:
          return REDS_POLICY_1.id;
        case PartyName.GREENS:
          return GREENS_POLICY_1.id;
        }
      }
      return undefined;
    },
    partyNameToCss(card: CardModel): string {
      if (card === undefined || card.data === undefined) {
        console.warn('no party provided');
        return '';
      }
      return (card.data as string).toLowerCase().split(' ').join('_');
    },
  },
});

</script>

