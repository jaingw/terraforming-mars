<template>
  <div class="select-initial-cards">
    <confirm-dialog
      message="Continue without buying any project cards?"
      ref="confirmation"
      v-on:accept="confirmSelection" />
    <SelectCard :playerView="playerView" :playerinput="corpCardOption" :showtitle="true" :onsave="noop" v-on:cardschanged="corporationChanged" />
    <div v-if="playerCanChooseAridor" class="player_home_colony_cont">
      <div v-i18n>These are the colony tiles Aridor may choose from:</div>
      <div class="discarded-colonies-for-aridor">
        <div class="player_home_colony small_colony" v-for="colonyName in playerView.game.discardedColonies" :key="colonyName">
          <colony :colony="getColony(colonyName)"></colony>
        </div>
      </div>
    </div>
    <SelectCard v-if="hasPrelude" :playerView="playerView" :playerinput="preludeCardOption" :onsave="noop" :showtitle="true" v-on:cardschanged="preludesChanged" />
    <SelectCard v-if="hasCeo" :playerView="playerView" :playerinput="ceoCardOption" :onsave="noop" :showtitle="true" v-on:cardschanged="ceosChanged" />
    <SelectCard :playerView="playerView" :playerinput="projectCardOption" :onsave="noop" :showtitle="true" v-on:cardschanged="cardsChanged" />
    <template v-if="this.selectedCorporations[0]">
      <div><span v-i18n>Starting Megacredits</span> <span v-if="selectedCorporations[1]">(双公司-42M€)</span>: <div class="megacredits">{{getStartingMegacredits()}}</div></div>
      <div v-if="hasPrelude"><span v-i18n>After Preludes:</span> <div class="megacredits">{{getStartingMegacredits() + getAfterPreludes()}}</div></div>
    </template>
    <div v-if="warning !== undefined" class="tm-warning">
      <label class="label label-error">{{ $t(warning) }}</label>
    </div>
    <!-- :key=warning is a way of validing that the state of the button should change. If the warning changes, or disappears, that's a signal that the button might change. -->
    <AppButton :disabled="!valid" v-if="showsave" @click="saveIfConfirmed" type="submit" :title="playerinput.buttonLabel"/>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';

import AppButton from '@/client/components/common/AppButton.vue';
import {getCard, getCardOrThrow} from '@/client/cards/ClientCardManifest';
import {CardName} from '@/common/cards/CardName';
import * as constants from '@/common/constants';
import {PlayerInputModel} from '@/common/models/PlayerInputModel';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import SelectCard from '@/client/components/SelectCard.vue';
import ConfirmDialog from '@/client/components/common/ConfirmDialog.vue';
import {getPreferences, Preferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {Tag} from '@/common/cards/Tag';
import {AndOptionsResponse} from '@/common/inputs/InputResponse';
import {CardType} from '@/common/cards/CardType';
import Colony from '@/client/components/colonies/Colony.vue';
import {ColonyName} from '@/common/colonies/ColonyName';
import {ColonyModel} from '@/common/models/ColonyModel';
import * as titles from '@/common/inputs/SelectInitialCards';
import {ClientCard} from '../../common/cards/ClientCard';

type Refs = {
  confirmation: InstanceType<typeof ConfirmDialog>,
}

type SelectInitialCardsModel = {
  selectedCards: Array<CardName>,
  // End result will be a single CEO, but the player may select multiple while deciding what to keep.
  selectedCeos: Array<CardName>,
  // End result will be a single corporation, but the player may select multiple while deciding what to keep.
  selectedCorporations: Array<ClientCard>,
  selectedPreludes: Array<CardName>,
  valid: boolean,
  warning: string | undefined,
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'SelectInitialCards',
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
    },
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: AndOptionsResponse) => void,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
    preferences: {
      type: Object as () => Readonly<Preferences>,
      default: () => PreferencesManager.INSTANCE.values(),
    },
  },
  components: {
    AppButton,
    SelectCard,
    'confirm-dialog': ConfirmDialog,
    Colony,
  },
  data(): SelectInitialCardsModel {
    return {
      selectedCards: [],
      selectedCeos: [],
      selectedCorporations: [] as Array<ClientCard>,
      selectedPreludes: [],
      valid: false,
      warning: undefined,
    };
  },
  methods: {
    noop() {
      throw new Error('should not be called');
    },
    getAfterPreludes() {
      let result = 0;
      for (const prelude of this.selectedPreludes) {
        const card = getCardOrThrow(prelude);
        result += card.startingMegaCredits ?? 0;
        if (this.selectedCorporations[0]) {
          result += this.getAfterPreludesCorp(card, this.selectedCorporations[0]);
        }
        if (this.selectedCorporations[1]) {
          result += this.getAfterPreludesCorp(card, this.selectedCorporations[1]);
        }
      }
      return result;
    },
    getAfterPreludesCorp: function(card:ClientCard, corp:ClientCard ) {
      let result = 0;
      const prelude = card.name;
      switch (corp.name) {
      // For each step you increase the production of a resource ... you also gain that resource.
      case CardName.MANUTECH:
        result += card.productionBox?.megacredits ?? 0;
        break;

        // When you place a city tile, gain 3 M€.
      case CardName.THARSIS_REPUBLIC:
        switch (prelude) {
        case CardName.SELF_SUFFICIENT_SETTLEMENT:
        case CardName.EARLY_SETTLEMENT:
        case CardName.STRATEGIC_BASE_PLANNING:
          result += 3;
          break;
        }
        break;

        // When ANY microbe tag is played ... lose 4 M€ or as much as possible.
      case CardName.PHARMACY_UNION:
        const tags = card.tags.filter((tag) => tag === Tag.MICROBE).length;
        result -= (4 * tags);
        break;

        // when a microbe tag is played, incl. this, THAT PLAYER gains 2 M€,
      case CardName.SPLICE:
        const microbeTags = card.tags.filter((tag) => tag === Tag.MICROBE).length;
        result += (2 * microbeTags);
        break;

        // Whenever Venus is terraformed 1 step, you gain 2 M€
      case CardName.APHRODITE:
        switch (prelude) {
        case CardName.VENUS_FIRST:
        case CardName.VENUS_FIRST_PATHFINDERS:
          result += 4;
          break;
        case CardName.HYDROGEN_BOMBARDMENT:
          result += 2;
          break;
        }
        break;

        // When any player raises any Moon Rate, gain 1M€ per step.
      case CardName.LUNA_FIRST_INCORPORATED:
        switch (prelude) {
        case CardName.FIRST_LUNAR_SETTLEMENT:
        case CardName.CORE_MINE:
        case CardName.BASIC_INFRASTRUCTURE:
          result += 1;
          break;
        case CardName.MINING_COMPLEX:
          result += 2;
          break;
        }
        break;

        // When you place an ocean tile, gain 4MC
      case CardName.POLARIS:
        switch (prelude) {
        case CardName.AQUIFER_TURBINES:
        case CardName.POLAR_INDUSTRIES:
          result += 4;
          break;
        case CardName.GREAT_AQUIFER:
          result += 8;
          break;
        }
        break;
      }
      return result;
    },
    getStartingMegacredits() {
      if (this.selectedCorporations.length === 0 || this.selectedCorporations[0] === undefined) {
        return NaN;
      }
      // The ?? 0 is only because ClientCard applies to _all_ cards.
      let starting = this.selectedCorporations[0].startingMegaCredits ?? 0;
      let cardCost = this.selectedCorporations[0].cardCost === undefined ? constants.CARD_COST : this.selectedCorporations[0].cardCost;

      if (this.selectedCorporations[1]) {
        if (this.selectedCorporations[1].cardCost !== undefined ) {
          // 双公司 买牌费用平均一下
          if (cardCost === constants.CARD_COST) {
            cardCost = this.selectedCorporations[1].cardCost;
          } else if (this.selectedCorporations[1].cardCost !== constants.CARD_COST) {
            cardCost = (this.selectedCorporations[1].cardCost + cardCost) /2;
          }
        }

        starting += ( this.selectedCorporations[1].startingMegaCredits ?? 0) - constants.STARTING_MEGA_CREDITS_SUB;
      }
      starting -= this.selectedCards.length * cardCost;
      return starting;
    },
    saveIfConfirmed() {
      const projectCards = this.selectedCards.filter((name) => getCard(name)?.type !== CardType.PRELUDE);
      let showAlert = false;
      if (this.preferences.show_alerts && projectCards.length === 0) showAlert = true;
      if (showAlert) {
        this.$refs.confirmation.show();
      } else {
        this.saveData();
      }
    },
    saveData() {
      const result: AndOptionsResponse = {
        type: 'and',
        responses: [],
      };
      const cards = [];
      if (this.selectedCorporations[0] !== undefined) {
        cards.push(this.selectedCorporations[0].name);
      }
      if (this.selectedCorporations[1] !== undefined) {
        cards.push(this.selectedCorporations[1].name);
      }
      result.responses.push({
        type: 'card',
        cards: cards,
      });
      if (this.hasPrelude) {
        result.responses.push({
          type: 'card',
          cards: this.selectedPreludes,
        });
      }
      if (this.hasCeo) {
        result.responses.push({
          type: 'card',
          cards: this.selectedCeos,
        });
      }
      result.responses.push({
        type: 'card',
        cards: this.selectedCards,
      });
      this.onsave(result);
    },

    cardsChanged(cards: Array<CardName>) {
      this.selectedCards = cards;
      this.validate();
    },
    ceosChanged(cards: Array<CardName>) {
      this.selectedCeos = cards;
      this.validate();
    },
    corporationChanged(cards: Array<CardName>) {
      const choseCards = getOption(this.playerinput.options, titles.SELECT_CORPORATION_TITLE).cards?.filter((card) => {
        return cards.indexOf(card.name) >= 0;
      });
      const coprs: Array<ClientCard> = [];
      if (choseCards !== undefined) {
        if (choseCards[0]) {
          const card = getCard(choseCards[0].name);
          if (card) {
            coprs[0] = card;
          }
        }
        if (choseCards[1]) {
          const card= getCard(choseCards[1].name);
          if (card) {
            coprs[1] = card;
          }
        }
      }
      this.selectedCorporations = coprs;
      this.validate();
    },
    preludesChanged(cards: Array<CardName>) {
      this.selectedPreludes = cards;
      this.validate();
    },

    calcuateWarning(): boolean {
      // Start with warning being empty.
      this.warning = undefined;
      if (this.selectedCorporations.length < 2 && this.corpCardOption && this.corpCardOption.min && this.corpCardOption.min >= 2 ) {
        this.warning = 'Select 2 corporations';
        return false;
      }
      if (this.selectedCorporations.length === 0) {
        this.warning = 'Select a corporation';
        return false;
      }
      if (this.selectedCorporations.length > 1 && this.corpCardOption && this.corpCardOption.max && this.corpCardOption.max <= 1 ) {
        this.warning = 'You selected too many corporations';
        return false;
      }
      if (this.hasPrelude) {
        if (this.selectedPreludes.length < 2) {
          this.warning = 'Select 2 preludes';
          return false;
        }
        if (this.selectedPreludes.length > 2) {
          this.warning = 'You selected too many preludes';
          return false;
        }
      }
      if (this.hasCeo) {
        if (this.selectedCeos.length < 1) {
          this.warning = 'Select 1 CEO';
          return false;
        }
        if (this.selectedCeos.length > 1) {
          this.warning = 'You selected too many CEOs';
          return false;
        }
      }
      if (this.selectedCards.length === 0) {
        this.warning = 'You haven\'t selected any project cards';
        return true;
      }
      return true;
    },
    validate() {
      this.valid = this.calcuateWarning();
    },
    confirmSelection() {
      this.saveData();
    },
    // TODO(kberg): Duplicate of LogPanel.getColony
    getColony(colonyName: ColonyName): ColonyModel {
      return {
        colonies: [],
        isActive: false,
        name: colonyName,
        trackPosition: 0,
        visitor: undefined,
      };
    },
  },
  computed: {
    playerCanChooseAridor() {
      return this.playerView.dealtCorporationCards.some((card) => card.name === CardName.ARIDOR);
    },
    hasPrelude() {
      return hasOption(this.playerinput.options, titles.SELECT_PRELUDE_TITLE);
    },
    hasCeo() {
      return hasOption(this.playerinput.options, titles.SELECT_CEO_TITLE);
    },
    corpCardOption() {
      const option = getOption(this.playerinput.options, titles.SELECT_CORPORATION_TITLE);
      if (getPreferences().experimental_ui) {
        option.min = 1;
        option.max = undefined;
      }
      return option;
    },
    preludeCardOption() {
      const option = getOption(this.playerinput.options, titles.SELECT_PRELUDE_TITLE);
      if (getPreferences().experimental_ui) {
        option.max = undefined;
      }
      return option;
    },
    ceoCardOption() {
      const option = getOption(this.playerinput.options, titles.SELECT_CEO_TITLE);
      if (getPreferences().experimental_ui) {
        option.max = undefined;
      }
      return option;
    },
    projectCardOption() {
      return getOption(this.playerinput.options, titles.SELECT_PROJECTS_TITLE);
    },
  },
  mounted() {
    this.validate();
  },
});

function getOption(options: Array<PlayerInputModel> | undefined, title: string): PlayerInputModel {
  let option = options?.find((option) => option.title === title);
  if (option === undefined && title === titles.SELECT_CORPORATION_TITLE) {
    option = options?.find((option) => option.title === titles.SELECT_CORPORATION_TITLE2);
  }
  if (option === undefined) {
    throw new Error('invalid input, missing option');
  }
  return option;
}

function hasOption(options: Array<PlayerInputModel> | undefined, title: string): boolean {
  const option = options?.find((option) => option.title === title);
  return option !== undefined;
}
</script>
