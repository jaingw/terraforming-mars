import {mount} from '@vue/test-utils';
import {getLocalVue} from './getLocalVue';
import {CardName} from '@/common/cards/CardName';
import CardHTML from '@/client/components/card/Card_HTML.vue';
import {FakeLocalStorage} from './FakeLocalStorage';
import {getPreferences} from '../../../src/client/utils/PreferencesManager';
import {ClientCard} from '@/common/cards/ClientCard';
import * as cnjson from '../../../assets/locales/cn.json';
import * as cardJson from '@/genfiles/cards.json';
const fs = eval('require("fs")');

describe('CardHTML', () => {
  let localStorage: FakeLocalStorage;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();
    FakeLocalStorage.register(localStorage);
  });
  afterEach(() => {
    FakeLocalStorage.deregister(localStorage);
  });

  it('get card', async () => {
    const lang = getPreferences().lang || 'cn';
    if (lang === 'cn') {
      try {
        console.log(`fetch /assets/locales/${lang}.json`);
        (window as any)._translations = cnjson;
        // TODO - add a nice loader for this fetch
      } catch (err) {
        console.warn(`Cannot load ${lang} translations. See network for details.`);
      }
    }

    const json :Partial<Record<CardName, string>>={};
    // function processDeck( cardManifest: CardManifest<ICard>) {
    //   for (const cardName of CardManifest.keys(cardManifest)) {
    (cardJson as any as Array<ClientCard>).forEach((card) => {
      const sortable = mount(CardHTML, {
        localVue: getLocalVue(),
        propsData: {
          card: {
            name: card.name,
          },
        },
      });
      const cards = sortable.findAll('div.div-card-content');
      json[card.name] = cards.at(0).html().replace(/<div class="div-card-content">(.*)<\/div>/gis, function(_rs, $1) {
        return $1;
      });
    });
    fs.writeFileSync('src/genfiles/cards-html-cn.json', JSON.stringify(json));
  });
});


