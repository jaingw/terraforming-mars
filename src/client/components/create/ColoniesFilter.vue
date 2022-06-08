<template>
    <div class="colonies-filter">
        <div>
            <h2 v-i18n>Colonies</h2>
        </div>
        <div class="colonies-filter-list corporations-filter-toolbox-cont">
            <h2 v-i18n>Official</h2>
            <div class="corporations-filter-toolbox">
              <a href="#" v-i18n v-on:click.prevent="selectAll('Official')">All</a> |
              <a href="#" v-i18n v-on:click.prevent="selectNone('Official')">None</a> |
              <a href="#" v-i18n v-on:click.prevent="invertSelection('Official')">Invert</a>
            </div>
            <label class="form-checkbox" v-for="colony in officialColonies" v-bind:key="colony">
                <input type="checkbox" v-model="selectedColonies" :value="colony"/>
                <i class="form-icon"></i><span v-i18n>{{ colony }} - ({{ description(colony) }})</span>
            </label>
        </div>
        <div class="colonies-filter-list corporations-filter-toolbox-cont">
            <h2 v-i18n>Community</h2>
            <div class="corporations-filter-toolbox">
              <a href="#" v-i18n v-on:click.prevent="selectAll('Community')">All</a> |
              <a href="#" v-i18n v-on:click.prevent="selectNone('Community')">None</a> |
              <a href="#" v-i18n v-on:click.prevent="invertSelection('Community')">Invert</a>
            </div>
            <label class="form-checkbox" v-for="colony in communityColonies" v-bind:key="colony">
                <input type="checkbox" v-model="selectedColonies" :value="colony"/>
                <i class="form-icon"></i><span v-i18n>{{ colony }} - ({{ description(colony) }})</span>
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {ColonyName} from '@/common/colonies/ColonyName';
import {COLONY_DESCRIPTIONS} from '@/common/colonies/ColonyDescription';
import {OFFICIAL_COLONY_NAMES, COMMUNITY_COLONY_NAMES} from '@/common/colonies/AllColonies';

type Data = {
  allColonies: Array<ColonyName>,
  officialColonies: Array<ColonyName>,
  communityColonies: Array<ColonyName>,
  selectedColonies: Array<ColonyName>,
}
export default Vue.extend({
  name: 'ColoniesFilter',
  props: {
    communityCardsOption: {
      type: Boolean,
    },
    venusNext: {
      type: Boolean,
    },
    turmoil: {
      type: Boolean,
    },
  },
  data() {
    const data: Data = {
      allColonies: OFFICIAL_COLONY_NAMES.concat(COMMUNITY_COLONY_NAMES),
      officialColonies: OFFICIAL_COLONY_NAMES,
      communityColonies: COMMUNITY_COLONY_NAMES,
      selectedColonies: [
        ...OFFICIAL_COLONY_NAMES,
        ...this.communityCardsOption ? COMMUNITY_COLONY_NAMES: [],
      ],
    };
    return data;
  },
  methods: {
    description(colonyName: ColonyName): string {
      return COLONY_DESCRIPTIONS.get(colonyName) ?? 'unknown';
    },
    selectAll: function(group: string) {
      const colonies = group === 'Official' ? OFFICIAL_COLONY_NAMES : COMMUNITY_COLONY_NAMES;
      if (!Array.isArray(this.selectedColonies)) {
        this.selectedColonies = [];
      }
      for (const item of colonies) {
        if (this.selectedColonies.includes(item) === false) {
          this.selectedColonies.push(item);
        }
      }
    },
    selectNone: function(group: string) {
      const colonies = group === 'Official' ? OFFICIAL_COLONY_NAMES : COMMUNITY_COLONY_NAMES;
      if (!Array.isArray(this.selectedColonies)) {
        this.selectedColonies = [];
      }
      for (const item of colonies) {
        const itemIdx = this.selectedColonies.indexOf(item);
        if (itemIdx !== -1) {
          this.selectedColonies.splice(itemIdx, 1);
        }
      }
    },
    invertSelection: function(group: string) {
      const colonies = group === 'Official' ? OFFICIAL_COLONY_NAMES : COMMUNITY_COLONY_NAMES;
      if (!Array.isArray(this.selectedColonies)) {
        this.selectedColonies = [];
      }
      for (const item of colonies) {
        const itemIdx = this.selectedColonies.indexOf(item);
        if (itemIdx !== -1) {
          this.selectedColonies.splice(itemIdx, 1);
        } else {
          this.selectedColonies.push(item);
        }
      }
    },
  },
  watch: {
    selectedColonies(value: Array<ColonyName>) {
      const colonyNames: Array<ColonyName> = [...value];
      this.$emit('colonies-list-changed', colonyNames);
    },
    communityCardsOption(enabled) {
      if (enabled) {
        this.selectedColonies = OFFICIAL_COLONY_NAMES.concat(COMMUNITY_COLONY_NAMES).slice();
        if (this.venusNext === false) this.selectedColonies = this.selectedColonies.filter((c) => c !== ColonyName.VENUS);
        if (this.turmoil === false) this.selectedColonies = this.selectedColonies.filter((c) => c !== ColonyName.PALLAS);
      } else {
        this.selectedColonies = OFFICIAL_COLONY_NAMES.slice();
      }
    },
    venusNext(enabled) {
      if (this.communityCardsOption && Array.isArray(this.selectedColonies)) {
        if (enabled === false) {
          this.selectedColonies = this.selectedColonies.filter((c) => c !== ColonyName.VENUS);
        } else if (this.selectedColonies.find((c) => c === ColonyName.VENUS) === undefined) {
          this.selectedColonies.push(ColonyName.VENUS);
        }
      }
    },
    turmoil(enabled) {
      if (this.communityCardsOption && Array.isArray(this.selectedColonies)) {
        if (enabled === false) {
          this.selectedColonies = this.selectedColonies.filter((c) => c !== ColonyName.PALLAS);
        } else if (this.selectedColonies.find((c) => c === ColonyName.PALLAS) === undefined) {
          this.selectedColonies.push(ColonyName.PALLAS);
        }
      }
    },
  },
});
</script>
