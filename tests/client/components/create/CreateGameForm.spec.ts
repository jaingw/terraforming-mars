import {shallowMount} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import {expect} from 'chai';
import CreateGameForm from '@/client/components/create/CreateGameForm.vue';

describe('CreateGameForm', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CreateGameForm, {
      ...globalConfig,
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('hides custom corporation and prelude filters when they emit close', async () => {
    const wrapper = shallowMount(CreateGameForm, {
      ...globalConfig,
    });

    await wrapper.setData({
      showCorporationList: true,
      showPreludesList: true,
    });

    await wrapper.findComponent({name: 'CorporationsFilter'}).vm.$emit('close');
    await wrapper.findComponent({name: 'PreludesFilter'}).vm.$emit('close');

    expect((wrapper.vm as any).showCorporationList).to.be.false;
    expect((wrapper.vm as any).showPreludesList).to.be.false;
  });
});
