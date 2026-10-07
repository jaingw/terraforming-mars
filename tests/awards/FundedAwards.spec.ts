import {expect} from 'chai';
import {deserializeFundedAwards, serializeFundedAwards} from '../../src/server/awards/FundedAward';
import {FundedAward, SerializedFundedAward} from '../../src/server/awards/FundedAward';
import {Cultivator} from '../../src/server/awards/Cultivator';
import {Industrialist} from '../../src/server/awards/Industrialist';
import {TestPlayer} from '../TestPlayer';

describe('FundedAwards', () => {
  it('test serialization', () => {
    const bluePlayer = TestPlayer.BLUE.newPlayer();
    const redPlayer = TestPlayer.RED.newPlayer();
    const fundedAwards: Array<FundedAward> = [
      {
        award: new Cultivator(),
        player: bluePlayer,
      }, {
        award: new Industrialist(),
        player: redPlayer,
      },
    ];
    const serialized: Array<SerializedFundedAward> = serializeFundedAwards(fundedAwards);
    expect(serialized).to.deep.eq([
      {award: {name: 'Cultivator'}, player: {id: 'p-blue-id'}},
      {award: {name: 'Industrialist'}, player: {id: 'p-red-id'}},
    ]);
    expect(serialized.every((fundedAward) => {
      return Object.keys(fundedAward).every((key) => key === 'award' || key === 'player');
    })).is.true;

    const cultivator = new Cultivator();
    const industrialist = new Industrialist();
    const deserialized = deserializeFundedAwards(
      serialized,
      [redPlayer, bluePlayer],
      [cultivator, industrialist]);
    expect(deserialized[0].award === cultivator);
    expect(deserialized[0].player === bluePlayer);
    expect(deserialized[1].award === industrialist);
    expect(deserialized[1].player === redPlayer);
  });
});
