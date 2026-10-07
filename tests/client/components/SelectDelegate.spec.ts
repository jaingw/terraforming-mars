import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import SelectDelegate from '@/client/components/SelectDelegate.vue';
import {fakePlayerViewModel} from './testHelpers';

describe('SelectDelegate', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(SelectDelegate, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: {
          title: 'Select a delegate',
          buttonLabel: 'Save',
          type: 'delegate',
          players: ['NEUTRAL'],
        },
        onsave: () => {},
        showsave: true,
        showtitle: true,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });
});
