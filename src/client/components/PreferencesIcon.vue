<template>
  <div class="sidebar_item sidebar_item--settings" :title="$t('Player Settings')">
    <i class="sidebar_icon sidebar_icon--settings fas fa-cog" :class="{'sidebar_item--is-active': preferences_panel_open}" v-on:click="$emit('preferencesPanelOpen'); preferences_panel_open = !preferences_panel_open"></i>
    <preferences-dialog ref='preferencesDialog' class="preferences-dialog" v-show="preferences_panel_open" @okButtonClicked="$emit('preferencesPanelOpen',false); preferences_panel_open = false" :preferencesManager="preferencesManager"/>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import PreferencesDialog from '@/client/components/PreferencesDialog.vue';

export default Vue.extend({
  name: 'PreferencesIcon',
  components: {
    'preferences-dialog': PreferencesDialog,
  },
  data() {
    return {
      preferences_panel_open: false,
    };
  },
  computed: {
    preferencesManager(): PreferencesManager {
      return PreferencesManager.INSTANCE;
    },
  },
  mounted() {
    this.$watch('preferences_panel_open', (newVal: boolean) => {
      if (newVal) {
        (this.$refs.preferencesDialog as any).show();
      }
    });
  },
});

</script>
