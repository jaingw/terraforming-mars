import {expect} from 'chai';
import * as responses from '../../src/server/server/responses';
import {MockResponse} from '../routes/HttpMocks';
import {RouteTestScaffolding} from '../routes/RouteTestScaffolding';
import {statusCode} from '../../src/common/http/statusCode';

describe('Route', () => {
  let scaffolding: RouteTestScaffolding;
  let res: MockResponse;

  beforeEach(() => {
    scaffolding = new RouteTestScaffolding();
    res = new MockResponse();
  });

  it('internalServerError expects predictable errors', () => {
    scaffolding.url = 'goo.goo.gaa.gaa';
    scaffolding.req.headers['accept-encoding'] = '';
    responses.internalServerError(scaffolding.req, res, {'<img src=x onerror=alert(1)>': 'foo'});
    expect(res.statusCode).eq(statusCode.internalServerError);
    expect(res.content).eq('Internal server error: unknown error');
  });

  it('internalServerError prevents xss', () => {
    scaffolding.url = 'goo.goo.gaa.gaa';
    scaffolding.req.headers['accept-encoding'] = '';
    responses.internalServerError(scaffolding.req, res, '<img src=x onerror=alert(1)>');
    expect(res.statusCode).eq(statusCode.internalServerError);
    expect(res.content).eq('Internal server error: &lt;img src=x onerror=alert(1)&gt;');
  });

  it('writeApiSuccess returns a json success object', () => {
    responses.writeApiSuccess(res);

    expect(res.headers.get('Content-Type')).eq('application/json');
    expect(JSON.parse(res.content)).deep.eq({success: true, message: 'success'});
  });

  it('writeApiFailure returns a json failure object', () => {
    responses.writeApiFailure(res, 'nope');

    expect(res.headers.get('Content-Type')).eq('application/json');
    expect(JSON.parse(res.content)).deep.eq({success: false, message: 'nope'});
  });

  it('writeApiFailure can set a status code', () => {
    responses.writeApiFailure(res, 'nope', statusCode.internalServerError);

    expect(res.statusCode).eq(statusCode.internalServerError);
    expect(res.headers.get('Content-Type')).eq('application/json');
    expect(JSON.parse(res.content)).deep.eq({success: false, message: 'nope'});
  });
});
