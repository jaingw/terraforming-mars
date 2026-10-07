<template>
  <div :class="'topmost-' + screen">
    <section>
      <dialog id="alert-dialog" class="alert-dialog">
        <form method="dialog" class="alert-dialog__content">
          <div class="alert-dialog__header">
            <div class="alert-dialog__icon" aria-hidden="true"></div>
            <p id="alert-dialog-title" class="alert-dialog__title" v-i18n>Error with input</p>
          </div>
          <div class="alert-dialog__body">
            <p id="alert-dialog-message"></p>
          </div>
          <menu class="alert-dialog__footer">
            <button id="alert-dialog-button" class="alert-dialog__btn">OK</button>
          </menu>
        </form>
      </dialog>
    </section>
    <nav-bar v-if="showNavBar"></nav-bar>
    <div class="main-container">
      <start-screen v-if="screen === 'start-screen'"></start-screen>
      <create-game-form v-else-if="screen === 'create-game-form'"></create-game-form>
      <game-lobby v-else-if="screen === 'game-lobby'"></game-lobby>
      <load-game-form v-else-if="screen === 'load'"></load-game-form>
      <game-home v-else-if="screen === 'game-home' && game !== undefined" :game="game"></game-home>
      <player-home v-else-if="screen === 'player-home' && playerView !== undefined" :player-view="playerView" :key="playerkey"></player-home>
      <game-end v-else-if="screen === 'the-end'" :player-view="playerView" :spectator="spectator"></game-end>
      <games-overview v-else-if="screen === 'games-overview'"></games-overview>
      <card-list v-else-if="screen === 'cards'"></card-list>
      <help v-else-if="screen === 'help'"></help>
      <admin-home v-else-if="screen === 'admin'"></admin-home>
      <login-page v-else-if="screen === 'login'"></login-page>
      <register-page v-else-if="screen === 'register'"></register-page>
      <reset-password-page v-else-if="screen === 'reset-password'"></reset-password-page>
      <me-page v-else-if="screen === 'me-page'"></me-page>
      <donate-page v-else-if="screen === 'donate'"></donate-page>
      <ranks-page v-else-if="screen === 'ranks'"></ranks-page>
      <user-profile v-else-if="screen === 'user-profile'" :identifier="userProfileId"></user-profile>
    </div>
  </div>
</template>

<script lang="ts">
import {defineAsyncComponent, defineComponent} from 'vue';
import * as constants from '@/common/constants';
import * as raw_settings from '@/genfiles/settings.json';
import {$t, setTranslationContext} from '@/client/directives/i18n';
import {paths} from '@/common/app/paths';
import {PlayerViewModel, ViewModel} from '@/common/models/PlayerModel';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import {SpectatorModel} from '@/common/models/SpectatorModel';
import {isPlayerId, isSpectatorId} from '@/common/Types';
import {hasShowModal, showModal, windowHasHTMLDialogElement} from './HTMLDialogElementCompatibility';
import {statusCode} from '@/common/http/statusCode';
import {showError} from '@/client/utils/showAlert';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import {setDocumentTitle} from '../utils/documentTitle';
import type {MainAppData, MainAppMethods} from './App';

import dialogPolyfill from 'dialog-polyfill';

const AdminHome = defineAsyncComponent(() => import(/* webpackChunkName: "admin" */ '@/client/components/admin/AdminHome.vue'));
const CardList = defineAsyncComponent(() => import(/* webpackChunkName: "card-list" */ '@/client/components/cardlist/CardList.vue'));
const CreateGameForm = defineAsyncComponent(() => import(/* webpackChunkName: "create-game" */ '@/client/components/create/CreateGameForm.vue'));
const DonatePage = defineAsyncComponent(() => import(/* webpackChunkName: "donate" */ '@/client/components/Donate.vue'));
const GameEnd = defineAsyncComponent(() => import(/* webpackChunkName: "game-end" */ '@/client/components/GameEnd.vue'));
const GameHome = defineAsyncComponent(() => import(/* webpackChunkName: "game-home" */ '@/client/components/GameHome.vue'));
const GameLobby = defineAsyncComponent(() => import(/* webpackChunkName: "game-lobby" */ '@/client/components/lobby/GameLobby.vue'));
const GamesOverview = defineAsyncComponent(() => import(/* webpackChunkName: "games-overview" */ '@/client/components/GamesOverview.vue'));
const Help = defineAsyncComponent(() => import(/* webpackChunkName: "help" */ '@/client/components/help/Help.vue'));
const LoadGameForm = defineAsyncComponent(() => import(/* webpackChunkName: "load-game" */ '@/client/components/LoadGameForm.vue'));
const LoginPage = defineAsyncComponent(() => import(/* webpackChunkName: "login" */ '@/client/components/Login.vue'));
const MePage = defineAsyncComponent(() => import(/* webpackChunkName: "me-page" */ '@/client/components/Me.vue'));
const NavBar = defineAsyncComponent(() => import(/* webpackChunkName: "nav-bar" */ '@/client/components/common/NavBar.vue'));
const PlayerHome = defineAsyncComponent(() => import(/* webpackChunkName: "player-home" */ '@/client/components/PlayerHome.vue'));
const RanksPage = defineAsyncComponent(() => import(/* webpackChunkName: "ranks" */ '@/client/components/Ranks.vue'));
const RegisterPage = defineAsyncComponent(() => import(/* webpackChunkName: "register" */ '@/client/components/Register.vue'));
const ResetPasswordPage = defineAsyncComponent(() => import(/* webpackChunkName: "reset-password" */ '@/client/components/ResetPassword.vue'));
const StartScreen = defineAsyncComponent(() => import(/* webpackChunkName: "start-screen" */ '@/client/components/StartScreen.vue'));
const UserProfile = defineAsyncComponent(() => import(/* webpackChunkName: "user-profile" */ '@/client/components/UserProfile.vue'));

function getDay() {
  return new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10).replace('T', ' ');
}

function getLastPathSegment() {
  return window.location.pathname.replace(/.*\//g, '');
}

function getFullPath() {
  return window.location.pathname.substring(1);
}

export default defineComponent({
  name: 'App',
  data(): MainAppData {
    return {
      screen: 'empty',
      oscreen: 'empty',
      userProfileId: '',
      playerkey: 0,
      settings: raw_settings,
      isServerSideRequestInProgress: false,
      componentsVisibility: {
        'milestones': true,
        'awards_list': true,
        'tags_concise': false,
        'pinned_player_0': false,
        'pinned_player_1': false,
        'pinned_player_2': false,
        'pinned_player_3': false,
        'pinned_player_4': false,
        'turmoil_parties': false,
      } as {[x: string]: boolean},
      game: undefined,
      isvip: false,
      spectator: undefined,
      playerView: undefined,
      login: undefined,
    };
  },
  components: {
    'admin-home': AdminHome,
    'card-list': CardList,
    'create-game-form': CreateGameForm,
    'donate-page': DonatePage,
    'game-end': GameEnd,
    'game-home': GameHome,
    'game-lobby': GameLobby,
    'games-overview': GamesOverview,
    'help': Help,
    'load-game-form': LoadGameForm,
    'login-page': LoginPage,
    'me-page': MePage,
    'nav-bar': NavBar,
    'player-home': PlayerHome,
    'ranks-page': RanksPage,
    'register-page': RegisterPage,
    'reset-password-page': ResetPasswordPage,
    'start-screen': StartScreen,
    'user-profile': UserProfile,
  },
  computed: {
    showNavBar(): boolean {
      return [
        'start-screen',
        'create-game-form',
        'game-lobby',
        'load',
        'cards',
        'help',
        'login',
        'register',
        'me-page',
        'donate',
        'ranks',
        'reset-password',
        'user-profile',
        'games-overview',
      ].includes(this.screen);
    },
  },
  methods: {
    handleRouteChange() {
      const currentPathname = getLastPathSegment();
      const app = this as unknown as MainAppData & MainAppMethods;

      if (currentPathname === paths.GAMES_OVERVIEW) {
        app.screen = 'games-overview';
      } else if (currentPathname === paths.NEW_GAME) {
        app.screen = 'create-game-form';
      } else if (currentPathname === paths.LOBBY) {
        app.screen = 'game-lobby';
      } else if (currentPathname === paths.LOAD) {
        app.screen = 'load';
      } else if (currentPathname === paths.CARDS) {
        app.screen = 'cards';
      } else if (currentPathname === paths.HELP) {
        app.screen = 'help';
      } else if (currentPathname === paths.ADMIN) {
        app.screen = 'admin';
      } else if (currentPathname === paths.LOGIN) {
        app.screen = 'login';
      } else if (currentPathname === 'register') {
        app.screen = 'register';
      } else if (currentPathname === 'reset-password') {
        app.screen = 'reset-password';
      } else if (currentPathname === 'mygames' || currentPathname === paths.ME) {
        app.screen = 'me-page';
      } else if (currentPathname === 'donate') {
        app.screen = 'donate';
      } else if (currentPathname === 'ranks') {
        app.screen = 'ranks';
      } else if (getFullPath().startsWith('user/')) {
        const identifier = getFullPath().substring('user/'.length);
        if (identifier) {
          app.userProfileId = decodeURIComponent(identifier);
          app.screen = 'user-profile';
        } else {
          app.screen = 'start-screen';
        }
      } else if (currentPathname !== paths.PLAYER && currentPathname !== paths.THE_END && currentPathname !== paths.GAME) {
        app.screen = 'start-screen';
      }
    },
    showAlert(titleOrMessage: string, messageOrCb?: string | (() => void), cb: () => void = () => {}): void {
      let title = 'Error';
      let message = titleOrMessage;
      let callback = cb;

      if (typeof messageOrCb === 'function') {
        callback = messageOrCb;
      } else if (typeof messageOrCb === 'string') {
        title = titleOrMessage;
        message = messageOrCb;
      }

      const dialogElement = document.getElementById('alert-dialog');
      const buttonElement = document.getElementById('alert-dialog-button');
      const messageElement = document.getElementById('alert-dialog-message');
      const titleElement = document.getElementById('alert-dialog-title');
      if (buttonElement !== null && titleElement !== null && messageElement !== null && dialogElement !== null && hasShowModal(dialogElement)) {
        messageElement.innerHTML = $t(message);
        titleElement.textContent = $t(title);
        const handler = () => {
          buttonElement.removeEventListener('click', handler);
          (dialogElement as HTMLDialogElement).close();
          callback();
        };
        buttonElement.addEventListener('click', handler);
        showModal(dialogElement);
      } else {
        alert(message);
        callback();
      }
    },
    setVisibilityState(targetVar: string, isVisible: boolean) {
      if (isVisible === this.getVisibilityState(targetVar)) {
        return;
      }
      (this as unknown as MainAppData).componentsVisibility[targetVar] = isVisible;
    },
    getVisibilityState(targetVar: string): boolean {
      return (this as unknown as MainAppData).componentsVisibility[targetVar] ? true : false;
    },
    update(path: typeof paths.PLAYER): void {
      const currentPathname = getLastPathSegment();
      const xhr = new XMLHttpRequest();
      const app = this as unknown as MainAppData;

      const userId = PreferencesManager.load('userId');
      let url = 'api/' + path + window.location.search.replace('&noredirect', '');
      if (userId.length > 0) {
        url += '&userId=' + userId;
      }
      xhr.open('GET', url);
      xhr.onerror = function() {
        if (xhr.status !== statusCode.notFound) {
          showError('Error getting game data');
        }
      };
      xhr.onload = function() {
        try {
          if (xhr.status === statusCode.ok) {
            const model = xhr.response as ViewModel;
            app.playerView = model as PlayerViewModel;
            setTranslationContext(app.playerView);
            app.playerkey++;
            if (
              (model.game.phase === 'end' || model.game.phase === 'timeout' || model.game.phase === 'abandon') &&
              window.location.search.includes('&noredirect') === false
            ) {
              app.screen = 'the-end';
              if (currentPathname !== paths.THE_END) {
                window.history.replaceState(
                  xhr.response,
                  `${constants.APP_NAME} - Player`,
                  `${paths.THE_END}?id=${model.id}`,
                );
              }
            } else {
              if (app.screen !== 'donate') {
                app.screen = 'player-home';
              } else {
                app.oscreen = 'player-home';
              }
              if (currentPathname !== path) {
                window.history.replaceState(
                  xhr.response,
                  `${constants.APP_NAME} - Game`,
                  `${path}?id=${model.id}`,
                );
              }
            }
          } else {
            showError('Unexpected server response: ' + xhr.statusText);
          }
        } catch (e) {
          console.warn('Error processing XHR response: ' + e);
        }
      };
      xhr.responseType = 'json';
      xhr.send();
    },
    updatePlayer() {
      this.update(paths.PLAYER);
    },
    udpatevip(userId: string) {
      const app = this as unknown as MainAppData & MainAppMethods;
      const vip = PreferencesManager.load('vip');

      const onSuccess = (response: Response) => {
        if (!response.ok) {
          response.text().then((msg: string) => {
            if (response.status === statusCode.notFound) {
              PreferencesManager.loginOut();
            }
            app.isvip = false;
            PreferencesManager.INSTANCE.set('vip', false);
            showError(msg);
          });
        } else {
          response.json().then((data: {id: string; isvip: boolean}) => {
            app.isvip = data.isvip;
            PreferencesManager.INSTANCE.set('vip', data.isvip);
            PreferencesManager.INSTANCE.set('userId', data.id);
            if (!data.isvip) {
              app.showdonate();
            }
          });
        }
        PreferencesManager.INSTANCE.set('vipupdate', getDay());
      };

      fetch('/api/isvip?userId=' + userId, {method: 'GET', headers: {'Content-Type': 'application/json'}})
        .then(onSuccess)
        .catch((e) => {
          console.warn('error', e);
          showError('Unexpected server response');
        });

      if (vip && vip === 'true') {
        app.isvip = true;
      }
    },
    showdonate() {
      const app = this as unknown as MainAppData;
      const r = Math.random() * 10 > 9;
      const d = PreferencesManager.load('donateupdate');
      const threeday = new Date().getTime() - 3 * 24 * 3600000;
      if (d < threeday.toString() && r && app.screen !== 'donate' && app.screen !== 'start-screen' && !app.isvip) {
        // app.oscreen = app.screen;
        // app.screen = 'donate';
        // PreferencesManager.INSTANCE.set('donateupdate', new Date().getTime().toString());
      }
    },
  },
  mounted() {
    setDocumentTitle();
    if (!windowHasHTMLDialogElement()) {
      dialogPolyfill.registerDialog(document.getElementById('alert-dialog') as HTMLDialogElement);
    }
    const currentPathname = getLastPathSegment();
    const app = this as unknown as MainAppData & MainAppMethods;
    const userId = PreferencesManager.load('userId');

    window.addEventListener('popstate', () => {
      app.handleRouteChange();
    });

    if (userId !== '') {
      if (currentPathname === '') {
        PreferencesManager.INSTANCE.set('vipupdate', '');
      }
      app.udpatevip(userId);
    }
    if (currentPathname === paths.PLAYER) {
      app.updatePlayer();
    } else if (currentPathname === paths.THE_END) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id') || '';
      if (isPlayerId(id)) {
        app.updatePlayer();
      } else if (isSpectatorId(id)) {
        app.updateSpectator();
      } else {
        showError('Bad id URL parameter.');
      }
    } else if (currentPathname === paths.GAME) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', paths.API_GAME + window.location.search + '&userId=' + userId);
      xhr.onerror = function() {
        showError('Error getting game data');
      };
      xhr.onload = function() {
        if (xhr.status === statusCode.ok) {
          window.history.replaceState(
            xhr.response,
            `${constants.APP_NAME} - Game`,
            `${paths.GAME}?id=${xhr.response.id}`,
          );
          app.game = xhr.response as SimpleGameModel;
          app.screen = 'game-home';
        } else {
          showError('Unexpected server response');
        }
      };
      xhr.responseType = 'json';
      xhr.send();
    } else {
      app.handleRouteChange();
    }

    if (userId === '') {
      app.showdonate();
    }
  },
});
</script>
