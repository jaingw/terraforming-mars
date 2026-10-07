<template>
  <div class="wf-component wf-component--select-card">
    <div v-if="showtitle === true" class="nofloat wf-component-title">{{ $t(playerinput.title) }}</div>
    <label v-for="card in getOrderedCards()" :key="card.name" :class="getCardBoxClass(card)">
      <template v-if="!card.isDisabled">
        <input v-if="selectOnlyOneCard" type="radio" v-model="cards" :value="card.name" />
        <input v-else type="checkbox" v-model="cards" :value="card.name" :disabled="playerinput.max !== undefined && Array.isArray(cards) && cards.length >= playerinput.max && cards.includes(card.name) === false" />
      </template>
      <Card :card="card" :actionUsed="isCardActivated(card)" :robotCard="robotCard(card)">
        <template v-if="playerinput.showOwner">
          <div :class="'card-owner-label player_translucent_bg_color_'+ getOwner(card).color">
            {{getOwner(card).name}}
          </div>
        </template>
      </Card>
    </label>
    <div v-if="hasCardWarning()" class="card-warning" v-i18n>{{ warning }}</div>
    <warnings-component :warnings="warnings"></warnings-component>
    <!-- 部分卡牌会覆盖确认按钮， my-4（margin-top）把按钮下移-->
    <div v-if="showsave === true" class="nofloat my-4">
      <AppButton v-if="showSelectAll" @click="toggleSelectAll" type="submit" :title="allSelected ? $t('Deselect All') : $t('Select All')" />
      <AppButton :disabled="disabled()" type="submit" @click="saveData" :title="buttonLabel()" /> 
      <!-- Keep the second button on the original inline flow and widen spacing slightly. -->
      <AppButton
        :disabled="isOptionalToManyCards && cardsSelected() > 0"
        v-if="isOptionalToManyCards"
        class="wf-skip-action-button"
        @click="saveData"
        type="submit"
        :title="$t('Skip this action')"
      />
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import AppButton from '@/client/components/common/AppButton.vue';
import WarningsComponent from '@/client/components/WarningsComponent.vue';
import {Color} from '@/common/Color';
import {Message} from '@/common/logs/Message';
import {LogMessageDataType} from '@/common/logs/LogMessageDataType';
import {CardOrderStorage} from '@/client/utils/CardOrderStorage';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import Card from '@/client/components/card/Card.vue';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {SelectCardModel} from '@/common/models/PlayerInputModel';
import {sortActiveCards} from '@/client/utils/ActiveCardsSortingOrder';
import {SelectCardResponse} from '@/common/inputs/InputResponse';
import {Warning} from '@/common/cards/Warning';
import {vueRoot} from './vueRoot';

type Owner = {
  name: string;
  color: Color;
}

type WidgetDataModel = {
  // The selected item or items
  cards: CardName | Array<CardName>;
  warning: string | Message | undefined;
  warnings: ReadonlyArray<Warning> | undefined;
  owners: Map<CardName, Owner>,
}

export default defineComponent({
  name: 'SelectCard',
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
      required: true,
    },
    playerinput: {
      type: Object as () => SelectCardModel,
      required: true,
    },
    onsave: {
      type: Function as unknown as () => (out: SelectCardResponse) => void,
      required: true,
    },
    showsave: {
      type: Boolean,
      required: false,
      default: false,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data(): WidgetDataModel {
    return {
      cards: [],
      warning: undefined,
      owners: new Map(),
      warnings: undefined,
    };
  },
  components: {
    Card,
    WarningsComponent,
    AppButton,
  },
  watch: {
    cards() {
      this.$emit('cardschanged', this.getData());
    },
  },
  methods: {
    cardsSelected(): number {
      if (Array.isArray(this.cards)) {
        return this.cards.length;
      } else if (this.cards === undefined) {
        return 0;
      }
      return 1;
    },
    getOrderedCards(): ReadonlyArray<CardModel> {
      let cards: ReadonlyArray<CardModel> = [];
      if (this.playerinput.cards !== undefined) {
        if (this.playerinput.selectBlueCardAction) {
          cards = sortActiveCards(this.playerinput.cards);
        } else {
          cards = CardOrderStorage.getOrdered(
            CardOrderStorage.getCardOrder(this.playerView.id),
            this.playerinput.cards,
          );
        }
      }

      if (this.playerinput.showOwner) {
        // Optimization so getOwners isn't repeatedly called.
        this.owners.clear();
        this.playerinput.cards.forEach((card) => {
          const owner = this.findOwner(card);
          if (owner !== undefined) {
            this.owners.set(card.name, owner);
          }
        });
      }
      return cards;
    },
    getData(): Array<CardName> {
      return Array.isArray(this.$data.cards) ? this.$data.cards : [this.$data.cards];
    },
    hasCardWarning() {
      // This is pretty clunky, to be honest.
      const selectedCards = this.selectedCardModels();
      if (selectedCards.length === 1) {
        this.warnings = selectedCards[0].warnings;
      }
      return false;
    },

    canSave() {
      const len = this.getData().length;
      if (len > this.playerinput.min) {
        return false;
      }
      if (len < this.playerinput.max) {
        return false;
      }
      return true;
    },
    saveData() {
      if (this.disabled()) {
        vueRoot(this).showAlert('Not enough cards selected');
        return;
      }
      this.onsave({type: 'card', cards: this.getData()});
    },
    getCardBoxClass(card: CardModel): string {
      if (this.playerinput.showOwner && this.getOwner(card) !== undefined) {
        return 'cardbox cardbox-with-owner-label';
      }
      return 'cardbox';
    },
    findOwner(card: CardModel): Owner | undefined {
      for (const player of this.playerView.players) {
        if (player.tableau.find((c) => c.name === card.name)) {
          return {name: player.name, color: player.color};
        }
      }
      return undefined;
    },
    getOwner(card: CardModel): Owner {
      return this.owners.get(card.name) ?? {name: 'unknown', color: 'neutral'};
    },
    isCardActivated(card: CardModel): boolean {
      // Copied from PlayerMixin.
      return this.playerView.thisPlayer.actionsThisGeneration.includes(card.name);
    },
    buttonLabel(): string | Message {
      if (this.selectOnlyOneCard) {
        return this.playerinput.buttonLabel;
      }
      return {
        message: this.playerinput.buttonLabel + ' ${0}',
        data: [{
          type: LogMessageDataType.RAW_STRING,
          value: String(this.cardsSelected()),
        }],
      };
    },
    robotCard(card: CardModel): CardModel | undefined {
      return this.playerView.thisPlayer.selfReplicatingRobotsCards?.find((r) => r.name === card.name);
    },
    disabled() {
      return this.playerinput.min !== undefined && this.playerinput.min > this.cardsSelected();
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.cards = [];
      } else {
        this.cards = this.selectableCards.map((card) => card.name);
      }
    },
    selectedCardModels(): Array<CardModel> {
      const selectedNames = this.getData();
      return this.playerinput.cards.filter((card) => selectedNames.includes(card.name));
    },
  },
  computed: {
    selectOnlyOneCard() : boolean {
      return this.playerinput.max === 1 && this.playerinput.min === 1;
    },
    isOptionalToManyCards(): boolean {
      return this.playerinput.max !== undefined &&
             this.playerinput.max > 1 &&
             this.playerinput.min === 0;
    },
    selectableCards(): Array<CardModel> {
      return this.playerinput.cards.filter((card) => !card.isDisabled);
    },
    showSelectAll(): boolean {
      return this.playerinput.showSelectAll === true &&
             !this.selectOnlyOneCard &&
             this.selectableCards.length > 1;
    },
    allSelected(): boolean {
      return Array.isArray(this.cards) && this.cards.length === this.selectableCards.length;
    },
  },
});

</script>
