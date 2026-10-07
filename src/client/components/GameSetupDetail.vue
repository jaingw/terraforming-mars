<template>
  <div id="game-setup-detail" class="game-setup-detail-container">
    <ul class="setup-list">
      <li class="setup-row">
        <div class="setup-item" v-i18n>Rank Mode:</div>
        <div v-if="gameOptions.rankOption" class="setup-badge setup-badge--ranked" v-i18n>On</div>
        <div v-else class="setup-badge setup-badge--neutral" v-i18n>Off</div>
      </li>
      <li v-if="gameOptions.rankTimeLimit && gameOptions.rankOption" class="setup-row">
        <div class="setup-item" v-i18n>Rank Mode Time Limit:</div>
        <div class="setup-badge setup-badge--ranked">
          {{ gameOptions.rankTimeLimit + $t(' + every generation ') + gameOptions.rankTimePerGeneration + $t(' Min per Player') }}
        </div>
      </li>
      <li class="setup-row">
        <div class="setup-item" v-i18n>Expansion:</div>
        <div class="setup-expansions">
          <a v-if="gameOptions.expansions.venus" :href="rulebookUrls.venus" class="tooltip" data-tooltip="Venus Next rulebook" target="_blank"><div class="create-game-expansion-icon expansion-icon-venus"></div></a>
          <a v-if="gameOptions.expansions.prelude" :href="rulebookUrls.prelude" class="tooltip" data-tooltip="Prelude rulebook" target="_blank"><div class="create-game-expansion-icon expansion-icon-prelude"></div></a>
          <a v-if="gameOptions.expansions.prelude2" :href="rulebookUrls.prelude2" class="tooltip" data-tooltip="Prelude 2 rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-prelude2"></div></a>
          <a v-if="gameOptions.expansions.colonies" :href="rulebookUrls.colonies" class="tooltip" data-tooltip="Colonies rulebook" target="_blank"><div class="create-game-expansion-icon expansion-icon-colony"></div></a>
          <a v-if="gameOptions.expansions.turmoil" :href="rulebookUrls.turmoil" class="tooltip" data-tooltip="Turmoil rulebook" target="_blank"><div class="create-game-expansion-icon expansion-icon-turmoil"></div></a>
          <a v-if="gameOptions.expansions.promo" :href="rulebookUrls.promo" class="tooltip" data-tooltip="Promo cards rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-promo"></div></a>
          <a v-if="gameOptions.expansions.ares" :href="rulebookUrls.ares" class="tooltip" data-tooltip="Ares rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-ares"></div></a>
          <a v-if="gameOptions.expansions.moon" :href="rulebookUrls.moon" class="tooltip" data-tooltip="The Moon rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-themoon"></div></a>
          <a v-if="gameOptions.expansions.pathfinders" :href="rulebookUrls.pathfinders" class="tooltip" data-tooltip="Pathfinders rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-pathfinders"></div></a>
          <a v-if="gameOptions.expansions.community" :href="rulebookUrls.community" class="tooltip" data-tooltip="Community rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-community"></div></a>
          <div v-if="gameOptions.expansions.eros" class="create-game-expansion-icon expansion-icon-eros"></div>
          <div v-if="gameOptions.expansions.commission" class="create-game-expansion-icon expansion-icon-commission"></div>
          <div v-if="isPoliticalAgendasOn" class="create-game-expansion-icon expansion-icon-agendas"></div>
          <a v-if="gameOptions.expansions.ceo" :href="rulebookUrls.ceo" class="tooltip" data-tooltip="CEOs rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-ceo"></div></a>
          <a v-if="gameOptions.expansions.underworld" :href="rulebookUrls.underworld" class="tooltip" data-tooltip="Underworld rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-underworld"></div></a>
          <a v-if="gameOptions.expansions.starwars" :href="rulebookUrls.starwars" class="tooltip" data-tooltip="Star Wars rules" target="_blank"><div class="create-game-expansion-icon expansion-icon-starwars"></div></a>
          <a v-if="gameOptions.expansions.deltaProject" :href="rulebookUrls.deltaProject" class="tooltip" :data-tooltip="$t('Delta Project rules')" target="_blank"><div class="create-game-expansion-icon expansion-icon-deltaProject"></div></a>
        </div>
      </li>
      <li class="setup-row">
        <div class="setup-item" v-i18n>Board:</div>
        <span :class="boardColorClass" v-i18n>{{ gameOptions.boardName }}</span>
        <span v-if="gameOptions.shuffleMapOption" class="setup-badge setup-badge--neutral" v-i18n>(randomized tiles)</span>
      </li>
      <li class="setup-row">
        <div class="setup-item" v-i18n>WGT:</div>
        <div v-if="gameOptions.solarPhaseOption" class="setup-badge setup-badge--accent" v-i18n>On</div>
        <div v-else class="setup-badge setup-badge--neutral" v-i18n>Off</div>
      </li>
      <li v-if="gameOptions.requiresVenusTrackCompletion" class="setup-row-text" v-i18n>Require terraforming Venus to end the game</li>
      <li v-if="gameOptions.requiresMoonTrackCompletion" class="setup-row-text" v-i18n>Require terraforming The Moon to end the game</li>

      <li v-if="playerNumber > 1" class="setup-row">
        <div class="setup-item" v-i18n>Milestones and Awards:</div>
        <div v-if="gameOptions.randomMA === RandomMAOptionType.NONE" class="setup-badge setup-badge--neutral" v-i18n>Board-defined</div>
        <div v-if="gameOptions.randomMA === RandomMAOptionType.LIMITED" class="setup-badge setup-badge--accent" v-i18n>Randomized with limited synergy</div>
        <div v-if="gameOptions.randomMA === RandomMAOptionType.UNLIMITED" class="setup-badge setup-badge--accent" v-i18n>Full randomized</div>
        <div v-if="gameOptions.randomMA !== RandomMAOptionType.NONE && gameOptions.includeFanMA" class="setup-badge setup-badge--accent" v-i18n>Include fan Milestones/Awards</div>
      </li>

      <li v-if="playerNumber > 1" class="setup-row">
        <div class="setup-item" v-i18n>Draft:</div>
        <div v-if="gameOptionsAny.initialCorpDraftVariant" class="setup-badge setup-badge--accent" v-i18n>Corporation</div>
        <div v-if="gameOptions.initialDraftVariant" class="setup-badge setup-badge--accent" v-i18n>Initial</div>
        <div v-if="gameOptions.draftVariant" class="setup-badge setup-badge--accent" v-i18n>Research phase</div>
        <div v-if="!gameOptions.initialDraftVariant && !gameOptions.draftVariant && !gameOptionsAny.initialCorpDraftVariant && !gameOptions.preludeDraftVariant" class="setup-badge setup-badge--neutral" v-i18n>Off</div>
        <div v-if="gameOptions.preludeDraftVariant" class="setup-badge setup-badge--accent" v-i18n>Prelude</div>
      </li>

      <li v-if="isEscapeVelocityOn" class="setup-row">
        <div class="create-game-expansion-icon expansion-icon-escape-velocity"></div>
        <span class="setup-row-text">{{ escapeVelocityDescription }}</span>
      </li>

      <li v-if="gameOptions.expansions.turmoil && gameOptions.removeNegativeGlobalEventsOption" class="setup-row">
        <div class="setup-item" v-i18n>Turmoil:</div>
        <div class="setup-badge setup-badge--neutral" v-i18n>No negative Turmoil event</div>
      </li>

      <li v-if="playerNumber === 1" class="setup-row">
        <div class="setup-item" v-i18n>Solo:</div>
        <div class="setup-badge setup-badge--neutral" v-i18n>{{ safeLastSoloGeneration }} Gens</div>
        <div v-if="gameOptions.soloTR" class="setup-badge setup-badge--neutral" v-i18n>63 TR</div>
        <div v-else class="setup-badge setup-badge--neutral" v-i18n>TR all</div>
      </li>

      <li class="setup-row">
        <div class="setup-item" v-i18n>Game configs:</div>
        <div v-if="gameOptions.fastModeOption" class="setup-badge setup-badge--accent" v-i18n>fast mode</div>
        <div v-if="gameOptions.showTimers" class="setup-badge setup-badge--accent" v-i18n>timer</div>
        <div v-if="gameOptions.showOtherPlayersVP" class="setup-badge setup-badge--accent" v-i18n>real-time vp</div>
        <div v-if="gameOptions.undoOption" class="setup-badge setup-badge--accent" v-i18n>Allow undo</div>
        <div v-if="gameOptions.heatFor" class="setup-badge setup-badge--neutral" v-i18n>7 Heat Into Temperature</div>
        <div v-if="gameOptionsAny.breakthrough" class="setup-badge setup-badge--neutral" v-i18n>BreakThrough</div>
        <div v-if="gameOptions.doubleCorp" class="setup-badge setup-badge--neutral" v-i18n>Double Corp</div>
      </li>

      <li v-if="customCorporationsList.length > 0" class="setup-row setup-row--block">
        <button class="setup-toggle-btn" @click="showCustomCorporationsList = !showCustomCorporationsList">
          {{ showCustomCorporationsList ? '-' : '+' }} {{ $t('Custom corporations') }} ({{ customCorporationsList.length }})
        </button>
        <div v-if="showCustomCorporationsList" class="setup-scroll-panel">
          <div v-for="corporation in customCorporationsList" :key="'custom-corp-' + corporation" class="setup-chip">
            {{ corporation }}
          </div>
        </div>
      </li>

      <li v-if="bannedCardsList.length > 0" class="setup-row setup-row--block">
        <button class="setup-toggle-btn" @click="showBannedCardsList = !showBannedCardsList">
          {{ showBannedCardsList ? '-' : '+' }} {{ $t('Banned cards') }} ({{ bannedCardsList.length }})
        </button>
        <div v-if="showBannedCardsList" class="setup-scroll-panel">
          <div v-for="card in bannedCardsList" :key="'banned-card-' + card" class="setup-chip">
            {{ card }}
          </div>
        </div>
      </li>

      <li v-if="includedCardsList.length > 0" class="setup-row setup-row--block">
        <button class="setup-toggle-btn" @click="showIncludedCardsList = !showIncludedCardsList">
          {{ showIncludedCardsList ? '-' : '+' }} {{ $t('Included cards') }} ({{ includedCardsList.length }})
        </button>
        <div v-if="showIncludedCardsList" class="setup-scroll-panel">
          <div v-for="card in includedCardsList" :key="'included-card-' + card" class="setup-chip">
            {{ card }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {GameOptionsModel} from '@/common/models/GameOptionsModel';
import {BoardName} from '@/common/boards/BoardName';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';
import {translateTextWithParams} from '@/client/directives/i18n';
import {RULEBOOK_URLS} from '@/client/utils/WikiLinks';

const boardColorClass: Record<BoardName, string> = {
  [BoardName.THARSIS]: 'game-config board-tharsis map',
  [BoardName.HELLAS]: 'game-config board-hellas map',
  [BoardName.ELYSIUM]: 'game-config board-elysium map',
  [BoardName.UTOPIA_PLANITIA]: 'game-config board-utopia-planitia map',
  [BoardName.VASTITAS_BOREALIS_NOVA]: 'game-config board-vastitas_borealis_nova map',
  [BoardName.TERRA_CIMMERIA_NOVA]: 'game-config board-terra_cimmeria_nova map',
  [BoardName.AMAZONIS]: 'game-config board-amazonis map',
  [BoardName.ARABIA_TERRA]: 'game-config board-arabia_terra map',
  [BoardName.VASTITAS_BOREALIS]: 'game-config board-vastitas_borealis map',
  [BoardName.TERRA_CIMMERIA]: 'game-config board-terra_cimmeria map',
  [BoardName.HOLLANDIA]: 'game-config board-hollandia map',
};

export default defineComponent({
  name: 'game-setup-detail',
  props: {
    playerNumber: {
      type: Number,
      required: true,
    },
    gameOptions: {
      type: Object as () => GameOptionsModel,
      required: true,
    },
    lastSoloGeneration: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showCustomCorporationsList: false,
      showBannedCardsList: false,
      showIncludedCardsList: false,
    };
  },
  computed: {
    gameOptionsAny(): any {
      return this.gameOptions as any;
    },
    rulebookUrls(): typeof RULEBOOK_URLS {
      return RULEBOOK_URLS;
    },
    customCorporationsList(): Array<string> {
      return this.gameOptionsAny.customCorporationsList || [];
    },
    bannedCardsList(): Array<string> {
      return this.gameOptionsAny.bannedCards || [];
    },
    includedCardsList(): Array<string> {
      return this.gameOptionsAny.includedCards || [];
    },
    safeLastSoloGeneration(): number {
      return this.lastSoloGeneration ?? 14;
    },
    isPoliticalAgendasOn(): boolean {
      return this.gameOptions.politicalAgendasExtension !== 'Standard';
    },
    boardColorClass(): string {
      return boardColorClass[this.gameOptions.boardName];
    },
    isEscapeVelocityOn(): boolean {
      return this.gameOptions.escapeVelocity !== undefined;
    },
    escapeVelocityDescription(): string {
      const ev = this.gameOptions.escapeVelocity;
      if (ev === undefined) {
        return '';
      }
      return translateTextWithParams(
        'After ${0} min, reduce ${1} VP every ${2} min. (${3} bonus sec. per action.)',
        [
          ev.thresholdMinutes.toString(),
          ev.penaltyVPPerPeriod.toString(),
          ev.penaltyPeriodMinutes.toString(),
          ev.bonusSectionsPerAction.toString(),
        ]);
    },
    RandomMAOptionType(): typeof RandomMAOptionType {
      return RandomMAOptionType;
    },
  },
});
</script>

<style scoped>
.game-setup-detail-container {
  background: rgba(17, 24, 39, 0.85);
  border: 1px solid rgba(38, 48, 73, 0.85);
  border-radius: 12px;
  padding: 10px 12px;
}

.setup-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setup-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.setup-row--block {
  flex-direction: column;
  align-items: flex-start;
}

.setup-item {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.setup-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid transparent;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 1.3;
}

.setup-badge--neutral {
  background: rgba(26, 34, 52, 0.9);
  color: #cbd5e1;
  border-color: rgba(38, 48, 73, 0.8);
}

.setup-badge--accent {
  background: rgba(6, 182, 212, 0.14);
  color: #67e8f9;
  border-color: rgba(6, 182, 212, 0.45);
}

.setup-badge--ranked {
  background: rgba(234, 179, 8, 0.18);
  color: #fef08a;
  border-color: rgba(234, 179, 8, 0.55);
}

.setup-expansions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 10px;
  border: 1px solid rgba(38, 48, 73, 0.8);
  background: rgba(26, 34, 52, 0.75);
}

.setup-row-text {
  color: #cbd5e1;
  font-size: 12px;
}

.setup-toggle-btn {
  border-radius: 9999px;
  border: 1px solid rgba(100, 116, 139, 0.55);
  background: rgba(26, 34, 52, 0.7);
  color: #cbd5e1;
  padding: 4px 12px;
  font-size: 12px;
  line-height: 1.3;
  transition: all 0.2s ease;
}

.setup-toggle-btn:hover {
  border-color: rgba(6, 182, 212, 0.65);
  color: #67e8f9;
}

.setup-scroll-panel {
  width: 100%;
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid rgba(38, 48, 73, 0.9);
  background: rgba(11, 15, 26, 0.6);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.setup-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 8px;
  border: 1px solid rgba(163, 118, 79, 0.55);
  background: rgba(163, 118, 79, 0.12);
  color: #e2e8f0;
  font-size: 11px;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .game-setup-detail-container {
    padding: 8px 10px;
    border-radius: 8px;
  }

  .setup-list {
    gap: 6px;
  }

  .setup-row {
    gap: 4px;
  }

  .setup-item {
    font-size: 11px;
    flex-shrink: 0;
  }

  .setup-badge {
    font-size: 11px;
    padding: 1px 8px;
  }

  .setup-expansions {
    gap: 2px;
    padding: 3px 4px;
  }

  .setup-expansions .create-game-expansion-icon {
    width: 22px;
    height: 22px;
    background-size: 22px 22px;
  }

  .setup-row-text {
    font-size: 11px;
  }

  .setup-toggle-btn {
    font-size: 11px;
    padding: 3px 10px;
  }

  .setup-scroll-panel {
    max-height: 120px;
    padding: 6px;
    gap: 4px;
  }

  .setup-chip {
    font-size: 10px;
    padding: 1px 6px;
  }
}
</style>
