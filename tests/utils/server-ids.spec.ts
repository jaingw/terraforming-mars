import {expect} from 'chai';
import {generateRandomId} from '../../src/server/utils/server-ids';

describe('server ids', () => {
  it('generates unique ids with the requested prefix', () => {
    const ids = new Set<string>();
    for (let idx = 0; idx < 5000; idx++) {
      const id = generateRandomId('g');
      expect(id.startsWith('g')).is.true;
      expect(id).matches(/^g[0-9a-f]{12}$/);
      ids.add(id);
    }
    expect(ids.size).eq(5000);
  });
});
