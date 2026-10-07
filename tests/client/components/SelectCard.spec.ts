import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import SelectCard from '@/client/components/SelectCard.vue';
import {fakePlayerViewModel} from './testHelpers';
import {CardName} from '@/common/cards/CardName';

describe('SelectCard', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(SelectCard, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: {
          title: 'Select a card',
          buttonLabel: 'Save',
          type: 'card',
          cards: [],
          max: 1,
          min: 1,
          showOnlyInLearnerMode: false,
          selectBlueCardAction: false,
          showOwner: false,
          showSelectAll: false,
        },
        onsave: () => {},
        showsave: true,
        showtitle: true,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('selects only the clicked card when card models have similar shape', async () => {
    const wrapper = mount(SelectCard, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: {
          title: 'Select cards',
          buttonLabel: 'Save',
          type: 'card',
          cards: [
            {name: CardName.ANTS, resources: 0, calculatedCost: 0},
            {name: CardName.BIRDS, resources: 0, calculatedCost: 0},
            {name: CardName.FISH, resources: 0, calculatedCost: 0},
          ],
          max: 3,
          min: 0,
          showOnlyInLearnerMode: false,
          selectBlueCardAction: false,
          showOwner: false,
          showSelectAll: false,
        },
        onsave: () => {},
        showsave: true,
        showtitle: true,
      },
    });

    const inputs = wrapper.findAll('input[type="checkbox"]');
    await inputs[0].setChecked(true);

    expect(inputs.map((input) => (input.element as HTMLInputElement).checked)).deep.eq([true, false, false]);
    expect(wrapper.emitted('cardschanged')?.at(-1)).deep.eq([[CardName.ANTS]]);
  });
});
