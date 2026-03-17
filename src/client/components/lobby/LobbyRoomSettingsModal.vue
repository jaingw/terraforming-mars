<template>
  <dialog ref="dialog" class="lobby-settings-modal">
    <div class="lobby-settings-shell">
      <div class="lobby-settings-header">
        <div class="lobby-settings-title">
          <span class="font-semibold">{{ room?.ownerName }}</span>
          <span class="text-mars-text-faint" v-i18n>'s Room Settings</span>
        </div>
        <button class="lobby-settings-close" @click="close">x</button>
      </div>
      <div class="lobby-settings-body">
        <game-setup-detail
          v-if="room !== null"
          :game-options="room.gameConfig"
          :player-number="room.maxPlayers"
          :last-solo-generation="14"
        />
      </div>
    </div>
  </dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';
import {showModal, windowHasHTMLDialogElement} from '@/client/components/HTMLDialogElementCompatibility';
import dialogPolyfill from 'dialog-polyfill';
import {ILobbyRoom} from '@/common/lobby/LobbyTypes';
import GameSetupDetail from '@/client/components/GameSetupDetail.vue';

type TRefs = {
  dialog: HTMLElement;
}

export default (Vue as WithRefs<TRefs>).extend({
  name: 'LobbyRoomSettingsModal',
  components: {
    GameSetupDetail,
  },
  props: {
    room: {
      type: Object as () => ILobbyRoom | null,
      default: null,
    },
  },
  methods: {
    show() {
      showModal(this.$refs.dialog);
    },
    close() {
      (this.$refs.dialog as any).close?.();
    },
  },
  mounted() {
    if (!windowHasHTMLDialogElement()) {
      dialogPolyfill.default.registerDialog(this.$refs.dialog);
    }
  },
});
</script>

<style scoped>
.lobby-settings-modal {
  width: min(920px, 94vw);
  max-height: 88vh;
  border: 1px solid #263049;
  border-radius: 12px;
  background: #111827;
  color: #e2e8f0;
  padding: 0;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
}

.lobby-settings-modal::backdrop {
  background: rgba(3, 8, 18, 0.72);
}

.lobby-settings-shell {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
}

.lobby-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(38, 48, 73, 0.9);
  background: rgba(26, 34, 52, 0.7);
}

.lobby-settings-title {
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 12px;
}

.lobby-settings-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: 1px solid rgba(100, 116, 139, 0.55);
  color: #94a3b8;
  background: rgba(26, 34, 52, 0.8);
  line-height: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.lobby-settings-close:hover {
  border-color: rgba(226, 232, 240, 0.7);
  color: #e2e8f0;
}

.lobby-settings-body {
  overflow: auto;
  padding: 14px 16px 16px;
}

/* ============ Desktop: ensure center alignment ============ */
.lobby-settings-modal[open] {
  margin: auto;
}

/* ============ Mobile ============ */
@media (max-width: 640px) {
  .lobby-settings-modal {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 32px);
    border-radius: 8px;
  }

  .lobby-settings-modal[open] {
    margin: auto;
  }

  .lobby-settings-header {
    padding: 10px 12px;
  }

  .lobby-settings-title {
    font-size: 11px;
    gap: 4px;
  }

  .lobby-settings-close {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .lobby-settings-body {
    padding: 10px 12px 14px;
  }
}
</style>
