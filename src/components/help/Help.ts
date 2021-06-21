import Vue from 'vue';
import {HelpIconology} from './HelpIconology';
import {HelpPhases} from './HelpPhases';
import {HelpStandardProjects} from './HelpStandardProjects';
import {HelpOperation} from './HelpOperation';

type Tab = 'iconology' | 'standard projects' | 'phases' | 'hotkeys' | 'help-operation';

export interface HelpPageModel {
    currentPage: Tab;
}

export const Help = Vue.component('help', {
  data: function(): HelpPageModel {
    return {
      currentPage: 'help-operation',
    };
  },
  components: {
    'iconology': HelpIconology,
    'standard-projects': HelpStandardProjects,
    'phases': HelpPhases,
    'help-operation': HelpOperation,
  },
  methods: {
    setTab: function(tab: Tab): void {
      this.currentPage = tab;
    },
    isOpen: function(tab: Tab): boolean {
      return tab === this.currentPage;
    },
  },
  template: `
    <div class="help-container">

        <div class="help-tabs">
            <input type="radio" name="help-tab" id="radio-help-operation" checked>
            <label for="radio-help-operation" v-on:click="setTab('help-operation')">
                <span v-i18n>Operation</span>
            </label>
            <input type="radio" name="help-tab" id="radio-symbols" >
            <label for="radio-symbols" v-on:click="setTab('iconology')">
                <span v-i18n>Game Iconology</span>
            </label>
            <input type="radio" name="help-tab" id="radio-standard-projects">
            <label for="radio-standard-projects" v-on:click="setTab('standard projects')">
                <span v-i18n>Standard Projects</span>
            </label>
            <input type="radio" name="help-tab" id="radio-phases">
            <label for="radio-phases" v-on:click="setTab('phases')">
                <span v-i18n>Game Phases</span>
            </label>
            <input type="radio" name="help-tab" id="radio-hotkeys">
            <label for="radio-hotkeys" v-on:click="setTab('hotkeys')">
                <span v-i18n>Hot Keys</span>
            </label>
        </div>
        
        <help-operation v-if="isOpen('help-operation')"></help-operation>

        <help-iconology v-if="isOpen('iconology')"></help-iconology>

        <help-standard-projects v-if="isOpen('standard projects')"></help-standard-projects>

        <help-phases v-if="isOpen('phases')"></help-phases>

        <div v-if="isOpen('hotkeys')">
          <div class="help-hotkeys">
            <div class="keys">
              <div v-i18n>Main Board</div>
              <div v-i18n>Players Overview Table</div>
              <div v-i18n>Cards in Hand</div>
              <div v-i18n>Colonies</div>
            </div>
          </div>
          <div class="help-hotkeys-example"></div>
        </div>
        
    </div>
    `,
});
