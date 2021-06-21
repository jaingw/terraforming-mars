import Vue from 'vue';
import {LanguageSwitcher} from './LanguageSwitcher';
import {PreferencesManager} from './PreferencesManager';

import * as raw_settings from '../genfiles/settings.json';

export const StartScreen = Vue.component('start-screen', {
  props: {
    version: {
      type: String as () => typeof raw_settings.version,
    },
  },
  data: function() {
    return {
      userName: '',
    };
  },
  methods: {
    palyVideo: function() {
      (document.getElementById('video') as any).play();
    },
    getAppVersion(): string {
      const versionParts = this.version.split(' ');
      return versionParts[0];
    },
    getAppDate(): string {
      const versionParts = this.version.split(' ');
      if (versionParts.length > 1) {
        return versionParts.slice(1).join(' ');
      }
      return '';
    },

  },
  mounted: function() {
    this.userName = PreferencesManager.load('userName');
  },
  components: {
    LanguageSwitcher,
  },
  template: `
        <div class="start-screen">           
            <div v-i18n class="start-screen-links">
                <div class="start-screen-header start-screen-link--title" v-if="userName">
                    <div class="start-screen-title-top">Welcome</div> 
                    <div class="start-screen-title-bottom">{{userName}}</div>
                </div>
                <div class="start-screen-header start-screen-link--title" v-else>
                    <div class="start-screen-title-top">TERRAFORMING</div> 
                    <div class="start-screen-title-bottom">MARS</div>
                </div>
                <a class="start-screen-link start-screen-link--new-game" href="/new-game" v-i18n>New game</a>
                <a class="start-screen-link start-screen-link--solo" href="/mygames" v-if="userName" v-i18n>My Games</a>
                <a class="start-screen-link start-screen-link--solo" href="/login" v-else v-i18n>Login</a>
                <a class="start-screen-link start-screen-link--cards-list" href="/donate" v-i18n>Donate</a>
                <a class="start-screen-link start-screen-link--board-game" href="/help"  target="_blank"  v-i18n>Help</a>
                <a class="start-screen-link start-screen-link--about" href="cards"  target="_blank"  v-i18n>Cards list</a>
                <a class="start-screen-link start-screen-link--changelog" href="https://boardgamegeek.com/boardgame/167791/terraforming-mars"  target="_blank"  v-i18n>Board game</a>
                
                <div class="start-screen-header  start-screen-link--languages">
                    <language-switcher />
      <div class="start-screen-version-cont">
        <div class="nowrap start-screen-date"><span v-i18n>deployed</span>: {{getAppDate()}}</div>
        <div class="nowrap start-screen-version"><span v-i18n>version</span>: {{getAppVersion()}}</div>
      </div>
                </div>
            </div>


</div>`,
});
