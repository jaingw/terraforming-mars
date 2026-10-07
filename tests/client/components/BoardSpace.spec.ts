import {mount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import BoardSpace from '@/client/components/BoardSpace.vue';

describe('BoardSpace', () => {
  it('has visible tile', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {id: 'm1', bonus: []},
        tileView: 'show',
      },
    });

    expect(wrapper.find('[data-test="tile"]').classes()).to.not.contain('board-hidden-tile');
  });

  it('has hidden tile if hidden props is passed', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {id: 'm1', bonus: []},
        tileView: 'hide',
      },
    });

    expect(wrapper.find('[data-test="tile"]').classes()).to.contain('board-hidden-tile');
  });

  it('shows the player marker when the space has a color', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {id: 'm1', bonus: [], color: 'red'},
        tileView: 'show',
      },
    });

    const marker = wrapper.find('.board-cube');
    expect(marker.exists()).is.true;
    expect(marker.classes()).to.contain('board-cube--red');
  });
});
