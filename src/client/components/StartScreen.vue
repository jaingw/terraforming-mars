<template>
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
          <a class="start-screen-link start-screen-link--how-to-play" href="/mygames" v-if="userName" v-i18n>My Games</a>
          <a class="start-screen-link start-screen-link--how-to-play" href="/login" v-else v-i18n>Login</a>
          <!-- <a class="start-screen-link start-screen-link--cards-list" href="https://wx4.sinaimg.cn/mw2000/0081mJiNgy1h02nbunoj0j30ze0zatsn.jpg" v-i18n>Donate</a> -->
          <a class="start-screen-link start-screen-link--cards-list" href="https://docs.qq.com/doc/DQU5vYmtJeGRQaVpN"  target="_blank" v-i18n>Help Translation</a>
          <a class="start-screen-link start-screen-link--board-game" href="/help"  target="_blank"  v-i18n>Help</a>
          <a class="start-screen-link start-screen-link--about" href="cards"  target="_blank"  v-i18n>Cards list</a>
          <a class="start-screen-link start-screen-link--changelog" href="https://boardgamegeek.com/boardgame/167791/terraforming-mars"  target="_blank"  v-i18n>Board game</a>

          <div class="start-screen-header  start-screen-link--languages">
            <language-switcher />
            <div class="start-screen-version-cont">
        <div class="nowrap start-screen-date"><span v-i18n>deployed</span>: {{raw_settings.builtAt}}</div>
        <div class="nowrap start-screen-version"><span v-i18n>version</span>: {{raw_settings.head}}</div>
            </div>
          </div>
      </div>
  <div class="free-floating-preferences-icon">
  </div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import LanguageSwitcher from '@/client/components/LanguageSwitcher.vue';

import * as raw_settings from '@/genfiles/settings.json';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import * as constants from '@/common/constants';

export default Vue.extend({
  name: 'start-screen',
  data: function() {
    return {
      userName: '',
    };
  },
  components: {
    LanguageSwitcher,
  },
  computed: {
    raw_settings(): typeof raw_settings {
      return raw_settings;
    },
    DISCORD_INVITE(): string {
      return constants.DISCORD_INVITE;
    },
  },
  mounted: function() {
    this.userName = PreferencesManager.load('userName');
  },
});

</script>
