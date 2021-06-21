import Vue from 'vue';

import {Phase} from '../Phase';
import {PreferencesManager} from './PreferencesManager';

export const MyGames = Vue.component('my-games', {
  data: function() {
    return {
      userId: '',
      userName: '',
      games: [],
      vipDate: '',
    };
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
      const vueApp = this;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/mygames?id='+this.userId);
      xhr.onerror = function() {
        alert('Error getting games data');
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = xhr.response;
          if (result && result.mygames && result.mygames instanceof Array) {
            (vueApp as any).games = result.mygames;
            if (result.vipDate) {
              (vueApp as any).vipDate = result.vipDate;
            }
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
  },
  template: `
        <div id="games-overview">
            <h1><span v-i18n>Terraforming Mars</span> — <span v-i18n>My Games</span> 
                <span v-if="this.vipDate"><img src="assets/potato.png" style="height: 50px;vertical-align: middle;" />{{vipDate}}<img src="assets/potato.png" style="height: 50px;vertical-align: middle;" /></span> 
                <button class="btn btn-lg btn-success" style="margin-bottom: 7px;min-width: 80px;" v-on:click="changeLogin" v-i18n><span v-if="userName">LoginOut</span><span v-else>Login</span></button>
            </h1>
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

