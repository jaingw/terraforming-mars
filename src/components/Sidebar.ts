import Vue from 'vue';
import {Color} from '../Color';
import {PreferencesManager} from './PreferencesManager';
import {LANGUAGES} from '../constants';
import {TurmoilModel} from '../models/TurmoilModel';
import {PartyName} from '../turmoil/parties/PartyName';
import {GameSetupDetail} from './GameSetupDetail';
import {TranslateMixin} from './TranslateMixin';
import {PlayerModel} from '../models/PlayerModel';
import {GameOptions} from '../Game';
import {GlobalParameterValue} from './GlobalParameterValue';
import {MoonGlobalParameterValue} from './MoonGlobalParameterValue';
import {GlobalParameter} from '../GlobalParameter';
import {MoonModel} from '../models/MoonModel';
import {PreferencesDialog} from './PreferencesDialog';
import {mainAppSettings} from './App';

let ui_timeout_id : number;
export const Sidebar = Vue.component('sidebar', {
  props: {
    playerNumber: {
      type: Number,
    },
    gameOptions: {
      type: Object as () => GameOptions,
    },
    player: {
      type: Object as () => PlayerModel,
    },
    acting_player: {
      type: Boolean,
    },
    player_color: {
      type: String as () => Color,
    },
    generation: {
      type: Number,
    },
    coloniesCount: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    oxygen: {
      type: Number,
    },
    oceans: {
      type: Number,
    },
    venus: {
      type: Number,
    },
    moonData: {
      type: Object as () => MoonModel,
    },
    turmoil: {
      type: Object as () => TurmoilModel || undefined,
    },
    lastSoloGeneration: {
      type: Number,
    },
  },
  components: {
    'game-setup-detail': GameSetupDetail,
    'global-parameter-value': GlobalParameterValue,
    'moon-global-parameter-value': MoonGlobalParameterValue,
    'preferences-dialog': PreferencesDialog,
  },
  mixins: [TranslateMixin],
  data: function() {
    return {
      'ui': {
        'preferences_panel_open': false,
        'resign_panel_open': false,
        'resign_wait': false,
        'resign_time': '',
        'canresign': false,
        'gamesetup_detail_open': false,
      },
      'hide_hand': false as boolean | unknown[],
      'hide_awards_and_milestones': false as boolean | unknown[],
      'hide_top_bar': false as boolean | unknown[],
      'small_cards': false as boolean | unknown[],
      'remove_background': false as boolean | unknown[],
      'magnify_cards': true as boolean | unknown[],
      'show_alerts': true as boolean | unknown[],
      'lang': 'en',
      'langs': LANGUAGES,
      'enable_sounds': false as boolean | unknown[],
      'hide_tile_confirmation': false as boolean | unknown[],
      'show_card_number': false as boolean | unknown[],
      'hide_discount_on_cards': false as boolean | unknown[],
      'learner_mode': true as boolean | unknown[],
      'hide_animated_sidebar': false as boolean | unknown[],
      'globalParameter': GlobalParameter,
    };
  },
  methods: {
    preferencesPanelOpen: function() :void{
      this.ui.resign_panel_open = false;
      this.ui.resign_wait = false;
      this.ui.resign_time = '';

      clearInterval(ui_timeout_id);
      this.ui.preferences_panel_open = !this.ui.preferences_panel_open;
    },
    resignPanelOpen: function(): void{
      const ui = this.ui;
      ui.preferences_panel_open = false;

      clearInterval(ui_timeout_id);
      ui.resign_panel_open = ! ui.resign_panel_open;
      ui.resign_wait = false;
      ui.resign_time = '';
    },
    resignWait: function():void{
      this.ui.resign_time = '(3s)';
      let wait_time = 3;
      clearInterval(ui_timeout_id);
      const resignWaitTime = ()=> {
        if (wait_time > 1 ) {
          wait_time = wait_time - 1;
          this.ui.resign_time = '('+ wait_time +'s)';
        } else {
          clearInterval(ui_timeout_id);
          this.ui.resign_wait = true;
        }
      };
      ui_timeout_id = (setInterval(resignWaitTime, 1000) as any);
    },
    resign: function():void{
      const userId = PreferencesManager.load('userId');
      this.resignPanelOpen();
      if (userId === '') {
        this.resignPanelOpen();
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'player/resign');
      xhr.responseType = 'json';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const root = this.$root.$data as unknown as typeof mainAppSettings.data;
          root.screen = 'empty';
          root.player = xhr.response;
          root.playerkey++;
          root.screen = 'player-home';
          if (root.player?.game.phase === 'end' && window.location.pathname !== '/the-end') {
            (window as any).location = (window as any).location;
          }
        } else if (xhr.status === 400 && xhr.responseType === 'json') {
          const element: HTMLElement | null = document.getElementById('dialog-default');
          const message: HTMLElement | null = document.getElementById('dialog-default-message');
          if (message !== null && element !== null && (element as HTMLDialogElement).showModal !== undefined) {
            message.innerHTML = xhr.response.message;
            (element as HTMLDialogElement).showModal();
          } else {
            alert(xhr.response.message);
          }
        } else {
          alert('Error sending input');
        }
      };
      const senddata ={'playerId': this.player.id, 'userId': userId};
      xhr.send(JSON.stringify(senddata));
    },
    getPlayerColorCubeClass: function(): string {
      return this.acting_player && (PreferencesManager.loadBoolean('hide_animated_sidebar') === false) ? 'preferences_player_inner active' : 'preferences_player_inner';
    },
    getSideBarClass: function(): string {
      return this.acting_player && (PreferencesManager.loadBoolean('hide_animated_sidebar') === false) ? 'preferences_acting_player' : 'preferences_nonacting_player';
    },
    getGenMarker: function(): string {
      return `${this.generation}`;
    },
    rulingPartyToCss: function(): string {
      if (this.turmoil.ruling === undefined) {
        console.warn('no party provided');
        return '';
      }
      return this.turmoil.ruling.toLowerCase().split(' ').join('_');
    },
    getRulingParty: function(): string {
      const rulingPartyName = this.turmoil.ruling;
      if (rulingPartyName === PartyName.MARS) {
        return 'Mars';
      } else if (rulingPartyName === PartyName.SCIENTISTS) {
        return 'Science';
      } else if (rulingPartyName === PartyName.KELVINISTS) {
        return 'Kelvin';
      } else {
        return rulingPartyName as string;
      }
    },
  },
  mounted: function() {
    //    this.updatePreferencesFromStorage();
    this.ui.canresign = this.player.canExit &&
            (this.$root as any).isvip &&
            this.player.block === false;
  },
  template: `
<div :class="'sidebar_cont sidebar '+getSideBarClass()">
  <div class="tm">
    <div class="gen-text">GEN</div>
    <div class="gen-marker">{{ getGenMarker() }}</div>
  </div>
  <div v-if="gameOptions.turmoilExtension">
    <div :class="'party-name party-name-indicator party-name--'+rulingPartyToCss()"> {{ getRulingParty() }}</div>
  </div>
  <div class="global_params">
    <global-parameter-value :param="this.globalParameter.TEMPERATURE" :value="this.temperature"></global-parameter-value>
    <global-parameter-value :param="this.globalParameter.OXYGEN" :value="this.oxygen"></global-parameter-value>
    <global-parameter-value :param="this.globalParameter.OCEANS" :value="this.oceans"></global-parameter-value>
    <global-parameter-value v-if="gameOptions.venusNextExtension" :param="this.globalParameter.VENUS" :value="this.venus"></global-parameter-value>
    <moon-global-parameter-value v-if="gameOptions.moonExpansion" :moonData="this.moonData"></moon-global-parameter-value>
  </div>
  <div class="sidebar_item preferences_player">
    <div :class="getPlayerColorCubeClass()+' player_bg_color_' + player_color"></div>
  </div>
  <a  href="/donate" target="_blank">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--donate"><div class="deck-size">赞助</div></i>
      </div>
  </a>
  <a  href="#resign_panel" style="position: relative;">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--resign"  v-on:click="resignPanelOpen"><div class="deck-size">体退</div></i>
      </div>
      <div class="resign_panel" id="resign_panel" v-if="ui.resign_panel_open">
          <div class="preferences_panel_item form-group">
              体退功能必须满足以下条件：
              <li> 用户已登录且为赞助用户</li>
              <li> 游戏处于行动阶段</li>
              <li> 剩余玩家人数至少2人</li>
              <li> 玩家当前回合才能体退</li>
              <li> 玩家名称未注册 或者 <br>&nbsp;&nbsp;&nbsp;&nbsp;玩家注册名称与登录名称相同</li>
              
          </div>
          <div style="padding: 10px;border-top: dashed;">玩家只剩1人时不能再获得新的里程牌<br>以及设立奖项</div>
          <div class="preferences_panel_actions">
              <button class="btn btn-lg btn-primary" v-on:click="resignWait" v-if="!ui.resign_wait && ui.canresign" >我要体退！{{ui.resign_time}}</button> 
              <button class="btn btn-lg btn-primary" v-on:click="resign" v-if="ui.resign_wait" >确认体退</button>
          </div>
      </div>
  </a>
  <a href="#board">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--board"></i>
      </div>
  </a>
  <a href="#actions">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--actions"></i>
      </div>
  </a>
  <a href="#cards">
      <div class="sidebar_item goto-cards sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--cards"><slot></slot></i>
      </div>
  </a>
  <a v-if="coloniesCount > 0" href="#colonies">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--colonies"></i>
      </div>
  </a>

  <div class="sidebar_item sidebar_item--info">
    <i class="sidebar_icon sidebar_icon--info"
      :class="{'sidebar_item--is-active': ui.gamesetup_detail_open}"
      v-on:click="ui.gamesetup_detail_open = !ui.gamesetup_detail_open"
      :title="$t('game setup details')"></i>
    <div class="info_panel" v-if="ui.gamesetup_detail_open">
      <div class="info_panel-spacing"></div>
      <div class="info-panel-title" v-i18n>Game Setup Details</div>
      <game-setup-detail :gameOptions="gameOptions" :playerNumber="playerNumber" :lastSoloGeneration="lastSoloGeneration"></game-setup-detail>

      <div class="info_panel_actions">
        <button class="btn btn-lg btn-primary" v-on:click="ui.gamesetup_detail_open=false">Ok</button>
      </div>
    </div>
  </div>

  <a href="/help" target="_blank">
    <div class="sidebar_item sidebar_item--help">
      <i class="sidebar_icon sidebar_icon--help" :title="$t('player aid')"></i>
    </div>
  </a>

  <div class="sidebar_item sidebar_item--settings">
    <i class="sidebar_icon sidebar_icon--settings" :class="{'sidebar_item--is-active': ui.preferences_panel_open}" v-on:click="ui.preferences_panel_open = !ui.preferences_panel_open"></i>
    <preferences-dialog v-if="ui.preferences_panel_open" @okButtonClicked="ui.preferences_panel_open = false"/>
  </div>
</div>
    `,
});
