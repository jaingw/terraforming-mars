import Vue from 'vue';

import {Phase} from '@/common/Phase';
import {getPreferences} from '../utils/PreferencesManager';
import ConfirmDialog from './common/ConfirmDialog.vue';
import RankTier from '@/client/components/RankTier.vue';
import {UserRank} from '../../common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '../../common/rank/constants';
import {showError} from '../utils/showAlert';
import {userService} from '../services';
import {userStore, preferencesStore} from '../stores';

export const MyGames = Vue.component('my-games', {
  data: function() {
    return {
      userId: '',
      userName: '',
      games: [],
      vipDate: '',
      enable_sounds: false,
      showhandcards: false,
      userRank: new UserRank('', DEFAULT_RANK_VALUE, DEFAULT_MU, DEFAULT_SIGMA, 0), // 用户默认段位
      openTab: 1,
    };
  },
  components: {
    'confirm-dialog': ConfirmDialog,
    RankTier,
  },
  mounted: function() {
    this.userId = userStore.userId;
    this.userName = userStore.userName;
    if (this.userId.length > 0) {
      this.getGames();
      this.getUserRank();
    }
  },
  methods: {
    getGames: function() {
      userService.getMyGames(this.userId)
        .then((result) => {
          if (result && result.mygames && result.mygames instanceof Array) {
            this.games = result.mygames;
            if (result.vipDate) {
              this.vipDate = result.vipDate;
            }
            this.showhandcards = result.showhandcards;
          } else {
            showError('Unexpected response fetching games from API');
          }
        })
        .catch(() => {
          showError('Error getting games data');
        });
    },
    getUserRank: function() {
      if (this.userId === '') return;
      userService.getUserRankInstance(this.userId)
        .then((userRank) => {
          this.userRank = userRank;
        })
        .catch(() => {
          showError('Error getting user rank data');
        });
    },
    getTier() {
      return this.userRank.getTier();
    },
    // isGameRunning: function(gamePhase: string): boolean {
    //   return (gamePhase === Phase.END) ? false : true;
    // },
    isGameTimeOut: function(gamePhase: string): boolean {
      return gamePhase === Phase.TIMEOUT;
    },
    isGameAbandon: function(gamePhase: string): boolean {
      return gamePhase === Phase.ABANDON;
    },
    isGameEnd: function(gamePhase: string): boolean {
      return gamePhase === Phase.END;
    },
    changeLogin: function(): void {
      if (this.userName !== '') {
        this.userId = '';
        this.userName = '';
        this.vipDate = '';
        this.games = [];
        userStore.logout();
      } else {
        window.location.href = '/login';
      }
    },
    updateTips: function() {
      preferencesStore.set('enable_sounds', this.enable_sounds);
    },
    updateShowHandCards: function() {
      if (this.showhandcards) {
        (this.$refs['showHand'] as any).show();
      } else {
        this.confimUpdate();
      }
    },
    cancelUpdate: function() {
      this.showhandcards = false;
    },
    confimUpdate: function() {
      const userId = userStore.userId;
      if ( userId === undefined || userId === '') {
        return;
      }
      userService.updateShowHandCards(userId, this.showhandcards)
        .catch(function(error: any) {
          showError(error);
        });
    },

    // 天梯，激活排名，在`user_rank`表中创建对应数据
    activateRank: function() {
      const userId = userStore.userId;
      if ( userId === undefined || userId === '') {
        return;
      }
      console.log('activateRank');
      const $this = this;
      userService.activateRankInstance(userId)
        .then(function(userRank) {
          $this.userRank = userRank;
        })
        .catch(function(error: any) {
          showError(error);
        });
    },
    toggleTabs: function(tabNumber: number) {
      this.openTab = tabNumber;
    },
  },
  created() {
    if (window.localStorage) {
      this.enable_sounds = getPreferences().enable_sounds;
      this.userName = userStore.userName;
    }
  },
  template: `
    <div class="bg-mars-void text-mars-text p-4 sm:p-6 lg:p-8"
      style="flex: 1; min-height: 0; overflow-y: auto; background-image: radial-gradient(ellipse at 50% -10%, rgba(226,82,14,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(34,211,238,0.05) 0%, transparent 40%), linear-gradient(rgba(38,48,80,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(38,48,80,0.3) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;">
      <div class="max-w-4xl mx-auto">
        <!-- Page Title -->
        <div class="flex items-center gap-3 mb-3">
          <div style="width:7px;height:7px;border-radius:50%;background:#2dd4bf;box-shadow:0 0 8px rgba(45,212,191,0.7);"></div>
          <h1 class="text-lg font-bold text-mars-text uppercase tracking-widest" v-i18n>My Games</h1>
        </div>
        <div class="mb-6" style="height:1px;background:linear-gradient(to right,rgba(226,82,14,0.7),rgba(226,82,14,0.3) 20%,rgba(38,48,80,0.5) 50%,transparent 100%);"></div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-5" style="cursor:pointer;">
          <div class="mygames-tab flex-1 text-center text-xs font-bold uppercase tracking-widest px-4 py-3 transition-all relative"
               v-on:click="toggleTabs(1)"
               v-bind:class="{'mygames-tab--active bg-mars-deep text-mars-text': openTab === 1, 'text-mars-text-dim hover:text-mars-text hover:bg-mars-deep/50': openTab !== 1}">
            <span v-i18n>User Info</span>
            <div v-if="openTab === 1" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8" style="height:2px;background:linear-gradient(to right,transparent,#e2520e,transparent);"></div>
          </div>
          <div class="mygames-tab flex-1 text-center text-xs font-bold uppercase tracking-widest px-4 py-3 transition-all relative"
               v-on:click="toggleTabs(2)"
               v-bind:class="{'mygames-tab--active bg-mars-deep text-mars-text': openTab === 2, 'text-mars-text-dim hover:text-mars-text hover:bg-mars-deep/50': openTab !== 2}">
            <span v-i18n>Settings</span>
            <div v-if="openTab === 2" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8" style="height:2px;background:linear-gradient(to right,transparent,#e2520e,transparent);"></div>
          </div>
          <div class="mygames-tab flex-1 text-center text-xs font-bold uppercase tracking-widest px-4 py-3 transition-all relative"
               v-on:click="toggleTabs(3)"
               v-bind:class="{'mygames-tab--active bg-mars-deep text-mars-text': openTab === 3, 'text-mars-text-dim hover:text-mars-text hover:bg-mars-deep/50': openTab !== 3}">
            <span v-i18n>Games</span>
            <div v-if="openTab === 3" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8" style="height:2px;background:linear-gradient(to right,transparent,#e2520e,transparent);"></div>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="bg-mars-deep border border-mars-border shadow-xl shadow-black/40 p-5 relative"
          style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);">
          <div class="absolute top-0 left-0 w-8 h-px" style="background:linear-gradient(to right,#e2520e,transparent);"></div>
          <div class="absolute bottom-0 right-0 w-8 h-px" style="background:linear-gradient(to left,#e2520e,transparent);"></div>

          <!-- User Info -->
          <div v-bind:class="{'hidden': openTab !== 1, 'block': openTab === 1}">
            <div class="mb-4">
              <button class="px-4 py-2 bg-mars-surface hover:bg-mars-border text-mars-text-dim hover:text-mars-text text-sm font-medium transition-colors border border-mars-border rounded-sm"
                      style="cursor:pointer;" v-on:click="changeLogin" v-i18n>
                <span v-if="userName">Logout</span>
                <span v-else>Login / Register</span>
              </button>
            </div>

            <div v-if="userName" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- User Name Card -->
              <div class="p-4 text-center" style="background:linear-gradient(135deg,rgba(17,26,46,0.95),rgba(26,37,64,0.8));border:1px solid rgba(38,48,80,0.5);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));">
                <div class="text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-2" v-i18n>User Name</div>
                <div class="text-lg text-mars-text font-semibold">{{ userName }}</div>
              </div>
              <!-- VIP Card -->
              <div class="p-4 text-center" style="background:linear-gradient(135deg,rgba(17,26,46,0.95),rgba(26,37,64,0.8));border:1px solid rgba(38,48,80,0.5);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));">
                <div class="text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-2" v-i18n>Potato Date</div>
                <div v-if="vipDate" class="text-lg text-mars-amber font-mono font-semibold">{{ vipDate }}</div>
                <div v-else>
                  <a href="/donate" class="inline-block mt-1 px-3 py-1.5 bg-mars-amber/15 hover:bg-mars-amber/25 text-mars-amber text-xs font-bold uppercase tracking-wider border border-mars-amber/30 hover:border-mars-amber/50 transition-all" v-i18n>Get Potato</a>
                </div>
              </div>
              <!-- Rank Card -->
              <div class="p-4 text-center" style="background:linear-gradient(135deg,rgba(17,26,46,0.95),rgba(26,37,64,0.8));border:1px solid rgba(38,48,80,0.5);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));">
                <div class="text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-2">User Rank</div>
                <div v-if="userRank.userId!==''" class="scale-110 mb-2">
                  <RankTier :rankTier="getTier()" :showNumber="false"/>
                </div>
                <div v-else>
                  <button class="px-3 py-1.5 bg-mars-rust/15 hover:bg-mars-rust/25 text-mars-rust text-xs font-bold uppercase tracking-wider border border-mars-rust/30 hover:border-mars-rust/50 transition-all mb-2"
                    v-on:click="activateRank" v-i18n>Start Rank</button>
                </div>
                <a href="/ranks" class="inline-block px-3 py-1 text-mars-cyan text-xs uppercase tracking-wider font-mono hover:underline" v-i18n>View Rankings</a>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div v-bind:class="{'hidden': openTab !== 2, 'block': openTab === 2}">
            <div v-if="userName" class="space-y-4">
              <confirm-dialog message="开启后其他玩家可以通过你的游戏链接查看你的手牌，但不能帮你操作" ref="showHand"
                              v-on:accept="confimUpdate" v-on:dismiss="cancelUpdate"/>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="enable_sounds" v-model="enable_sounds" v-on:change="updateTips"
                  class="w-4 h-4 accent-mars-rust">
                <span class="text-sm text-mars-text-dim group-hover:text-mars-text transition-colors" v-i18n>Sound notifications</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="showhandcards" v-model="showhandcards" v-on:change="updateShowHandCards"
                  class="w-4 h-4 accent-mars-rust">
                <span class="text-sm text-mars-text-dim group-hover:text-mars-text transition-colors" v-i18n>Show cards in hand to others</span>
              </label>
            </div>
          </div>

          <!-- Games -->
          <div v-bind:class="{'hidden': openTab !== 3, 'block': openTab === 3}">
            <div v-if="userName">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead>
                    <tr class="border-b border-mars-border">
                      <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Created</th>
                      <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Players</th>
                      <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Members</th>
                      <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="game in games" class="border-b border-mars-border/40 hover:bg-mars-surface/50 transition-colors">
                      <td class="py-2.5 px-3 font-mono text-mars-text-dim text-xs">{{ game.createtime.slice(0, 16) }}</td>
                      <td class="py-2.5 px-3 font-mono text-mars-text">{{ game.players.length }}</td>
                      <td class="py-2.5 px-3">
                        <span v-for="player in game.players" class="player_name mr-1" :class="'player_bg_color_'+ player.color">
                          <a :href="'/player?id=' + player.id" class="text-mars-text hover:text-white">{{ player.name }}</a>
                        </span>
                      </td>
                      <td class="py-2.5 px-3">
                        <span v-if="isGameAbandon(game.phase)" class="inline-block px-2 py-0.5 text-xs font-mono uppercase bg-mars-surface text-mars-text-faint border border-mars-border rounded-sm">Abandon</span>
                        <span v-else-if="isGameTimeOut(game.phase)" class="inline-block px-2 py-0.5 text-xs font-mono uppercase bg-mars-red/15 text-mars-red border border-mars-red/30 rounded-sm">Timeout</span>
                        <a v-else-if="isGameEnd(game.phase)" v-bind:href="'/game?id='+game.id" target="_blank" class="inline-block px-2 py-0.5 text-xs font-mono uppercase bg-mars-surface text-mars-text-dim border border-mars-border rounded-sm hover:text-mars-text transition-colors" v-i18n>Ended</a>
                        <a v-else v-bind:href="'/game?id='+game.id" target="_blank" class="inline-block px-2 py-0.5 text-xs font-mono uppercase bg-mars-teal/15 text-mars-teal border border-mars-teal/30 rounded-sm hover:bg-mars-teal/25 transition-colors" v-i18n>Running</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>
        .mygames-tab {
          clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
          background: rgba(17,26,46,0.4);
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .mygames-tab--active {
          border-color: rgba(38,48,80,0.7);
          background: rgba(17,26,46,0.8);
        }
      </style>
    </div>`,

});
