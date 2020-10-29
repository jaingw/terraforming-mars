
import Vue from "vue";

import { translateTextNode } from "./src/directives/i18n";
import { trimEmptyTextNodes } from "./src/directives/TrimWhitespace";
import { mainAppSettings } from "./src/components/App";
import { Dealer } from "./src/Dealer";
import { HTML_DATA } from "./src/HTML_data";
import { CardName } from "./src/CardName";
import { POSITIVE_GLOBAL_EVENTS, NEGATIVE_GLOBAL_EVENTS, COLONY_ONLY_POSITIVE_GLOBAL_EVENTS, COLONY_ONLY_NEGATIVE_GLOBAL_EVENTS, VENUS_COLONY_POSITIVE_GLOBAL_EVENTS, VENUS_COLONY_NEGATIVE_GLOBAL_EVENTS } from "./src/turmoil/globalEvents/GlobalEventDealer";

Vue.directive("trim-whitespace", {
    inserted: trimEmptyTextNodes,
    componentUpdated: trimEmptyTextNodes
});


Vue.directive("i18n", {
    inserted: translateTextNode,
    componentUpdated: translateTextNode
});

 

(window as any).vm = new Vue(mainAppSettings);
let x = tt;
x = bigboxpromo;
x=  globalEvent;
x = tactician;
x();


function tt(){
    // console.log("//ALL_PRELUDE_CORPORATIONS:\n");
    // ALL_PRELUDE_CORPORATIONS.forEach(x => {
    //     const htmlData = HTML_DATA.get(x.cardName);
    //     const node = document.createElement("div")
    //     node.innerHTML = htmlData as string;
    //     translateTextNode(node);
    // })


    
}

function bigboxpromo(){
    const ALL_BIGBOXP_CARDS = [
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
        const htmlData = HTML_DATA.get(x);
        const node = document.createElement("div")
        node.innerHTML = htmlData as string;
        translateTextNode(node);
    })
}

function globalEvent(){
    const events = [...POSITIVE_GLOBAL_EVENTS,
                ...NEGATIVE_GLOBAL_EVENTS,
                ...COLONY_ONLY_POSITIVE_GLOBAL_EVENTS,
                ...COLONY_ONLY_NEGATIVE_GLOBAL_EVENTS,
                ...VENUS_COLONY_POSITIVE_GLOBAL_EVENTS,
                ...VENUS_COLONY_NEGATIVE_GLOBAL_EVENTS];
    events.forEach(x => {
        const node = document.createElement("div")
        node.innerHTML = new x.factory().description
        translateTextNode(node);
    })
}

function tactician(){
    const dealer = new Dealer(true, true, true, true, true, true, true, true);
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