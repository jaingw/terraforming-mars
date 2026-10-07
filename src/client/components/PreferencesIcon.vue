<template>
  <div class="sidebar_item sidebar_item--settings" :title="preferences_panel_open ? undefined : $t('Player Settings')">
    <i class="sidebar_icon sidebar_icon--settings fas fa-cog" :class="{'sidebar_item--is-active': preferences_panel_open}" v-on:click="togglePreferencesDialog"></i>
    <preferences-dialog
      ref='preferencesDialog'
      class="preferences-dialog"
      @okButtonClicked="$emit('preferencesPanelOpen', false); preferences_panel_open = false"
      @dialogClosed="$emit('preferencesPanelOpen', false); preferences_panel_open = false"
      :preferencesManager="preferencesManager"
    />
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import PreferencesDialog from '@/client/components/PreferencesDialog.vue';

export default defineComponent({
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
  methods: {
    togglePreferencesDialog(): void {
      this.$emit('preferencesPanelOpen');
      this.preferences_panel_open = !this.preferences_panel_open;
    },
  },
  mounted() {
    this.$watch('preferences_panel_open', (newVal: boolean) => {
      if (newVal) {
        (this.$refs.preferencesDialog as any).show();
      } else {
        (this.$refs.preferencesDialog as any).closeDialog();
      }
    });
  },
});

</script>
