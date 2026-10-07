import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import LogPanel from '@/client/components/logpanel/LogPanel.vue';
import {fakeViewModel} from '../testHelpers';

describe('LogPanel', () => {
  let originalFetch: any;
  let originalGetElementById: typeof document.getElementById;

  beforeEach(() => {
    originalFetch = (global as any).fetch;
    (global as any).fetch = () => Promise.resolve({ok: true, json: () => Promise.resolve([])});
    originalGetElementById = document.getElementById;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    document.getElementById = originalGetElementById;
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(LogPanel, {
      ...globalConfig,
      props: {
        viewModel: fakeViewModel(),
        color: 'blue',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('does not scroll to end when the log is scrolled in the middle', async () => {
    let resolveFetch: (response: {ok: boolean, json: () => Promise<Array<unknown>>}) => void = () => {};
    (global as any).fetch = () => new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const scrollablePanel = fakeScrollablePanel({
      scrollHeight: 1000,
      clientHeight: 200,
      scrollTop: 300,
    });
    document.getElementById = ((id: string) => id === 'logpanel-scrollable' ? scrollablePanel : null) as typeof document.getElementById;

    shallowMount(LogPanel, {
      ...globalConfig,
      props: {
        viewModel: fakeViewModel({id: 'middle-scroll-player-id' as any}),
        color: 'blue',
      },
    });

    resolveFetch({ok: true, json: () => Promise.resolve([])});
    await flushPromises();

    expect(scrollablePanel.scrollTop).to.eq(300);
  });

  it('scrolls to end when the log is already near the bottom', async () => {
    let resolveFetch: (response: {ok: boolean, json: () => Promise<Array<unknown>>}) => void = () => {};
    (global as any).fetch = () => new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const scrollablePanel = fakeScrollablePanel({
      scrollHeight: 1000,
      clientHeight: 200,
      scrollTop: 785,
    });
    document.getElementById = ((id: string) => id === 'logpanel-scrollable' ? scrollablePanel : null) as typeof document.getElementById;

    const wrapper = shallowMount(LogPanel, {
      ...globalConfig,
      props: {
        viewModel: fakeViewModel({id: 'near-bottom-player-id' as any}),
        color: 'blue',
      },
    });
    (wrapper.vm as any).rememberScrollPosition();

    resolveFetch({ok: true, json: () => Promise.resolve([])});
    await flushPromises();

    expect(scrollablePanel.scrollTop).to.eq(1000);
  });

  it('restores scroll position after remounting the log panel', async () => {
    const viewModel = fakeViewModel({id: 'remounted-player-id' as any});
    const firstPanel = fakeScrollablePanel({
      scrollHeight: 1000,
      clientHeight: 200,
      scrollTop: 300,
    });
    document.getElementById = ((id: string) => id === 'logpanel-scrollable' ? firstPanel : null) as typeof document.getElementById;

    const wrapper = shallowMount(LogPanel, {
      ...globalConfig,
      props: {
        viewModel,
        color: 'blue',
      },
    });
    (wrapper.vm as any).rememberScrollPosition();
    wrapper.unmount();

    let resolveFetch: (response: {ok: boolean, json: () => Promise<Array<unknown>>}) => void = () => {};
    (global as any).fetch = () => new Promise((resolve) => {
      resolveFetch = resolve;
    });

    const secondPanel = fakeScrollablePanel({
      scrollHeight: 1000,
      clientHeight: 200,
      scrollTop: 0,
    });
    document.getElementById = ((id: string) => id === 'logpanel-scrollable' ? secondPanel : null) as typeof document.getElementById;

    shallowMount(LogPanel, {
      ...globalConfig,
      props: {
        viewModel,
        color: 'blue',
      },
    });

    resolveFetch({ok: true, json: () => Promise.resolve([])});
    await flushPromises();

    expect(secondPanel.scrollTop).to.eq(300);
  });
});

function fakeScrollablePanel(options: {scrollHeight: number, clientHeight: number, scrollTop: number}): HTMLElement {
  const element = document.createElement('div');
  Object.defineProperty(element, 'scrollHeight', {value: options.scrollHeight, configurable: true});
  Object.defineProperty(element, 'clientHeight', {value: options.clientHeight, configurable: true});
  element.scrollTop = options.scrollTop;
  return element;
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
