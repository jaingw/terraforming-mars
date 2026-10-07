<template>
  <div id="player-home" :class="game.turmoil ? 'with-turmoil' : ''">
    <h2 :class="'game-title player_color_' + thisPlayer.color">
      <a :href="'/game?id=' + playerView.gameId" v-i18n>Terraforming Mars</a>
      <a v-if="userName" href="mygames">- {{ userName }}</a>
    </h2>
    <top-bar :playerView="playerView" />

    <div v-if="game.phase === 'end'">
      <div class="player_home_block">
        <DynamicTitle title="This game is over!" :color="thisPlayer.color"/>
        <a :href="'the-end?id=' + playerView.id" v-i18n>Go to game results</a>
      </div>
    </div>
    <div v-if="game.phase === 'abandon'">
      <div class="player_home_block">
        <DynamicTitle title="This game is abandon!" :color="thisPlayer.color"/>
        <a :href="'/the-end?id=' + playerView.id" v-i18n>Go to game results</a>
      </div>
    </div>
    <div v-if="game.phase === 'timeout'">
      <div class="player_home_block">
        <DynamicTitle title="This game is timeout!" :color="thisPlayer.color"/>
        <a :href="'/the-end?id=' + playerView.id" v-i18n>Go to game results</a>
      </div>
    </div>

    <sidebar
      v-trim-whitespace
      :acting_player="isPlayerActing(playerView)"
      :playerView="playerView"
      :player_color="thisPlayer.color"
      :generation="game.generation"
      :coloniesCount="game.colonies.length"
      :temperature="game.temperature"
      :oxygen="game.oxygenLevel"
      :oceans="game.oceans"
      :venus="game.venusScaleLevel"
      :turmoil="game.turmoil"
      :moonData="game.moon"
      :gameOptions="game.gameOptions"
      :playerNumber="playerView.players.length"
      :lastSoloGeneration="game.lastSoloGeneration"
      :deckSize="game.deckSize"
      :discardPileSize="game.discardPileSize">
    </sidebar>

    <div v-if="thisPlayer.tableau.length > 0">
      <div class="player_home_block">
        <GameBoardView
          :game="game"
          :tileView="tileView"
          :players="playerView.players"
          @toggleTileView="cycleTileView()"
        />
      </div>

      <a class="hotkey-target"></a>
      <players-overview
        id="shortkey-playersoverview"
        class="player_home_block player_home_block--players nofloat"
        :playerView="playerView"
        v-trim-whitespace
      />

      <a class="hotkey-target"></a>
      <div class="player_home_block nofloat">
        <log-panel :viewModel="playerView" :color="thisPlayer.color" :step="game.step"></log-panel>
      </div>

      <a class="hotkey-target"></a>
      <div class="player_home_block player_home_block--actions nofloat">
        <a name="actions" class="player_home_anchor"></a>
        <dynamic-title title="Actions" :color="thisPlayer.color"/>
        <div v-if="canSitDown" style="display: inline-block; margin-bottom: 6px;" v-i18n>
          <button id="sitdown" class="played-cards-button btn btn-tiny" v-on:click="sitDown()">
            <span v-i18n>Sit down</span>
          </button>
          <span style="margin-left: 5px;" v-i18n>Sit down tips</span>
        </div>
        <waiting-for
          v-if="game.phase !== 'end' && game.phase !== 'timeout' && game.phase !== 'abandon'"
          :playerView="playerView"
          :waitingfor="playerView.waitingFor"
        ></waiting-for>
      </div>

      <div v-if="playerView.draftedCards.length > 0" class="player_home_block player_home_block--hand">
        <dynamic-title title="Drafted cards" :color="thisPlayer.color" />
        <div v-for="card in playerView.draftedCards" :key="card.name" class="cardbox">
          <Card :card="card"/>
        </div>
      </div>

      <a name="cards" class="player_home_anchor"></a>
      <div v-if="cardsInHandCount > 0" id="shortkey-hand" class="player_home_block player_home_block--hand">
        <div class="hiding-card-button-row">
          <dynamic-title title="Cards In Hand" :color="thisPlayer.color"/>
          <div :class="getHideButtonClass('HAND')" v-on:click.prevent="toggle('HAND')">
            <div class="played-cards-count">{{ cardsInHandCount.toString() }}</div>
            <div class="played-cards-selection" v-i18n>{{ getToggleLabel('HAND') }}</div>
          </div>
          <div class="text-overview" v-i18n>[ toggle cards in hand ]</div>
        </div>
        <sortable-cards
          v-show="isVisible('HAND')"
          :playerId="playerView.id"
          :cards="playerView.preludeCardsInHand.concat(playerView.ceoCardsInHand).concat(playerView.cardsInHand)"
        />
      </div>

      <div class="player_home_block player_home_block--cards">
        <div class="hiding-card-button-row">
          <dynamic-title title="Played Cards" :color="thisPlayer.color" />
          <div class="played-cards-filters">
            <div :class="getHideButtonClass('ACTIVE')" v-on:click.prevent="toggle('ACTIVE')">
              <div class="played-cards-count">{{ getCardsByType(thisPlayer.tableau, [CardType.ACTIVE]).length.toString() }}</div>
              <div class="played-cards-selection" v-i18n>{{ getToggleLabel('ACTIVE') }}</div>
            </div>
            <div :class="getHideButtonClass('AUTOMATED')" v-on:click.prevent="toggle('AUTOMATED')">
              <div class="played-cards-count">{{ getCardsByType(thisPlayer.tableau, [CardType.AUTOMATED, CardType.PRELUDE]).length.toString() }}</div>
              <div class="played-cards-selection" v-i18n>{{ getToggleLabel('AUTOMATED') }}</div>
            </div>
            <div :class="getHideButtonClass('EVENT')" v-on:click.prevent="toggle('EVENT')">
              <div class="played-cards-count">{{ getCardsByType(thisPlayer.tableau, [CardType.EVENT]).length.toString() }}</div>
              <div class="played-cards-selection" v-i18n>{{ getToggleLabel('EVENT') }}</div>
            </div>
          </div>
          <div class="text-overview" v-i18n>[ toggle cards filters ]</div>
        </div>
        <div v-for="card in getCardsByType(thisPlayer.tableau, [CardType.CORPORATION])" :key="card.name" class="cardbox">
          <Card :card="card" :actionUsed="isCardActivated(card, thisPlayer)" :cubeColor="thisPlayer.color"/>
        </div>
        <div v-for="card in getCardsByType(thisPlayer.tableau, [CardType.CEO])" :key="card.name" class="cardbox">
          <Card :card="card" :actionUsed="isCardActivated(card, thisPlayer)" :cubeColor="thisPlayer.color"/>
        </div>
        <div
          v-for="card in sortActiveCards(getCardsByType(thisPlayer.tableau, [CardType.ACTIVE, CardType.PRELUDE]).filter(isActive))"
          v-show="isVisible('ACTIVE')"
          :key="card.name"
          class="cardbox">
          <Card :card="card" :actionUsed="isCardActivated(card, thisPlayer)" :cubeColor="thisPlayer.color"/>
        </div>

        <stacked-cards
          v-show="isVisible('AUTOMATED')"
          :cards="getCardsByType(thisPlayer.tableau, [CardType.AUTOMATED, CardType.PRELUDE]).filter(isNotActive)"
        ></stacked-cards>

        <stacked-cards
          v-show="isVisible('EVENT')"
          :cards="getCardsByType(thisPlayer.tableau, [CardType.EVENT])"
        ></stacked-cards>
      </div>

      <div v-if="thisPlayer.selfReplicatingRobotsCards.length > 0" class="player_home_block">
        <dynamic-title title="Self-replicating Robots cards" :color="thisPlayer.color"/>
        <div>
          <div v-for="card in thisPlayer.selfReplicatingRobotsCards" :key="card.name" class="cardbox">
            <Card :card="card"/>
          </div>
        </div>
      </div>
    </div>

    <div v-if="thisPlayer.underworldData.tokens.length > 0">
      <dynamic-title title="Claimed Underground Resource Tokens" :color="thisPlayer.color"/>
      <underground-tokens :underworldData="thisPlayer.underworldData"></underground-tokens>
    </div>

    <template v-if="thisPlayer.tableau.length === 0">
      <PlayerSetupView :playerView="playerView" :tileView="tileView"/>
    </template>

    <div v-if="game.colonies.length > 0" ref="colonies" id="shortkey-colonies" class="player_home_block">
      <a name="colonies" class="player_home_anchor hotkey-target"></a>
      <dynamic-title title="Colonies" :color="thisPlayer.color"/>
      <div class="colonies-fleets-cont">
        <div v-for="colonyPlayer in playerView.players" :key="colonyPlayer.color" class="colonies-player-fleets">
          <div
            v-for="idx in getFleetsCountRange(colonyPlayer)"
            :key="idx"
            :class="'colonies-fleet colonies-fleet-' + colonyPlayer.color"></div>
        </div>
      </div>
      <div class="player_home_colony_cont">
        <div v-for="colony in game.colonies" :key="colony.name" class="player_home_colony">
          <colony :colony="colony" :active="colony.isActive"></colony>
        </div>
      </div>
    </div>

    <KeyboardShortcuts v-show="keyboardShortcutOpened" @close="keyboardShortcutOpened = false"></KeyboardShortcuts>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';

import Card from '@/client/components/card/Card.vue';
import PlayersOverview from '@/client/components/overview/PlayersOverview.vue';
import WaitingFor from '@/client/components/WaitingFor.vue';
import Sidebar from '@/client/components/Sidebar.vue';
import Colony from '@/client/components/colonies/Colony.vue';
import LogPanel from '@/client/components/logpanel/LogPanel.vue';
import GameBoardView from '@/client/components/GameBoardView.vue';
import PlayerSetupView from '@/client/components/PlayerSetupView.vue';
import DynamicTitle from '@/client/components/common/DynamicTitle.vue';
import SortableCards from '@/client/components/SortableCards.vue';
import TopBar from '@/client/components/TopBar.vue';
import StackedCards from '@/client/components/StackedCards.vue';
import UndergroundTokens from '@/client/components/underworld/UndergroundTokens.vue';
import KeyboardShortcuts from '@/client/components/KeyboardShortcuts.vue';
import {getPreferences, Preferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {GameModel} from '@/common/models/GameModel';
import {PlayerViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';
import {CardType} from '@/common/cards/CardType';
import {getCardsByType, isCardActivated} from '@/client/utils/CardUtils';
import {sortActiveCards} from '@/client/utils/ActiveCardsSortingOrder';
import {CardModel} from '@/common/models/CardModel';
import {getCardOrThrow} from '../cards/ClientCardManifest';
import {showError} from '../utils/showAlert';
import {HomeMixin} from '@/client/mixins/HomeMixin';
import {ApiResponse} from '@/common/http/ApiResponse';

type PlayerHomeModel = {
  showHand: boolean;
  showActiveCards: boolean;
  showAutomatedCards: boolean;
  showEventCards: boolean;
  userId: string;
  userName: string;
}

type ToggleableCardType = 'HAND' | 'ACTIVE' | 'AUTOMATED' | 'EVENT';

type ShowCardProperty = 'showHand' | 'showActiveCards' | 'showAutomatedCards' | 'showEventCards';

const typeToDataModel: Record<ToggleableCardType, {key: ShowCardProperty, preference: keyof Preferences}> = {
  HAND: {key: 'showHand', preference: 'hide_hand'},
  ACTIVE: {key: 'showActiveCards', preference: 'hide_active_cards'},
  AUTOMATED: {key: 'showAutomatedCards', preference: 'hide_automated_cards'},
  EVENT: {key: 'showEventCards', preference: 'hide_event_cards'},
} as const;

export default defineComponent({
  name: 'player-home',
  mixins: [HomeMixin],
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
      required: true,
    },
  },
  data(): PlayerHomeModel {
    const preferences = getPreferences();
    return {
      showHand: !preferences.hide_hand,
      showActiveCards: !preferences.hide_active_cards,
      showAutomatedCards: !preferences.hide_automated_cards,
      showEventCards: !preferences.hide_event_cards,
      userId: PreferencesManager.load('userId'),
      userName: PreferencesManager.load('userName'),
    };
  },
  watch: {
    showHand: function hide_hand() {
      PreferencesManager.INSTANCE.set('hide_hand', !this.showHand);
    },
    showActiveCards: function toggle_active_cards() {
      PreferencesManager.INSTANCE.set('hide_active_cards', !this.showActiveCards);
    },
    showAutomatedCards: function toggle_automated_cards() {
      PreferencesManager.INSTANCE.set('hide_automated_cards', !this.showAutomatedCards);
    },
    showEventCards: function toggle_event_cards() {
      PreferencesManager.INSTANCE.set('hide_event_cards', !this.showEventCards);
    },
  },
  computed: {
    thisPlayer(): PublicPlayerModel {
      return this.playerView.thisPlayer;
    },
    game(): GameModel {
      return this.playerView.game;
    },
    CardType(): typeof CardType {
      return CardType;
    },
    cardsInHandCount(): number {
      const playerView = this.playerView;
      return playerView.cardsInHand.length + playerView.preludeCardsInHand.length + playerView.ceoCardsInHand.length;
    },
    canSitDown(): boolean {
      const playerView = this.playerView;
      if (playerView.role === 'self' || playerView.role === 'other' || !this.userId) {
        return false;
      }
      return playerView.players.every((player: PublicPlayerModel) => player.name !== this.userName);
    },
    getCardsByType(): typeof getCardsByType {
      return getCardsByType;
    },
    isCardActivated(): typeof isCardActivated {
      return isCardActivated;
    },
    sortActiveCards(): typeof sortActiveCards {
      return sortActiveCards;
    },
  },
  components: {
    DynamicTitle,
    Card,
    'players-overview': PlayersOverview,
    'waiting-for': WaitingFor,
    'sidebar': Sidebar,
    'colony': Colony,
    'log-panel': LogPanel,
    'sortable-cards': SortableCards,
    'top-bar': TopBar,
    GameBoardView,
    PlayerSetupView,
    'stacked-cards': StackedCards,
    UndergroundTokens,
    KeyboardShortcuts,
  },
  methods: {
    isPlayerActing(playerView: PlayerViewModel): boolean {
      return playerView.players.length > 1 && playerView.waitingFor !== undefined;
    },
    getFleetsCountRange(player: PublicPlayerModel): Array<number> {
      const fleetsRange = [];
      for (let i = 0; i < player.fleetSize - player.tradesThisGeneration; i++) {
        fleetsRange.push(i);
      }
      return fleetsRange;
    },
    sitDown(): void {
      if (!this.userId) {
        return;
      }
      axios.post('/api/sitDown', {
        userId: this.userId,
        playerId: this.playerView.id,
      }).then((response: {data: ApiResponse}) => {
        if (response.data.success === false) {
          showError(response.data.message ?? 'sit down failed');
        } else {
          window.location.href = window.location.href + '';
        }
      }, (error) => {
        showError(error);
      }).catch((error) => {
        showError(error);
      });
    },
    toggle(type: ToggleableCardType): void {
      this[typeToDataModel[type].key] = !this[typeToDataModel[type].key];
    },
    isVisible(type: ToggleableCardType): boolean {
      return this[typeToDataModel[type].key];
    },
    getToggleLabel(hideType: ToggleableCardType): string {
      const val = this[typeToDataModel[hideType].key];
      return val ? '✔' : '';
    },
    getHideButtonClass(hideType: ToggleableCardType): string {
      const prefix = 'hiding-card-button ';
      switch (hideType) {
      case 'HAND':
        return prefix + (this.showHand ? 'hand-toggle' : 'hand-toggle-transparent');
      case 'ACTIVE':
        return prefix + (this.showActiveCards ? 'active' : 'active-transparent');
      case 'AUTOMATED':
        return prefix + (this.showAutomatedCards ? 'automated' : 'automated-transparent');
      case 'EVENT':
        return prefix + (this.showEventCards ? 'event' : 'event-transparent');
      }
    },
    isActive(cardModel: CardModel): boolean {
      const card = getCardOrThrow(cardModel.name);
      return card.type === CardType.ACTIVE || card.hasAction;
    },
    isNotActive(cardModel: CardModel): boolean {
      return !getCardOrThrow(cardModel.name).hasAction;
    },
  },
});

</script>
