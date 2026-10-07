<template>
  <div class="log-container">
    <div class="log-generations">
      <h2 :class="getTitleClasses()">
        <span v-i18n>Game log</span>
      </h2>
      <div class="log-gen-title"  v-i18n>Gen: </div>
      <div class="log-gen-numbers">
        <div v-for="n in getGenerationsRange()" :key="n" :class="getClassesGenIndicator(n)" v-on:click.prevent="selectGeneration(n)">
          {{ n }}
        </div>
      </div>
      <span class="label-additional" v-if="players.length === 1"><span :class="lastGenerationClass" v-i18n>of {{lastSoloGeneration}}</span></span>
    </div>
    <div class="panel log-panel">
      <div id="logpanel-scrollable" class="panel-body" @scroll="rememberScrollPosition">
        <ul v-if="messages">
          <log-message-component v-for="(message, index) in messages" :key="index" :message="message" :viewModel="viewModel" v-on:click="messageClicked(message)" @spaceClicked="spaceClicked"></log-message-component>
        </ul>
      </div>
      <div class='debugid'>(debugid {{step}})</div>
    </div>
    <card-panel v-if="selectedMessage !== undefined" :message="selectedMessage" :players="players" v-on:hide="selectedMessage = undefined"></card-panel>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {paths} from '@/common/app/paths';
import {LogMessage} from '@/common/logs/LogMessage';
import {PublicPlayerModel, ViewModel} from '@/common/models/PlayerModel';
import {playerColorClass} from '@/common/utils/utils';
import {Color} from '@/common/Color';
import {SoundManager} from '@/client/utils/SoundManager';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {ParticipantId, SpaceId} from '@/common/Types';
import LogMessageComponent from '@/client/components/logpanel/LogMessageComponent.vue';
import CardPanel from '@/client/components/logpanel/CardPanel.vue';
import {isMarsSpace} from '@/common/boards/spaces';

let logAbortController: AbortController | undefined;
const AUTO_SCROLL_THRESHOLD = 24;

type LogScrollState = {
  scrollTop: number,
  isNearEnd: boolean,
};

let logScrollState: LogScrollState | undefined;

type LogPanelModel = {
  messages: Array<LogMessage>,
  selectedGeneration: number,
  selectedMessage: LogMessage | undefined,
};

export default defineComponent({
  name: 'log-panel',
  props: {
    viewModel: {
      type: Object as () => ViewModel,
      required: true,
    },
    color: {
      type: String as () => Color,
      required: true,
    },
    step: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data(): LogPanelModel {
    return {
      messages: [],
      selectedGeneration: -1,
      selectedMessage: undefined,
    };
  },
  components: {
    LogMessageComponent,
    CardPanel,
  },
  methods: {
    messageClicked(message: LogMessage) {
      this.selectedMessage = message;
    },
    spaceClicked(spaceId: SpaceId) {
      const id = isMarsSpace(spaceId) ? 'shortkey-board' : 'shortkey-moonBoard';
      const el = document.getElementById(id);
      el?.scrollIntoView({block: 'center', inline: 'center', behavior: 'auto'});

      const regions = ['main_board', 'moon_board', 'moon_board_outer_spaces'];
      for (const region of regions) {
        const board = document.getElementById(region);
        if (board !== null) {
          const array = board.getElementsByClassName('board-log-highlight');
          for (let i = 0, length = array.length; i < length; i++) {
            const element = array[i] as HTMLElement;
            if (element.getAttribute('data_log_highlight_id') === spaceId) {
              element.classList.add('highlight');
              setTimeout(() => {
                element.classList.remove('highlight');
              }, 3000);
              return;
            }
          }
        }
      }
    },
    selectGeneration(gen: number): void {
      if (gen !== this.selectedGeneration) {
        this.getLogsForGeneration(gen);
      }
      this.selectedGeneration = gen;
    },
    getLogsForGeneration(generation: number): void {
      const messages = this.messages;
      // abort any pending requests
      if (logAbortController) {
        logAbortController.abort();
        logAbortController = undefined;
      }

      const url = `${paths.API_GAME_LOGS}?id=${this.id}&generation=${generation}`;
      const controller = new AbortController();
      logAbortController = controller;

      fetch(url, {signal: controller.signal})
        .then((resp) => {
          if (!resp.ok) {
            console.error(`error updating messages, response code ${resp.status}`);
            return null;
          }
          return resp.json();
        })
        .then((data) => {
          if (!data) {
            return;
          }
          const scrollState = this.getScrollState();
          messages.splice(0, messages.length);
          messages.push(...data);
          if (getPreferences().enable_sounds && window.location.search.includes('experimental=1') ) {
            SoundManager.newLog();
          }
          if (generation === this.generation) {
            this.$nextTick(() => this.restoreScrollPosition(scrollState));
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') {
            // ignore aborted requests
            return;
          }
          console.error('error updating messages, unable to reach server');
        });
    },
    scrollToEnd() {
      const scrollablePanel = this.getScrollablePanel();
      if (scrollablePanel !== null) {
        scrollablePanel.scrollTop = scrollablePanel.scrollHeight;
        this.rememberScrollPosition();
      }
    },
    isScrolledNearEnd(scrollablePanel = this.getScrollablePanel()): boolean {
      if (scrollablePanel === null) {
        return true;
      }
      return scrollablePanel.scrollHeight - scrollablePanel.scrollTop - scrollablePanel.clientHeight <= AUTO_SCROLL_THRESHOLD;
    },
    getScrollablePanel(): HTMLElement | null {
      return document.getElementById('logpanel-scrollable');
    },
    getScrollState(): LogScrollState {
      const scrollablePanel = this.getScrollablePanel();
      if (scrollablePanel !== null && (this.messages.length > 0 || logScrollState === undefined)) {
        return this.captureScrollState(scrollablePanel);
      }
      return logScrollState ?? {
        scrollTop: 0,
        isNearEnd: true,
      };
    },
    captureScrollState(scrollablePanel: HTMLElement): LogScrollState {
      logScrollState = {
        scrollTop: scrollablePanel.scrollTop,
        isNearEnd: this.isScrolledNearEnd(scrollablePanel),
      };
      return logScrollState;
    },
    rememberScrollPosition(): void {
      const scrollablePanel = this.getScrollablePanel();
      if (scrollablePanel !== null) {
        this.captureScrollState(scrollablePanel);
      }
    },
    restoreScrollPosition(scrollState: LogScrollState): void {
      if (scrollState.isNearEnd) {
        this.scrollToEnd();
        return;
      }
      const scrollablePanel = this.getScrollablePanel();
      if (scrollablePanel !== null) {
        scrollablePanel.scrollTop = scrollState.scrollTop;
        this.captureScrollState(scrollablePanel);
      }
    },
    getClassesGenIndicator(gen: number): string {
      const classes = ['log-gen-indicator'];
      if (gen === this.selectedGeneration) {
        classes.push('log-gen-indicator--selected');
      }
      return classes.join(' ');
    },
    getGenerationsRange(): Array<number> {
      const generations: Array<number> = [];
      for (let i = 1; i <= this.generation; i++) {
        generations.push(i);
      }
      return generations;
    },
    getTitleClasses(): string {
      const classes = ['log-title'];
      classes.push(playerColorClass(this.color, 'shadow'));
      return classes.join(' ');
    },
    lastGenerationClass(): string {
      return this.lastSoloGeneration === this.generation ? 'last-generation blink-animation' : '';
    },
  },
  computed: {
    generation(): number {
      return this.viewModel.game.generation;
    },
    lastSoloGeneration(): number {
      return this.viewModel.game.lastSoloGeneration;
    },
    players(): Array<PublicPlayerModel> {
      return this.viewModel.players;
    },
    id(): ParticipantId | undefined {
      return this.viewModel.id;
    },
  },
  mounted() {
    this.selectedGeneration = this.generation;
    this.getLogsForGeneration(this.generation);
  },
});

</script>
