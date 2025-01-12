import Vue from 'vue';

import axios from 'axios';
import {Phase} from '@/common/Phase';
import {getPreferences, PreferencesManager} from '../utils/PreferencesManager';
import ConfirmDialog from './common/ConfirmDialog.vue';
import RankTier from '@/client/components/RankTier.vue';
import {UserRank} from '../../common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '../../common/rank/constants';

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
    this.userId = PreferencesManager.load('userId');
    this.userName = PreferencesManager.load('userName');
    if (this.userId.length > 0) {
      this.getGames();
      this.getUserRank();
    }
  },
  methods: {
    getGames: function() {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/mygames?id='+this.userId);
      xhr.onerror = function() {
        alert('Error getting games data');
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = xhr.response;
          if (result && result.mygames && result.mygames instanceof Array) {
            this.games = result.mygames;
            if (result.vipDate) {
              this.vipDate = result.vipDate;
            }
            this.showhandcards = result.showhandcards;
          } else {
            alert('Unexpected response fetching games from API');
          }
        } else {
          alert('Unexpected response fetching games from API');
        }
      };
      xhr.responseType = 'json';
      xhr.send();
    },
    getUserRank: function() {
      if (this.userId === '') return;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/userrank?userId='+this.userId);
      xhr.onerror = function() {
        alert('Error getting user rank data');
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = xhr.response;
          if (result && result.rankValue >= 0) {
            this.userRank = new UserRank(this.userId, result.rankValue, result.mu, result.sigma, result.trueskill); // 更新userRank的值
          }
        }
      };
      xhr.responseType = 'json';
      xhr.send();
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
        PreferencesManager.loginOut();
      } else {
        window.location.href = '/login';
      }
    },
    updateTips: function() {
      PreferencesManager.INSTANCE.set('enable_sounds', this.enable_sounds );
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
      const userId = PreferencesManager.load('userId');
      if ( userId === undefined || userId === '') {
        return;
      }
      axios.post('/api/showHand', {
        userId: userId,
        showhandcards: this.showhandcards,
      }).then(function(response) {
        console.log(response);
      }).catch(function(error) {
        alert(error);
      });
    },

    // 天梯，激活排名，在`user_rank`表中创建对应数据
    activateRank: function() {
      const userId = PreferencesManager.load('userId');
      if ( userId === undefined || userId === '') {
        return;
      }
      console.log('activateRank');
      const $this = this;
      axios.post('/api/activateRank', {
        userId: userId,
      }).then(function(response) {
        if (response && response.data ) {
          const result = response.data;
          $this.userRank = new UserRank($this.userId, result.rankValue, result.mu, result.sigma, result.trueskill); // 更新userRank的值
        }
      }).catch(function(error) {
        alert(error);
      });
    },
    toggleTabs: function(tabNumber: number) {
      this.openTab = tabNumber;
    },
  },
  created() {
    if (window.localStorage) {
      this.enable_sounds = getPreferences().enable_sounds;
      this.userName = PreferencesManager.load('userName');
    }
  },
  template: `
    <div id="games-overview">
    <h1><a href="/" v-i18n>Terraforming Mars</a> — <span v-i18n>My Games</span>
    </h1>

    <div class="flex flex-wrap">
    <div class="w-full mr-8">
      <ul class="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row" style="cursor:pointer;">
        <li class="-mb-px mr-2 last:mr-0 flex-auto text-center">
          <div class="text-lg font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal" v-on:click="toggleTabs(1)" v-bind:class="{'text-blue-300 bg-gray-700': openTab !== 1, 'text-white bg-blue-300': openTab === 1}">
            <span v-i18n>User Information</span>
          </div>
        </li>
        <li class="-mb-px mr-2 last:mr-0 flex-auto text-center">
          <div class="text-lg font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal" v-on:click="toggleTabs(2)" v-bind:class="{'text-blue-300 bg-gray-700': openTab !== 2, 'text-white bg-blue-300': openTab === 2}">
            <span v-i18n>User Setting</span>
          </div>
        </li>
        <li class="-mb-px mr-2 last:mr-0 flex-auto text-center">
          <div class="text-lg font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal" v-on:click="toggleTabs(3)" v-bind:class="{'text-blue-300 bg-gray-700': openTab !== 3, 'text-white bg-blue-300': openTab === 3}">
            <span v-i18n>User Games</span>
          </div>
        </li>
      </ul>
      <div class="relative flex flex-col min-w-0 break-words bg-gray-700 w-full mb-6 shadow-lg rounded">
        <div class="px-4 py-5 flex-auto">
          <div class="tab-content tab-space">
            <div v-bind:class="{'hidden': openTab !== 1, 'block': openTab === 1}">
              <button class="rounded-md bg-blue-500 hover:bg-blue-300 w-32 p-2 text-md align-center"  style="cursor:pointer;"
                      v-on:click="changeLogin" v-i18n>
                <span v-if="userName">LoginOut</span>
                <span v-else>Login/Register</span>
              </button>

              <div v-if="userName" class="flex flex-col items-center justify-center">
                <div class="rounded-md bg-gray-500 w-64 my-4 text-center text-md" v-i18n>
                  <div class="text-lg text-gray-700 font-bold">{{$t('User Name')}}</div>
                  {{ userName }}
                </div>
                <div class="align-center rounded-md bg-gray-500 w-64 my-4 text-center text-md p-2" v-i18n>
                  <div class="text-lg text-gray-700 font-bold">{{$t('Potato Date')}}</div>
                  <div v-if="this.vipDate">{{ vipDate }}</div>
                  <div v-else>
                    <div class="rounded-md bg-yellow-500 hover:bg-yellow-600 w-auto p-2"><a href="/donate" class="text-black text-md align-center" v-i18n>
                      {{$t('Get Potato')}}
                    </a></div>
                  </div>
                </div>

                <div class="flex flex-col items-center justify-center rounded-md bg-gray-500 w-64 h-32 my-4 pb-2 text-center text-md " v-i18n>
                  <div class="text-lg text-gray-700 font-bold">User Rank</div>
                  <div v-if="this.userRank.userId!==''" class=" scale-125 ml-10 mb-2">
                    <RankTier :rankTier="getTier()" :showNumber="false"/>
                  </div>
                  <div v-else>
                    <button class="rounded-md bg-yellow-500 hover:bg-yellow-600 w-auto p-2 text-md align-center mb-2" v-on:click="activateRank" v-i18n>
                      Start Rank
                    </button>
                  </div>
                  <div class="rounded-md bg-yellow-500 hover:bg-yellow-600 w-auto p-2">
                    <a href="/ranks" class="text-black text-md align-center" v-i18n>
                      {{ $t('Go To Ranking') }}
                    </a></div>
                  <!--      <p>Hello <span class="user-name">{{ userName }}</span>,the following games are related with you:</p>-->
                </div>
                </div>
              </div>

            </div>
            <div v-bind:class="{'hidden': openTab !== 2, 'block': openTab === 2}">
              <div v-if="userName">
              <confirm-dialog message="开启后其他玩家可以通过你的游戏链接查看你的手牌，但不能帮你操作" ref="showHand"
                              v-on:accept="confimUpdate" v-on:dismiss="cancelUpdate"/>
              <label class="form-switch" style="margin-left: 20px;display: inline-block;">
                <input type="checkbox" name="enable_sounds" v-model="enable_sounds" v-on:change="updateTips">
                <i class="form-icon"></i> <span v-i18n>Soundtip</span>
              </label>
              <br />
              <label class="form-switch" style="margin-left: 20px;display: inline-block;">
                <input type="checkbox" name="showhandcards" v-model="showhandcards" v-on:change="updateShowHandCards">
                <i class="form-icon"></i> <span v-i18n>Show cards in hand to others</span>
              </label>
              </div>
            </div>
            <div v-bind:class="{'hidden': openTab !== 3, 'block': openTab === 3}">
              <div v-if="userName">
              <div class="relative overflow-x-auto">
              <table class="w-full text-sm text-left mygames">
                <thead>
                <tr class="bg-gray-500">
                  <th v-i18n>Create Time</th>
                  <th v-i18n>Player Number</th=>
                  <th v-i18n>Players</th=>
                  <th v-i18n>Status</th=>
                </tr>
                </thead>
                <tbody>
                <tr v-for="game in games">
                  <td>{{ game.createtime.slice(0, 16) }}</td>
                  <td>{{ game.players.length }}</td>
                  <td class="text-left"><span v-for="player in game.players" class="player_name"
                            :class="'player_bg_color_'+ player.color">
                            <a :href="'/player?id=' + player.id">{{ player.name }}</a>
                        </span>
                  </td>
                  <td>
                    <div v-if="isGameAbandon(game.phase)" class="rounded-md w-20 bg-gray-500 text-center p-1">
                      Abandon
                    </div>
                    <div v-else-if="isGameTimeOut(game.phase)" class="rounded-md w-20 bg-red-400 text-center p-1">
                      Time Out
                    </div>
                    <div v-else-if="isGameEnd(game.phase)" class="rounded-md w-20 bg-gray-500 text-center p-1">
                      <a v-bind:href="'/game?id='+game.id" target="_blank" v-i18n>Ended</a>
                    </div>
                    <div v-else class="rounded-md w-20 bg-green-600 text-center p-1" v-i18n>
                      <a v-bind:href="'/game?id='+game.id" target="_blank" v-i18n>Running</a>
                    </div>
                  </td>
                </tr>

                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>`,

});
