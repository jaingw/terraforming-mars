
import Vue from 'vue';
import {Button} from './common/Button';
import {Message} from '../Message';
import {PlayerModel} from '../models/PlayerModel';
import {VueModelCheckbox, VueModelRadio} from './VueTypes';
import {Card} from './card/Card';
import {CardModel} from '../models/CardModel';
import {CardName} from '../CardName';
import {PlayerInputModel} from '../models/PlayerInputModel';
import {TranslateMixin} from './TranslateMixin';
import {Color} from '../Color';
import {PartyName} from '../turmoil/parties/PartyName';

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
      type: Object as () => PlayerModel,
    },
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: Array<Array<string>>) => void,
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
    Card,
    Button,
  },
  mixins: [TranslateMixin],
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
      return this.playerinput.maxCardsToSelect !== undefined &&
             this.playerinput.maxCardsToSelect > 1 &&
             this.playerinput.minCardsToSelect === 0;
    },
    getData: function(): Array<CardName> {
      return Array.isArray(this.$data.cards) ? this.$data.cards.map((card) => card.name) : [this.$data.cards.name];
    },
    saveData: function() {
      this.onsave([this.getData()]);
    },
    getCardBoxClass: function(card: CardModel): string {
      if (this.playerinput.showOwner && this.getOwner(card) !== undefined) {
        return 'cardbox cardbox-with-owner-label';
      }
      return 'cardbox';
    },
    getOwner: function(card: CardModel): OwnerModel | undefined {
      for (const player of this.player.players) {
        if (player.playedCards.find((c) => c.name === card.name)) {
          return {name: player.name, color: player.color} as OwnerModel;
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
  },
  template: `<div class="wf-component wf-component--select-card">
        <div v-if="showtitle === true" class="nofloat wf-component-title">{{ $t(playerinput.title) }}</div>
        <div class="turmoil" style="width: auto;margin: auto;margin-left: -50px;"><div class="events-board"  style="width: auto;">
          <label v-for="card in playerinput.globalEventCards" :key="card.name" :class="getCardBoxClass(card)">
              <template v-if="!card.isDisabled">
                <input v-if="playerinput.maxCardsToSelect === 1 && playerinput.minCardsToSelect === 1" type="radio" v-model="cards" :value="card" />
                <input v-else type="checkbox" v-model="cards" :value="card" :disabled="playerinput.maxCardsToSelect !== undefined && Array.isArray(cards) && cards.length >= playerinput.maxCardsToSelect && cards.includes(card) === false" />
              </template>
              <div class="global-event global-event--coming filterDiv " style="margin-right: 25px;border: none;">
                <div class="event-party event-party--top" :class="'event-party--'+partyNameToCss(card.revealedDelegate)" v-i18n>{{ card.revealedDelegate }}</div>
                <div class="event-party event-party--bottom" :class="'event-party--'+partyNameToCss(card.currentDelegate)" v-i18n>{{ card.currentDelegate }}</div>
                <div class="event-content"><div class="event-text" v-i18n>{{ card.description }}</div></div>
              </div>
          </label>
        </div></div>
        <div v-if="hasCardWarning()" class="card-warning">{{ $t(warning) }}</div>
        <div v-if="showsave === true" class="nofloat">
            <Button :disabled="isOptionalToManyCards() && cardsSelected() === 0" type="submit" :onClick="saveData" :title="playerinput.buttonLabel" />
            <Button :disabled="isOptionalToManyCards() && cardsSelected() > 0" v-if="isOptionalToManyCards()" :onClick="saveData" type="submit" :title="$t('Skip this action')" />
        </div>
    </div>`,
});

