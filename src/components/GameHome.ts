import Vue from 'vue';
import {PreferencesManager} from './PreferencesManager';
import {SimpleGameModel} from '../models/SimpleGameModel';
import {Button} from '../components/common/Button';
import {playerColorClass} from '../utils/utils';
import {GameSetupDetail} from '../components/GameSetupDetail';
import {QrCode} from './QrCode';

// taken from https://stackoverflow.com/a/46215202/83336
// The solution to copying to the clipboard in this case is
// 1. create a dummy input
// 2. add the copied text as a value
// 3. select the input
// 4. execute document.execCommand('copy') which does the clipboard thing
// 5. remove the dummy input
function copyToClipboard(text: string): void {
  const input = document.createElement('input');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
const DEFAULT_COPIED_PLAYER_ID = '-1';

export const GameHome = Vue.component('game-home', {
  props: {
    game: {
      type: Object as () => SimpleGameModel,
    },
  },
  components: {
    Button,
    'game-setup-detail': GameSetupDetail,
    'qrcode': QrCode,
  },
  data: function() {
    return {
      userId: PreferencesManager.load('userId'),
      // Variable to keep the state for the current copied player id. Used to display message of which button and which player playable link is currently in the clipboard
      urlCopiedPlayerId: DEFAULT_COPIED_PLAYER_ID as string,
    };
  },
  methods: {
    getGameId: function(): string {
      return this.game !== undefined ? this.game.id.toString() : 'n/a';
    },
    getTurnOrder: function(index: number): string {
      if (index === 0) {
        return '1st';
      } else if (index === 1) {
        return '2nd';
      } else if (index === 2) {
        return '3rd';
      } else if (index > 2) {
        return `${index + 1}th`;
      } else {
        return 'n/a';
      }
    },
    setCopiedIdToDefault: function() {
      this.urlCopiedPlayerId = DEFAULT_COPIED_PLAYER_ID;
    },
    getPlayerCubeColorClass: function(color: string): string {
      return playerColorClass(color.toLowerCase(), 'bg');
    },
    getHref: function(playerId: string): string {
      return `/player?id=${playerId}`;
    },
    copyUrl: function(playerId: string): void {
      copyToClipboard(window.location.origin + this.getHref(playerId));
      this.urlCopiedPlayerId = playerId;
    },
    isPlayerUrlCopied: function(playerId: string): boolean {
      return playerId === this.urlCopiedPlayerId;
    },
  },
  template: `
      <div id="game-home" class="game-home-container">
        <h1><a href="/" v-i18n>Terraforming Mars</a> [game id: <span>{{getGameId()}}</span>]</h1>
        <h4 v-i18n>Send players their links below. As game administrator pick your link to use.</h4>
        <div v-if="game !== undefined" style="margin:0px 15px;">Game Age： {{game.gameAge}} ,Last Save Id : {{game.saveId}} 
        </div>
        <ul>
          <li v-for="(player, index) in (game === undefined ? [] : game.players)">
            <span class="turn-order">{{getTurnOrder(index)}}</span>
            <span class="player_name" :class="getPlayerCubeColorClass(player.color)"><a :href="'/player?id=' + player.id">{{player.name}}</a></span>
            <Button title="copy" size="tiny" :onClick="_=>copyUrl(player.id)"/>
            <span v-if="isPlayerUrlCopied(player.id)" class="copied-notice">Playable link for {{player.name}} copied to clipboard <span class="dismissed" @click="setCopiedIdToDefault" >dismiss</span></span>
          </li>
        </ul>

        <div class="spacing-setup"></div>
        <div v-if="game !== undefined">
          <h1 v-i18n>Game settings</h1>
          <game-setup-detail :gameOptions="game.gameOptions" :playerNumber="game.players.length" :lastSoloGeneration="game.lastSoloGeneration"  ></game-setup-detail>
        </div>

        <qrcode/>
      </div>


    `,
});
