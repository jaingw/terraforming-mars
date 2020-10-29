
import Vue from "vue";
import { PreferencesManager } from "./PreferencesManager";

export const GameHome = Vue.component("game-home", {
    props: ["game"],
    data: function () {
        return {
            userId : PreferencesManager.loadValue("userId") ,
        }
    },
    methods: {
    },
    template: `
        <div id="game-home">
            <h1><a href="/" v-i18n>Terraforming Mars</a> — <span v-i18n>Game Home</span></h1>
            <p  v-i18n>Send players their links below. As game administrator pick your link to use.</p>
            <div>Game Age： {{game.gameAge}} ,Last Save Id : {{game.saveId}} 
                <span v-if="game.rollback == true">--&gt;
                    <a class="btn btn-lg btn-success"  v-bind:href="'api/gameback?id='+game.id+'&userId='+userId" target="_blank" > ROLLBACK({{game.rollbackNum}})</a>
                </span>
            </div>
            <ul>
                <li v-for="player in game.players">
                    <span class="player_home_block nofloat">
                        <span class="player_name" :class="'player_bg_color_'+ player.color"><a :href="'/player?id=' + player.id">{{player.name}}</a></span>
                    </span>
                </li>
            </ul>
        </div>
    `
});

