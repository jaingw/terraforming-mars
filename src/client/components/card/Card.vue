<template>
  <div class="card-container filterDiv hover-hide-res" :class="cardClasses">
    <div class="card-content-wrapper"  @mouseover="hovering = true" @mouseleave="hovering = false">
      <div v-if="!isStandardProject" class="card-cost-and-tags">
        <CardCost :amount="cost" :newCost="reducedCost" />
        <div v-if="showPlayerCube" :class="playerCubeClass"></div>
        <card-help v-if="hasHelpText" :name="card.name" :hovering="hovering" />
        <CardTags :tags="tags" />
      </div>

      <CardTitle :title="card.name" :type="cardType"/>
      <CardContent
        :metadata="cardMetadata"
        :requirements="cardRequirements"
        :isCorporation="isCorporationCard"
        :padBottom="hasResourceType" />
    </div>
    <CardExpansion :expansion="cardExpansion" :isCorporation="isCorporationCard" :isResourceCard="isResourceCard" :compatibility="cardCompatibility" />
    <CardCustomizedContent v-if="isLunaChainCard" :amount="lunaChainPay" />
    <CardResourceCounter v-if="hasResourceType" :amount="resourceAmount" :type="resourceType" />
    <CardExtraContent :card="card" />
    <slot/>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';

import {CardModel} from '@/common/models/CardModel';
import {CARD_HELP_TEXT} from '@/client/cards/CardHelpText';
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
import {GameModule} from '@/common/cards/GameModule';
// import { newCard } from '@/server/createCard';


export default defineComponent({
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
      default: 'neutral',
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
  computed: {
    cardExpansion(): GameModule {
      return this.cardInstance.module;
    },
    cardCompatibility(): Array<GameModule> {
      return this.cardInstance.compatibility;
    },
    isResourceCard(): boolean {
      if (this.cardInstance.resourceType !== undefined) {
        return true;
      } else {
        return false;
      }
    },
    tags(): Array<Tag> {
      const type = this.cardType;
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
    cost(): number | undefined {
      return this.isProjectCard ? this.cardInstance.cost : undefined;
    },
    reducedCost(): number | undefined {
      return this.isProjectCard ? this.card.calculatedCost : undefined;
    },
    cardType(): CardType {
      return this.cardInstance.type;
    },
    cardClasses(): string {
      const classes = [];
      classes.push('card-' + this.card.name.toLowerCase().replaceAll(' ', '-'));

      if (this.card.isDisabled) {
        classes.push('card-unavailable');
      } else if (!getPreferences().experimental_ui && this.actionUsed) {
        classes.push('card-unavailable');
      }

      if (this.isStandardProject) {
        classes.push('card-standard-project');
      }
      const learnerModeOff = !getPreferences().learner_mode;
      if (learnerModeOff && this.isStandardProject && this.card.isDisabled) {
        classes.push('card-hide');
      }
      return classes.join(' ');
    },
    cardMetadata(): CardMetadata {
      return this.cardInstance.metadata;
    },
    cardRequirements(): ReadonlyArray<CardRequirementDescriptor> | undefined {
      return this.cardInstance.requirements;
    },
    resourceAmount(): number {
      return this.card.resources || this.robotCard?.resources || 0;
    },
    isCorporationCard() : boolean {
      return this.cardType === CardType.CORPORATION;
    },
    isProjectCard(): boolean {
      const type = this.cardType;
      return type === CardType.AUTOMATED || type === CardType.ACTIVE || type === CardType.EVENT;
    },
    isStandardProject() : boolean {
      return this.cardType === CardType.STANDARD_PROJECT || this.cardType === CardType.STANDARD_ACTION;
    },
    lunaChainPay(): number {
      return this.isCorporationCard && this.card.data?.lastPay >=0 ? this.card.data.lastPay : -1;
    },
    hasResourceType(): boolean {
      return this.card.isSelfReplicatingRobotsCard === true || this.cardInstance.resourceType !== undefined || this.robotCard !== undefined;
    },
    isLunaChainCard(): boolean {
      return this.cardInstance.name === 'Luna Chain';
    },
    resourceType(): CardResource {
      if (this.robotCard !== undefined || this.card.isSelfReplicatingRobotsCard === true) {
        return CardResource.RESOURCE_CUBE;
      }
      // This last RESOURCE_CUBE is functionally unnecessary and serves to satisfy the type contract.
      return this.cardInstance.resourceType ?? CardResource.RESOURCE_CUBE;
    },
    hasHelpText(): boolean {
      return CARD_HELP_TEXT[this.card.name] !== undefined;
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
