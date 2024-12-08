import Vue from 'vue';

import {trimEmptyTextNodes} from '@/client/directives/TrimWhitespace';
import {mainAppSettings} from '@/client/components/App';
import {getPreferences} from '@/client/utils/PreferencesManager';
import i18nPlugin from '@/client/plugins/i18n.plugin';

import '../styles/tailwindcss.css';

declare global {
  interface Window {
    _translations: { [key: string]: string } | undefined;
  }
}
async function bootstrap() {
  const lang = getPreferences().lang || 'cn';

  if (lang !== 'en') {
    try {
      window._translations = await fetch(`assets/locales/${lang}.json`).then((res) => res.json());
      for (const key in window._translations) {
        if (key.length > 10) {// 由于部分文案由大写更换成了小写,这里做个兼容
          window._translations[key.toLocaleLowerCase()] = window._translations[key];
          if (key.endsWith('.')) {
            window._translations[key.slice(0, -1)] = window._translations[key];
            window._translations[key.slice(0, -1).toLocaleLowerCase()] = window._translations[key];
          }
        }
      }
      // TODO - add a nice loader for this fetch
    } catch (err) {
      console.warn(`Cannot load ${lang} translations. See network for details.`);
    }
  }

  Vue.use(i18nPlugin);

  Vue.directive('trim-whitespace', {
    inserted: trimEmptyTextNodes,
    componentUpdated: trimEmptyTextNodes,
  });

  if (window.isSecureContext && 'serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('registered the service worker', registration);
      });
    });
  }

  (window as any).vm = new Vue(mainAppSettings);
}

bootstrap();

const x = tt;
// x = bigboxpromo;
// x= globalEvent;
x();


function tt() {
  // console.log("//ALL_PRELUDE_CORPORATIONS:\n");
  // ALL_PRELUDE_CORPORATIONS.forEach(x => {
  //     const htmlData = HTML_DATA.get(x.cardName);
  //     const node = document.createElement("div")
  //     node.innerHTML = htmlData as string;
  //     translateTextNode(node);
  // })


}

// function bigboxpromo() {
//   const ALL_BIGBOXP_CARDS = [
//     CardName.ASTRODRILL,
//     CardName.ASTEROID_HOLLOWING,
//     CardName.ADVERTISING,
//     CardName.PHARMACY_UNION,
//     CardName.COMET_AIMING,
//     CardName.CUTTING_EDGE_TECHNOLOGY,
//     CardName.CRASH_SITE_CLEANUP,
//     CardName.DIRECTED_IMPACTORS,
//     CardName.FIELD_CAPPED_CITY,
//     CardName.MAGNETIC_SHIELD,
//     CardName.MELTWORKS,
//     CardName.MOHOLE_LAKE,
//     CardName.DIVERSITY_SUPPORT,
//     CardName.JOVIAN_EMBASSY,
//     CardName.TOPSOIL_CONTRACT,
//     CardName.IMPORTED_NUTRIENTS,
//     CardName.ASTEROID_DEFLECTION_SYSTEM,
//     CardName.SUB_CRUST_MEASUREMENTS,
//     CardName.POTATOES,
//     CardName.MEAT_INDUSTRY,
//     CardName.DEIMOS_DOWN_PROMO,
//     CardName.MAGNETIC_FIELD_GENERATORS_PROMO,
//     CardName.GREAT_DAM_PROMO,
//   ];

//   ALL_BIGBOXP_CARDS.forEach((x) => {
//     const htmlData = HTML_DATA.get(x);
//     const node = document.createElement('div');
//     node.innerHTML = htmlData as string;
//     translateTextNode(node);
//   });
// }

// function globalEvent() {
//   const events = [...POSITIVE_GLOBAL_EVENTS,
//     ...NEGATIVE_GLOBAL_EVENTS,
//     ...COLONY_ONLY_POSITIVE_GLOBAL_EVENTS,
//     ...COLONY_ONLY_NEGATIVE_GLOBAL_EVENTS,
//     ...VENUS_COLONY_POSITIVE_GLOBAL_EVENTS,
//     ...VENUS_COLONY_NEGATIVE_GLOBAL_EVENTS];
//   events.forEach((x) => {
//     const node = document.createElement('div');
//     node.innerHTML = new x.Factory().description;
//     translateTextNode(node);
//   });
// }
