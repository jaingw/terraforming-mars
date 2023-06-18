<template>
        <div id="game-setup-detail" class="game-setup-detail-container">
          <ul>
            <li><div class="setup-item text-yellow-600" v-i18n>Rank Mode:</div>
              <div v-if="gameOptions.rankOption" class="game-config generic bg-yellow-600" v-i18n>On</div>
              <div v-else class="game-config generic" v-i18n>Off</div>
            </li>
            <li><div v-if="gameOptions.rankTimeLimit && gameOptions.rankOption" class="setup-item text-yellow-600" v-i18n>Rank Mode Time Limit:</div>
              <div v-if="gameOptions.rankTimeLimit && gameOptions.rankOption"  class="game-config generic bg-yellow-600" v-i18n>{{gameOptions.rankTimeLimit + $t(' + every generation ') + gameOptions.rankTimePerGeneration + $t(' Min per Player')}}</div>
            </li>
            <li><div class="setup-item" v-i18n>Expansion:</div>
              <div v-if="gameOptions.venusNextExtension" class="create-game-expansion-icon expansion-icon-venus"></div>
              <div v-if="gameOptions.preludeExtension" class="create-game-expansion-icon expansion-icon-prelude"></div>
              <div v-if="gameOptions.coloniesExtension" class="create-game-expansion-icon expansion-icon-colony"></div>
              <div v-if="gameOptions.turmoilExtension" class="create-game-expansion-icon expansion-icon-turmoil"></div>
              <div v-if="gameOptions.promoCardsOption" class="create-game-expansion-icon expansion-icon-promo"></div>
              <div v-if="gameOptions.aresExtension" class="create-game-expansion-icon expansion-icon-ares"></div>
              <div v-if="gameOptions.moonExpansion" class="create-game-expansion-icon expansion-icon-themoon"></div>
              <div v-if="gameOptions.pathfindersExpansion" class="create-game-expansion-icon expansion-icon-pathfinders"></div>
              <div v-if="gameOptions.communityCardsOption" class="create-game-expansion-icon expansion-icon-community"></div>
              <div v-if="gameOptions.erosCardsOption" class="create-game-expansion-icon expansion-icon-eros"></div>
              <div v-if="isPoliticalAgendasOn" class="create-game-expansion-icon expansion-icon-agendas"></div>
              <div v-if="gameOptions.ceoExtension" class="create-game-expansion-icon expansion-icon-ceo"></div>
            </li>

            <li><div class="setup-item" v-i18n>Board:</div>
              <span :class="boardColorClass" v-i18n>{{ gameOptions.boardName }}</span>
              &nbsp;
              <span v-if="gameOptions.shuffleMapOption" class="game-config generic" v-i18n>(randomized tiles)</span>
            </li>

            <li><div class="setup-item" v-i18n>WGT:</div>
              <div v-if="gameOptions.solarPhaseOption" class="game-config generic" v-i18n>On</div>
              <div v-else class="game-config generic" v-i18n>Off</div>
            </li>
            <li v-if="gameOptions.requiresVenusTrackCompletion">Require terraforming Venus to end the game</li>
            <li v-if="gameOptions.requiresMoonTrackCompletion">Require terraforming The Moon to end the game</li>

            <li v-if="playerNumber > 1">
              <div class="setup-item" v-i18n>Milestones and Awards:</div>

              <div v-if="gameOptions.randomMA === RandomMAOptionType.NONE" class="game-config generic" v-i18n>Board-defined</div>
              <div v-if="gameOptions.randomMA === RandomMAOptionType.LIMITED" class="game-config generic" v-i18n>Randomized with limited synergy</div>
              <div v-if="gameOptions.randomMA === RandomMAOptionType.UNLIMITED" class="game-config generic" v-i18n>Full randomized</div>
              <div v-if="gameOptions.venusNextExtension && gameOptions.includeVenusMA" class="game-config generic" v-i18n>Venus Milestone/Award</div>
              <div v-if="gameOptions.randomMA !== RandomMAOptionType.NONE && gameOptions.includeFanMA" class="game-config generic" v-i18n>Include fan Milestones/Awards</div>
            </li>

            <li v-if="playerNumber > 1">
              <div class="setup-item" v-i18n>Draft:</div>
              <div v-if="gameOptions.initialCorpDraftVariant" class="game-config generic" v-i18n>Corporation</div>
              <div v-if="gameOptions.initialDraftVariant" class="game-config generic" v-i18n>Initial</div>
              <div v-if="gameOptions.draftVariant" class="game-config generic" v-i18n>Research phase</div>
              <div v-if="!gameOptions.initialDraftVariant && !gameOptions.draftVariant && !gameOptions.initialCorpDraftVariant" class="game-config generic" v-i18n>Off</div>
            </li>

            <li v-if="gameOptions.escapeVelocityMode">
              <div class="create-game-expansion-icon expansion-icon-escape-velocity"></div>
              <span>After {{gameOptions.escapeVelocityThreshold}} min, reduce {{gameOptions.escapeVelocityPenalty}} VP every {{gameOptions.escapeVelocityPeriod}} min.</span>
            </li>

            <li v-if="gameOptions.turmoilExtension && gameOptions.removeNegativeGlobalEventsOption">
              <div class="setup-item" v-i18n>Turmoil:</div>
              <div class="game-config generic" v-i18n>No negative Turmoil event</div>
            </li>

            <li v-if="playerNumber === 1">
              <div class="setup-item" v-i18n>Solo:</div>
              <div class="game-config generic" v-i18n>{{ this.lastSoloGeneration }} Gens</div>
              <div v-if="gameOptions.soloTR" class="game-config generic" v-i18n>63 TR</div>
              <div v-else class="game-config generic" v-i18n>TR all</div>
            </li>

            <li><div class="setup-item" v-i18n>Game configs:</div>
              <div v-if="gameOptions.fastModeOption" class="game-config fastmode" v-i18n>fast mode</div>
              <div v-if="gameOptions.showTimers" class="game-config timer" v-i18n>timer</div>
              <div v-if="gameOptions.showOtherPlayersVP" class="game-config realtime-vp" v-i18n>real-time vp</div>
              <div v-if="gameOptions.undoOption" class="game-config undo" v-i18n>Allow undo</div>
              <div v-if="gameOptions.heatFor" class="game-config generic" v-i18n>7 Heat Into Temperature</div>
              <div v-if="gameOptions.breakthrough" class="game-config generic" v-i18n>BreakThrough</div>
              <div v-if="gameOptions.doubleCorp" class="game-config generic" v-i18n>Double Corp</div>
            </li>

            <li v-if="gameOptions.bannedCards.length > 0"><div class="setup-item" v-i18n>Banned cards:</div>{{ gameOptions.bannedCards.join(', ') }}</li>
          </ul>
        </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {BoardName} from '@/common/boards/BoardName';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';
import {AgendaStyle} from '@/common/turmoil/Types';
import {GameOptions} from '@/server/GameOptions';

const boardColorClass: Record<BoardName, string> = {
  [BoardName.THARSIS]: 'game-config board-tharsis map',
  [BoardName.HELLAS]: 'game-config board-hellas map',
  [BoardName.ELYSIUM]: 'game-config board-elysium map',
  [BoardName.AMAZONIS]: 'game-config board-amazonis map',
  [BoardName.ARABIA_TERRA]: 'game-config board-arabia_terra map',
  [BoardName.VASTITAS_BOREALIS]: 'game-config board-vastitas_borealis map',
  [BoardName.TERRA_CIMMERIA]: 'game-config board-terra_cimmeria map',
};

export default Vue.extend({
  name: 'game-setup-detail',
  props: {
    playerNumber: {
      type: Number,
    },
    gameOptions: {
      type: Object as () => GameOptions,
    },
    lastSoloGeneration: {
      type: Number,
    },
  },
  computed: {
    isPoliticalAgendasOn(): boolean {
      return (this.gameOptions.politicalAgendasExtension !== AgendaStyle.STANDARD);
    },
    boardColorClass(): string {
      return boardColorClass[this.gameOptions.boardName];
    },
    RandomMAOptionType(): typeof RandomMAOptionType {
      return RandomMAOptionType;
    },
  },
});

</script>
