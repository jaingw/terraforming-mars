
import Vue from 'vue';

import {Button} from './common/Button';
import {CardFinder} from '../CardFinder';
import {CardName} from '../CardName';
import * as constants from '../constants';
import {CorporationCard} from '../cards/corporation/CorporationCard';
import {PlayerInputModel} from '../models/PlayerInputModel';
import {PlayerModel} from '../models/PlayerModel';
import {SelectCard} from './SelectCard';
import {ConfirmDialog} from './common/ConfirmDialog';
import {PreferencesManager} from './PreferencesManager';

export const SelectInitialCards = Vue.component('select-initial-cards', {
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
  components: {
    Button,
    'select-card': SelectCard,
    'confirm-dialog': ConfirmDialog,
  },
  data: function() {
    return {
      selectedCards: [] as Array<CardName>,
      selectedCorporation: [] as Array<CorporationCard>,
      selectedPrelude: [] as Array<CardName>,
    };
  },
  methods: {
    getAfterPreludes: function() {
      let result = 0;
      for (const prelude of this.selectedPrelude) {
        switch (prelude) {
        case CardName.ALLIED_BANKS:
          result += 3;
          break;
        case CardName.BUSINESS_EMPIRE:
          result -= 6;
          break;
        case CardName.AQUIFER_TURBINES:
          result -= 3;
          break;
        case CardName.DONATION:
          result += 21;
          break;
        case CardName.GALILEAN_MINING:
        case CardName.HUGE_ASTEROID:
        case CardName.VITAL_COLONY:
          result -= 5;
          break;
        case CardName.LOAN:
          result += 30;
          break;
        case CardName.MARTIAN_INDUSTRIES:
        case CardName.VALUABLE_GASES:
          result += 6;
          break;
        case CardName.NITROGEN_SHIPMENT:
          result += 5;
          break;
        case CardName.AEROSPACE_MISSION:
          result -= 14;
          break;
        case CardName.RESEARCH_GRANT:
          result += 8;
          break;
        case CardName.TRADE_ADVANCE:
          result += 2;
          break;
        }
        if (this.selectedCorporation[0]) {
          result += this.getAfterPreludesCorp(prelude, this.selectedCorporation[0]);
        }
        if (this.selectedCorporation[1]) {
          result += this.getAfterPreludesCorp(prelude, this.selectedCorporation[1]);
        }
      }
      return result;
    },
    getAfterPreludesCorp: function(prelude:CardName, corp:CorporationCard) {
      let result = 0;
      switch (corp.name) {
      case CardName.MANUTECH:
        switch (prelude) {
        case CardName.ALLIED_BANKS:
          result += 4;
          break;
        case CardName.BUSINESS_EMPIRE:
          result += 6;
          break;
        case CardName.DOME_FARMING:
        case CardName.SELF_SUFFICIENT_SETTLEMENT:
          result += 2;
          break;
        case CardName.METALS_COMPANY:
        case CardName.RESEARCH_NETWORK:
          result += 1;
          break;
        case CardName.NITRATE_REDUCERS:
          result += 3;
          break;
        }
        break;
      case CardName.THARSIS_REPUBLIC:
        switch (prelude) {
        case CardName.SELF_SUFFICIENT_SETTLEMENT:
        case CardName.EARLY_SETTLEMENT:
          result += 3;
          break;
        }
        break;
      case CardName.PHARMACY_UNION:
        switch (prelude) {
        case CardName.BIOFUELS:
        case CardName.ECOLOGY_EXPERTS:
        case CardName.NITRATE_REDUCERS:
          result -= 4;
          break;
        }
        break;
      case CardName.SPLICE:
        switch (prelude) {
        case CardName.BIOFUELS:
        case CardName.ECOLOGY_EXPERTS:
        case CardName.NITRATE_REDUCERS:
          result += 4;
          break;
        }
        break;
      case CardName.APHRODITE:
        switch (prelude) {
        case CardName.VENUS_FIRST:
          result += 4;
          break;
        }
      }
      return result;
    },
    getOption: function(idx: number) {
      if (this.playerinput.options === undefined || this.playerinput.options[idx] === undefined) {
        throw new Error('invalid input, missing option');
      }
      return this.playerinput.options[idx];
    },
    getStartingMegacredits: function() {
      if (this.selectedCorporation.length === 0 || this.selectedCorporation[0] === undefined) {
        return NaN;
      }
      let starting = this.selectedCorporation[0].startingMegaCredits;
      let cardCost = this.selectedCorporation[0].cardCost === undefined ? constants.CARD_COST : this.selectedCorporation[0].cardCost;

      if (this.selectedCorporation[1]) {
        if (this.selectedCorporation[1].cardCost !== undefined ) {
          // 双公司 买牌费用平均一下
          if (cardCost === constants.CARD_COST) {
            cardCost = this.selectedCorporation[1].cardCost;
          } else if (this.selectedCorporation[1].cardCost !== constants.CARD_COST) {
            cardCost = (this.selectedCorporation[1].cardCost + cardCost) /2;
          }
        }

        starting += this.selectedCorporation[1].startingMegaCredits - constants.STARTING_MEGA_CREDITS_SUB;
      }
      starting -= this.selectedCards.length * cardCost;
      return starting;
    },
    saveIfConfirmed: function() {
      if (PreferencesManager.load('show_alerts') === '1' && this.selectedCards.length === 0) {
        (this.$refs['confirmation'] as any).show();
      } else {
        this.saveData();
      }
    },
    saveData: function() {
      const result: Array<Array<string>> = [];
      result.push([]);
      if (this.selectedCorporation[0] !== undefined) {
        result[0].push(this.selectedCorporation[0].name);
      }
      if (this.selectedCorporation[1] !== undefined) {
        result[0].push(this.selectedCorporation[1].name);
      }
      if (this.hasPrelude()) {
        result.push(this.selectedPrelude);
      }
      result.push(this.selectedCards);
      this.onsave(result);
    },
    hasPrelude: function() {
      return this.playerinput.options !== undefined && this.playerinput.options.length === 3;
    },
    cardsChanged: function(cards: Array<CardName>) {
      this.selectedCards = cards;
    },
    corporationChanged: function(cards: Array<CardName>) {
      const choseCards = this.getOption(0).cards?.filter((card) => {
        return cards.indexOf(card.name) >= 0;
      });
      const coprs: Array<CorporationCard> = [];
      if (choseCards !== undefined) {
        if (choseCards[0]) {
          coprs[0] = new CardFinder().getCorporationCardByName(choseCards[0].name)!;
        }
        if (choseCards[1]) {
          coprs[1] = new CardFinder().getCorporationCardByName(choseCards[1].name)!;
        }
      }
      this.selectedCorporation = coprs;
    },
    preludesChanged: function(cards: Array<CardName>) {
      this.selectedPrelude = cards;
    },
    confirmSelection: function() {
      this.saveData();
    },
  },
  template: `
  <div class="select-initial-cards">
    <confirm-dialog
      message="Continue without buying initial cards?"
      ref="confirmation"
      v-on:accept="confirmSelection" />
    <select-card :player="player" :playerinput="getOption(0)" :showtitle="true" v-on:cardschanged="corporationChanged" />
    <select-card v-if="hasPrelude()" :player="player" :playerinput="getOption(1)" :showtitle="true" v-on:cardschanged="preludesChanged" />
    <select-card :player="player" :playerinput="getOption(hasPrelude() ? 2 : 1)" :showtitle="true" v-on:cardschanged="cardsChanged" />
    <div v-if="selectedCorporation[0]" v-i18n>Starting Megacredits <span v-if="selectedCorporation[1]">(双公司-42M€)</span>: <div class="megacredits">{{getStartingMegacredits()}}</div></div>
    <div v-if="selectedCorporation[0] && hasPrelude()" v-i18n>After Preludes: <div class="megacredits">{{getStartingMegacredits() + getAfterPreludes()}}</div></div>
    <Button v-if="showsave" :onClick="saveIfConfirmed" type="submit" :title="playerinput.buttonLabel" />
  </div>`,
});

