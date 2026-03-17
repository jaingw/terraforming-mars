<template>
  <div class="start-screen">
      <div v-i18n class="start-screen-links">
          <!-- Mars-themed header -->
          <div class="start-screen-hero">
            <div class="start-screen-hero__accent"></div>
            <div class="start-screen-hero__content" v-if="userName">
              <div class="start-screen-hero__label">Welcome, Commander</div>
              <div class="start-screen-hero__name">{{userName}}</div>
            </div>
            <div class="start-screen-hero__content" v-else>
              <div class="start-screen-hero__label">Terraforming</div>
              <div class="start-screen-hero__name">Mars</div>
            </div>
            <div class="start-screen-hero__line"></div>
          </div>

          <!-- Primary action buttons (with background images) -->
          <a class="start-screen-link start-screen-link--new-game" href="new-game" v-i18n>New game</a>
          <a class="start-screen-link start-screen-link--lobby" href="lobby" v-i18n>Game Lobby</a>
          <a class="start-screen-link start-screen-link--me" href="/me" v-if="userName" v-i18n>Me</a>
          <a class="start-screen-link start-screen-link--me" href="/login" v-else v-i18n>Login</a>

          <!-- More navigation buttons -->
          <a class="start-screen-link start-screen-link--donate" href="/donate" v-i18n>Donate</a>
          <a class="start-screen-link start-screen-link--cards" href="cards" target="_blank" v-i18n>Cards list</a>
          <a class="start-screen-link start-screen-link--ranking" href="/ranks" target="_blank" v-i18n>Tier Ranking</a>

          <!-- Help (simple style) -->
          <div class="start-screen-secondary">
            <a class="start-screen-nav" href="/help" target="_blank" v-i18n>Help</a>
          </div>

          <!-- Footer: language switcher + version -->
          <div class="start-screen-footer">
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

import raw_settings from '@/genfiles/settings.json';
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
