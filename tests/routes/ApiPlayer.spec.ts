import {expect} from 'chai';
import {ApiPlayer} from '../../src/server/routes/ApiPlayer';
import {MockResponse} from './HttpMocks';
import {RouteTestScaffolding} from './RouteTestScaffolding';

describe('ApiPlayer', function() {
  let scaffolding: RouteTestScaffolding;
  let res: MockResponse;

  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('no parameter', async () => {
    scaffolding.url = '/api/player';
    await scaffolding.get(ApiPlayer.INSTANCE, res);
    expect(res.content).eq('Bad request: missing id parameter');
  });

  it('fails invalid player id', async () => {
    scaffolding.url = '/api/player?id=googoo';
    await scaffolding.get(ApiPlayer.INSTANCE, res);
    expect(res.content).eq('Bad request: invalid player id');
  });

  it('fails game not found', async () => {
    scaffolding.url = '/api/player?id=p123';
    await scaffolding.get(ApiPlayer.INSTANCE, res);
    expect(res.content).eq('Not found');
  });
});
