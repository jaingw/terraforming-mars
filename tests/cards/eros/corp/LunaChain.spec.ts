import {expect} from 'chai';
import {LunaChain} from '../../../../src/server/cards/eros/corp/LunaChain';
import {testGame} from '../../../TestGame';
import {TestPlayer} from '../../../TestPlayer';
import {MicroMills} from '../../../../src/server/cards/base/MicroMills';
import {BusinessNetwork} from '../../../../src/server/cards/base/BusinessNetwork';
import {MineralDeposit} from '../../../../src/server/cards/base/MineralDeposit';
import {Payment} from '../../../../src/common/inputs/Payment';
import {Greenhouses} from '../../../../src/server/cards/base/Greenhouses';
import {OptimalAerobraking} from '../../../../src/server/cards/base/OptimalAerobraking';
import {EnergyMarket} from '../../../../src/server/cards/promo/EnergyMarket';

describe('LunaChain', () => {
  let card: LunaChain;
  let player: TestPlayer;

  beforeEach(() => {
    card = new LunaChain();
    const [_game, _player] = testGame(1, {skipInitialShuffling: true});
    player = _player;
    player.playCorporationCard(card);
    player.megaCredits = 100; // 充足资金
  });

  it('费用差为0时奖励3', () => {
    const cardA = new MicroMills(); // 费用3
    const cardB = new EnergyMarket(); // 费用3
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 - 3); // 首次无奖励
    player.playCard(cardB, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 - 3); // 差值0，奖励3
  });

  it('费用差为1时奖励2', () => {
    const cardA = new MicroMills(); // 费用3
    const cardB = new BusinessNetwork(); // 费用4
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 - 3 );
    player.playCard(cardB, Payment.of({megaCredits: 4}));
    expect(player.megaCredits).to.eq(100 - 3 - 4 + 2); // 差值1，奖励2
  });

  it('费用差为2时奖励1', () => {
    const cardA = new MicroMills(); // 费用3
    const cardB = new MineralDeposit(); // 费用5
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 - 3);
    player.playCard(cardB, Payment.of({megaCredits: 5}));
    expect(player.megaCredits).to.eq(100 - 3 - 5 + 1); // 差值2，奖励1
  });

  it('费用差为3时无奖励', () => {
    const cardA = new MicroMills(); // 费用3
    const cardB = new Greenhouses(); // 费用6
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 - 3 );
    player.playCard(cardB, Payment.of({megaCredits: 6}));
    expect(player.megaCredits).to.eq(100 - 3 - 6 ); // 差值3，无奖励
  });

  it('费用差为4时无奖励', () => {
    const cardA = new MicroMills(); // 费用3
    const cardB = new OptimalAerobraking(); // 费用7
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100 -3 );
    player.playCard(cardB, Payment.of({megaCredits: 7}));
    expect(player.megaCredits).to.eq(100 -3 - 7); // 差值4，无奖励
  });

  it('多次连续触发奖励累计', () => {
    const cardA = new MicroMills(); // 3
    const cardB = new BusinessNetwork(); // 4
    const cardC = new MineralDeposit(); // 5
    player.playCard(cardA, Payment.of({megaCredits: 3}));
    expect(player.megaCredits).to.eq(100-3 );
    player.playCard(cardB, Payment.of({megaCredits: 4}));
    expect(player.megaCredits).to.eq(100 -3 - 4 + 2);
    player.playCard(cardC, Payment.of({megaCredits: 5}));
    expect(player.megaCredits).to.eq(100 -3 - 4 - 5 + 2 + 2); // 4-3=1奖励2, 5-4=1奖励2
  });
});
