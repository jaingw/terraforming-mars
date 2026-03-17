import {expect} from 'chai';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {ElectricSheep} from '../../../src/server/cards/eros/ElectricSheep';
import {IGame} from '../../../src/server/IGame';
import {PowerPlant} from '../../../src/server/cards/base/PowerPlant';
import {GeothermalPower} from '../../../src/server/cards/base/GeothermalPower';
import {GiantSpaceMirror} from '../../../src/server/cards/base/GiantSpaceMirror';
import {SolarPower} from '../../../src/server/cards/base/SolarPower';

describe('ElectricSheep', function() {
  let card: ElectricSheep;
  let player: TestPlayer;
  // let other: TestPlayer;
  let game: IGame;

  beforeEach(function() {
    card = new ElectricSheep();
    [game, player] = testGame(2, {skipInitialShuffling: true});
  });

  function addPowerTags() {
    // 打出4张真实能量标签卡牌
    player.playCard(new PowerPlant()); // +1 energy
    player.playCard(new GiantSpaceMirror()); // +3 energy
    player.playCard(new GeothermalPower()); // +2 energy
    player.playCard(new SolarPower()); // +1 energy
  }

  it('canPlay 需要4个能量标签', function() {
    expect(card.canPlay(player)).to.be.false;
    addPowerTags();
    expect(card.canPlay(player)).to.be.true;
  });

  it('play 打出时触发能量产出-1的deferred action', function() {
    addPowerTags();
    player.playCard(card);
    player.production.override({energy: 1});
    // deferred action 应该是 DecreaseAnyProduction
    const input = game.deferredActions.pop()?.execute();
    // 选择自己
    input!.cb(player, 1);
    // 检查能量产出减少
    expect(player.production.energy).to.equal(0);
  });

  it('action 给本牌加1动物资源', function() {
    addPowerTags();
    player.playCard(card);
    const before = card.resourceCount;
    card.action(player);
    expect(card.resourceCount).to.equal(before + 1);
  });

  it('每有1动物资源就加1分', function() {
    addPowerTags();
    player.playCard(card);
    card.action(player);
    card.action(player);
    expect(card.resourceCount).to.equal(2);
    expect(card.getVictoryPoints(player)).to.equal(2);
  });
});
