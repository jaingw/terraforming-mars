<template>
  <div v-i18n class="card-content" :class="corporationClass">
    <CardRequirementsComponent v-if="requirements !== undefined && requirements.length > 0" :requirements="requirements"/>
    <CardRenderData v-if="metadata.renderData" :renderData="metadata.renderData" />
    <CardDescription v-if="hasDescription" :item="metadata.description"/>
    <CardVictoryPoints v-if="metadata.victoryPoints" :victoryPoints="metadata.victoryPoints" />
    <div class="padBottom" v-if="padBottom" style="padding-bottom: 22px;"></div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {CardMetadata} from '@/common/cards/CardMetadata';
import CardRequirementsComponent from './CardRequirementsComponent.vue';
import CardVictoryPoints from './CardVictoryPoints.vue';
import CardDescription from './CardDescription.vue';
import CardRenderData from './CardRenderData.vue';
import {CardRequirementDescriptor} from '@/common/cards/CardRequirementDescriptor';

export default defineComponent({
  name: 'CardContent',
  props: {
    metadata: {
      type: Object as () => CardMetadata,
      required: true,
    },
    requirements: {
      type: Array as () => ReadonlyArray<CardRequirementDescriptor>,
      required: false,
    },
    isCorporation: {
      type: Boolean,
      required: true,
    },
    padBottom: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    CardRequirementsComponent,
    CardVictoryPoints,
    CardDescription,
    CardRenderData,
  },
  methods: {
  },
  computed: {
    corporationClass(): string {
      return this.isCorporation ? 'card-content-corporation' : '';
    },
    hasDescription(): boolean {
      const description = this.metadata.description;
      return description !== undefined && (typeof(description) !== 'string' || description.length > 0);
    },
  },
});

</script>
