<template>
  <div class="admin-home">
    <ul>
      <li v-for="path of paths" v-bind:key="path">
        <a :href="path + '?serverId=' + serverId" target="_blank">{{path}}</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {paths} from '@/common/app/paths';

export default Vue.extend({
  name: 'admin-home',
  data() {
    return {
      paths: [
        paths.API_STATS,
        paths.GAMES_OVERVIEW,
        paths.API_GAMES,
        paths.API_METRICS,
        paths.LOAD,
        paths.API_IPS,
        'users',
        'exec',
      ],
    };
  },
  computed: {
    serverId(): string {
      const search = new URLSearchParams(window.location.search);
      return search.get('serverId') || search.get('id') || '';
    },
  },
});
</script>
