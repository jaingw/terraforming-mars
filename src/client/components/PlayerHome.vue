<template>
  <div id="player-home" :class="(game.turmoil ? 'with-turmoil': '')">
        <confirm-dialog message="开启后其他玩家可以通过你的游戏链接查看你的手牌，但不能帮你操作" ref="showHand"  />
            <h2 :class="'game-title player_color_'+ playerView.color">
                <a :href="'/game?id='+ playerView.gameId" v-i18n>Terraforming Mars</a>
                <a :href="'mygames'" v-if="userName">- {{userName}}</a>
            </h2>
      <top-bar :playerView="playerView" />

      <div v-if="game.phase === 'end'">
          <div class="player_home_block">
              <DynamicTitle title="This game is over!" :color="thisPlayer.color"/>
              <a :href="'/the-end?id='+ playerView.id" v-i18n>Go to game results</a>
          </div>
      </div>

      <sidebar v-trim-whitespace
        :acting_player="isPlayerActing(playerView)"
              :playerView="playerView"
        :player_color="thisPlayer.color"
        :generation="game.generation"
        :coloniesCount="game.colonies.length"
        :temperature = "game.temperature"
        :oxygen = "game.oxygenLevel"
        :oceans = "game.oceans"
        :venus = "game.venusScaleLevel"
        :turmoil = "game.turmoil"
        :moonData="game.moon"
        :gameOptions = "game.gameOptions"
        :playerNumber = "playerView.players.length"
        :lastSoloGeneration = "game.lastSoloGeneration">
          <div class="deck-size">{{ game.deckSize }}</div>
      </sidebar>

      <div v-if="thisPlayer.corporationCard">

          <div class="player_home_block">
              <a name="board" class="player_home_anchor"></a>
              <board
                :spaces="game.spaces"
                :venusNextExtension="game.gameOptions.venusNextExtension"
                :venusScaleLevel="game.venusScaleLevel"
                :boardName ="game.gameOptions.boardName"
                :oceans_count="game.oceans"
                :oxygen_level="game.oxygenLevel"
                :temperature="game.temperature"
                :aresExtension="game.gameOptions.aresExtension"
                :pathfindersExpansion="game.gameOptions.pathfindersExpansion"
                :altVenusBoard="game.gameOptions.altVenusBoard"
                :aresData="game.aresData"
                :hideTiles="hideTiles"
                @toggleHideTiles="hideTiles = !hideTiles"
                id="shortkey-board"
              />

              <turmoil v-if="game.turmoil" :turmoil="game.turmoil"/>

              <MoonBoard v-if="game.gameOptions.moonExpansion" :model="game.moon" :hideTiles="hideTiles"/>

              <PlanetaryTracks v-if="game.gameOptions.pathfindersExpansion" :tracks="game.pathfinders" :gameOptions="game.gameOptions"/>

              <div v-if="playerView.players.length > 1" class="player_home_block--milestones-and-awards">
                  <Milestone :milestones_list="game.milestones" />
                  <Awards :awards="game.awards" show-scores/>
              </div>
          </div>

          <players-overview class="player_home_block player_home_block--players nofloat" :playerView="playerView" v-trim-whitespace id="shortkey-playersoverview"/>

          <div class="player_home_block nofloat">
              <log-panel
                :id="playerView.id"
                :players="playerView.players"
                :generation="game.generation"
                :lastSoloGeneration="game.lastSoloGeneration"
                :color="thisPlayer.color"
                :step="game.step"></log-panel>
          </div>

          <div class="player_home_block player_home_block--actions nofloat">
              <a name="actions" class="player_home_anchor"></a>
              <dynamic-title title="Actions" :color="thisPlayer.color"/>
                    <label class="form-switch" style="margin-left: 20px;display: inline-block;">
                        <input type="checkbox" name="soundtip" v-model="soundtip" v-on:change="updateTips" >
                        <i class="form-icon"></i> <span v-i18n>Soundtip</span>
                    </label>
                    <label v-if="playerView.isme" class="form-switch" style="margin-left: 20px;display: inline-block;">
                        <input type="checkbox" name="showhandcards" v-model="showhandcards" v-on:change="updateShowHandCards" >
                        <i class="form-icon"></i> <span v-i18n>Show cards in hand to others</span>
                    </label>
                    <label v-if="!playerView.isme && !playerView.block" class="form-switch" style="display: inline-block;">
                        <button id="sitdown" class="played-cards-button btn btn-tiny"  v-on:click="sitDown()"><span v-i18n>Sit down</span></button>
                    </label>
              <waiting-for v-if="game.phase !== 'end'" :players="playerView.players" :playerView="playerView" :settings="settings" :waitingfor="playerView.waitingFor"></waiting-for>
          </div>

          <div class="player_home_block player_home_block--hand" v-if="playerView.draftedCards.length > 0">
              <dynamic-title title="Drafted cards" :color="thisPlayer.color" />
              <div v-for="card in playerView.draftedCards" :key="card.name" class="cardbox">
                  <Card :card="card"/>
              </div>
          </div>

          <a name="cards" class="player_home_anchor"></a>
          <div class="player_home_block player_home_block--hand" v-if="playerView.cardsInHand.length + playerView.preludeCardsInHand.length > 0" id="shortkey-hand">
              <dynamic-title title="Cards In Hand" :color="thisPlayer.color" :withAdditional="true" :additional="(thisPlayer.cardsInHandNbr + playerView.preludeCardsInHand.length).toString()" />
              <sortable-cards :playerId="playerView.id" :cards="playerView.preludeCardsInHand.concat(playerView.cardsInHand)" />
          </div>

          <div class="player_home_block player_home_block--cards">
              <div class="hiding-card-button-row">
                  <dynamic-title title="Played Cards" :color="thisPlayer.color" />
                  <div class="played-cards-filters">
                    <div :class="getHideButtonClass('ACTIVE')" v-on:click.prevent="toggle('ACTIVE')">
                      <div class="played-cards-count">{{getCardsByType(thisPlayer.playedCards, [getActiveCardType()]).length.toString()}}</div>
                      <div class="played-cards-selection" v-i18n>{{ getToggleLabel('ACTIVE')}}</div>
                    </div>
                    <div :class="getHideButtonClass('AUTOMATED')" v-on:click.prevent="toggle('AUTOMATED')">
                      <div class="played-cards-count">{{getCardsByType(thisPlayer.playedCards, [getAutomatedCardType(), getPreludeCardType()]).length.toString()}}</div>
                      <div class="played-cards-selection" v-i18n>{{ getToggleLabel('AUTOMATED')}}</div>
                    </div>
                    <div :class="getHideButtonClass('EVENT')" v-on:click.prevent="toggle('EVENT')">
                      <div class="played-cards-count">{{getCardsByType(thisPlayer.playedCards, [getEventCardType()]).length.toString()}}</div>
                      <div class="played-cards-selection" v-i18n>{{ getToggleLabel('EVENT')}}</div>
                    </div>
                  </div>
                  <div class="text-overview" v-i18n>[ toggle cards filters ]</div>
              </div>
              <div v-if="thisPlayer.corporationCard !== undefined" class="cardbox">
                  <Card :card="thisPlayer.corporationCard" :actionUsed="isCardActivated(thisPlayer.corporationCard, thisPlayer)"/>
                    </div>
                    <div v-if="thisPlayer.corporationCard2 !== undefined" class="cardbox">
                        <Card :card="thisPlayer.corporationCard2" :actionUsed="isCardActivated(thisPlayer.corporationCard2, thisPlayer)"/>
              </div>
              <div v-show="isVisible('ACTIVE')" v-for="card in sortActiveCards(getCardsByType(thisPlayer.playedCards, [getActiveCardType()]))" :key="card.name" class="cardbox">
                  <Card :card="card" :actionUsed="isCardActivated(card, thisPlayer)"/>
              </div>

              <stacked-cards v-show="isVisible('AUTOMATED')" :cards="getCardsByType(thisPlayer.playedCards, [getAutomatedCardType(), getPreludeCardType()])" ></stacked-cards>

              <stacked-cards v-show="isVisible('EVENT')" :cards="getCardsByType(thisPlayer.playedCards, [getEventCardType()])" ></stacked-cards>

          </div>

          <div v-if="thisPlayer.selfReplicatingRobotsCards.length > 0" class="player_home_block">
              <dynamic-title title="Self-Replicating Robots cards" :color="thisPlayer.color"/>
              <div>
                  <div v-for="card in getCardsByType(thisPlayer.selfReplicatingRobotsCards, [getActiveCardType()])" :key="card.name" class="cardbox">
                      <Card :card="card"/>
                  </div>
              </div>
          </div>

      </div>

      <div class="player_home_block player_home_block--setup nofloat"  v-if="!thisPlayer.corporationCard">

          <template v-if="isInitialDraftingPhase()">
            <div v-for="card in playerView.dealtCorporationCards" :key="card.name" class="cardbox">
              <Card :card="card"/>
            </div>

            <div v-for="card in playerView.dealtPreludeCards" :key="card.name" class="cardbox">
              <Card :card="card"/>
            </div>

            <div v-for="card in playerView.dealtProjectCards" :key="card.name" class="cardbox">
              <Card :card="card"/>
            </div>
          </template>
          <div class="player_home_block player_home_block--hand" v-if="playerView.draftedCards.length > 0">
              <dynamic-title title="Drafted Cards" :color="thisPlayer.color"/>
              <div v-for="card in playerView.draftedCards" :key="card.name" class="cardbox">
                  <Card :card="card"/>
              </div>
          </div>

          <template v-if="playerView.pickedCorporationCard.length === 1">
            <dynamic-title title="Your selected cards:" :color="thisPlayer.color"/>
            <div>
              <div class="cardbox">
                <Card :card="playerView.pickedCorporationCard[0]"/>
              </div>
                    <div v-if="playerView.pickedCorporationCard2.length === 1" class="cardbox">
                      <Card :card="playerView.pickedCorporationCard2[0]"/>
                    </div>
              <template v-if="game.gameOptions.preludeExtension">
                <div v-for="card in playerView.preludeCardsInHand" :key="card.name" class="cardbox">
                  <Card :card="card"/>
                </div>
              </template>
            </div>
            <div>
              <div v-for="card in playerView.cardsInHand" :key="card.name" class="cardbox">
                <Card :card="card"/>
              </div>
            </div>
          </template>

          <dynamic-title v-if="playerView.pickedCorporationCard.length === 0" title="Select initial cards:" :color="thisPlayer.color"/>
          <waiting-for v-if="game.phase !== 'end'" :players="playerView.players" :playerView="playerView" :settings="settings" :waitingfor="playerView.waitingFor"></waiting-for>

          <dynamic-title title="Game details" :color="thisPlayer.color"/>

          <div class="player_home_block" v-if="playerView.players.length > 1">
              <Milestone :show_scores="false" :milestones_list="game.milestones" />
              <Awards :awards="game.awards" />
          </div>
          <div class="player_home_block player_home_block--turnorder nofloat" v-if="playerView.players.length>1">
              <dynamic-title title="Turn order" :color="thisPlayer.color"/>
              <div class="player_item" v-for="(p, idx) in playerView.players" :key="idx" v-trim-whitespace>
                  <div class="player_name_cont" :class="getPlayerCssForTurnOrder(p, true)">
                      <span class="player_number">{{ idx+1 }}.</span><span class="player_name" :class="getPlayerCssForTurnOrder(p, false)" href="#">{{ p.name }}</span>
                  </div>
                  <div class="player_separator" v-if="idx !== playerView.players.length - 1">⟶</div>
              </div>
          </div>

          <details class="accordion board-accordion" open>
              <summary class="accordion-header">
                  <div class="is-action">
                      <i class="icon icon-arrow-right mr-1"></i>
                      <span v-i18n>Board</span>
                  </div>
              </summary>
              <div class="accordion-body">
                  <board
                    :spaces="game.spaces"
                    :venusNextExtension="game.gameOptions.venusNextExtension"
                    :venusScaleLevel="game.venusScaleLevel"
                    :boardName ="game.gameOptions.boardName"
                    :aresExtension="game.gameOptions.aresExtension"
                    :pathfindersExpansion="game.gameOptions.pathfindersExpansion"
                    :aresData="game.aresData"
                    :altVenusBoard="game.gameOptions.altVenusBoard">
                  </board>

                  <turmoil v-if="game.turmoil" :turmoil="game.turmoil"></turmoil>

                  <MoonBoard v-if="game.gameOptions.moonExpansion" :model="game.moon"></MoonBoard>

              </div>
          </details>
      </div>

      <div v-if="game.colonies.length > 0" class="player_home_block" ref="colonies" id="shortkey-colonies">
          <a name="colonies" class="player_home_anchor"></a>
          <dynamic-title title="Colonies" :color="thisPlayer.color"/>
          <div class="colonies-fleets-cont" v-if="thisPlayer.corporationCard">
              <div class="colonies-player-fleets" v-for="colonyPlayer in playerView.players" :key="colonyPlayer.color">
                  <div :class="'colonies-fleet colonies-fleet-'+ colonyPlayer.color" v-for="idx in getFleetsCountRange(colonyPlayer)" :key="idx"></div>
              </div>
          </div>
          <div class="player_home_colony_cont">
              <div class="player_home_colony" v-for="colony in game.colonies" :key="colony.name">
                  <colony :colony="colony"></colony>
              </div>
          </div>
      </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

import Board from '@/client/components/Board.vue';
import Card from '@/client/components/card/Card.vue';
import Milestone from '@/client/components/Milestone.vue';
import Awards from '@/client/components/Awards.vue';
import PlayersOverview from '@/client/components/overview/PlayersOverview.vue';
import WaitingFor from '@/client/components/WaitingFor.vue';
import Sidebar from '@/client/components/Sidebar.vue';
import Colony from '@/client/components/colonies/Colony.vue';
import LogPanel from '@/client/components/LogPanel.vue';
import {PlayerMixin} from '@/client/mixins/PlayerMixin';
import Turmoil from '@/client/components/turmoil/Turmoil.vue';
import {playerColorClass} from '@/common/utils/utils';
import PlanetaryTracks from '@/client/components/pathfinders/PlanetaryTracks.vue';
import DynamicTitle from '@/client/components/common/DynamicTitle.vue';
import SortableCards from '@/client/components/SortableCards.vue';
import TopBar from '@/client/components/TopBar.vue';
import {getPreferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {KeyboardNavigation} from '@/client/components/KeyboardNavigation';
import MoonBoard from '@/client/components/moon/MoonBoard.vue';
import {Phase} from '@/common/Phase';
import StackedCards from '@/client/components/StackedCards.vue';
import {GameModel} from '@/common/models/GameModel';
import {PlayerViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';

import * as raw_settings from '@/genfiles/settings.json';
import ConfirmDialog from './common/ConfirmDialog.vue';

export interface PlayerHomeModel {
  showActiveCards: boolean;
  showAutomatedCards: boolean;
  showEventCards: boolean;
  hideTiles: boolean;
  userId: string;
  soundtip: boolean ;
  showhandcards: boolean ;
  userName: string;
}

class TerraformedAlertDialog {
  static shouldAlert = true;
}

export default Vue.extend({
  name: 'player-home',
  data(): PlayerHomeModel {
    const preferences = getPreferences();
    return {
      showActiveCards: !preferences.hide_active_cards,
      showAutomatedCards: !preferences.hide_automated_cards,
      showEventCards: !preferences.hide_event_cards,
      hideTiles: false,
      userId: PreferencesManager.load('userId'),
      soundtip: false,
      showhandcards: false,
      userName: '',
    };
  },
  watch: {
    hide_active_cards() {
      PreferencesManager.INSTANCE.set('hide_active_cards', !this.showActiveCards);
    },
    hide_automated_cards() {
      PreferencesManager.INSTANCE.set('hide_automated_cards', !this.showAutomatedCards);
    },
    hide_event_cards() {
      PreferencesManager.INSTANCE.set('hide_event_cards', !this.showEventCards);
    },
  },
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
    },
    settings: {
      type: Object as () => typeof raw_settings,
    },
  },
  computed: {
    thisPlayer(): PublicPlayerModel {
      return this.playerView.thisPlayer;
    },
    game(): GameModel {
      return this.playerView.game;
    },
  },
  components: {
    'board': Board,
    DynamicTitle,
    Card,
    'players-overview': PlayersOverview,
    'waiting-for': WaitingFor,
    Milestone,
    Awards,
    'sidebar': Sidebar,
    'colony': Colony,
    'log-panel': LogPanel,
    'turmoil': Turmoil,
    'sortable-cards': SortableCards,
    'top-bar': TopBar,
    MoonBoard,
    PlanetaryTracks,
    'confirm-dialog': ConfirmDialog,
    'stacked-cards': StackedCards,
  },
  mixins: [PlayerMixin],
  methods: {
    ...PlayerMixin.methods,
    navigatePage(event: KeyboardEvent) {
      const inputSource = event.target as Element;
      if (inputSource.nodeName.toLowerCase() !== 'input') {
        let idSuffix: string | undefined = undefined;
        switch (event.code) {
        case KeyboardNavigation.GAMEBOARD:
          idSuffix = 'board';
          break;
        case KeyboardNavigation.PLAYERSOVERVIEW:
          idSuffix = 'playersoverview';
          break;
        case KeyboardNavigation.HAND:
          idSuffix = 'hand';
          break;
        case KeyboardNavigation.COLONIES:
          idSuffix = 'colonies';
          break;
        default:
          return;
        }
        const el = document.getElementById('shortkey-' + idSuffix);
        if (el) {
          event.preventDefault();
          el.scrollIntoView({block: 'center', inline: 'center', behavior: 'auto'});
        }
      }
    },
    isPlayerActing(playerView: PlayerViewModel) : boolean {
      return playerView.players.length > 1 && playerView.waitingFor !== undefined;
    },
    getPlayerCssForTurnOrder: function(
      publicPlayer: PublicPlayerModel,
      highlightActive: boolean,
    ): string {
      const classes = ['highlighter_box'];
      if (publicPlayer.exited) {
        classes.push('player_exited');
      }
      if (highlightActive && publicPlayer.isActive) {
        classes.push('player_is_active');
      }
      // hilightActive 显示小框的高亮
      if (!highlightActive && publicPlayer.waitingFor !== undefined &&
        (!publicPlayer.isActive || this.game.phase === 'drafting' || this.game.phase === 'research' || this.game.phase === 'initial_drafting' )) {
        classes.push(' player_is_waiting');
      }
      if (highlightActive) {
        classes.push(playerColorClass(publicPlayer.color, 'bg'));
      }
      return classes.join(' ');
    },
    getFleetsCountRange(player: PublicPlayerModel): Array<number> {
      const fleetsRange: Array<number> = [];
      for (let i = 0; i < player.fleetSize - player.tradesThisGeneration; i++) {
        fleetsRange.push(i);
      }
      return fleetsRange;
    },
    updateTips: function() {
      PreferencesManager.INSTANCE.set('enable_sounds', this.soundtip );
    },
    updateShowHandCards: function() {
      const userId = PreferencesManager.load('userId');
      if ( userId === undefined) {
        return;
      }
      const $this =this;
      axios.post('/api/showHand', {
        userId: userId,
        showhandcards: this.showhandcards,
      }).then(function(response) {
        if ($this.showhandcards) {
          ($this.$refs['showHand'] as any).show();
        }
        console.log(response);
      }).catch(function(error) {
        alert(error);
      });
    },
    sitDown: function() {
      const userId = PreferencesManager.load('userId');
      if ( userId === undefined) {
        return;
      }
      axios.post('/api/sitDown', {
        userId: userId,
        playerId: this.playerView.id,
      }).then(function(response) {
        console.log(response);
        if (response.data !== 'success' && response.data?.length > 0) {
          alert(response.data);
        } else {
          window.location=window.location;
        }
      }, function(error) {
        alert(error);
      }).catch(function(error) {
        alert(error);
      });
    },
    toggle(type: string): void {
      switch (type) {
      case 'ACTIVE':
        this.showActiveCards = !this.showActiveCards;
        break;
      case 'AUTOMATED':
        this.showAutomatedCards = !this.showAutomatedCards;
        break;
      case 'EVENT':
        this.showEventCards = !this.showEventCards;
        break;
      }
    },
    isVisible(type: string): boolean {
      switch (type) {
      case 'ACTIVE':
        return this.showActiveCards;
      case 'AUTOMATED':
        return this.showAutomatedCards;
      case 'EVENT':
        return this.showEventCards;
      }
      return false;
    },
    isInitialDraftingPhase(): boolean {
      return (this.game.phase === Phase.INITIALDRAFTING) && this.game.gameOptions.initialDraftVariant;
    },
    getToggleLabel(hideType: string): string {
      if (hideType === 'ACTIVE') {
        return (this.showActiveCards? '✔' : '');
      } else if (hideType === 'AUTOMATED') {
        return (this.showAutomatedCards ? '✔' : '');
      } else if (hideType === 'EVENT') {
        return (this.showEventCards ? '✔' : '');
      } else {
        return '';
      }
    },
    getHideButtonClass(hideType: string): string {
      const prefix = 'hiding-card-button ';
      if (hideType === 'ACTIVE') {
        return prefix + (this.showActiveCards ? 'active' : 'active-transparent');
      } else if (hideType === 'AUTOMATED') {
        return prefix + (this.showAutomatedCards ? 'automated' : 'automated-transparent');
      } else if (hideType === 'EVENT') {
        return prefix + (this.showEventCards ? 'event' : 'event-transparent');
      } else {
        return '';
      }
    },
  },
  created() {
    if (window.localStorage) {
      this.soundtip = getPreferences().enable_sounds;
      this.userName = PreferencesManager.load('userName');
    }
    this.showhandcards = this.playerView.showhandcards;
  },
  destroyed() {
    window.removeEventListener('keydown', this.navigatePage);
  },
  mounted() {
    window.addEventListener('keydown', this.navigatePage);
    if (this.game.isTerraformed && TerraformedAlertDialog.shouldAlert && getPreferences().show_alerts) {
      alert('Mars is Terraformed!');
      // Avoids repeated calls.
      TerraformedAlertDialog.shouldAlert = false;
    }
  },

});

</script>
