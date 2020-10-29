import Vue from "vue";
import { PreferencesManager } from "./PreferencesManager";
import { LANGUAGES } from "../constants";
import { MAX_OCEAN_TILES, MAX_TEMPERATURE, MAX_OXYGEN_LEVEL, MAX_VENUS_SCALE } from "../constants";
// @ts-ignore
import { $t } from "../directives/i18n";

let ui_timeout_id : NodeJS.Timeout ;
export const Preferences = Vue.component("preferences", {
    props: ["player","player_name", "player_color", "generation", "coloniesCount", "temperature", "oxygen", "oceans", "venus", "venusNextExtension"],
    data: function () {
        return {
            "ui": {
                "preferences_panel_open": false,
                "resign_panel_open": false,
                "resign_wait": false,
                "resign_time":"",
                "canresign": false
            },
            "hide_corporation": false,
            "hide_hand": false,
            "hide_cards": false,
            "hide_awards_and_milestones": false,
            "hide_tag_overview": false,
            "hide_turnorder": false,
            "hide_corporation_names": false,
            "small_cards": false,
            "remove_background": false,
            "magnify_cards": true,
            "magnify_card_descriptions": true,
            "show_alerts": true,
            "hide_ma_scores": false,
            "hide_non_blue_cards": false,
            "hide_log": false,
            "lang": "en",
            "langs": LANGUAGES,
            "enable_sounds": false
        };
    },
    methods: {
        setPreferencesCSS: function (val: boolean | undefined,cssClassSuffix: string): void {
            const target = document.getElementById("ts-preferences-target");
            if (!target) return;
            if (val) {
                target.classList.add("preferences_" + cssClassSuffix);
            } else {
                target.classList.remove("preferences_" + cssClassSuffix);
            }

            if (!target.classList.contains("language-" + this.lang)) {
                target.classList.add("language-" + this.lang);
            }
        },
        updatePreferencesFromStorage: function (): Map<string,boolean | string> {
            for (const k of PreferencesManager.keys) {
                const val = PreferencesManager.loadValue(k);
                if (k === "lang") {
                    PreferencesManager.preferencesValues.set(k, this.$data[k]);
                    this[k] = val || "en";
                    PreferencesManager.preferencesValues.set(k, val || "en");
                } else {
                    const boolVal = val !== "" ? val === "1" : this.$data[k];
                    PreferencesManager.preferencesValues.set(k, val === "1");
                    this.$data[k] = boolVal;
                }
            }
            return PreferencesManager.preferencesValues;
        },
        updatePreferences: function (_evt: any): void {
            let strVal: string = "";
            for (const k of PreferencesManager.keys) {
                const val = PreferencesManager.preferencesValues.get(k);
                if (val !== this.$data[k]) {
                    if (k === "lang") {
                        strVal = this.$data[k];
                    } else {
                        strVal = this.$data[k] ? "1" : "0";
                    }
                    PreferencesManager.saveValue(k, strVal);
                    PreferencesManager.preferencesValues.set(k, this.$data[k]);
                    this.setPreferencesCSS(this.$data[k], k);
                }
            }
        },
        syncPreferences: function (): void {
            for (const k of PreferencesManager.keys) {
                this.$data[k] = PreferencesManager.preferencesValues.get(k);
                this.setPreferencesCSS(this.$data[k], k);
            }
        },
        preferencesPanelOpen: function() :void{
            this.ui.resign_panel_open = false;
            this.ui.resign_wait = false;
            this.ui.resign_time = "";

            clearInterval(ui_timeout_id);
            this.ui.preferences_panel_open = !this.ui.preferences_panel_open;
        },
        resignPanelOpen: function(): void{
            const ui = this.ui;
            ui.preferences_panel_open = false;

            clearInterval(ui_timeout_id);
            ui.resign_panel_open = ! ui.resign_panel_open;
            ui.resign_wait = false;
            ui.resign_time = "";
        },
        resignWait:function():void{
            this.ui.resign_time = "(3s)";
            let wait_time = 3;
            clearInterval(ui_timeout_id);
            const resignWaitTime = ()=> {
                if(wait_time > 1 ){
                    wait_time = wait_time - 1;
                    this.ui.resign_time = "("+ wait_time +"s)";
                }else{
                    clearInterval(ui_timeout_id);
                    this.ui.resign_wait = true;
                }
            }
            ui_timeout_id = setInterval(resignWaitTime,   1000)
        },
        resign:function():void{
            const userId = PreferencesManager.loadValue("userId");
            this.resignPanelOpen();
            if(userId === ""){
                this.resignPanelOpen();
                return ;
            }
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "player/resign");
            xhr.responseType = "json";
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const root = (this.$root as any);
                    root.screen = "empty";
                    root.player = xhr.response;
                    root.playerkey++;
                    root.screen = "player-home";
                    if (root.player.phase === "end" && window.location.pathname !== "/the-end") {
                        (window as any).location = (window as any).location;
                    }

                } else if (xhr.status === 400 && xhr.responseType === "json") {
                    const element: HTMLElement | null = document.getElementById("dialog-default");
                    const message: HTMLElement | null = document.getElementById("dialog-default-message");
                    if (message !== null && element !== null && (element as HTMLDialogElement).showModal !== undefined) {
                        message.innerHTML = xhr.response.message;
                        (element as HTMLDialogElement).showModal();
                    } else {
                        alert(xhr.response.message);
                    }
                } else {
                    alert("Error sending input");
                }
            }
            const senddata ={"playerId":this.player.id,"userId":userId};
            xhr.send(JSON.stringify(senddata));  
        },
        getGenMarker: function (): string {
            return `${this.generation}`;
        },
        getOceanCount: function(): string{
            if (this.oceans === MAX_OCEAN_TILES){
                return "<img src=\"/assets/misc/checkmark.png\" class=\"preferences_checkmark\" :alt=\"$t('Completed!')\">";
            } else {
                return `${this.oceans}`;
            } 
        },
        getTemperatureCount: function(): string{
            if (this.temperature === MAX_TEMPERATURE){
                return "<img src=\"/assets/misc/checkmark.png\" class=\"preferences_checkmark\" :alt=\"$t('Completed!')\">";
            } else {
                return `${this.temperature}`;
            } 
        },
        getOxygenCount: function(): string{
            if (this.oxygen === MAX_OXYGEN_LEVEL){
                return "<img src=\"/assets/misc/checkmark.png\" class=\"preferences_checkmark\" :alt=\"$t('Completed!')\">";
            } else {
                return `${this.oxygen}`;
            } 
        },
        getVenusCount: function(): string{
            if (this.venus === MAX_VENUS_SCALE){
                return "<img src=\"/assets/misc/checkmark.png\" class=\"preferences_checkmark\" :alt=\"$t('Completed!')\">";
            } else {
                return `${this.venus}`;
            } 
        }
    },
    mounted: function () {
        this.updatePreferencesFromStorage();
        this.ui.canresign = this.player.canExit 
            && (this.$root as any).isvip 
            && this.player.block === false;
    },
    template: `
        <div class="preferences_cont" :data="syncPreferences()">
                <div class="preferences_tm">
                    <div class="preferences-gen-text">GEN</div>
                    <div class="preferences-gen-marker">{{ getGenMarker() }}</div>
                </div>
                <div class="preferences_global_params">
                  <div class="preferences_temperature-tile"></div>
                  <div class="preferences_global_params_value" v-html="getTemperatureCount()"></div>
                  <div class="preferences_oxygen-tile"></div>
                  <div class="preferences_global_params_value" v-html="getOxygenCount()"></div>
                  <div class="preferences_ocean-tile"></div>
                  <div class="preferences_global_params_value" v-html="getOceanCount()"></div>
                  <div v-if="venusNextExtension">
                    <div class="preferences_venus-tile"></div>
                    <div class="preferences_global_params_value" v-html="getVenusCount()"></div>
                  </div>
                </div>
                <div class="preferences_item preferences_player">
                  <div class="preferences_player_inner" :class="'player_bg_color_' + player_color"></div>
                </div>
                <a  href="/donate" target="_blank">
                    <div class="preferences_item preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--donate"><div class="deck-size">赞助</div></i>
                    </div>
                </a>
                <a  href="#resign_panel" style="position: relative;">
                    <div class="preferences_item preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--resign"  v-on:click="resignPanelOpen"><div class="deck-size">体退</div></i>
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
                <a  href="#board">
                    <div class="preferences_item preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--board"></i>
                    </div>
                </a>
                <a  href="#actions">
                    <div class="preferences_item preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--actions"></i>
                    </div>
                </a>
                <a href="#cards">
                    <div class="preferences_item goto-cards preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--cards"><slot></slot></i>
                    </div>
                </a>
                <a v-if="coloniesCount > 0" href="#colonies">
                    <div class="preferences_item preferences_item_shortcut">
                        <i class="preferences_icon preferences_icon--colonies"></i>
                    </div>
                </a>
                <a href="/help-iconology">
                    <div class="preferences_item preferences_item--help">
                        <i class="preferences_icon preferences_icon--help"></i>
                    </div>
                </a>
            <div class="preferences_item preferences_item--settings">
                <i class="preferences_icon preferences_icon--settings" :class="{'preferences_item--is-active': ui.preferences_panel_open}" v-on:click="ui.preferences_panel_open = !ui.preferences_panel_open"></i>
                <div class="preferences_panel" v-if="ui.preferences_panel_open">
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_turnorder" />
                            <i class="form-icon"></i> <span v-i18n>Hide turn order</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_hand" />
                            <i class="form-icon"></i> <span v-i18n>Hide cards in hand</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_cards" />
                            <i class="form-icon"></i> <span v-i18n>Hide played cards</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_non_blue_cards" />
                            <i class="form-icon"></i> <span v-i18n>Hide non-blue played cards</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_awards_and_milestones" />
                            <i class="form-icon"></i> <span v-i18n>Hide awards and milestones</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_log" />
                            <i class="form-icon"></i> <span v-i18n>Hide log</span>
                        </label>
                    </div>
                   <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_tag_overview" />
                            <i class="form-icon"></i> <span v-i18n>Hide tag overview</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_corporation_names" />
                            <i class="form-icon"></i> <span v-i18n>Hide corporation names for players</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="small_cards" />
                            <i class="form-icon"></i> <span v-i18n>Smaller cards</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="remove_background" />
                            <i class="form-icon"></i> <span v-i18n>Remove background image</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="magnify_cards" />
                            <i class="form-icon"></i> <span v-i18n>Magnify cards on hover</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="magnify_card_descriptions" />
                            <i class="form-icon"></i> <span v-i18n>Magnify card descriptions on hover</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="show_alerts" />
                            <i class="form-icon"></i> <span v-i18n>Show in-game alerts</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item">
                        <label class="form-switch">
                            <input type="checkbox" v-on:change="updatePreferences" v-model="hide_ma_scores" />
                            <i class="form-icon"></i> <span v-i18n>Hide Milestones / Awards scores</span>
                        </label>
                    </div>
                    <div class="preferences_panel_item form-group">
                        <label class="form-label"><span v-i18n>Language</span> (<a href="javascript:document.location.reload(true);" v-i18n>refresh page</a> <span v-i18n>to see changes</span>)</label>
                        <div class="preferences_panel_langs">
                            <label class="form-radio" v-for="language in langs">
                                <input name="lang" type="radio" v-on:change="updatePreferences" v-model="lang" :value="language.id" />
                                <i class="form-icon"></i> {{ language.title }}
                            </label>
                        </div>
                    </div>
                    <div class="preferences_panel_actions">
                        <button class="btn btn-lg btn-primary" v-on:click="ui.preferences_panel_open=false">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `,
});
