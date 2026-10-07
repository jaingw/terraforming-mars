<template>
  <div>
    <template v-if="playerView.role === 'other'">{{ $t('Please Login with right user') }} <a v-if="!userId" href="login" class="player_name player_bg_color_blue">{{ $t('Login') }}</a></template>
    <template v-else-if="playerView.undoing">{{ $t('Undoing, Please refresh or wait seconds') }}</template>
    <template v-else-if="waitingfor === undefined">
      {{ $t('Not your turn to take any actions') }}
      <template v-if="playersWaitingFor.length > 0">
        (⌛ <span v-for="color in playersWaitingFor" :key="color" class="log-player" :class="playerColorClass(color, 'bg')">{{ getPlayerName(color) }}</span>)
      </template>

      <template v-if="preferences().experimental_ui && playerView.game.phase === Phase.ACTION && playerView.players.length !== 1">
        <input id="suspend-checkbox" v-model="suspend" type="checkbox" name="suspend" @change="updateSuspend">
        <label for="suspend-checkbox">
          <span v-i18n>Suspend</span>
        </label>
        <div v-if="showRefresh()">Refresh<span class="reset"></span></div>
      </template>
    </template>
    <div v-else class="wf-root">
      <player-input-factory
        :players="playerView.players"
        :playerView="playerView"
        :playerinput="waitingfor"
        :onsave="onsave"
        :showsave="true"
        :showtitle="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as constants from '@/common/constants';
import raw_settings from '@/genfiles/settings.json';
import {vueRoot} from '@/client/components/vueRoot';
import {PlayerInputModel} from '@/common/models/PlayerInputModel';
import {PlayerViewModel, ViewModel} from '@/common/models/PlayerModel';
import {playerColorClass} from '@/common/utils/utils';
import {getPreferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {SoundManager} from '@/client/utils/SoundManager';
import {WaitingForModel} from '@/common/models/WaitingForModel';
import {Phase} from '@/common/Phase';
import {paths} from '@/common/app/paths';
import {statusCode} from '@/common/http/statusCode';
import {isPlayerId} from '@/common/Types';
import {InputResponse} from '@/common/inputs/InputResponse';
import {INVALID_RUN_ID} from '@/common/app/AppErrorId';
import {Color} from '@/common/Color';
import {gameDocumentTitle} from '../utils/documentTitle';

let uiUpdateTimeoutId: number | undefined;
let documentTitleTimer: number | undefined;

type WaitableViewModel = ViewModel & {
  undoing?: boolean;
  waitingFor?: PlayerInputModel;
};

type DataModel = {
  userId: string,
  playersWaitingFor: Array<Color>,
  suspend: boolean,
  savedPlayerView: PlayerViewModel | undefined;
}

const CANNOT_CONTACT_SERVER = 'Unable to reach the server. It may be restarting or down for maintenance.';

export default defineComponent({
  name: 'waiting-for',
  props: {
    playerView: {
      type: Object as () => WaitableViewModel,
      required: true,
    },
    waitingfor: {
      type: Object as () => PlayerInputModel | undefined,
      default: undefined,
    },
  },
  data(): DataModel {
    return {
      userId: PreferencesManager.load('userId'),
      playersWaitingFor: [],
      suspend: false,
      savedPlayerView: undefined,
    };
  },
  methods: {
    getPlayerName(color: Color): string {
      const player = this.playerView.players.find((p) => p.color === color);
      return player ? player.name : color;
    },
    animateTitle() {
      if (!getPreferences().animated_title) {
        return;
      }

      const sequence = '\u25D1\u25D2\u25D0\u25D3';
      const first = document.title[0];
      const position = sequence.indexOf(first);
      let next = sequence[0];
      if (position !== -1 && position < sequence.length - 1) {
        next = sequence[position + 1];
      }
      document.title = next + ' ' + gameDocumentTitle(this.playerView.game);
    },
    onsave(out: InputResponse) {
      const root = vueRoot(this);
      if (root.isServerSideRequestInProgress) {
        console.warn('Server request in progress');
        return;
      }
      root.isServerSideRequestInProgress = true;

      const xhr = new XMLHttpRequest();
      let url = paths.PLAYER_INPUT + '?id=' + this.playerView.id;
      if (this.userId) {
        url += '&userId=' + this.userId;
      }
      xhr.open('POST', url);
      xhr.responseType = 'json';
      xhr.onload = () => {
        this.loadPlayerViewResponse(xhr);
      };
      xhr.onerror = () => {
        root.isServerSideRequestInProgress = false;
        root.showAlert('Error sending input', CANNOT_CONTACT_SERVER);
      };
      const senddata = {id: (this.waitingfor as any)?.id, runId: this.playerView.runId, input: out};
      xhr.send(JSON.stringify(senddata));
    },
    loadPlayerViewResponse(xhr: XMLHttpRequest) {
      const root = vueRoot(this);
      if (xhr.status === statusCode.ok) {
        this.updatePlayerView(xhr.response);
      } else if (xhr.status === statusCode.badRequest && xhr.responseType === 'json') {
        let cb = () => {};
        if (xhr.response.id === INVALID_RUN_ID) {
          cb = () => setTimeout(() => window.location.reload(), 100);
        }
        root.showAlert('Error with input', xhr.response.message, cb);
      } else {
        root.showAlert('Error processing response', 'Unexpected response from server. Please try again.');
      }
      root.isServerSideRequestInProgress = false;
    },
    updatePlayerView(playerView: PlayerViewModel | undefined) {
      if (this.suspend === false) {
        const root = vueRoot(this);
        root.screen = 'empty';
        root.playerView = playerView;
        root.playerkey++;
        root.screen = 'player-home';
        if (
          root.playerView?.game.phase === Phase.END ||
          root.playerView?.game.phase === Phase.TIMEOUT ||
          root.playerView?.game.phase === Phase.ABANDON
        ) {
          if (window.location.pathname !== '/' + paths.THE_END) {
            window.location = window.location as any as string & Location;
          }
        }
        this.savedPlayerView = undefined;
      } else {
        this.savedPlayerView = playerView;
      }
    },
    waitForUpdate(faster = false) {
      const root = vueRoot(this);
      window.clearInterval(uiUpdateTimeoutId);
      let failednum = 0;
      let allnum = 0;

      const askForUpdate = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', paths.API_WAITING_FOR + window.location.search + '&gameAge=' + this.playerView.game.gameAge + '&undoCount=' + this.playerView.game.undoCount);
        xhr.onerror = () => {
          failednum++;
          if (failednum < 5) {
            root.showAlert('Error fetching state', CANNOT_CONTACT_SERVER, () => {});
          }
        };
        xhr.onload = () => {
          if (xhr.status === statusCode.ok) {
            allnum++;
            failednum = 0;
            if (root.playerView?.game.phase === Phase.END) {
              window.clearInterval(uiUpdateTimeoutId);
              return;
            }
            const result = xhr.response as WaitingForModel;
            this.playersWaitingFor = result.waitingFor;
            if (result.result === 'GO' && this.waitingfor === undefined && this.playerView.role !== 'other') {
              try {
                root.updatePlayer();
                this.notify();
              } catch (err) {
                console.warn('Error calling updatePlayer:', err);
              }
              return;
            } else if (result.result === 'REFRESH') {
              try {
                if (isPlayerId(this.playerView.id)) {
                  root.updatePlayer();
                } else {
                  root.updateSpectator();
                }
              } catch (err) {
                console.warn('Error calling updatePlayer/updateSpectator:', err);
              }
              return;
            }
          } else if (xhr.status === statusCode.notFound) {
            window.clearInterval(uiUpdateTimeoutId);
            root.showAlert(
              'Game not found',
              'This game has been cleaned up or does not exist.',
              () => {},
            );
          } else {
            root.showAlert(
              'Error with input',
              `Received unexpected response from server (${xhr.status}). This is often due to the server restarting.`,
              () => {},
            );
            failednum++;
          }

          if (failednum >= 5 || allnum > 200) {
            window.clearInterval(uiUpdateTimeoutId);
          }
        };
        xhr.responseType = 'json';
        xhr.send();
      };

      if (faster) {
        askForUpdate();
        uiUpdateTimeoutId = window.setInterval(askForUpdate, 1000);
      } else {
        uiUpdateTimeoutId = window.setInterval(askForUpdate, raw_settings.waitingForTimeout);
      }
    },
    notify() {
      if (!this.playerView.undoing && getPreferences().enable_sounds) {
        SoundManager.playActivePlayerSound();
      }

      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      } else if (Notification.permission === 'granted') {
        const notificationOptions = {
          icon: 'favicon.ico',
          body: 'It\'s your turn!',
        };
        const notificationTitle = constants.APP_NAME;
        try {
          new Notification(notificationTitle, notificationOptions);
        } catch (e) {
          if (!window.isSecureContext || !navigator.serviceWorker) {
            return;
          }
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(notificationTitle, notificationOptions);
          }).catch((err) => {
            console.warn('Failed to display notification with serviceWorker', err);
          });
        }
      }
    },
    updateSuspend() {
      if (this.suspend === false && this.savedPlayerView !== undefined) {
        this.updatePlayerView(this.savedPlayerView);
      }
    },
    showRefresh(): boolean {
      return this.suspend === true && this.savedPlayerView !== undefined;
    },
  },
  mounted() {
    if (this.playerView.undoing) {
      this.waitForUpdate(true);
      return;
    }

    this.waitForUpdate();
    document.title = gameDocumentTitle(this.playerView.game);
    window.clearInterval(documentTitleTimer);

    if (this.playerView.players.length > 1 && this.waitingfor !== undefined) {
      documentTitleTimer = window.setInterval(() => this.animateTitle(), 1000);
    }
  },
  beforeUnmount() {
    window.clearInterval(uiUpdateTimeoutId);
    window.clearInterval(documentTitleTimer);
  },
  computed: {
    Phase(): typeof Phase {
      return Phase;
    },
    preferences(): typeof getPreferences {
      return getPreferences;
    },
    playerColorClass(): typeof playerColorClass {
      return playerColorClass;
    },
  },
});
</script>
