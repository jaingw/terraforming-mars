<template>
  <div :class="wrapper">
    <div class="underground-token-background" :class="style + ' ' + border"></div>
    <div :class="style + ' ' + tokenClass"></div>
    <div :class="shelter"></div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {ClaimedToken} from '@/common/underworld/UnderworldPlayerData';

function normalizeToken(token: string | ClaimedToken): ClaimedToken {
  if (typeof token === 'string') {
    return {token, shelter: false, active: false};
  }
  return token;
}

export default defineComponent({
  name: 'UndergroundToken',
  props: {
    token: {
      type: [Object, String],
      required: true,
    },
    location: {
      type: String as () => 'board' | 'player-home' | 'tag-count',
      required: true,
    },
  },
  computed: {
    _parsedToken(): ClaimedToken {
      return normalizeToken(this.token);
    },
    wrapper(): string {
      return 'underground-token-wrapper--' + this.location;
    },
    border(): string {
      return this._parsedToken.active ? 'underground-token-border' : '';
    },
    style(): string {
      return 'underground-token-style--' + this.location;
    },
    tokenClass(): string {
      return 'underground-token--' + this._parsedToken.token;
    },
    shelter(): string {
      return this._parsedToken.shelter ? 'underground-token-shelter' : '';
    },
  },
});
</script>
