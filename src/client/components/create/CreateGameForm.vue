<template>
      <div id="create-game">
            <h1><span v-i18n>{{ constants.APP_NAME }}</span> — <span v-i18n>Create New Game</span></h1>
            <div class="create-game-discord-invite" v-if="!isvip" >
                <span v-i18n>Want to play more DIY expansion? Join us qq group: 859050306</span> .
            </div>
            <div class="create-game-discord-invite" v-else-if="playersCount===1" >
                <span v-i18n>Looking for people to play with? Join us qq group: 859050306</span> .
            </div>
            <div class="create-game-discord-invite" >
                <span v-i18n> bug: 反重力先行试验持续生效 - 显示bug，应该已经修复，不确定 </span><br>
                <span v-i18n> bug: 火星击剑允许撤回 - 已修复 </span><br>
            </div>
            <div class="create-game-form create-game-panel create-game--block">

                <div class="create-game-options">

                    <div class="create-game-page-container">
                        <div class="create-game-page-column">
                            <h4 v-i18n>№ of Players</h4>
                                <template v-for="pCount in [1,2,3,4,5,6]">
                                    <input type="radio" :value="pCount" name="playersCount" v-model="playersCount" :id="pCount+'-radio'" :key="'__input'+pCount">
                                    <label :for="pCount+'-radio'" :key="'_label'+pCount">
                                    {{pCount === 1 ? 'Solo' : pCount}}
                                    </label>
                                </template>
                        </div>

                        <div class="create-game-page-column">
                            <h4 v-i18n>Expansions</h4>

                            <input type="checkbox" name="allOfficialExpansions" id="allOfficialExpansions-checkbox" v-model="allOfficialExpansions">
                            <label for="allOfficialExpansions-checkbox">
                                <span v-i18n>All</span>
                            </label>


                            <input type="checkbox" name="prelude" id="prelude-checkbox" v-model="prelude">
                            <label for="prelude-checkbox" class="expansion-button">
                                <div class="create-game-expansion-icon expansion-icon-prelude"></div>
                                <span v-i18n>Prelude</span>
                            </label>

                            <input type="checkbox" name="venusNext" id="venusNext-checkbox" v-model="venusNext">
                            <label for="venusNext-checkbox" class="expansion-button">
                            <div class="create-game-expansion-icon expansion-icon-venus"></div>
                                <span v-i18n>Venus Next</span>
                            </label>

                            <input type="checkbox" name="colonies" id="colonies-checkbox" v-model="colonies">
                            <label for="colonies-checkbox" class="expansion-button">
                            <div class="create-game-expansion-icon expansion-icon-colony"></div>
                                <span v-i18n>Colonies</span>
                            </label>

                            <input type="checkbox" name="turmoil" id="turmoil-checkbox" v-model="turmoil">
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

                            <input type="checkbox" name="pathfinders" id="pathfinders-checkbox" v-model="pathfindersExpansion" v-if="isvip">
                            <label for="pathfinders-checkbox" class="expansion-button" :class="{forbidden:!isvip}">
                                <div class="create-game-expansion-icon expansion-icon-pathfinders"></div>
                                <span v-i18n>Pathfinders</span>&nbsp;<a href="https://github.com/bafolts/terraforming-mars/wiki/Pathfinders" class="tooltip" target="_blank">&#9432;</a>
                            </label>

                            <!--
                            <template v-if="venusNext">
                                <input type="checkbox" v-model="altVenusBoard" id="altVenusBoard-checkbox">
                                <label for="altVenusBoard-checkbox">
                                    <span v-i18n>Alternate Venus Board</span> &nbsp;<a href="https://github.com/bafolts/terraforming-mars/wiki/Variants#alt-venus" class="tooltip" target="_blank">&#9432;</a>
                                </label>
                            </template>
                            -->
                        </div>

                        <div class="create-game-page-column">
                            <h4 v-i18n>Board</h4>

                            <template v-for="boardName in boards">
                                <div v-if="boardName==='arabia terra'" class="create-game-subsection-label" :key="boardName + '-lab'" v-i18n>Fan-made</div>
                                <input type="radio" :value="boardName" name="board" v-model="board" :id="boardName+'-checkbox'" :key="boardName">
                                <label :for="boardName+'-checkbox'" class="expansion-button"  :key="'-'+boardName">
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

                            <!-- <input type="checkbox" v-model="beginnerOption" id="beginnerOption-checkbox">
                            <label for="beginnerOption-checkbox">
                                <span v-i18n>Beginner Options</span>
                            </label> -->

                            <input type="checkbox" v-model="undoOption" id="undo-checkbox">
                            <label for="undo-checkbox">
                                <span v-i18n>Allow undo</span>&nbsp;
                            </label>

                            <input type="checkbox" v-model="showTimers" id="timer-checkbox">
                            <label for="timer-checkbox">
                                <span v-i18n>Show timers</span>
                            </label>

                            <input type="checkbox" v-model="escapeVelocityMode" id="escapevelocity-checkbox">
                            <label for="escapevelocity-checkbox">
                                <div class="create-game-expansion-icon expansion-icon-escape-velocity"></div>
                                <span v-i18n>Escape Velocity</span>&nbsp;<a href="https://github.com/terraforming-mars/terraforming-mars/wiki/Escape-Velocity" class="tooltip" target="_blank">&#9432;</a>
                            </label>

                            <label for="escapeThreshold-checkbox" v-show="escapeVelocityMode">
                              <span v-i18n>After&nbsp;</span>
                              <input type="number" class="create-game-corporations-count" value="30" step="5" min="0" :max="180" v-model="escapeVelocityThreshold" id="escapeThreshold-checkbox">
                              <span v-i18n>&nbsp;min</span>
                            </label>

                            <label for="escapePeriod-checkbox" v-show="escapeVelocityMode">
                              <span v-i18n>Reduce&nbsp;</span>
                              <input type="number" class="create-game-corporations-count" value="1" min="1" :max="10" v-model="escapeVelocityPenalty" id="escapePeriod-checkbox">
                              <span v-i18n>&nbsp;VP every&nbsp;</span>
                              <input type="number" class="create-game-corporations-count" value="2" min="1" :max="10" v-model="escapeVelocityPeriod" id="escapePeriod-checkbox">
                              <span v-i18n>&nbsp;min</span>
                            </label>

                            <input type="checkbox" v-model="shuffleMapOption" id="shuffleMap-checkbox"  v-if="isvip">
                            <label for="shuffleMap-checkbox"  :class="{forbidden:!isvip}">
                                <span v-i18n>Randomize board tiles</span>&nbsp;
                            </label>

                            <div v-if="seededGame">
                                <input type="text" name="clonedGamedId" v-model="clonedGameId" />
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

                            <div v-if="initialDraft && doubleCorp" >
                              <input type="checkbox" name="initialCorpDraftVariant" v-model="initialCorpDraftVariant" id="initialCorpDraftVariant-checkbox">
                              <label for="initialCorpDraftVariant-checkbox">
                                <span v-i18n>Initial Draft Double Corp</span>
                              </label>
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
                        </div>

                        <div class="create-game-players-cont" v-if="playersCount > 1">
                            <div class="container">
                                <div class="columns">
                                    <template v-for="newPlayer in getPlayers()">
                                    <div :class="'form-group col6 create-game-player '+getPlayerContainerColorClass(newPlayer.color)" :key="newPlayer.index">
                                        <div>
                                            <input class="form-input form-inline create-game-player-name" :placeholder="getPlayerNamePlaceholder(newPlayer)" v-model="newPlayer.name" />
                                        </div>
                                        <div class="create-game-page-color-row">
                                            <template v-for="color in ['Red', 'Green', 'Yellow', 'Blue', 'Black', 'Purple', 'Orange', 'Pink']">
                                                <input type="radio" :value="color.toLowerCase()" :name="'playerColor' + newPlayer.index" v-model="newPlayer.color" :id="'radioBox' + color + newPlayer.index"  :key="color">
                                                <label :for="'radioBox' + color + newPlayer.index" :key="'_'+color">
                                                    <div :class="'create-game-colorbox '+getPlayerCubeColorClass(color)"></div>
                                                </label>
                                            </template>
                                        </div>
                                        <div>
                                              <!-- <template v-if="beginnerOption">
                                                <label v-if="isBeginnerToggleEnabled()" class="form-switch form-inline create-game-beginner-option-label">
                                                    <input type="checkbox" v-model="newPlayer.beginner">
                                                    <i class="form-icon"></i> <span v-i18n>Beginner?</span>&nbsp;
                                                </label>

                                                <label class="form-label">
                                                    <input type="number" class="form-input form-inline player-handicap" value="0" min="0" :max="10" v-model.number="newPlayer.handicap" />
                                                    <i class="form-icon"></i><span v-i18n>TR Boost</span>&nbsp;
                                                </label>
                                               </template> -->

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
                            <Button title="Create game" size="big" @click="createGame"/>
                            <span  v-if="isvip">
                              <label>
                                  <div class="btn btn-primary btn-action btn-lg"><i class="icon icon-upload"></i></div>
                                <input style="display: none" type="file" accept=".json" id="settings-file" ref="file" v-on:change="handleSettingsUpload()"/>
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
              <CorporationsFilter
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
                  v-bind:pathfindersExpansion="pathfindersExpansion"
              ></CorporationsFilter>
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
            <QrCode/>
            <preferences-icon></preferences-icon>
        </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';
import {Color} from '@/common/Color';
import {BoardName} from '@/common/boards/BoardName';
import {RandomBoardOption} from '@/common/boards/RandomBoardOption';
import {CardName} from '@/common/cards/CardName';
import CorporationsFilter from '@/client/components/create/CorporationsFilter.vue';
import {translateText, translateTextWithParams} from '@/client/directives/i18n';
import ColoniesFilter from '@/client/components/create/ColoniesFilter.vue';
import {ColonyName} from '@/common/colonies/ColonyName';
import CardsFilter from '@/client/components/create/CardsFilter.vue';
import Button from '@/client/components/common/Button.vue';
import {playerColorClass} from '@/common/utils/utils';
import {PreferencesManager} from '../../utils/PreferencesManager';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';
import {AgendaStyle} from '@/common/turmoil/Types';
import PreferencesIcon from '@/client/components/PreferencesIcon.vue';
import {getCard} from '@/client/cards/ClientCardManifest';
import {GameModule} from '@/common/cards/GameModule';

import * as constants from '@/common/constants';
import {QrCode} from '../QrCode';
import {mainAppSettings} from '../App';
import {BoardNameType, NewGameConfig, NewPlayerModel} from '@/common/game/NewGameConfig';

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
    initialCorpDraftVariant: boolean;
    randomMA: RandomMAOptionType;
    randomFirstPlayer: boolean;
    showOtherPlayersVP: boolean;
    // beginnerOption: boolean;
    venusNext: boolean;
    colonies: boolean;
    turmoil: boolean;
    customCorporationsList: Array<CardName>;
    customColoniesList: Array<ColonyName>;
    cardsBlackList: Array<CardName>;
    showCorporationList: boolean;
    showColoniesList: boolean;
    showCardsBlackList: boolean;
    board: BoardNameType;
    boards: Array<BoardNameType>;
    seed: number;
    solarPhaseOption: boolean;
    shuffleMapOption: boolean;
    promoCardsOption: boolean;
    communityCardsOption: boolean;
    erosCardsOption: boolean;
    aresExtension: boolean;
    politicalAgendasExtension: AgendaStyle;
    moonExpansion: boolean;
    pathfindersExpansion: boolean;
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
    clonedGameId: string | undefined;
    requiresVenusTrackCompletion: boolean;
    requiresMoonTrackCompletion: boolean;
    moonStandardProjectVariant: boolean;
    altVenusBoard: boolean;
    seededGame: boolean;
    randomMACheckbox: boolean;// 上传设置之后选中随机里程碑的按钮
    escapeVelocityMode: boolean;
    escapeVelocityThreshold: number;
    escapeVelocityPeriod: number;
    escapeVelocityPenalty: number;
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
  'pathfindersExpansion': false,

  'shuffleMapOption': false,
  'removeNegativeGlobalEventsOption': false,
  'randomMA': RandomMAOptionType.NONE,

  // 这四参数跟后端 routes/game不一样
  'cardsBlackList': [],
  'customColoniesList': [],
  'showCardsBlackList': false,
  'showColoniesList': false,
};

type Refs = {
  coloniesFilter: InstanceType<typeof ColoniesFilter>,
  corporationsFilter: InstanceType<typeof CorporationsFilter>,
  cardsFilter: InstanceType<typeof CardsFilter>,
  file: HTMLInputElement,
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'CreateGameForm',
  data(): CreateGameModel {
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
      initialCorpDraftVariant: true,
      randomMA: RandomMAOptionType.NONE,
      randomFirstPlayer: true,
      showOtherPlayersVP: true,
      // beginnerOption: false,
      venusNext: true,
      colonies: true,
      showColoniesList: false,
      showCorporationList: false,
      showCardsBlackList: false,
      turmoil: true,
      customCorporationsList: [],
      customColoniesList: [],
      cardsBlackList: [],
      board: RandomBoardOption.OFFICIAL,
      boards: [
        BoardName.ORIGINAL,
        BoardName.HELLAS,
        BoardName.ELYSIUM,
        RandomBoardOption.OFFICIAL,
        BoardName.ARABIA_TERRA,
        BoardName.AMAZONIS,
        BoardName.TERRA_CIMMERIA,
        BoardName.VASTITAS_BOREALIS,
        RandomBoardOption.ALL,
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
      pathfindersExpansion: false,
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
      clonedGameId: undefined,
      allOfficialExpansions: true,
      requiresVenusTrackCompletion: false,
      requiresMoonTrackCompletion: false,
      randomMACheckbox: false,
      moonStandardProjectVariant: false,
      altVenusBoard: false,
      escapeVelocityMode: false,
      escapeVelocityThreshold: constants.DEFAULT_ESCAPE_VELOCITY_THRESHOLD,
      escapeVelocityPeriod: constants.DEFAULT_ESCAPE_VELOCITY_PERIOD,
      escapeVelocityPenalty: constants.DEFAULT_ESCAPE_VELOCITY_PENALTY,
    };
  },
  components: {
    Button,
    CardsFilter,
    ColoniesFilter,
    CorporationsFilter,
    QrCode,
    PreferencesIcon,
  },
  mounted() {
    const root = this.$root as any;
    this.isvip = root.isvip;
  },
  watch: {
    allOfficialExpansions(value: boolean) {
      // this.corporateEra = value;
      this.prelude = value;
      this.venusNext = value;
      this.colonies = value;
      this.turmoil = value;
      this.promoCardsOption = value;
      this.solarPhaseOption = value;
    },
    venusNext(value: boolean) {
      this.solarPhaseOption = value;
    },
    turmoil(value: boolean) {
      if (value === false) {
        this.politicalAgendasExtension = AgendaStyle.STANDARD;
      }
    },
    playersCount(value: number) {
      if (value === 1) {
        this.corporateEra = true;
      }
    },
  },
  methods: {
    async downloadCurrentSettings() {
      const serializedData = await this.serializeSettings();

      if (serializedData) {
        const a = document.createElement('a');
        const blob = new Blob([serializedData], {'type': 'application/json'});
        a.href = window.URL.createObjectURL(blob);
        a.download = 'tm_settings.json';
        a.click();
      }
    },
    handleSettingsUpload() {
      const refs = this.$refs;
      const file = refs.file.files !== null ? refs.file.files[0] : undefined;
      (refs.file as any).value ='';
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

          // Capture the solar phase option since several of the other results will change
          // it via the watch mechanism.
          const capturedSolarPhaseOption = results.solarPhaseOption;

          for (const k in results) {
            if (['customCorporationsList', 'customColoniesList', 'cardsBlackList', 'players', 'solarPhaseOption'].includes(k)) continue;
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
                refs.coloniesFilter.updateColoniesByNames(results['customColoniesList']);
              }

              if (component.showCorporationList) {
                refs.corporationsFilter.selectedCorporations = results['customCorporationsList'];
              }

              if (component.showCardsBlackList) {
                refs.cardsFilter.selectedCardNames = results['cardsBlackList'];
              }
            }
            if ( ! component.seededGame) {
              component.seed = Math.random();
            }

            // set to alter after any watched properties
            component.solarPhaseOption = Boolean(capturedSolarPhaseOption);
          });
        }
      }, false);
      if (file) {
        if (/\.json$/i.test(file.name)) {
          reader.readAsText(file);
        }
      }
    },
    getPlayerNamePlaceholder(player: NewPlayerModel): string {
      return translateTextWithParams(
        'Player ${0} name',
        [String(player.index)],
      );
    },
    updateCustomCorporationsList(customCorporationsList: Array<CardName>) {
      this.customCorporationsList = customCorporationsList;
    },
    updateCardsBlackList(cardsBlackList: Array<CardName>) {
      this.cardsBlackList = cardsBlackList;
    },
    updateCustomColoniesList(customColoniesList: Array<ColonyName>) {
      this.customColoniesList = customColoniesList;
    },
    getPlayers(): Array<NewPlayerModel> {
      return this.players.slice(0, this.playersCount);
    },
    isRandomMAEnabled(): Boolean {
      return this.randomMA !== RandomMAOptionType.NONE;
    },
    randomMAToggle() {
      if (this.randomMA === RandomMAOptionType.NONE) {
        this.randomMA = RandomMAOptionType.LIMITED;
      } else {
        this.randomMA = RandomMAOptionType.NONE;
      }
    },
    getRandomMaOptionType(type: 'limited' | 'full'): RandomMAOptionType {
      if (type === 'limited') {
        return RandomMAOptionType.LIMITED;
      } else if (type === 'full') {
        return RandomMAOptionType.UNLIMITED;
      } else {
        return RandomMAOptionType.NONE;
      }
    },
    isPoliticalAgendasExtensionEnabled(): Boolean {
      return this.politicalAgendasExtension !== AgendaStyle.STANDARD;
    },
    politicalAgendasExtensionToggle() {
      if (this.politicalAgendasExtension === AgendaStyle.STANDARD) {
        this.politicalAgendasExtension = AgendaStyle.RANDOM;
      } else {
        this.politicalAgendasExtension = AgendaStyle.STANDARD;
      }
    },
    getPoliticalAgendasExtensionAgendaStyle(type: 'random' | 'chairman'): AgendaStyle {
      if (type === 'random') {
        return AgendaStyle.RANDOM;
      } else if (type === 'chairman') {
        return AgendaStyle.CHAIRMAN;
      } else {
        console.warn('AgendaStyle not found');
        return AgendaStyle.STANDARD;
      }
    },
    isBeginnerToggleEnabled(): Boolean {
      return !(this.initialDraft || this.prelude || this.venusNext || this.colonies || this.turmoil);
    },
    deselectVenusCompletion() {
      if (this.$data.venusNext === false) {
        this.requiresVenusTrackCompletion = false;
      }
    },
    deselectMoonCompletion() {
      if (this.$data.moonExpansion === false) {
        this.requiresMoonTrackCompletion = false;
        this.moonStandardProjectVariant = false;
      }
    },
    getBoardColorClass(boardName: string): string {
      if (boardName === BoardName.ORIGINAL) {
        return 'create-game-board-hexagon create-game-tharsis';
      } else if (boardName === BoardName.HELLAS) {
        return 'create-game-board-hexagon create-game-hellas';
      } else if (boardName === BoardName.ELYSIUM) {
        return 'create-game-board-hexagon create-game-elysium';
      } else if (boardName === BoardName.AMAZONIS) {
        return 'create-game-board-hexagon create-game-amazonis';
      } else if (boardName === BoardName.ARABIA_TERRA) {
        return 'create-game-board-hexagon create-game-arabia-terra';
      } else if (boardName === BoardName.TERRA_CIMMERIA) {
        return 'create-game-board-hexagon create-game-terra-cimmeria';
      } else if (boardName === BoardName.VASTITAS_BOREALIS) {
        return 'create-game-board-hexagon create-game-vastitas-borealis';
      } else {
        return 'create-game-board-hexagon create-game-random';
      }
    },
    getPlayerCubeColorClass(color: string): string {
      return playerColorClass(color.toLowerCase(), 'bg');
    },
    getPlayerContainerColorClass(color: string): string {
      return playerColorClass(color.toLowerCase(), 'bg_transparent');
    },
    isEnabled(module: GameModule): boolean {
      switch (module) {
      case 'corpera': return this.$data.corpera;
      case 'promo': return this.$data.promoCardsOption;
      case 'venus': return this.$data.venusNext;
      case 'colonies': return this.$data.colonies;
      case 'prelude': return this.$data.prelude;
      case 'turmoil': return this.$data.turmoil;
      case 'community': return this.$data.communityCardsOption;
      case 'ares': return this.$data.aresExtension;
      case 'moon': return this.$data.moonExpansion;
      case 'pathfinders': return this.$data.pathfindersExpansion;
      default: return true;
      }
    },
    async serializeSettings() {
      // TODO(kberg): remove 'component'
      const component: CreateGameModel = this;

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
              player.name = this.$t('You');
            }
          } else {
            const defaultPlayerName = this.$t(player.color.charAt(0).toUpperCase() + player.color.slice(1));
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
      const initialCorpDraftVariant = component.initialCorpDraftVariant;
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
      const pathfindersExpansion = component.pathfindersExpansion;
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
      // const beginnerOption = component.beginnerOption;
      const randomFirstPlayer = component.randomFirstPlayer;
      const requiresVenusTrackCompletion = component.requiresVenusTrackCompletion;
      const escapeVelocityMode = component.escapeVelocityMode;
      const escapeVelocityThreshold = component.escapeVelocityMode ? component.escapeVelocityThreshold : undefined;
      const escapeVelocityPeriod = component.escapeVelocityMode ? component.escapeVelocityPeriod : undefined;
      const escapeVelocityPenalty = component.escapeVelocityMode ? component.escapeVelocityPenalty : undefined;
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

      if (players.length === 1 && corporateEra === false) {
        const confirm = window.confirm(translateText(
          'We do not recommend playing a solo game without the Corporate Era. Press OK if you want to play without it.'));
        if (confirm === false) return;
      }

      // Check custom corp count
      if (component.showCorporationList && customCorporationsList.length > 0) {
        const neededCorpsCount = players.length * startingCorporations;
        if (customCorporationsList.length < neededCorpsCount) {
          window.alert(translateTextWithParams('Must select at least ${0} corporations', [neededCorpsCount.toString()]));
          return;
        }
        let valid = true;
        for (const corp of customCorporationsList) {
          const card = getCard(corp);
          for (const module of card?.compatibility ?? []) {
            if (!this.isEnabled(module)) {
              valid = false;
            }
          }
        }
        if (valid === false) {
          const confirm = window.confirm(translateText(
            'Some of the corps you selected need expansions you have not enabled. Using them might break your game. Press OK to continue or Cancel to change your selections.'));
          if (confirm === false) return;
        }
      } else {
        customCorporationsList.length = 0;
      }
      const dataToSend: NewGameConfig = {
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
        pathfindersExpansion: pathfindersExpansion,
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
        initialCorpDraftVariant,
        randomMA,
        shuffleMapOption,
        userId: PreferencesManager.load('userId'),
        // beginnerOption,
        randomFirstPlayer,
        requiresVenusTrackCompletion,
        requiresMoonTrackCompletion: component.requiresMoonTrackCompletion,
        moonStandardProjectVariant: component.moonStandardProjectVariant,
        altVenusBoard: component.altVenusBoard,
        escapeVelocityMode,
        escapeVelocityThreshold,
        escapeVelocityPeriod,
        escapeVelocityPenalty,
      };
      return JSON.stringify(dataToSend, undefined, 4);
    },
    async createGame() {
      const lastcreated = Number(PreferencesManager.load('lastcreated')) || 0;
      const nowtime = new Date().getTime();
      if (nowtime - lastcreated < 60000 && !this.isvip || nowtime - lastcreated < 5000 ) { // location.href.indexOf("localhost") < 0){
        alert('请不要频繁创建游戏');
        return;
      }
      const root = this.$root as unknown as typeof mainAppSettings.data;
      root.isServerSideRequestInProgress = true;
      PreferencesManager.INSTANCE.set('lastcreated', nowtime.toString());

      const dataToSend = await this.serializeSettings();

      if (dataToSend === undefined) return;
      const onSuccess = (json: any) => {
        root.isServerSideRequestInProgress = false;
        if (json.players.length === 1) {
          window.location.href = '/player?id=' + json.players[0].id;
          return;
        } else {
          window.history.replaceState(json, `${constants.APP_NAME} - Game`, '/game?id=' + json.id);
          (this as any).$root.$data.game = json;
          (this as any).$root.$data.screen = 'game-home';
        }
      };

      fetch('/game', {'method': 'PUT', 'body': dataToSend, 'headers': {'Content-Type': 'application/json'}})
        .then((response) => response.text())
        .then((text) => {
          try {
            const json = JSON.parse(text);
            onSuccess(json);
          } catch (err) {
            throw new Error(text);
          }
        })
        .catch((error: Error) => {
          alert(error.message);
        });
    },
  },
});
</script>
