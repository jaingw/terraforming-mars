<template>
  <div id="games-overview" class="games-overview-container">
    <h1 v-i18n>{{ constants.APP_NAME }} — Games Overview</h1>
    <p v-i18n>The following games are available on this server:</p>
    <table>
      <game-overview v-for="game in games" :key="game.id" :id="game.id" :game="game"></game-overview>
    </table>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {PreferencesManager} from '../utils/PreferencesManager';
import * as constants from '@/common/constants';
import GameOverview from '@/client/components/admin/GameOverview.vue';
import {showError} from '../utils/showAlert';

type ApiGame = {
  id: string;
  phase: string;
  players: Array<{id: string; name: string; color: string}>;
  createtime: string;
  updatetime: string;
  gameAge: number;
  saveId: number;
};

export default defineComponent({
  name: 'games-overview',
  data() {
    return {
      games: [] as Array<ApiGame>,
    };
  },
  mounted() {
    this.getGames();
  },
  components: {
    GameOverview,
  },
  methods: {
    async getGames() {
      try {
        const serverId = (new URL(location.href)).searchParams.get('serverId') || '';
        const response = await fetch('api/games?serverId=' + serverId + '&userId=' + PreferencesManager.load('userId'));
        if (!response.ok) {
          showError('Unexpected response fetching games from API');
          return;
        }
        const result = await response.json();
        if (result instanceof Array) {
          this.games = result;
        } else {
          showError('Unexpected response fetching games from API');
        }
      } catch (error) {
        showError('Error getting games data');
      }
    },
  },
  computed: {
    constants(): typeof constants {
      return constants;
    },
  },
});
</script>
