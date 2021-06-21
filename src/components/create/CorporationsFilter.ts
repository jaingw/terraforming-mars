import Vue from 'vue';

import {CardName} from '../../CardName';
import {CorporationGroup} from '../../CorporationName';

import {COLONIES_CARD_MANIFEST} from '../../cards/colonies/ColoniesCardManifest';
import {COMMUNITY_CARD_MANIFEST} from '../../cards/community/CommunityCardManifest';
import {PRELUDE_CARD_MANIFEST} from '../../cards/prelude/PreludeCardManifest';
import {PROMO_CARD_MANIFEST} from '../../cards/promo/PromoCardManifest';
import {BASE_CARD_MANIFEST, CORP_ERA_CARD_MANIFEST} from '../../cards/StandardCardManifests';
import {TURMOIL_CARD_MANIFEST} from '../../cards/turmoil/TurmoilCardManifest';
import {VENUS_CARD_MANIFEST} from '../../cards/venusNext/VenusCardManifest';

import {EROS_CARD_MANIFEST} from '../../cards/eros/ErosCardManifest';
import {ARES_CARD_MANIFEST} from '../../cards/ares/AresCardManifest';
import {MOON_CARD_MANIFEST} from '../../cards/moon/MoonCardManifest';


const allItems: Array<CardName> = [
  ...BASE_CARD_MANIFEST.corporationCards.cards.concat(CORP_ERA_CARD_MANIFEST.corporationCards.cards).map((cf) => cf.cardName),
  ...PRELUDE_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...VENUS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...COLONIES_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...TURMOIL_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...PROMO_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...COMMUNITY_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...EROS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...ARES_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
  ...MOON_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName),
];

export const CorporationsFilter = Vue.component('corporations-filter', {
  props: {
    corporateEra: {
      type: Boolean,
    },
    prelude: {
      type: Boolean,
    },
    venusNext: {
      type: Boolean,
    },
    colonies: {
      type: Boolean,
    },
    turmoil: {
      type: Boolean,
    },
    promoCardsOption: {
      type: Boolean,
    },
    communityCardsOption: {
      type: Boolean,
    },
    erosCardsOption: {
      type: Boolean,
    },
    moonExpansion: {
      type: Boolean,
    },
  },
  data: function() {
    return {
      customCorporationsList: false,
      selectedCorporations: [
        ...this.corporateEra ? BASE_CARD_MANIFEST.corporationCards.cards.concat(CORP_ERA_CARD_MANIFEST.corporationCards.cards).map((cf) => cf.cardName) : [],
        ...this.prelude ? PRELUDE_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.venusNext ? VENUS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.colonies ? COLONIES_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.turmoil ? TURMOIL_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.promoCardsOption ? PROMO_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.communityCardsOption ? COMMUNITY_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.erosCardsOption ? EROS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
        ...this.moonExpansion ? MOON_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName) : [],
      ] as Array<CardName> | boolean /* v-model thinks this can be boolean */,
      corporationGroups: [
        {'title': CorporationGroup.ORIGINAL, 'items': BASE_CARD_MANIFEST.corporationCards.cards.concat(CORP_ERA_CARD_MANIFEST.corporationCards.cards).map((cf) => cf.cardName)},
        {'title': CorporationGroup.PRELUDE, 'items': PRELUDE_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.VENUS_NEXT, 'items': VENUS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.COLONIES, 'items': COLONIES_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.TURMOIL, 'items': TURMOIL_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.PROMO, 'items': PROMO_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.COMMUNITY, 'items': COMMUNITY_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.EROS, 'items': EROS_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
        {'title': CorporationGroup.MOON, 'items': MOON_CARD_MANIFEST.corporationCards.cards.map((cf) => cf.cardName)},
      ],
    };
  },
  methods: {
    getSelected: function(): Array<CardName> {
      if (Array.isArray(this.selectedCorporations)) {
        return this.selectedCorporations;
      }
      console.warn('unexpectedly got boolean for selectedCorporations');
      return [];
    },
    getItemsByGroup: function(group: string): Array<CardName> {
      if (group === 'All') return allItems.slice();

      const corps = this.corporationGroups.find((g) => g.title === group);
      if (corps === undefined) return [];

      return (corps.items as any).slice();
    },
    selectAll: function(group: string) {
      const items = this.getItemsByGroup(group);
      for (const item of items) {
        if (this.getSelected().includes(item) === false) {
          this.getSelected().push(item);
        }
      }
    },
    removeFromSelection: function(cardName: CardName) {
      const itemIdx = this.getSelected().indexOf(cardName);
      if (itemIdx !== -1) {
        this.getSelected().splice(itemIdx, 1);
      }
    },
    selectNone: function(group: string) {
      const items = this.getItemsByGroup(group);
      for (const item of items) {
        this.removeFromSelection(item);
      }
    },
    invertSelection: function(group: string) {
      const items = this.getItemsByGroup(group);

      for (const idx in items) {
        if (this.getSelected().includes(items[idx])) {
          this.removeFromSelection(items[idx]);
        } else {
          this.getSelected().push(items[idx]);
        }
      }
    },
  },
  watch: {
    selectedCorporations: function(value) {
      this.$emit('corporation-list-changed', value);
    },
    corporateEra: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.ORIGINAL) : this.selectNone(CorporationGroup.ORIGINAL);
    },
    prelude: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.PRELUDE) : this.selectNone(CorporationGroup.PRELUDE);
    },
    venusNext: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.VENUS_NEXT) : this.selectNone(CorporationGroup.VENUS_NEXT);
    },
    colonies: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.COLONIES) : this.selectNone(CorporationGroup.COLONIES);
    },
    turmoil: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.TURMOIL) : this.selectNone(CorporationGroup.TURMOIL);
    },
    promoCardsOption: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.PROMO) : this.selectNone(CorporationGroup.PROMO);
    },
    erosCardsOption: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.EROS) : this.selectNone(CorporationGroup.EROS);
    },
    communityCardsOption: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.COMMUNITY) : this.selectNone(CorporationGroup.COMMUNITY);
    },
    moonExpansion: function(enabled) {
      enabled ? this.selectAll(CorporationGroup.MOON) : this.selectNone(CorporationGroup.MOON);
    },
  },
  template: `
    <div class="corporations-filter">
        <div class="corporations-filter-toolbox-cont">
            <h2 v-i18n>Corporations</h2>
            <div class="corporations-filter-toolbox corporations-filter-toolbox--topmost">
                <a href="#" v-i18n v-on:click.prevent="selectAll('All')">All*</a> |
                <a href="#" v-i18n v-on:click.prevent="selectNone('All')">None*</a> |
                <a href="#" v-i18n v-on:click.prevent="invertSelection('All')">Invert*</a>
            </div>
        </div>
        <br/>
        <div class="corporations-filter-group" v-for="group in corporationGroups">
            <div class="corporations-filter-toolbox-cont">
                <h2>{{ group.title }}</h2>
                <div class="corporations-filter-toolbox">
                    <a href="#" v-i18n v-on:click.prevent="selectAll(group.title)">All</a> | 
                    <a href="#" v-i18n v-on:click.prevent="selectNone(group.title)">None</a> | 
                    <a href="#" v-i18n v-on:click.prevent="invertSelection(group.title)">Invert</a>
                </div>
            </div>
            <div v-for="corporation in group.items">
                <label class="form-checkbox">
                    <input type="checkbox" v-model="selectedCorporations" :value="corporation"/>
                    <i class="form-icon"></i>{{ corporation }}
                </label>
            </div>
        </div>
    </div>
    `,
});
