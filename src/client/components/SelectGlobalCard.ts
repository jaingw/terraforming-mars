
import Vue from 'vue';
import AppButton from './common/AppButton.vue';
import {Message} from '@/common/logs/Message';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import {VueModelCheckbox, VueModelRadio} from '@/client/types';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {PlayerInputModel} from '@/common/models/PlayerInputModel';
import {Color} from '@/common/Color';
import {PartyName} from '@/common/turmoil/PartyName';
import {GlobalEventName} from '@/common/turmoil/globalEvents/GlobalEventName';
import {GlobalEventModel} from '@/common/models/TurmoilModel';
import GlobalEvent from './turmoil/GlobalEvent.vue';
import {getGlobalEventByName} from '../../server/turmoil/globalEvents/GlobalEventDealer';
import {SelectCardResponse} from '../../common/inputs/InputResponse';

interface SelectCardModel {
  cards: VueModelRadio<CardModel> | VueModelCheckbox<Array<CardModel>>;
  warning: string | Message | undefined;
}

export interface OwnerModel {
  name: string;
  color: Color;
}

export const SelectGlobalCard = Vue.component('select-global-card', {
  props: {
    player: {
      type: Object as () => PlayerViewModel,
    },
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: SelectCardResponse) => void,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data: function() {
    return {
      cards: [],
      warning: undefined,
    } as SelectCardModel;
  },
  components: {
    AppButton,
    GlobalEvent,
  },
  watch: {
    cards: function() {
      this.$emit('cardschanged', this.getData());
    },
  },
  methods: {
    cardsSelected: function(): number {
      if (Array.isArray(this.cards)) {
        return this.cards.length;
      } else if (this.cards === false || this.cards === undefined) {
        return 0;
      }
      return 1;
    },
    hasCardWarning: function() {
      if (Array.isArray(this.cards)) {
        return false;
      } else if (typeof this.cards === 'object' && this.cards.warning !== undefined) {
        this.warning = this.cards.warning;
        return true;
      }
      return false;
    },
    isOptionalToManyCards: function(): boolean {
      return this.playerinput.max !== undefined &&
             this.playerinput.max > 1 &&
             this.playerinput.min === 0;
    },
    getData: function(): Array<CardName> {
      return Array.isArray(this.$data.cards) ? this.$data.cards.map((card) => card.name) : [this.$data.cards.name];
    },
    saveData: function() {
      this.onsave({type: 'card', cards: this.getData()});
    },
    getCardBoxClass: function(card: CardModel): string {
      if (this.playerinput.showOwner && this.getOwner(card) !== undefined) {
        return 'cardbox cardbox-with-owner-label';
      }
      return 'cardbox';
    },
    getOwner: function(card: CardModel): OwnerModel | undefined {
      for (const player of this.player.players) {
        if (player.tableau.find((c) => c.name === card.name)) {
          return {name: player.name, color: player.color};
        }
      }
      return undefined;
    },
    partyNameToCss: function(party: PartyName | undefined): string {
      if (party === undefined) {
        console.warn('no party provided');
        return '';
      }
      return party.toLowerCase().split(' ').join('_');
    },
    getGlobalEvent(globalEventName: GlobalEventName): GlobalEventModel {
      const globalEvent = getGlobalEventByName(globalEventName);
      if (globalEvent) {
        return {
          name: globalEvent.name,
          description: globalEvent.description,
          revealed: globalEvent.revealedDelegate,
          current: globalEvent.currentDelegate,
        };
      }
      return {
        name: globalEventName,
        description: 'global event not found',
        revealed: PartyName.GREENS,
        current: PartyName.GREENS,
      };
    },
  },
  template: `<div class="wf-component wf-component--select-card">
        <div v-if="showtitle === true" class="nofloat wf-component-title">{{ $t(playerinput.title) }}</div>
        <div class="turmoil" style="width: auto;margin: auto;margin-left: -50px;"><div class="events-board"  style="width: auto;">
          <label v-for="card in playerinput.globalEventCards" :key="card.name" :class="getCardBoxClass(card)">
              <template v-if="!card.isDisabled">
                <input v-if="playerinput.max === 1 && playerinput.min === 1" type="radio" v-model="cards" :value="card" />
                <input v-else type="checkbox" v-model="cards" :value="card" :disabled="playerinput.max !== undefined && Array.isArray(cards) && cards.length >= playerinput.max && cards.includes(card) === false" />
              </template>
              <global-event :class="'filterDiv'"  style="margin-right: 25px;border: none;" :globalEvent="getGlobalEvent(card.name)" type="prior" :showIcons="false"></global-event>
          </label>
        </div></div>
        <div v-if="hasCardWarning()" class="card-warning">{{ $t(warning) }}</div>
        <div v-if="showsave === true" class="nofloat">
          <AppButton :disabled="isOptionalToManyCards() && cardsSelected() === 0" type="submit" @click="saveData"  :title="playerinput.buttonLabel" />
          <AppButton :disabled="isOptionalToManyCards() && cardsSelected() > 0" v-if="isOptionalToManyCards()" @click="saveData"  type="submit" :title="$t('Skip this action')" />
        </div>
    </div>`,
});

