import Vue from 'vue';

import axios from 'axios';
import {Phase} from '@/common/Phase';
import {getPreferences, PreferencesManager} from '../utils/PreferencesManager';
import ConfirmDialog from './common/ConfirmDialog.vue';

export const MyGames = Vue.component('my-games', {
  data: function() {
    return {
      userId: '',
      userName: '',
      games: [],
      vipDate: '',
      enable_sounds: false,
      showhandcards: false,
    };
  },
  components: {
    'confirm-dialog': ConfirmDialog,
  },
  mounted: function() {
    this.userId = PreferencesManager.load('userId');
    this.userName = PreferencesManager.load('userName');
    if (this.userId.length > 0) {
      this.getGames();
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
    isGameRunning: function(gamePhase: string): boolean {
      return (gamePhase === Phase.END) ? false : true;
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
  },
  created() {
    if (window.localStorage) {
      this.enable_sounds = getPreferences().enable_sounds;
      this.userName = PreferencesManager.load('userName');
    }
  },
  template: `
        <div id="games-overview">
            <h1><a href="/"  v-i18n>Terraforming Mars</a> — <span v-i18n>My Games</span> 
                <span v-if="this.vipDate"><img src="assets/qrcode/potato.png" style="height: 50px;vertical-align: middle;" />{{vipDate}}<img src="assets/qrcode/potato.png" style="height: 50px;vertical-align: middle;" /></span> 
                <button class="btn btn-lg btn-success" style="margin-bottom: 7px;min-width: 80px;" v-on:click="changeLogin" v-i18n><span v-if="userName">LoginOut</span><span v-else>Login/Register</span></button>
            </h1>
            <confirm-dialog message="开启后其他玩家可以通过你的游戏链接查看你的手牌，但不能帮你操作" ref="showHand"   v-on:accept="confimUpdate" v-on:dismiss="cancelUpdate" />
            <label class="form-switch" style="margin-left: 20px;display: inline-block;">
              <input type="checkbox" name="enable_sounds" v-model="enable_sounds" v-on:change="updateTips" >
              <i class="form-icon"></i> <span v-i18n>Soundtip</span>
            </label>
            <label  class="form-switch" style="margin-left: 20px;display: inline-block;">
              <input type="checkbox" name="showhandcards" v-model="showhandcards" v-on:change="updateShowHandCards" >
              <i class="form-icon"></i> <span v-i18n>Show cards in hand to others</span>
            </label>
            <br>
            <div v-if="userName">
                <p>Hello <span class="user-name">{{userName}}</span>,the following games are related with you:</p>
            </div>
            <ul>
                <li v-for="game in games">
                    <a v-bind:href="'/game?id='+game.id" target="_blank" >{{game.id}}</a> 
                    <span>{{game.createtime.slice(5, 16)}}  {{game.updatetime.slice(5, 16)}}  </span>
                    age: {{game.gameAge}} 
                    with {{game.players.length}} player(s) : 
                    <span class="player_home_block nofloat" >
                        <span v-for="player in game.players" class="player_name" :class="'player_bg_color_'+ player.color">
                            <a :href="'/player?id=' + player.id">{{player.name}}</a>
                        </span>
                        <span v-if="isGameRunning(game.phase)">is running</span><span v-else>has ended</span>
                    </span>
                </li>
            </ul>
        </div>
    `,
});

