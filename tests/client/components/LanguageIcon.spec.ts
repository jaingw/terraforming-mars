import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import LanguageIcon from '@/client/components/LanguageIcon.vue';
import {FakeLocalStorage} from './FakeLocalStorage';
import {PreferencesManager} from '@/client/utils/PreferencesManager';

describe('LanguageIcon', () => {
  let localStorage: FakeLocalStorage;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();
    FakeLocalStorage.register(localStorage);
    PreferencesManager.resetForTest();
  });

  afterEach(() => {
    FakeLocalStorage.deregister(localStorage);
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(LanguageIcon, {
      ...globalConfig,
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('defaults to Chinese when language preference is missing or invalid', () => {
    localStorage.setItem('lang', 'xx');
    PreferencesManager.resetForTest();

    const wrapper = shallowMount(LanguageIcon, {
      ...globalConfig,
    });

    expect((wrapper.vm as any).lang).to.eq('cn');
    expect((wrapper.vm as any).title).to.eq('中文 (Chinese)');
  });
});
