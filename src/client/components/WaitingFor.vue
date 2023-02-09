<template>
  <div v-if="playerView.block">{{ $t('Please Login with right user') }} <a href="login" class="player_name  player_bg_color_blue">{{ $t('Login') }}</a></div>
  <div v-else-if="waitingfor === undefined">{{ $t('Not your turn to take any actions') }}</div>
  <div v-else-if="playerView.undoing">{{ $t('Undoing, Please refresh or wait seconds') }}</div>
  <div v-else class="wf-root">
    <player-input-factory :players="players"
                          :playerView="playerView"
                          :playerinput="waitingfor"
                          :onsave="onsave"
                          :showsave="true"
                          :showtitle="true" />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {MainAppData, mainAppSettings} from '@/client/components/App';
import {PlayerInputModel} from '@/common/models/PlayerInputModel';
import {PlayerViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';
import {getPreferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {SoundManager} from '@/client/utils/SoundManager';
import {WaitingForModel} from '@/common/models/WaitingForModel';

import * as constants from '@/common/constants';
import * as raw_settings from '@/genfiles/settings.json';
import * as paths from '@/common/app/paths';
import * as HTTPResponseCode from '@/client/utils/HTTPResponseCode';
import {isPlayerId} from '@/common/Types';
import {InputResponse} from '@/common/inputs/InputResponse';

let ui_update_timeout_id: number | undefined;
let documentTitleTimer: number | undefined;

export default Vue.extend({
  name: 'waiting-for',
  props: {
    playerView: {
      type: Object as () => PlayerViewModel,
    },
    players: {
      type: Array as () => Array<PublicPlayerModel>,
    },
    settings: {
      type: Object as () => typeof raw_settings,
    },
    waitingfor: {
      type: Object as () => PlayerInputModel | undefined,
    },
  },
  data() {
    return {
      waitingForTimeout: this.settings.waitingForTimeout as typeof raw_settings.waitingForTimeout,
    };
  },
  methods: {
    animateTitle() {
      const sequence = '\u25D1\u25D2\u25D0\u25D3';
      const first = document.title[0];
      const position = sequence.indexOf(first);
      let next = sequence[0];
      if (position !== -1 && position < sequence.length - 1) {
        next = sequence[position + 1];
      }
      document.title = next + ' ' + this.$t(constants.APP_NAME);
    },
    onsave(out: InputResponse) {
      const xhr = new XMLHttpRequest();
      const root = this.$root as unknown as MainAppData;
      const showAlert = (this.$root as unknown as typeof mainAppSettings.methods).showAlert;

      if (root.isServerSideRequestInProgress) {
        console.warn('Server request in progress');
        return;
      }

      root.isServerSideRequestInProgress = true;
      const userId = PreferencesManager.load('userId');
      let url = paths.PLAYER_INPUT + '?id=' + (this.$parent as any).playerView.id;
      if (userId.length > 0) {
        url += '&userId=' + userId;
      }
      xhr.open('POST', url);
      xhr.responseType = 'json';
      xhr.onload = () => {
        if (xhr.status === HTTPResponseCode.OK) {
          root.screen = 'empty';
          root.playerView = xhr.response;
          root.playerkey++;
          root.screen = 'player-home';
          if (root?.playerView?.game.phase === 'end' && window.location.pathname !== '/the-end') {
            (window).location = (window).location; // eslint-disable-line no-self-assign
          }
        } else if (xhr.status === HTTPResponseCode.BAD_REQUEST && xhr.responseType === 'json') {
          showAlert(xhr.response.message);
        } else {
          showAlert('Unexpected response from server. Please try again.');
        }
        root.isServerSideRequestInProgress = false;
      };
      const senddata ={'id': this.waitingfor?.id, 'input': out};
      xhr.send(JSON.stringify(senddata));
      xhr.onerror = function() {
        root.isServerSideRequestInProgress = false;
      };
    },
    waitForUpdate: function(faster:boolean = false) {
      const root = this.$root as unknown as typeof mainAppSettings.methods;
      const rootdata = this.$root as unknown as typeof mainAppSettings.data;
      clearInterval(ui_update_timeout_id);
      let failednum = 0;
      let allnum = 0;
      const askForUpdate = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', paths.API_WAITING_FOR + window.location.search + '&gameAge=' + this.playerView.game.gameAge + '&undoCount=' + this.playerView.game.undoCount);
        xhr.onerror = function() {
          failednum ++;
          if (failednum < 5) {
            root.showAlert('Unable to reach the server. The server may be restarting or down for maintenance.', () => {});
          }
        };
        xhr.onload = () => {
          if (xhr.status === HTTPResponseCode.OK) {
            allnum ++;
            failednum = 0;
            if (rootdata.playerView?.game.phase === 'end') {
              clearInterval(ui_update_timeout_id);
              return;
            }
            const result = xhr.response as WaitingForModel;
            if (result.result === 'GO' && this.waitingfor === undefined && !this.playerView.block) {
              // Will only apply to player, not spectator.
              root.updatePlayer();

              if (Notification.permission !== 'granted') {
                Notification.requestPermission();
              } else if (Notification.permission === 'granted') {
                const notificationOptions = {
                  icon: '/favicon.ico',
                  body: 'It\'s your turn!',
                };
                const notificationTitle = constants.APP_NAME;
                try {
                  new Notification(notificationTitle, notificationOptions);
                } catch (e) {
                  // ok so the native Notification doesn't work which will happen
                  // try to use the service worker if we can
                  if (!window.isSecureContext || !navigator.serviceWorker) {
                    return;
                  }
                  navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(notificationTitle, notificationOptions);
                  }).catch((err) => {
                    // avoid promise going uncaught
                    console.warn('Failed to display notification with serviceWorker', err);
                  });
                }
              }

              const soundsEnabled = getPreferences().enable_sounds;
              if (soundsEnabled) SoundManager.playActivePlayerSound();

              // We don't need to wait anymore - it's our turn
              return;
            } else if (result.result === 'REFRESH') {
              // Something changed, let's refresh UI
              if (isPlayerId(this.playerView.id)) {
                root.updatePlayer();
              } else {
                root.updateSpectator();
              }

              return;
            }
          } else {
            root.showAlert(`Received unexpected response from server (${xhr.status}). This is often due to the server restarting.`, () => {});
            failednum ++;
          }
          console.log(`allnum:${allnum}, failednum:${failednum}` );
          // (vueApp as any).waitForUpdate();
        };
        xhr.responseType = 'json';
        xhr.send();
        if (failednum >= 5 || allnum > 200) {
          // 失败5次不再发送请求 需手动刷新
          clearInterval(ui_update_timeout_id);
        }
      };
      if (faster) {
        askForUpdate();
      }
      ui_update_timeout_id = (setInterval(askForUpdate, this.waitingForTimeout) as any);
    },
  },
  mounted() {
    if (this.playerView.undoing ) {
      (this as any).waitForUpdate(true);
      return;
    }
    // if (!this.playerView.block ) {
    (this as any).waitForUpdate();
    // }
    document.title = this.$t(constants.APP_NAME);
    window.clearInterval(documentTitleTimer);

    if (this.playerView.players.length > 1 && this.waitingfor !== undefined) {
      documentTitleTimer = window.setInterval(() => this.animateTitle(), 1000);
    }
  },
});

</script>

