<template>
  <tr>
    <td><span :class="isRunning ? 'status-running' : 'status-finished'"></span></td>
    <td><a :href="'game?id='+id" class="game-id">{{id}}</a></td>
    <td class="game-overview-time">
      <span>{{game.createtime?.slice(5, 16)}} {{game.updatetime?.slice(5, 16)}}</span>
      <span v-if="game.gameAge !== undefined"> age: {{game.gameAge}}</span>
    </td>
    <td>
      <span class="player_home_block nofloat">
        <span v-for="player in game.players" :key="player.color" class="player_name" :class="'player_bg_color_'+ player.color">
          <a target="blank" :href="'player?id=' + player.id">{{player.name}}</a>
        </span>
      </span>
    </td>
  </tr>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'GameOverview',
  props: {
    game: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    isRunning(): boolean {
      return this.game.phase !== 'end';
    },
  },
});
</script>
