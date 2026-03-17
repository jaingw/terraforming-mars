<template>
   <div class="admin-home">
     <ul>
       <li v-for="path of paths" v-bind:key="path">
         <a :href="path + '?serverId=' + serverId" target="_blank">{{path}}</a>
       </li>
     </ul>
     <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #334155;">
       <h3>Season Admin</h3>
       <div style="display: flex; gap: 8px; margin-top: 8px;">
         <button @click="triggerSeasonReset(true)">Dry Run Season Reset</button>
         <button @click="triggerSeasonReset(false)">Execute Season Reset</button>
       </div>
       <div v-if="seasonResetResult" style="margin-top: 8px; white-space: pre-wrap; font-family: monospace;">
         {{ seasonResetResult }}
       </div>
     </div>

     <!-- Season Reset Confirm Dialog -->
     <confirm-dialog
       ref="confirmDialog"
       :message="confirmMessage"
       v-on:accept="onConfirmAccept"
       v-on:dismiss="onConfirmDismiss">
     </confirm-dialog>

     <!-- Final Confirm Dialog -->
     <confirm-dialog
       ref="finalConfirmDialog"
       :message="finalConfirmMessage"
       v-on:accept="onFinalConfirmAccept"
       v-on:dismiss="onFinalConfirmDismiss">
     </confirm-dialog>
   </div>
 </template>

<script lang="ts">
import Vue from 'vue';
import {paths} from '@/common/app/paths';
import {request, RequestError} from '@/client/utils/request';
import ConfirmDialog from '../common/ConfirmDialog.vue';

export default Vue.extend({
  name: 'admin-home',
  components: {
    'confirm-dialog': ConfirmDialog,
  },
  data() {
    return {
      paths: [
        paths.API_STATS,
        paths.GAMES_OVERVIEW,
        paths.API_GAMES,
        paths.API_METRICS,
        paths.LOAD,
        paths.API_IPS,
      ],
      seasonResetResult: '',
      currentSeasonInfo: null as any,
      pendingDryRun: false as boolean | null,
      confirmMessage: '',
      finalConfirmMessage: '',
    };
  },
  computed: {
    serverId(): string {
      const search = new URLSearchParams(window.location.search);
      return search.get('serverId') || search.get('id') || '';
    },
  },
  mounted() {
    this.loadCurrentSeasonInfo();
  },
  methods: {
    async loadCurrentSeasonInfo() {
      try {
        const response = await fetch('/api/v2/season/info');
        if (response.ok) {
          const data = await response.json();
          this.currentSeasonInfo = data;
        }
      } catch (error) {
        console.error('Failed to load season info:', error);
      }
    },
    triggerSeasonReset(this: any, dryRun: boolean) {
      if (!this.currentSeasonInfo) {
        this.seasonResetResult = 'Error: Season info not loaded. Please refresh the page.';
        return;
      }
      const currentSeasonId = this.currentSeasonInfo.seasonId;
      this.pendingDryRun = dryRun;

      if (dryRun) {
        this.confirmMessage = `Dry run season reset from ${currentSeasonId}? This will show a preview without making changes.`;
        (this as any).$refs.confirmDialog.show();
      } else {
        this.confirmMessage = `Execute season reset from ${currentSeasonId}? This will move all players to the next season.`;
        (this as any).$refs.confirmDialog.show();
      }
    },
    onConfirmAccept() {
      if (this.pendingDryRun) {
        this.executeSeasonReset(true);
      } else {
        // Show final confirmation for actual reset
        const currentSeasonId = this.currentSeasonInfo.seasonId;
        this.finalConfirmMessage = `CONFIRM: This will irreversibly reset season ${currentSeasonId} to the next season. Are you absolutely sure?`;
        (this as any).$refs.finalConfirmDialog.show();
      }
    },
    onConfirmDismiss() {
      this.pendingDryRun = null;
      this.confirmMessage = '';
    },
    onFinalConfirmAccept() {
      this.executeSeasonReset(false);
    },
    onFinalConfirmDismiss() {
      this.pendingDryRun = null;
      this.finalConfirmMessage = '';
    },
    executeSeasonReset(this: any, dryRun: boolean) {
      if (!this.currentSeasonInfo) {
        return;
      }
      const currentSeasonId = this.currentSeasonInfo.seasonId;
      request.post('/api/v2/season/admin/reset?serverId=' + encodeURIComponent(this.serverId), {
        dryRun,
        expectedFromSeasonId: currentSeasonId,
      }).then((payload: any) => {
        this.seasonResetResult = JSON.stringify(payload, null, 2);
      }).catch((error) => {
        if (error instanceof RequestError) {
          this.seasonResetResult = error.body || error.message;
          return;
        }
        this.seasonResetResult = String(error);
      }).finally(() => {
        this.pendingDryRun = null;
        this.confirmMessage = '';
        this.finalConfirmMessage = '';
      });
    },
  },
});
</script>

