<template>
<div :class="'sidebar_cont sidebar '+getSideBarClass()">
  <div class="tm" :title="$t('Generation Marker')">
    <div class="gen-text">GEN</div>
    <div class="gen-marker">{{ getGenMarker() }}</div>
  </div>
  <div v-if="gameOptions.turmoilExtension" :title="$t('Ruling Party')">
    <div :class="'party-name party-name-indicator party-name--'+rulingPartyToCss()"> {{ getRulingParty() }}</div>
  </div>
  <div class="global_params">
    <global-parameter-value :param="this.globalParameter.TEMPERATURE" :value="this.temperature"></global-parameter-value>
    <global-parameter-value :param="this.globalParameter.OXYGEN" :value="this.oxygen"></global-parameter-value>
    <global-parameter-value :param="this.globalParameter.OCEANS" :value="this.oceans"></global-parameter-value>
    <global-parameter-value v-if="gameOptions.venusNextExtension" :param="this.globalParameter.VENUS" :value="this.venus"></global-parameter-value>
    <MoonGlobalParameterValue v-if="gameOptions.moonExpansion" :moonData="this.moonData"></MoonGlobalParameterValue>
  </div>
  <div class="sidebar_item preferences_player" :title="$t('Player Color Cube')">
    <div :class="getPlayerColorCubeClass()+' player_bg_color_' + player_color"></div>
  </div>
  <a  href="https://wx4.sinaimg.cn/mw2000/0081mJiNgy1h02nbunoj0j30ze0zatsn.jpg" target="_blank">
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
  <a href="#board" :title="$t('Jump to board')">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--board"></i>
      </div>
  </a>
  <a href="#actions" :title="$t('Jump to actions')">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--actions"></i>
      </div>
  </a>
  <a href="#cards" :title="$t('Jump to cards')">
      <div class="sidebar_item goto-cards sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--cards"><slot></slot></i>
      </div>
  </a>
  <a v-if="coloniesCount > 0" href="#colonies" :title="$t('Jump to colonies')">
      <div class="sidebar_item sidebar_item_shortcut">
          <i class="sidebar_icon sidebar_icon--colonies"></i>
      </div>
  </a>

  <div class="sidebar_item sidebar_item--info" :title="$t('Information panel')">
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

  <div class="sidebar_item sidebar_item--settings" :title="$t('Player Settings')">
    <i class="sidebar_icon sidebar_icon--settings" :class="{'sidebar_item--is-active': ui.preferences_panel_open}" v-on:click="ui.preferences_panel_open = !ui.preferences_panel_open"></i>
    <preferences-dialog v-if="ui.preferences_panel_open" @okButtonClicked="ui.preferences_panel_open = false"  :preferencesManager="preferencesManager"/>
  </div>
</div>
</template>

<script lang="ts">

import Vue from 'vue';
import {Color} from '@/common/Color';
import {getPreferences, PreferencesManager} from '@/client/utils/PreferencesManager';
import {TurmoilModel} from '@/common/models/TurmoilModel';
import {PartyName} from '@/common/turmoil/PartyName';
import GameSetupDetail from '@/client/components/GameSetupDetail.vue';
import {GameOptions} from '@/Game';
import GlobalParameterValue from '@/client/components/GlobalParameterValue.vue';
import MoonGlobalParameterValue from '@/client/components/MoonGlobalParameterValue.vue';
import {GlobalParameter} from '@/common/GlobalParameter';
import {MoonModel} from '@/common/models/MoonModel';
import PreferencesDialog from '@/client/components/PreferencesDialog.vue';
import {mainAppSettings} from '@/client/components/App';
import {PlayerViewModel} from '@/common/models/PlayerModel';

let ui_timeout_id : number;
export default Vue.extend({
  name: 'sidebar',
  props: {
    playerNumber: {
      type: Number,
    },
    gameOptions: {
      type: Object as () => GameOptions,
    },
    playerView: {
      type: Object as () => PlayerViewModel,
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
    MoonGlobalParameterValue,
    'preferences-dialog': PreferencesDialog,
  },
  data() {
    return {
      'ui': {
        'preferences_panel_open': false,
        'resign_panel_open': false,
        'resign_wait': false,
        'resign_time': '',
        'canresign': false,
        'gamesetup_detail_open': false,
      },
      'globalParameter': GlobalParameter,
    };
  },
  methods: {
    preferencesPanelOpen: function() :void {
      this.ui.resign_panel_open = false;
      this.ui.resign_wait = false;
      this.ui.resign_time = '';

      clearInterval(ui_timeout_id);
      this.ui.preferences_panel_open = !this.ui.preferences_panel_open;
    },
    resignPanelOpen: function(): void {
      const ui = this.ui;
      ui.preferences_panel_open = false;

      clearInterval(ui_timeout_id);
      ui.resign_panel_open = ! ui.resign_panel_open;
      ui.resign_wait = false;
      ui.resign_time = '';
    },
    resignWait: function():void {
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
    resign: function():void {
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
          root.playerView = xhr.response;
          root.playerkey++;
          root.screen = 'player-home';
          if (root.playerView?.game.phase === 'end' && window.location.pathname !== '/the-end') {
            (window as any).location = (window as any).location;
          }
        } else if (xhr.status === 400 && xhr.responseType === 'json') {
          const root = this.$root as unknown as typeof mainAppSettings.methods;
          root.showAlert( xhr.response.message || '', () =>{});
        } else {
          alert('Error sending input');
        }
      };
      const senddata ={'playerId': this.playerView.id, 'userId': userId};
      xhr.send(JSON.stringify(senddata));
    },
    getPlayerColorCubeClass(): string {
      return this.acting_player && (getPreferences().hide_animated_sidebar === false) ? 'preferences_player_inner active' : 'preferences_player_inner';
    },
    getSideBarClass(): string {
      return this.acting_player && (getPreferences().hide_animated_sidebar === false) ? 'preferences_acting_player' : 'preferences_nonacting_player';
    },
    getGenMarker(): string {
      return `${this.generation}`;
    },
    rulingPartyToCss(): string {
      if (this.turmoil.ruling === undefined) {
        console.warn('no party provided');
        return '';
      }
      return this.turmoil.ruling.toLowerCase().split(' ').join('_');
    },
    getRulingParty(): string {
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
    this.ui.canresign = this.playerView.canExit &&
            (this.$root as any).isvip &&
            this.playerView.block === false;
  },
  computed: {
    preferencesManager(): PreferencesManager {
      return PreferencesManager.INSTANCE;
    },
  },
});

</script>
