<template>
  <div :class="getCardClasses(card)">
      <div class="card-content-wrapper"  @mouseover="hovering = true" @mouseleave="hovering = false">
          <div v-if="!isStandardProject()" class="card-cost-and-tags">
              <CardCost :amount="getCost()" :newCost="getReducedCost()" />
              <div v-if="showPlayerCube" :class="playerCubeClass"></div>
              <card-help v-if="hasHelp" :name="card.name" />
              <CardTags :tags="getTags()" />
          </div>

          <template v-if="getCardContent() === ''">
            <CardTitle :title="card.name" :type="getCardType()"/>
            <CardContent v-if="getCardMetadata() !== undefined" :metadata="getCardMetadata()" :requirements="getCardRequirements()" :isCorporation="isCorporationCard()" :padBottom="hasResourceType" />
          </template>
          <template v-else >
            <div  v-html="getCardContent()"></div>
          </template>
        </div>
      <CardExpansion :expansion="getCardExpansion()" :isCorporation="isCorporationCard()" :isResourceCard="isResourceCard()" :compatibility="getCardCompatibility()" />
      <CardCustomizedContent v-if="isLunaChainCard" :amount="getLunaChainPay()" />
      <CardResourceCounter v-if="hasResourceType" :amount="getResourceAmount()" :type="resourceType" />
      <CardExtraContent :card="card" />
      <slot/>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';

import {CardModel} from '@/common/models/CardModel';
import CardTitle from './CardTitle.vue';
import CardResourceCounter from './CardResourceCounter.vue';
import CardCustomizedContent from './CardCustomizedContent.vue';

import CardCost from './CardCost.vue';
import CardExtraContent from './CardExtraContent.vue';
import CardExpansion from './CardExpansion.vue';
import CardTags from './CardTags.vue';
import {CardType} from '@/common/cards/CardType';
import CardContent from './CardContent.vue';
import CardHelp from './CardHelp.vue';
import {CardMetadata} from '@/common/cards/CardMetadata';
import {Tag} from '@/common/cards/Tag';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {CardResource} from '@/common/CardResource';
import {getCardOrThrow} from '@/client/cards/ClientCardManifest';
import {Color} from '@/common/Color';
import {CardRequirementDescriptor} from '@/common/cards/CardRequirementDescriptor';
// import * as HTML_DATA from '@/genfiles/cards-html-cn.json';
import * as HTML_DATA from '@/genfiles/cards.json';
import {GameModule} from '@/common/cards/GameModule';
// import { newCard } from '@/server/createCard';

function getCardContentCN(cardName: string): string {
  let htmlData: string | undefined = '';
  htmlData = (HTML_DATA as any)[cardName];
  return htmlData || '';
}

export default Vue.extend({
  name: 'Card',
  components: {
    CardTitle,
    CardHelp,
    CardResourceCounter,
    CardCustomizedContent,
    CardCost,
    CardExtraContent,
    CardExpansion,
    CardTags,
    CardContent,
  },
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
    actionUsed: {
      type: Boolean,
      required: false,
      default: false,
    },
    robotCard: {
      type: Object as () => CardModel | undefined,
      required: false,
    },
    // Cube is only shown when actionUsed is true.
    cubeColor: {
      type: String as () => Color,
      required: false,
      default: Color.NEUTRAL,
    },
  },
  data() {
    const cardName = this.card.name;

    const card = getCardOrThrow(cardName);
    // 调试卡牌样式临时用下
    // const icard = newCard(cardName);
    // if(icard){
    //   card.metadata = icard.metadata;
    // }
    return {
      cardInstance: card,
      hovering: false,
    };
  },
  methods: {
    getCardContent: function() {
      if ((getPreferences().lang || 'cn') === 'cn') {
        return getCardContentCN(this.card.name);
      }
      return '';
    },
    getCardExpansion(): GameModule {
      return this.cardInstance.module;
    },
    getCardCompatibility(): Array<GameModule> {
      return this.cardInstance.compatibility;
    },
    isResourceCard(): boolean {
      if (this.cardInstance.resourceType !== undefined) {
        return true;
      } else {
        return false;
      }
    },
    getTags(): Array<string> {
      const type = this.getCardType();
      const tags = [...this.cardInstance.tags || []];
      tags.forEach((tag, idx) => {
        // Clone are changed on card implementations but that's not passed down directly through the
        // model, however, it sends down the `cloneTag` field. So this function does the substitution.
        if (tag === Tag.CLONE && this.card.cloneTag !== undefined) {
          tags[idx] = this.card.cloneTag;
        }
      });
      if (type === CardType.EVENT) {
        tags.push(Tag.EVENT);
      }
      return tags;
    },
    getCost(): number | undefined {
      return this.isProjectCard() ? this.cardInstance.cost : undefined;
    },
    getReducedCost(): number | undefined {
      return this.isProjectCard() ? this.card.calculatedCost : undefined;
    },
    getCardType(): CardType {
      return this.cardInstance.type;
    },
    getCardClasses(card: CardModel): string {
      const classes = ['card-container', 'filterDiv', 'hover-hide-res'];
      classes.push('card-' + card.name.toLowerCase().replace(/ /g, '-'));

      if (card.isDisabled) {
        classes.push('card-unavailable');
      } else if (!getPreferences().experimental_ui && this.actionUsed) {
        classes.push('card-unavailable');
      }

      if (this.isStandardProject()) {
        classes.push('card-standard-project');
      }
      const learnerModeOff = !getPreferences().learner_mode;
      if (learnerModeOff && this.isStandardProject() && card.isDisabled) {
        classes.push('card-hide');
      }
      return classes.join(' ');
    },
    getCardMetadata(): CardMetadata {
      return this.cardInstance.metadata;
    },
    getCardRequirements(): Array<CardRequirementDescriptor> {
      return this.cardInstance.requirements;
    },
    getResourceAmount(): number {
      return this.card.resources || this.robotCard?.resources || 0;
    },
    isCorporationCard() : boolean {
      return this.getCardType() === CardType.CORPORATION;
    },
    isProjectCard(): boolean {
      const type = this.getCardType();
      return type !== CardType.PRELUDE && type !== CardType.CORPORATION && type !== CardType.CEO;
    },
    isStandardProject() : boolean {
      return this.getCardType() === CardType.STANDARD_PROJECT || this.getCardType() === CardType.STANDARD_ACTION;
    },
    getLunaChainPay(): number {
      return this.isCorporationCard() && this.card.data?.lastPay >=0 ? this.card.data.lastPay : -1;
    },
  },
  computed: {
    hasResourceType(): boolean {
      return this.card.isSelfReplicatingRobotsCard === true || this.cardInstance.resourceType !== undefined || this.robotCard !== undefined;
    },
    isLunaChainCard(): boolean {
      return this.cardInstance.name === 'Luna Chain';
    },
    resourceType(): CardResource {
      if (this.robotCard !== undefined || this.card.isSelfReplicatingRobotsCard === true) return CardResource.RESOURCE_CUBE;
      // This last RESOURCE_CUBE is functionally unnecessary and serves to satisfy the type contract.
      return this.cardInstance.resourceType ?? CardResource.RESOURCE_CUBE;
    },
    hasHelp(): boolean {
      return this.hovering && this.cardInstance.metadata.hasExternalHelp === true;
    },
    showPlayerCube(): boolean {
      return getPreferences().experimental_ui && this.actionUsed;
    },
    playerCubeClass(): string {
      return `board-cube board-cube--${this.cubeColor}`;
    },
  },
});

</script>
