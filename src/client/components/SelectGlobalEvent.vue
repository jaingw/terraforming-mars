<template>
    <div class="wf-component wf-component--select-global-event">
        <div v-if="showtitle === true" class="nofloat wf-component-title">{{ $t(playerinput.title) }}</div>
        <label v-for="globalEventName in playerinput.globalEventNames" :key="globalEventName" class="cardBox">
          <input v-if="playerinput.max === 1 && playerinput.min === 1" type="radio" v-model="selected" :value="globalEventName" />
          <input v-else type="checkbox" v-model="selected" :value="globalEventName" :disabled="playerinput.max !== undefined && Array.isArray(selected) && selected.length >= playerinput.max && selected.includes(globalEventName) === false" />
          <GlobalEvent :globalEventName="globalEventName" type=""></GlobalEvent>
        </label>
        <div v-if="showsave === true" class="nofloat">
          <AppButton :disabled="selected === undefined && playerinput.min > 0" type="submit" @click="saveData" title="OK" />
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import AppButton from '@/client/components/common/AppButton.vue';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import GlobalEvent from '@/client/components/turmoil/GlobalEvent.vue';
import {SelectGlobalEventModel} from '@/common/models/PlayerInputModel';
import {SelectGlobalEventResponse} from '@/common/inputs/InputResponse';
import {GlobalEventName} from '@/common/turmoil/globalEvents/GlobalEventName';

type DataModel = {
  selected: Array<GlobalEventName> | undefined ;
};

export default Vue.extend({
  name: 'SelectGlobalEvent',
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
    },
    playerinput: {
      type: Object as () => SelectGlobalEventModel,
    },
    onsave: {
      type: Function as unknown as () => (out: SelectGlobalEventResponse) => void,
    },
    showsave: {
      type: Boolean,
      required: false,
      default: false,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data(): DataModel {
    return {
      selected: [],
    };
  },
  components: {
    GlobalEvent,
    AppButton,
  },
  methods: {
    saveData() {
      if (this.selected === undefined) {
        if (this.playerinput.min > 0 ) {
          throw new Error('Select a global event');
        } else {
          this.selected = [];
        }
      }
      this.onsave({type: 'globalEvent', globalEventNames: Array.isArray(this.selected) ? this.selected : [this.selected]});
    },
  },
});

</script>
