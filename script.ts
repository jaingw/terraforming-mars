
import Vue from "vue";

import { translateTextNode } from "./src/directives/i18n";
import { trimEmptyTextNodes } from "./src/directives/TrimWhitespace";
import { mainAppSettings } from "./src/components/App";
import { ALL_PRELUDE_CORPORATIONS,
    ALL_CORPORATION_CARDS,
    ALL_CORP_ERA_CORPORATION_CARDS,
    ALL_PROJECT_CARDS,
    ALL_CORP_ERA_PROJECT_CARDS,
    ALL_PRELUDE_CARDS,
    ALL_PRELUDE_PROJECTS_CARDS,
    ALL_PROMO_CORPORATIONS,
    ALL_VENUS_CORPORATIONS,
    ALL_VENUS_PROJECTS_CARDS,
    ALL_COLONIES_PROJECTS_CARDS,
    ALL_TURMOIL_PROJECTS_CARDS,
    ALL_PROMO_PROJECTS_CARDS,
    Dealer
    } from "./src/Dealer";
import { HTML_DATA } from "./src/HTML_data";
import { CardName } from "./src/CardName";
import { ALL_GLOBAL_EVENTS, COLONY_ONLY_GLOBAL_EVENTS, VENUS_COLONY_GLOBAL_EVENTS } from "./src/turmoil/globalEvents/GlobalEventDealer";

Vue.directive("trim-whitespace", {
    inserted: trimEmptyTextNodes,
    componentUpdated: trimEmptyTextNodes
});


Vue.directive("i18n", {
    inserted: translateTextNode,
    componentUpdated: translateTextNode
});


// preload translations
fetch("/assets/translations.json?v=0817")
    .then(response => response.json())
    .then(jsonData => {
        (window as any).TM_translations = jsonData;
        new Vue(mainAppSettings);
        let x = tt;
        x = bigboxpromo;
        x=  globalEvent;
        x = tactician;
        x();
    });

function tt(){
    console.log("//ALL_PRELUDE_CORPORATIONS:\n");
    ALL_PRELUDE_CORPORATIONS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_CORPORATION_CARDS:\n");
    ALL_CORPORATION_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    ALL_CORP_ERA_CORPORATION_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_PROJECT_CARDS:\n");
    ALL_PROJECT_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    ALL_CORP_ERA_PROJECT_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_PRELUDE_CARDS:\n");
    ALL_PRELUDE_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_PRELUDE_PROJECTS_CARDS:\n");
    ALL_PRELUDE_PROJECTS_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_PROMO_CORPORATIONS:\n");
    ALL_PROMO_CORPORATIONS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_VENUS_CORPORATIONS:\n");
    ALL_VENUS_CORPORATIONS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_VENUS_PROJECTS_CARDS:\n");
    ALL_VENUS_PROJECTS_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_COLONIES_PROJECTS_CARDS:\n");
    ALL_COLONIES_PROJECTS_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_TURMOIL_PROJECTS_CARDS:\n");
    ALL_TURMOIL_PROJECTS_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })

    console.log("//ALL_PROMO_PROJECTS_CARDS:\n");
    ALL_PROMO_PROJECTS_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x.cardName);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })
}

function bigboxpromo(){
    let ALL_BIGBOXP_CARDS = [
        CardName.ASTRODRILL ,
        CardName.ASTEROID_HOLLOWING ,
        CardName.ADVERTISING ,
        CardName.PHARMACY_UNION ,
        CardName.COMET_AIMING ,
        CardName.CUTTING_EDGE_TECHNOLOGY ,
        CardName.CRASH_SITE_CLEANUP ,
        CardName.DIRECTED_IMPACTORS ,
        CardName.FIELD_CAPPED_CITY ,
        CardName.MAGNETIC_SHIELD ,
        CardName.MELTWORKS ,
        CardName.MOHOLE_LAKE ,
        CardName.DIVERSITY_SUPPORT ,
        CardName.JOVIAN_EMBASSY ,
        CardName.TOPSOIL_CONTRACT ,
        CardName.IMPORTED_NUTRIENTS ,
        CardName.ASTEROID_DEFLECTION_SYSTEM ,
        CardName.SUB_CRUST_MEASUREMENTS ,
        CardName.POTATOES ,
        CardName.MEAT_INDUSTRY ,
        CardName.DEIMOS_DOWN_PROMO ,
        CardName.MAGNETIC_FIELD_GENERATORS_PROMO ,
        CardName.GREAT_DAM_PROMO 
    ]

    ALL_BIGBOXP_CARDS.forEach(x => {
        let htmlData = HTML_DATA.get(x);
        let node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })
}

function globalEvent(){
    let events = [...COLONY_ONLY_GLOBAL_EVENTS, ...VENUS_COLONY_GLOBAL_EVENTS, ...ALL_GLOBAL_EVENTS];
    events.forEach(x => {
        let node = document.createElement("div")
        node.innerHTML = new x.factory().description
        translateTextNode(node);
    })
}

function tactician(){
    let dealer = new Dealer(true, true, true, true, true, true, true);
    dealer.deck.forEach(x => {
        if(x.canPlay ){
            if(HTML_DATA.get(x.name)!.indexOf("requirements")<0 &&  ( x.hasRequirements === undefined || x.hasRequirements)){
                console.log("########################"+x.name);
            }
            if(HTML_DATA.get(x.name)!.indexOf("requirements")>0 &&   x.hasRequirements === false ){
                console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@"+x.name);
            }
        }
    })
}