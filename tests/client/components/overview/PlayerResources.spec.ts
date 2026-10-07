import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import PlayerResources from '@/client/components/overview/PlayerResources.vue';
import {fakePublicPlayerModel} from '../testHelpers';

describe('PlayerResources', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(PlayerResources, {
      ...globalConfig,
      props: {
        player: {
          ...fakePublicPlayerModel(),
          megacredits: 0,
          megacreditProduction: 0,
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });
});
