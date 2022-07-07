import GameEnd from '@/client/components/GameEnd.vue';
import CreateGameForm from '@/client/components/create/CreateGameForm.vue';
import GameHome from '@/client/components/GameHome.vue';
import GamesOverview from '@/client/components/GamesOverview.vue';
import PlayerHome from '@/client/components/PlayerHome.vue';
import PlayerInputFactory from '@/client/components/PlayerInputFactory.vue';
import SpectatorHome from '@/client/components/SpectatorHome.vue';
import {ViewModel, PlayerViewModel} from '@/common/models/PlayerModel';
import StartScreen from '@/client/components/StartScreen.vue';
import LoadGameForm from '@/client/components/LoadGameForm.vue';
import DebugUI from '@/client/components/DebugUI.vue';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import Help from '@/client/components/help/Help.vue';

import {$t} from '@/client/directives/i18n';

import * as constants from '@/common/constants';
import * as raw_settings from '@/genfiles/settings.json';
import {SpectatorModel} from '@/common/models/SpectatorModel';
import {isPlayerId, isSpectatorId} from '@/common/utils/utils';
import {hasShowModal, showModal, windowHasHTMLDialogElement} from './HTMLDialogElementCompatibility';

const dialogPolyfill = require('dialog-polyfill');


import {Login} from './Login';
import {Register} from './Register';
import {MyGames} from './MyGames';
import {Donate} from './Donate';
import {PreferencesManager} from '../utils/PreferencesManager';

function getDay() {
  return new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0, 10).replace('T', ' ');
}

export interface MainAppData {
    screen: string;
    oscreen: string;
    /**
     * player or spectator are set once the app component has loaded.
     * Vue only watches properties that exist initially. When we
     * use this property we can't trigger vue state without
     * a refactor.
     */
    spectator?: SpectatorModel;
    playerView?: PlayerViewModel;
    // playerKey might seem to serve no function, but it's basically an arbitrary value used
    // to force a rerender / refresh.
    // See https://michaelnthiessen.com/force-re-render/
    playerkey: number;
    settings: typeof raw_settings;
    isServerSideRequestInProgress: boolean;
    componentsVisibility: {[x: string]: boolean};
    game: SimpleGameModel | undefined;
}

export const mainAppSettings = {
  'el': '#app',
  'data': {
    screen: 'empty',
    playerkey: 0,
    settings: raw_settings,
    isServerSideRequestInProgress: false,
    componentsVisibility: {
      'milestones_list': true,
      'awards_list': true,
      'tags_concise': false,
      'pinned_player_0': false,
      'pinned_player_1': false,
      'pinned_player_2': false,
      'pinned_player_3': false,
      'pinned_player_4': false,
      'turmoil_parties': false,
    } as {[x: string]: boolean},
    game: undefined as SimpleGameModel | undefined,
    isvip: false, // 页面加载时刷新isvip, 之后都可以根据这个值判断是否vip // ender test
    oscreen: 'empty', // 跳转赞助页面前的页面
    playerView: undefined,
    spectator: undefined,
    logPaused: false,
  } as MainAppData,
  'components': {
    // These component keys match the screen values, and their entries in index.html.
    'player-input-factory': PlayerInputFactory,
    'start-screen': StartScreen,
    'create-game-form': CreateGameForm,
    'load-game-form': LoadGameForm,
    'game-home': GameHome,
    'player-home': PlayerHome,
    'spectator-home': SpectatorHome,
    'game-end': GameEnd,
    'games-overview': GamesOverview,
    'debug-ui': DebugUI,
    'help': Help,
    'login': Login,
    'register': Register,
    'my-games': MyGames,
    'donate': Donate,
  },
  'methods': {
    showAlert(message: string, cb: () => void = () => {}): void {
      const dialogElement: HTMLElement | null = document.getElementById('alert-dialog');
      const buttonElement: HTMLElement | null = document.getElementById('alert-dialog-button');
      const messageElement: HTMLElement | null = document.getElementById('alert-dialog-message');
      if (buttonElement !== null && messageElement !== null && dialogElement !== null && hasShowModal(dialogElement)) {
        messageElement.innerHTML = $t(message);
        const handler = () => {
          buttonElement.removeEventListener('click', handler);
          cb();
        };
        buttonElement.addEventListener('click', handler);
        showModal(dialogElement);
      } else {
        alert(message);
        cb();
      }
    },
    setVisibilityState(targetVar: string, isVisible: boolean) {
      if (isVisible === this.getVisibilityState(targetVar)) return;
      (this as unknown as typeof mainAppSettings.data).componentsVisibility[targetVar] = isVisible;
    },
    getVisibilityState(targetVar: string): boolean {
      return (this as unknown as typeof mainAppSettings.data).componentsVisibility[targetVar] ? true : false;
    },
    update(path: '/player' | '/spectator'): void {
      const currentPathname: string = window.location.pathname;
      const xhr = new XMLHttpRequest();
      const app = this as unknown as typeof mainAppSettings.data;

      const userId = PreferencesManager.load('userId');
      let url = '/api' + path + window.location.search.replace('&noredirect', '');
      if (userId.length > 0) {
        url += '&userId=' + userId;
      }
      xhr.open('GET', url);
      xhr.onerror = function() {
        alert('Error getting game data');
      };
      xhr.onload = function() {
        try {
          if (xhr.status === 200) {
            const scrollablePanel = document.getElementById('logpanel-scrollable');
            if (scrollablePanel !== null) {
            // 如果此时接近底部， 继续滚动到底部
              if (scrollablePanel.scrollTop > scrollablePanel.scrollHeight - scrollablePanel.clientHeight - 10) {
                (window as any).logScrollTop = -1;
              } else {
                (window as any).logScrollTop = scrollablePanel.scrollTop;
              }
            }

            const model = xhr.response as ViewModel;
            if (path === '/player') {
              app.playerView = model as PlayerViewModel;
            } else if (path === '/spectator') {
              app.spectator = model as SpectatorModel;
            }
            app.playerkey++;
            if (
              model.game.phase === 'end' &&
              window.location.search.includes('&noredirect') === false
            ) {
              app.screen = 'the-end';
              if (currentPathname !== '/the-end') {
                window.history.replaceState(
                  xhr.response,
                  `${constants.APP_NAME} - Player`,
                  '/the-end?id=' + model.id,
                );
              }
            } else {
              if (app.screen !== 'donate') {
                if (path === '/player') {
                  app.screen = 'player-home';
                } else if (path === '/spectator') {
                  app.screen = 'spectator-home';
                }
              } else {
                if (path === '/player') {
                  app.oscreen = 'player-home';
                } else if (path === '/spectator') {
                  app.oscreen = 'spectator-home';
                }
              }
              if (currentPathname !== path) {
                window.history.replaceState(
                  xhr.response,
                  `${constants.APP_NAME} - Game`,
                  path + '?id=' + model.id,
                );
              }
            }
          } else {
            alert('Unexpected server response: ' + xhr.statusText);
          }
        } catch (e) {
          console.log('Error processing XHR response: ' + e);
        }
      };
      xhr.responseType = 'json';
      xhr.send();
    },
    updatePlayer() {
      this.update('/player');
    },
    updateSpectator: function() {
      this.update('/spectator');
    },
    udpatevip: function(userId : string) {
      const app = (this as any);
      const vip = PreferencesManager.load('vip');
      // let vipupdate = PreferencesManager.load("vipupdate");
      // 每天更新一次vip
      // if(vipupdate < getDay()){
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/isvip?userId='+ userId );
      xhr.onerror = function() {
        alert('Error getting game data');
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const resp = xhr.response;
          if (resp === 'success') {
            app.isvip = true;
            PreferencesManager.INSTANCE.set('vip', true);
          } else {
            app.isvip = false;
            PreferencesManager.INSTANCE.set('vip', false);
            app.showdonate();// 根据用户id获取到vip到期，调用赞助页面方法
          }
        } else {
          if (xhr.status === 404) {
            PreferencesManager.loginOut();
          }
          app.isvip = false;
          PreferencesManager.INSTANCE.set('vip', false);
        }
        PreferencesManager.INSTANCE.set('vipupdate', getDay());
      };
      xhr.send();
      // }
      if (vip && vip === 'true') {
        app.isvip = true;
      }
    },
    showdonate: function() {
      const app = (this as any);
      const r = Math.random() * 10 > 9;// 10分之一概率弹出
      const d = PreferencesManager.load('donateupdate');
      const threeday = new Date().getTime() - 3*24*3600000;// 每3天弹出一次
      if (d < threeday.toString() && r && app.screen !== 'donate' && app.screen !== 'start-screen' && !app.isvip ) {
        // app.oscreen = app.screen;
        // app.screen = 'donate';
        // PreferencesManager.INSTANCE.set('donateupdate', new Date().getTime().toString());
      }
    },
  },
  mounted() {
    // document.title = constants.APP_NAME;
    if (!windowHasHTMLDialogElement()) dialogPolyfill.default.registerDialog(document.getElementById('alert-dialog'));
    const currentPathname: string = window.location.pathname;
    const app = this as unknown as (typeof mainAppSettings.data) & (typeof mainAppSettings.methods);
    const userId = PreferencesManager.load('userId');
    if (userId !== '') {
      if (currentPathname === '/') {// 首页强制更新vip
        PreferencesManager.INSTANCE.set('vipupdate', '');
      }
      app.udpatevip(userId);
    }
    if (currentPathname === '/player') {
      app.updatePlayer();
    } else if (currentPathname === '/the-end') {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id') || '';
      if (isPlayerId(id)) {
        app.updatePlayer();
      } else if (isSpectatorId(id)) {
        app.updateSpectator();
      } else {
        alert('Bad id URL parameter.');
      }
    } else if (currentPathname === '/game') {
      app.screen = 'game-home';
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/game' + window.location.search+'&userId='+ userId );
      xhr.onerror = function() {
        alert('Error getting game data');
      };
      xhr.onload = function() {
        if (xhr.status === 200) {
          window.history.replaceState(
            xhr.response,
            `${constants.APP_NAME} - Game`,
            '/game?id=' + xhr.response.id,
          );
          app.game = xhr.response as SimpleGameModel;
        } else {
          alert('Unexpected server response');
        }
      };
      xhr.responseType = 'json';
      xhr.send();
    } else if (currentPathname === '/games-overview') {
      app.screen = 'games-overview';
    } else if (currentPathname === '/new-game') {
      app.screen = 'create-game-form';
    } else if (currentPathname === '/load') {
      app.screen = 'load';
    } else if (currentPathname === '/cards') {
      app.screen = 'cards';
    } else if (currentPathname === '/help') {
      app.screen = 'help';
    } else if (currentPathname === '/login') {
      app.screen = 'login';
    } else if (currentPathname === '/register') {
      app.screen = 'register';
    } else if (currentPathname === '/mygames') {
      app.screen = 'my-games';
    } else if (currentPathname === '/donate') {
      app.screen = 'donate';
    } else {
      app.screen = 'start-screen';
    }

    if (userId === '') {// 没有用户id时  调用赞助页面方法
      app.showdonate();
    }
  },
};
