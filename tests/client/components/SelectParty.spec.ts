import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import SelectParty from '@/client/components/SelectParty.vue';
import {fakePlayerViewModel} from './testHelpers';
import {PartyName} from '@/common/turmoil/PartyName';

describe('SelectParty', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(SelectParty, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: {
          title: 'Select a party',
          buttonLabel: 'Save',
          type: 'party',
          parties: [],
        },
        onsave: () => {},
        showsave: true,
        showtitle: true,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('cannot save until a party is selected', async () => {
    const wrapper = shallowMount(SelectParty, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: {
          title: 'Select a party',
          buttonLabel: 'Save',
          type: 'party',
          parties: [PartyName.GREENS],
        },
        onsave: () => {},
        showsave: true,
        showtitle: true,
      },
    });

    expect(wrapper.vm.canSave()).is.false;

    await wrapper.setData({selectedParty: PartyName.GREENS});

    expect(wrapper.vm.canSave()).is.true;
  });
});
