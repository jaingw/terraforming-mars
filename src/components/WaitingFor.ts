import Vue from "vue";

import { AndOptions } from "./AndOptions";
import { OrOptions } from "./OrOptions";
import { PlayerInputFactory } from "./PlayerInputFactory";
import { SelectAmount } from "./SelectAmount";
import { SelectCard } from "./SelectCard";
import { SelectHowToPay } from "./SelectHowToPay";
import { SelectHowToPayForCard } from "./SelectHowToPayForCard";
import { SelectOption } from "./SelectOption";
import { SelectPlayer } from "./SelectPlayer";
import { SelectSpace } from "./SelectSpace";
import { $t } from "../directives/i18n";
import { SelectPartyPlayer } from "./SelectPartyPlayer";
import { PreferencesManager } from "./PreferencesManager";
import { playActivePlayerSound } from "../SoundManager";
import { SelectColony } from "./SelectColony";
import { SelectProductionToLose } from "./SelectProductionToLose";
import { ShiftAresGlobalParameters } from "./ShiftAresGlobalParameters";

let ui_update_timeout_id: number | undefined = undefined;

export const WaitingFor = Vue.component("waiting-for", {
    props: ["player", "players", "settings", "waitingfor","soundtip"],
    data: function () {
        return {
            waitingForTimeout: this.settings.waitingForTimeout
        }
    },
    components: {
        "and-options": AndOptions,
        "or-options": OrOptions,
        "select-amount": SelectAmount,
        "select-card": SelectCard,
        "select-option": SelectOption,
        "select-how-to-pay": SelectHowToPay,
        "select-how-to-pay-for-card": SelectHowToPayForCard,
        "select-player": SelectPlayer,
        "select-space": SelectSpace,
        "select-party-player": SelectPartyPlayer,
        "select-colony": SelectColony,
        "select-production-to-lose": SelectProductionToLose,
        "shift-ares-global-parameters": ShiftAresGlobalParameters,
    },
    methods: {
        waitForUpdate: function (faster:boolean = false) {
            const vueApp = this;
            clearInterval(ui_update_timeout_id);
            const askForUpdate = () => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", "/api/waitingfor" + window.location.search + "&prev-game-age=" + this.player.gameAge.toString());
                xhr.onerror = function () {
                    alert("Error getting waitingfor data");
                };
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const result = xhr.response;
                        if (result["result"] === "GO" && this.waitingfor === undefined ) {
                            (vueApp as any).$root.updatePlayer();

                            if (Notification.permission !== "granted") {
                                Notification.requestPermission();
                            }
                            if (Notification.permission === "granted") {
                                new Notification("Terraforming Mars Online", {
                                    icon: "/favicon.ico",
                                    body: "It's your turn!",
                                });
                            }
                            const soundsEnabled = PreferencesManager.loadValue("enable_sounds") === "1";
                            if (soundsEnabled) playActivePlayerSound();

                            // We don't need to wait anymore - it's our turn
                            return;
                        } else if (result["result"] === "REFRESH") {
                            // Something changed, let's refresh UI
                            (vueApp as any).$root.updatePlayer();
                            return;
                        }
                    } else {
                        alert("Unexpected server response");
                    }
                    // (vueApp as any).waitForUpdate();
                }
                xhr.responseType = "json";
                xhr.send();
            }
            if(faster){
                askForUpdate();
            }
            ui_update_timeout_id = (setInterval(askForUpdate,   this.waitingForTimeout) as any);
        }
    },
    render: function (createElement) {
        if (this.player.undoing ){
            (this as any).waitForUpdate(true);
            return createElement("div", $t("Undoing, Please refresh or wait seconds"));
        }
        (this as any).waitForUpdate();
        if(this.player.block){
            return createElement("div", $t("Please Login with right user"));
        }
        if (this.waitingfor === undefined) {
            return createElement("div", $t("Not your turn to take any actions"));
        }
        const input = new PlayerInputFactory().getPlayerInput(createElement, this.players, this.player, this.waitingfor, (out: Array<Array<string>>) => {
            const xhr = new XMLHttpRequest();
            const root = (this.$root as any);
            if (root.isServerSideRequestInProgress) {
                console.warn("Server request in progress");
                return;
            }
           
            root.isServerSideRequestInProgress = true;
	    let userId = PreferencesManager.loadValue("userId") ;
            let url = "/player/input?id=" + (this.$parent as any).player.id;
            if(userId.length > 0){
                url += "&userId=" + userId;
            }
            xhr.open("POST", url);
            xhr.responseType = "json";
            xhr.onload = () => {
                if (xhr.status === 200) {
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
                root.isServerSideRequestInProgress = false;
            }
            let senddata ={"id":this.waitingfor.id,"input":out};
            xhr.send(JSON.stringify(senddata));  
            xhr.onerror = function () {
                root.isServerSideRequestInProgress = false;
            };
        }, true, true);

        return createElement("div", {"class": "wf-root"}, [input])
    }
});

