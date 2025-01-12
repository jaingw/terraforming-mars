<template>
  <div class="div-card-content" v-i18n >
    <CardTitle :title="card.name" :type="getCardType()"/>
    <CardContent v-if="getCardMetadata() !== undefined" :metadata="getCardMetadata()" :requirements="getCardRequirements()" :isCorporation="isCorporationCard()"/>
 </div>
</template>

<script lang="ts">

import Vue from 'vue';

import {CardModel} from '@/common/models/CardModel';
import CardTitle from './CardTitle.vue';
import {CardType} from '@/common/cards/CardType';
import CardContent from './CardContent.vue';
import {CardMetadata} from '@/common/cards/CardMetadata';
import {CardResource} from '@/common/CardResource';
import {getCardOrThrow} from '@/client/cards/ClientCardManifest';
import {CardRequirementDescriptor} from '../../../common/cards/CardRequirementDescriptor';

export default Vue.extend({
  name: 'CardHTML',
  components: {
    CardTitle,
    CardContent,
  },
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
    robotCard: {
      type: Object as () => CardModel | undefined,
      required: false,
    },
  },
  data() {
    const cardName = this.card.name;

    const card = getCardOrThrow(cardName);

    return {
      cardInstance: card,
    };
  },
  methods: {
    getCardType(): CardType {
      return this.cardInstance.type;
    },
    getCardMetadata(): CardMetadata {
      return this.cardInstance.metadata;
    },
    getCardRequirements(): Array<CardRequirementDescriptor> {
      return this.cardInstance.requirements;
    },
    isCorporationCard() : boolean {
      return this.getCardType() === CardType.CORPORATION;
    },
  },
  computed: {
    resourceType(): CardResource {
      if (this.robotCard !== undefined || this.card.isSelfReplicatingRobotsCard === true) return CardResource.RESOURCE_CUBE;
      // This last RESOURCE_CUBE is functionally unnecessary and serves to satisfy the type contract.
      return this.cardInstance.resourceType ?? CardResource.RESOURCE_CUBE;
    },
  },
});

</script>
