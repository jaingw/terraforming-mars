import Vue from 'vue';
import {Color} from '../../Color';
import {BoardName} from '../../boards/BoardName';
import {CardName} from '../../CardName';
import {CorporationsFilter} from './CorporationsFilter';
import {translateTextWithParams} from '../../directives/i18n';
import {IGameData} from '../../database/IDatabase';
import {ColoniesFilter} from './ColoniesFilter';
import {ColonyName} from '../../colonies/ColonyName';
import {CardsFilter} from './CardsFilter';
import {Button} from '../common/Button';
import {playerColorClass} from '../../utils/utils';
import {PreferencesManager} from '../PreferencesManager';
import {RandomMAOptionType} from '../../RandomMAOptionType';
import {AgendaStyle} from '../../turmoil/PoliticalAgendas';

import * as constants from '../../constants';
import {QrCode} from '../QrCode';
import {mainAppSettings} from '../App';

export interface CreateGameModel {
    isvip: boolean,
    constants: typeof constants;
    allOfficialExpansions: boolean;
    firstIndex: number;
    playersCount: number;
    players: Array<NewPlayerModel>;
    corporateEra: boolean;
    prelude: boolean;
    draftVariant: boolean;
    initialDraft: boolean;
    randomMA: RandomMAOptionType;
    randomFirstPlayer: boolean;
    showOtherPlayersVP: boolean;
    beginnerOption: boolean;
    venusNext: boolean;
    colonies: boolean;
    turmoil: boolean;
    customCorporationsList: Array<CardName>;
    customColoniesList: Array<ColonyName>;
    cardsBlackList: Array<CardName>;
    showCorporationList: boolean;
    showColoniesList: boolean;
    showCardsBlackList: boolean;
    isSoloModePage: boolean;
    board: BoardName | 'random';
    boards: Array<BoardName | 'random'>;
    seed: number;
    solarPhaseOption: boolean;
    shuffleMapOption: boolean;
    promoCardsOption: boolean;
    communityCardsOption: boolean;
    erosCardsOption: boolean;
    aresExtension: boolean;
    politicalAgendasExtension: AgendaStyle;
    moonExpansion: boolean;
    undoOption: boolean;
    showTimers: boolean;
    fastModeOption: boolean;
    removeNegativeGlobalEventsOption: boolean;
    heatFor: boolean;
    breakthrough: boolean;
    doubleCorp: boolean; // 双将
    includeVenusMA: boolean;
    startingCorporations: number;
    soloTR: boolean;
    clonedGameData: IGameData | undefined;
    requiresVenusTrackCompletion: boolean;
    requiresMoonTrackCompletion: boolean;
    seededGame: boolean;
    randomMACheckbox: boolean;// 上传设置之后选中随机里程碑的按钮
}

export interface NewPlayerModel {
    index: number;
    name: string;
    color: Color;
    beginner: boolean;
    handicap: number;
    first: boolean;
}

const vipOptions : any = {
  'heatFor': false,
  'breakthrough': false,
  'doubleCorp': false,
  'erosCardsOption': false,
  'aresExtension': false,
  'communityCardsOption': false,
  'moonExpansion': false,
  'politicalAgendasExtension': AgendaStyle.STANDARD,

  'shuffleMapOption': false,
  'removeNegativeGlobalEventsOption': false,
  'randomMA': RandomMAOptionType.NONE,

  // 这四参数跟后端 routes/game不一样
  'cardsBlackList': [],
  'customColoniesList': [],
  'showCardsBlackList': false,
  'showColoniesList': false,
};

export const CreateGameForm = Vue.component('create-game-form', {
  data: function(): CreateGameModel {
    return {
      isvip: false,
      constants,
      firstIndex: 1,
      playersCount: 1,
      players: [
        {index: 1, name: '', color: Color.RED, beginner: false, handicap: 0, first: false},
        {index: 2, name: '', color: Color.GREEN, beginner: false, handicap: 0, first: false},
        {index: 3, name: '', color: Color.YELLOW, beginner: false, handicap: 0, first: false},
        {index: 4, name: '', color: Color.BLUE, beginner: false, handicap: 0, first: false},
        {index: 5, name: '', color: Color.BLACK, beginner: false, handicap: 0, first: false},
        {index: 6, name: '', color: Color.PURPLE, beginner: false, handicap: 0, first: false},
        {index: 7, name: '', color: Color.ORANGE, beginner: false, handicap: 0, first: false},
        {index: 8, name: '', color: Color.PINK, beginner: false, handicap: 0, first: false},
      ],
      corporateEra: true,
      prelude: true,
      draftVariant: true,
      initialDraft: false,
      randomMA: RandomMAOptionType.NONE,
      randomFirstPlayer: true,
      showOtherPlayersVP: true,
      beginnerOption: false,
      venusNext: true,
      colonies: true,
      showColoniesList: false,
      showCorporationList: false,
      showCardsBlackList: false,
      turmoil: true,
      customCorporationsList: [],
      customColoniesList: [],
      cardsBlackList: [],
      isSoloModePage: false,
      board: 'random',
      boards: [
        BoardName.ORIGINAL,
        BoardName.HELLAS,
        BoardName.ELYSIUM,
        'random',
      ],
      seed: Math.random(),
      seededGame: false,
      solarPhaseOption: true,
      shuffleMapOption: false,
      promoCardsOption: true,
      communityCardsOption: false,
      erosCardsOption: false,
      aresExtension: false,
      politicalAgendasExtension: AgendaStyle.STANDARD,
      moonExpansion: false,
      undoOption: true,
      showTimers: true,
      fastModeOption: true,
      removeNegativeGlobalEventsOption: false,
      heatFor: false,
      breakthrough: false,
      doubleCorp: false,
      includeVenusMA: true,
      startingCorporations: 4,
      soloTR: false,
      clonedGameData: undefined,
      allOfficialExpansions: true,
      requiresVenusTrackCompletion: false,
      requiresMoonTrackCompletion: false,
      randomMACheckbox: false,
    };
  },
  components: {
    'corporations-filter': CorporationsFilter,
    'colonies-filter': ColoniesFilter,
    'cards-filter': CardsFilter,
    'Button': Button,
    'qrcode': QrCode,
  },
  mounted: function() {
    if (window.location.pathname === '/solo') {
      this.isSoloModePage = true;
    }

    const root = this.$root as any;
    this.isvip = root.isvip;
  },
  methods: {
    downloadCurrentSettings: function() {
      const serializedData = this.serializeSettings();

      if (serializedData) {
        const a = document.createElement('a');
        const blob = new Blob([serializedData], {'type': 'application/json'});
        a.href = window.URL.createObjectURL(blob);
        a.download = 'tm_settings.json';
        a.click();
      }
    },
    handleSettingsUpload: function() {
      const refs = this.$refs;
      const file = (refs.file as any).files[0];
      const reader = new FileReader();
      const component = this.$data;

      reader.addEventListener('load', function() {
        const readerResults = reader.result;
        if (typeof(readerResults) === 'string') {
          const results = JSON.parse(readerResults);
          const players = results['players'];
          component.playersCount = players.length;
          component.showCorporationList = results['customCorporationsList'].length > 0;
          component.showColoniesList = results['customColoniesList'].length > 0;
          component.showCardsBlackList = results['cardsBlackList'].length > 0;

          for (const k in results) {
            if (['customCorporationsList', 'customColoniesList', 'cardsBlackList', 'players'].includes(k)) continue;
            (component as any)[k] = results[k];
          }

          for (let i = 0; i < players.length; i++) {
            Object.assign(component.players[i], players[i]);
            // component.players[i] = players[i];  这会使player对象替换，vue检测不到更换玩家颜色事件,不会自动修改背景色
          }

          // 非vip还原部分设置
          if (!component.isvip) {
            for (const k in vipOptions) {
              if (['customCorporationsList', 'customColoniesList', 'cardsBlackList', 'players'].includes(k)) continue;
              (component as any)[k] = vipOptions[k];
            }
          }
          if (component.randomMA !== RandomMAOptionType.NONE) {
            component.randomMACheckbox = true;
          }


          Vue.nextTick(() => {
            if (component.isvip) {
              if (component.showColoniesList) {
                (refs.coloniesFilter as any).updateColoniesByNames(results['customColoniesList']);
              }

              if (component.showCorporationList) {
                (refs.corporationsFilter as any).selectedCorporations = results['customCorporationsList'];
              }

              if (component.showCardsBlackList) {
                (refs.cardsFilter as any).selectedCardNames = results['cardsBlackList'];
              }
            }
            if ( ! component.seededGame) {
              component.seed = Math.random();
            }
          });
        }
      }, false);
      if (file) {
        if (/\.json$/i.test(file.name)) {
          reader.readAsText(file);
        }
      }
    },
    getPlayerNamePlaceholder: function(player: NewPlayerModel): string {
      return translateTextWithParams(
        'Player ${0} name',
        [String(player.index)],
      );
    },
    updateCustomCorporationsList: function(newCustomCorporationsList: Array<CardName>) {
      const component = (this as any) as CreateGameModel;
      component.customCorporationsList = newCustomCorporationsList;
    },
    updateCardsBlackList: function(newCardsBlackList: Array<CardName>) {
      const component = (this as any) as CreateGameModel;
      component.cardsBlackList = newCardsBlackList;
    },
    updateCustomColoniesList: function(newCustomColoniesList: Array<ColonyName>) {
      const component = (this as any) as CreateGameModel;
      component.customColoniesList = newCustomColoniesList;
    },
    getPlayers: function(): Array<NewPlayerModel> {
      const component = (this as any) as CreateGameModel;
      return component.players.slice(0, component.playersCount);
    },
    isRandomMAEnabled: function(): Boolean {
      return this.randomMA !== RandomMAOptionType.NONE;
    },
    randomMAToggle: function() {
      const component = (this as any) as CreateGameModel;
      if (component.randomMA === RandomMAOptionType.NONE) {
        component.randomMA = RandomMAOptionType.LIMITED;
        this.randomMA = RandomMAOptionType.LIMITED;
      } else {
        component.randomMA = RandomMAOptionType.NONE;
        this.randomMA = RandomMAOptionType.NONE;
      }
    },
    getRandomMaOptionType: function(type: 'limited' | 'full'): RandomMAOptionType {
      if (type === 'limited') {
        return RandomMAOptionType.LIMITED;
      } else if (type === 'full') {
        return RandomMAOptionType.UNLIMITED;
      } else {
        return RandomMAOptionType.NONE;
      }
    },
    isPoliticalAgendasExtensionEnabled: function(): Boolean {
      return this.politicalAgendasExtension !== AgendaStyle.STANDARD;
    },
    politicalAgendasExtensionToggle: function() {
      if (this.politicalAgendasExtension === AgendaStyle.STANDARD) {
        this.politicalAgendasExtension = AgendaStyle.RANDOM;
      } else {
        this.politicalAgendasExtension = AgendaStyle.STANDARD;
      }
    },
    getPoliticalAgendasExtensionAgendaStyle: function(type: 'random' | 'chairman'): AgendaStyle {
      if (type === 'random') {
        return AgendaStyle.RANDOM;
      } else if (type === 'chairman') {
        return AgendaStyle.CHAIRMAN;
      } else {
        console.warn('AgendaStyle not found');
        return AgendaStyle.STANDARD;
      }
    },
    isBeginnerToggleEnabled: function(): Boolean {
      return !(this.initialDraft || this.prelude || this.venusNext || this.colonies || this.turmoil);
    },
    selectAll: function() {
      // this.corporateEra = this.$data.allOfficialExpansions;
      this.prelude = this.$data.allOfficialExpansions;
      this.venusNext = this.$data.allOfficialExpansions;
      this.colonies = this.$data.allOfficialExpansions;
      this.turmoil = this.$data.allOfficialExpansions;
      this.promoCardsOption = this.$data.allOfficialExpansions;
      this.solarPhaseOption = this.$data.allOfficialExpansions;
    },
    toggleVenusNext: function() {
      this.solarPhaseOption = this.$data.venusNext;
    },
    deselectPoliticalAgendasWhenDeselectingTurmoil: function() {
      if (this.$data.turmoil === false) {
        this.politicalAgendasExtension = AgendaStyle.STANDARD;
      }
    },
    deselectVenusCompletion: function() {
      if (this.$data.venusNext === false) {
        this.requiresVenusTrackCompletion = false;
      }
    },
    deselectMoonCompletion: function() {
      if (this.$data.moonExpansion === false) {
        this.requiresMoonTrackCompletion = false;
      }
    },
    getBoardColorClass: function(boardName: string): string {
      if (boardName === BoardName.ORIGINAL) {
        return 'create-game-board-hexagon create-game-tharsis';
      } else if (boardName === BoardName.HELLAS) {
        return 'create-game-board-hexagon create-game-hellas';
      } else if (boardName === BoardName.ELYSIUM) {
        return 'create-game-board-hexagon create-game-elysium';
      } else {
        return 'create-game-board-hexagon create-game-random';
      }
    },
    getPlayerCubeColorClass: function(color: string): string {
      return playerColorClass(color.toLowerCase(), 'bg');
    },
    getPlayerContainerColorClass: function(color: string): string {
      return playerColorClass(color.toLowerCase(), 'bg_transparent');
    },
    serializeSettings: function() {
      const component = (this as any) as CreateGameModel;

      let players = component.players.slice(0, component.playersCount);

      if (component.randomFirstPlayer) {
        // Shuffle players array to assign each player a random seat around the table
        players = players.map((a) => ({sort: Math.random(), value: a}))
          .sort((a, b) => a.sort - b.sort)
          .map((a) => a.value);
        component.firstIndex = Math.floor(component.seed * component.playersCount) + 1;
      }

      // Auto assign an available color if there are duplicates
      const uniqueColors = players.map((player) => player.color).filter((v, i, a) => a.indexOf(v) === i);
      if (uniqueColors.length !== players.length) {
        const allColors = [Color.BLUE, Color.RED, Color.YELLOW, Color.GREEN, Color.BLACK, Color.PURPLE, Color.ORANGE, Color.PINK];
        players.forEach((player) => {
          if (allColors.includes(player.color)) {
            allColors.splice(allColors.indexOf(player.color), 1);
          } else {
            player.color = allColors.shift() as Color;
          }
        });
      }

      // Set player name automatically if not entered
      const isSoloMode = component.playersCount === 1;

      component.players.forEach((player) => {
        if (player.name === '') {
          if (isSoloMode) {
            const userName = PreferencesManager.load('userName');
            if ( userName.length > 0) {
              player.name = userName;
            } else {
              player.name = 'You';
            }
          } else {
            const defaultPlayerName = player.color.charAt(0).toUpperCase() + player.color.slice(1);
            player.name = defaultPlayerName;
          }
        }
      });

      players.map((player: any) => {
        player.first = (component.firstIndex === player.index);
        return player;
      });

      const corporateEra = component.corporateEra;
      const prelude = component.prelude;
      const draftVariant = component.draftVariant;
      const initialDraft = component.initialDraft;
      const randomMA = component.randomMA;
      const showOtherPlayersVP = component.showOtherPlayersVP;
      const venusNext = component.venusNext;
      const colonies = component.colonies;
      const turmoil = component.turmoil;
      const solarPhaseOption = this.solarPhaseOption;
      const shuffleMapOption = this.shuffleMapOption;
      const customCorporationsList = component.customCorporationsList;
      const customColoniesList = component.customColoniesList;
      const cardsBlackList = component.cardsBlackList;
      const board = component.board;
      const seed = component.seed;
      const promoCardsOption = component.promoCardsOption;
      const communityCardsOption = component.communityCardsOption;
      const erosCardsOption = component.erosCardsOption;
      const aresExtension = component.aresExtension;
      const politicalAgendasExtension = this.politicalAgendasExtension;
      const moonExpansion = component.moonExpansion;
      const undoOption = component.undoOption;
      const showTimers = component.showTimers;
      const fastModeOption = component.fastModeOption;
      const removeNegativeGlobalEventsOption = this.removeNegativeGlobalEventsOption;
      const heatFor = component.heatFor;
      const breakthrough = component.breakthrough;
      const doubleCorp = component.doubleCorp;
      const includeVenusMA = component.includeVenusMA;
      const startingCorporations = component.startingCorporations;
      const soloTR = component.soloTR;
      const beginnerOption = component.beginnerOption;
      const randomFirstPlayer = component.randomFirstPlayer;
      const requiresVenusTrackCompletion = component.requiresVenusTrackCompletion;
      const requiresMoonTrackCompletion = component.requiresMoonTrackCompletion;
      const clonedGamedId: undefined | string = undefined;

      // Check custom colony count
      if (customColoniesList.length > 0) {
        const playersCount = players.length;
        let neededColoniesCount = playersCount + 2;
        if (playersCount === 1) {
          neededColoniesCount = 4;
        } else if (playersCount === 2) {
          neededColoniesCount = 5;
        }

        if (customColoniesList.length < neededColoniesCount) {
          window.alert(translateTextWithParams('Must select at least ${0} colonies', [neededColoniesCount.toString()]));
          return;
        }
      }

      // Check custom corp count
      if (customCorporationsList.length > 0) {
        const neededCorpsCount = players.length * startingCorporations;

        if (customCorporationsList.length < neededCorpsCount) {
          window.alert(translateTextWithParams('Must select at least ${0} corporations', [neededCorpsCount.toString()]));
          return;
        }
      }
      const dataToSend = JSON.stringify({
        players,
        corporateEra,
        prelude,
        draftVariant,
        showOtherPlayersVP,
        venusNext,
        colonies,
        turmoil,
        customCorporationsList,
        customColoniesList,
        cardsBlackList,
        board,
        seed,
        solarPhaseOption,
        promoCardsOption,
        communityCardsOption,
        erosCardsOption,
        aresExtension: aresExtension,
        politicalAgendasExtension: politicalAgendasExtension,
        moonExpansion: moonExpansion,
        undoOption,
        showTimers,
        fastModeOption,
        removeNegativeGlobalEventsOption,
        heatFor,
        breakthrough,
        doubleCorp,
        includeVenusMA,
        startingCorporations,
        soloTR,
        clonedGamedId,
        initialDraft,
        randomMA,
        shuffleMapOption,
        userId: PreferencesManager.load('userId'),
        beginnerOption,
        randomFirstPlayer,
        requiresVenusTrackCompletion,
        requiresMoonTrackCompletion,
      }, undefined, 4);
      return dataToSend;
    },
    createGame: function() {
      const lastcreated = Number(PreferencesManager.load('lastcreated')) || 0;
      const nowtime = new Date().getTime();
      if (nowtime - lastcreated < 60000 && !this.isvip || nowtime - lastcreated < 5000 ) { // location.href.indexOf("localhost") < 0){
        alert('请不要频繁创建游戏');
        return;
      }
      const root = this.$root as unknown as typeof mainAppSettings.data;
      root.isServerSideRequestInProgress = true;
      PreferencesManager.save('lastcreated', nowtime.toString());

      const dataToSend = this.serializeSettings();

      if (dataToSend === undefined) return;
      const onSucces = (response: any) => {
        root.isServerSideRequestInProgress = false;
        if (response.players.length === 1) {
          window.location.href = '/player?id=' + response.players[0].id;
          return;
        } else {
          window.history.replaceState(response, `${constants.APP_NAME} - Game`, '/game?id=' + response.id);
          (this as any).$root.$data.game = response;
          (this as any).$root.$data.screen = 'game-home';
        }
      };

      fetch('/game', {'method': 'PUT', 'body': dataToSend, 'headers': {'Content-Type': 'application/json'}})
        .then((response) => response.json())
        .then(onSucces)
        .catch((_) => alert('Unexpected server response'));
    },
  },

  template: `
        <div id="create-game">
            <h1><span v-i18n>{{ constants.APP_NAME }}</span> — <span v-i18n>Create New Game</span></h1>
            <div class="create-game-discord-invite" v-if="playersCount===1" >
                <span v-i18n>Looking for people to play with</span>? <u v-i18n>Join us qq group: 859050306</u>.
            </div>

            <div class="create-game-form create-game-panel create-game--block">

                <div class="create-game-options">

                    <div class="create-game-solo-player form-group" v-if="isSoloModePage" v-for="newPlayer in getPlayers()">
                        <div>
                            <input class="form-input form-inline create-game-player-name" placeholder="Your name" v-model="newPlayer.name" />
                        </div>
                        <div class="create-game-colors-wrapper">
                            <label class="form-label form-inline create-game-color-label" v-i18n>Color:</label>
                            <span class="create-game-colors-cont">
                            <label class="form-radio form-inline create-game-color" v-for="color in ['Red', 'Green', 'Yellow', 'Blue', 'Black', 'Purple', 'Orange', 'Pink']">
                                <input type="radio" :value="color.toLowerCase()" :name="'playerColor' + newPlayer.index" v-model="newPlayer.color">
                                <i class="form-icon"></i> <div :class="'board-cube board-cube--'+color.toLowerCase()"></div>
                            </label>
                            </span>
                        </div>
                        <div>
                            <label class="form-switch form-inline">
                                <input type="checkbox" v-model="newPlayer.beginner">
                                <i class="form-icon"></i> <span v-i18n>Beginner?</span>
                            </label>
                        </div>
                    </div>

                    <div class="create-game-page-container">
                        <div class="create-game-page-column" v-if="! isSoloModePage">
                            <h4 v-i18n>№ of Players</h4>
                                <template v-for="pCount in [1,2,3,4,5,6]">
                                    <input type="radio" :value="pCount" name="playersCount" v-model="playersCount" :id="pCount+'-radio'">
                                    <label :for="pCount+'-radio'">
                                        <span v-html="pCount === 1 ? 'Solo' : pCount"></span>
                                    </label>
                                </template>
                        </div>

                        <div class="create-game-page-column">
                            <h4 v-i18n>Expansions</h4>

                            <input type="checkbox" name="allOfficialExpansions" id="allOfficialExpansions-checkbox" v-model="allOfficialExpansions" v-on:change="selectAll()">
                            <label for="allOfficialExpansions-checkbox">
                                <span v-i18n>All</span>
                            </label>


                            <input type="checkbox" name="prelude" id="prelude-checkbox" v-model="prelude">
                            <label for="prelude-checkbox" class="expansion-button">
                                <div class="create-game-expansion-icon expansion-icon-prelude"></div>
                                <span v-i18n>Prelude</span>
                            </label>

                            <input type="checkbox" name="venusNext" id="venusNext-checkbox" v-model="venusNext" v-on:change="toggleVenusNext()">
                            <label for="venusNext-checkbox" class="expansion-button">
                            <div class="create-game-expansion-icon expansion-icon-venus"></div>
                                <span v-i18n>Venus Next</span>
                            </label>

                            <input type="checkbox" name="colonies" id="colonies-checkbox" v-model="colonies">
                            <label for="colonies-checkbox" class="expansion-button">
                            <div class="create-game-expansion-icon expansion-icon-colony"></div>
                                <span v-i18n>Colonies</span>
                            </label>

                            <input type="checkbox" name="turmoil" id="turmoil-checkbox" v-model="turmoil" v-on:change="deselectPoliticalAgendasWhenDeselectingTurmoil()">
                            <label for="turmoil-checkbox" class="expansion-button">
                                <div class="create-game-expansion-icon expansion-icon-turmoil"></div>
                                <span v-i18n>Turmoil</span>
                            </label>

                            <input type="checkbox" name="promo" id="promo-checkbox" v-model="promoCardsOption">
                            <label for="promo-checkbox" class="expansion-button">
                                <div class="create-game-expansion-icon expansion-icon-promo"></div>
                                <span v-i18n>Promos</span>&nbsp;
                            </label>

                            <div class="create-game-subsection-label" v-i18n>Fan-made</div>

                            <input type="checkbox" name="heatFor" id="heatFor-checkbox" v-model="heatFor"  v-if="isvip">
                            <label for="heatFor-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>7 Heat Into Temperature</span> 
                            </label>
                
                            <input type="checkbox" name="breakthrough" id="breakthrough-checkbox" v-model="breakthrough"  v-if="isvip">
                            <label for="breakthrough-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>BreakThrough</span>&nbsp;<a href="https://docs.qq.com/pdf/DS29QWFZLeUhWWlRR" class="tooltip" target="_blank">&#9432;</a>
                            </label>

                            <input type="checkbox" name="doubleCorp" id="doubleCorp-checkbox" v-model="doubleCorp"  v-if="isvip">
                            <label for="doubleCorp-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>Double Corp</span>&nbsp;
                            </label>
                            
                            <input type="checkbox" name="eros" id="erosCards-checkbox" v-model="erosCardsOption"  v-if="isvip">
                            <label for="erosCards-checkbox" class="expansion-button" :class="{forbidden:!isvip}">
                                <div class="create-game-expansion-icon expansion-icon-eros"></div>
                                <span v-i18n>Eros</span>&nbsp;<a href="https://docs.qq.com/doc/DS25WcXdnbHhib3Fy" class="tooltip" target="_blank">&#9432;</a>
                            </label>
                            
                            <input type="checkbox" name="ares" id="ares-checkbox" v-model="aresExtension"  v-if="isvip">
                            <label for="ares-checkbox" class="expansion-button" :class="{forbidden:!isvip}">
                                <div class="create-game-expansion-icon expansion-icon-ares"></div>
                                <span v-i18n>Ares</span>&nbsp;<a href="https://docs.qq.com/pdf/DQVZqWU5BZURyUkZp" class="tooltip" target="_blank">&#9432;</a>
                            </label>
                
                            <input type="checkbox" name="community" id="communityCards-checkbox" v-model="communityCardsOption"  v-if="isvip">
                            <label for="communityCards-checkbox" class="expansion-button" :class="{forbidden:!isvip}">
                                <div class="create-game-expansion-icon expansion-icon-community"></div>
                                <span v-i18n>Community</span>&nbsp;<a href="https://docs.qq.com/pdf/DQUFZaHdMWHl2V21M" class="tooltip" target="_blank">&#9432;</a>
                            </label>

                            <input type="checkbox" name="themoon" id="themoon-checkbox" v-model="moonExpansion"  v-if="isvip">
                            <label for="themoon-checkbox" class="expansion-button" :class="{forbidden:!isvip}">
                                <div class="create-game-expansion-icon expansion-icon-themoon"></div>
                                <span v-i18n>The Moon</span>&nbsp;<a href="https://github.com/bafolts/terraforming-mars/wiki/The-Moon" class="tooltip" target="_blank">&#9432;</a>
                            </label>

                            <template v-if="turmoil">
                                <input type="checkbox" name="politicalAgendas" id="politicalAgendas-checkbox" v-on:change="politicalAgendasExtensionToggle()"  v-if="isvip">
                                <label for="politicalAgendas-checkbox" class="expansion-button"  :class="{forbidden:!isvip}">
                                    <div class="create-game-expansion-icon expansion-icon-agendas"></div>
                                    <span v-i18n>Agendas</span>&nbsp;<a href="https://docs.qq.com/doc/DQUh4RlJFQUxwb09v?pub=1&dver=2.1.0" class="tooltip" target="_blank">&#9432;</a>
                                </label>

                                <div class="create-game-page-column-row" v-if="isPoliticalAgendasExtensionEnabled()">
                                    <div>
                                    <input type="radio" name="agendaStyle" v-model="politicalAgendasExtension" :value="getPoliticalAgendasExtensionAgendaStyle('random')" id="randomAgendaStyle-radio">
                                    <label class="label-agendaStyle agendaStyle-random" for="randomAgendaStyle-radio">
                                        <span class="agendas-text" v-i18n>{{ getPoliticalAgendasExtensionAgendaStyle('random') }}</span>
                                    </label>
                                    </div>

                                    <div>
                                    <input type="radio" name="agendaStyle" v-model="politicalAgendasExtension" :value="getPoliticalAgendasExtensionAgendaStyle('chairman')" id="chairmanAgendaStyle-radio">
                                    <label class="label-agendaStyle agendaStyle-chairman" for="chairmanAgendaStyle-radio">
                                        <span class="agendas-text" v-i18n>{{ getPoliticalAgendasExtensionAgendaStyle('chairman') }}</span>
                                    </label>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div class="create-game-page-column">
                            <h4 v-i18n>Board</h4>

                            <template v-for="boardName in boards">
                                <input type="radio" :value="boardName" name="board" v-model="board" :id="boardName+'-checkbox'">
                                <label :for="boardName+'-checkbox'" class="expansion-button">
                                    <span :class="getBoardColorClass(boardName)">&#x2B22;</span><span class="capitalized" v-i18n>{{ boardName }}</span>
                                </label>
                            </template>
                        </div>

                        <div class="create-game-page-column">
                            <h4 v-i18n>Options</h4>

                            <label for="startingCorpNum-checkbox">
                            <input type="number" class="create-game-corporations-count" value="2" min="1" :max="6" v-model="startingCorporations" id="startingCorpNum-checkbox">
                                <span v-i18n>Starting Corporations</span>
                            </label>

                            <input type="checkbox" v-model="solarPhaseOption" id="WGT-checkbox">
                            <label for="WGT-checkbox">
                                <span v-i18n>World Government Terraforming</span>&nbsp;
                            </label>

                            <template v-if="playersCount === 1">
                            <input type="checkbox" v-model="soloTR" id="soloTR-checkbox">
                            <label for="soloTR-checkbox">
                                <span v-i18n>63 TR solo mode</span>&nbsp;
                            </label>
                            </template>

                            <input type="checkbox" v-model="undoOption" id="undo-checkbox">
                            <label for="undo-checkbox">
                                <span v-i18n>Allow undo</span>&nbsp;
                            </label>

                            <input type="checkbox" v-model="showTimers" id="timer-checkbox">
                            <label for="timer-checkbox">
                                <span v-i18n>Show timers</span>
                            </label>

                            <input type="checkbox" v-model="shuffleMapOption" id="shuffleMap-checkbox"  v-if="isvip">
                            <label for="shuffleMap-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>Randomize board tiles</span>&nbsp;
                            </label>

                            <div v-if="seededGame">
                                <select name="clonedGamedId" v-model="clonedGameData">
                                    <option v-for="game in cloneGameData" :value="game" :key="game.gameId">
                                        {{ game.gameId }} - {{ game.playerCount }} player(s)
                                    </option>
                                </select>
                            </div>


                            <div class="create-game-subsection-label" v-i18n>Filter</div>

                            <input type="checkbox" v-model="showCorporationList" id="customCorps-checkbox">
                            <label for="customCorps-checkbox">
                                <span v-i18n>Custom Corporation list</span>
                            </label>

                            <input type="checkbox" v-model="showCardsBlackList" id="blackList-checkbox"  v-if="isvip">
                            <label for="blackList-checkbox" :class="{forbidden:!isvip}">
                                <span v-i18n>Exclude some cards</span>
                            </label>

                            <template v-if="colonies">
                                <input type="checkbox" v-model="showColoniesList" id="customColonies-checkbox" v-if="isvip">
                                <label for="customColonies-checkbox" :class="{forbidden:!isvip}">
                                    <span v-i18n>Custom Colonies list</span>
                                </label>
                            </template>

                            <template v-if="turmoil">
                                <input type="checkbox" v-model="removeNegativeGlobalEventsOption" id="removeNegativeEvent-checkbox" v-if="isvip">
                                <label for="removeNegativeEvent-checkbox" :class="{forbidden:!isvip}">
                                    <span v-i18n>Remove negative Global Events</span>&nbsp;
                                </label>
                            </template>

                        </div>


                        <div class="create-game-page-column" v-if="playersCount > 1">
                            <h4 v-i18n>Multiplayer Options</h4>

                            <div class="create-game-page-column-row">
                                <div>
                                <input type="checkbox" name="draftVariant" v-model="draftVariant" id="draft-checkbox">
                                <label for="draft-checkbox">
                                    <span v-i18n>Draft variant</span>
                                </label>
                                </div>

                                <div>
                                <input type="checkbox" name="initialDraft" v-model="initialDraft" id="initialDraft-checkbox">
                                <label for="initialDraft-checkbox">
                                    <span v-i18n>Initial Draft variant</span>&nbsp;
                                </label>
                                </div>
                            </div>

                            <input type="checkbox" v-model="randomFirstPlayer" id="randomFirstPlayer-checkbox">
                            <label for="randomFirstPlayer-checkbox">
                                <span v-i18n>Random first player</span>
                            </label>

                            <input type="checkbox" name="randomMAToggle" v-model="randomMACheckbox" id="randomMA-checkbox" v-on:change="randomMAToggle()"  v-if="isvip">
                            <label for="randomMA-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>Random Milestones/Awards</span>&nbsp;
                            </label>

                            <div class="create-game-page-column-row" v-if="false">
                                <div>
                                <input type="radio" name="randomMAOption" v-model="randomMA" :value="getRandomMaOptionType('limited')" id="limitedRandomMA-radio">
                                <label class="label-randomMAOption" for="limitedRandomMA-radio">
                                    <span v-i18n>{{ getRandomMaOptionType('limited') }}</span>
                                </label>
                                </div>

                                <div>
                                <input type="radio" name="randomMAOption" v-model="randomMA" :value="getRandomMaOptionType('full')" id="unlimitedRandomMA-radio">
                                <label class="label-randomMAOption" for="unlimitedRandomMA-radio">
                                    <span v-i18n>{{ getRandomMaOptionType('full') }}</span>
                                </label>
                                </div>
                            </div>

                            <input type="checkbox" name="showOtherPlayersVP" v-model="showOtherPlayersVP" id="realTimeVP-checkbox">
                            <label for="realTimeVP-checkbox">
                                <span v-i18n>Show real-time VP</span>&nbsp;
                            </label>

                            <input type="checkbox" v-model="fastModeOption" id="fastMode-checkbox">
                            <label for="fastMode-checkbox">
                                <span v-i18n>Fast mode</span>&nbsp;
                            </label>

                            <!-- 
                            <input type="checkbox" v-model="beginnerOption" id="beginnerOption-checkbox">
                            <label for="beginnerOption-checkbox">
                                <span v-i18n>Beginner Options</span>
                            </label>
                            -->
                        </div>

                        <div class="create-game-players-cont" v-if="playersCount > 1">
                            <div class="container">
                                <div class="columns">
                                    <template v-for="newPlayer in getPlayers()">
                                    <div :class="'form-group col6 create-game-player '+getPlayerContainerColorClass(newPlayer.color)">
                                        <div>
                                            <input class="form-input form-inline create-game-player-name" :placeholder="getPlayerNamePlaceholder(newPlayer)" v-model="newPlayer.name" />
                                        </div>
                                        <div class="create-game-page-color-row">
                                            <template v-for="color in ['Red', 'Green', 'Yellow', 'Blue', 'Black', 'Purple', 'Orange', 'Pink']">
                                                <input type="radio" :value="color.toLowerCase()" :name="'playerColor' + newPlayer.index" v-model="newPlayer.color" :id="'radioBox' + color + newPlayer.index">
                                                <label :for="'radioBox' + color + newPlayer.index">
                                                    <div :class="'create-game-colorbox '+getPlayerCubeColorClass(color)"></div>
                                                </label>
                                            </template>
                                        </div>
                                        <div>
                                            <template v-if="beginnerOption">
                                                <label v-if="isBeginnerToggleEnabled()" class="form-switch form-inline create-game-beginner-option-label">
                                                    <input type="checkbox" v-model="newPlayer.beginner">
                                                    <i class="form-icon"></i> <span v-i18n>Beginner?</span>&nbsp;
                                                </label>

                                                <label class="form-label">
                                                    <input type="number" class="form-input form-inline player-handicap" value="0" min="0" :max="10" v-model.number="newPlayer.handicap" />
                                                    <i class="form-icon"></i><span v-i18n>TR Boost</span>&nbsp;
                                                </label>
                                            </template>

                                            <label class="form-radio form-inline" v-if="!randomFirstPlayer">
                                                <input type="radio" name="firstIndex" :value="newPlayer.index" v-model="firstIndex">
                                                <i class="form-icon"></i> <span v-i18n>Goes First?</span>
                                            </label>
                                        </div>
                                    </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div class="create-game-action">
                            <Button title="Create game" size="big" :onClick="createGame"/>
                            <span  v-if="isvip">
                              <label>
                                  <div class="btn btn-primary btn-action btn-lg"><i class="icon icon-upload"></i></div>
                                  <input style="display: none" type="file" id="settings-file" ref="file" v-on:change="handleSettingsUpload()"/>
                              </label>

                              <label>
                                  <div v-on:click="downloadCurrentSettings()" class="btn btn-primary btn-action btn-lg"><i class="icon icon-download"></i></div>
                              </label>
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            <div class="create-game--block" v-if="showCorporationList">
              <corporations-filter
                  ref="corporationsFilter"
                  v-on:corporation-list-changed="updateCustomCorporationsList"
                  v-bind:corporateEra="corporateEra"
                  v-bind:prelude="prelude"
                  v-bind:venusNext="venusNext"
                  v-bind:colonies="colonies"
                  v-bind:turmoil="turmoil"
                  v-bind:promoCardsOption="promoCardsOption"
                v-bind:erosCardsOption="erosCardsOption"
                  v-bind:communityCardsOption="communityCardsOption"
                  v-bind:moonExpansion="moonExpansion"
              ></corporations-filter>
            </div>

            <div class="create-game--block" v-if="showColoniesList">
              <colonies-filter
                  ref="coloniesFilter"
                  v-on:colonies-list-changed="updateCustomColoniesList"
                  v-bind:venusNext="venusNext"
                  v-bind:turmoil="turmoil"
                  v-bind:communityCardsOption="communityCardsOption"
              ></colonies-filter>
            </div>

            <div class="create-game--block" v-if="showCardsBlackList">
              <cards-filter
                  ref="cardsFilter"
                  v-on:cards-list-changed="updateCardsBlackList"
              ></cards-filter>
            
            </div>
            <qrcode/>
        </div>
    `,
});
