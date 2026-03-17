import {expect} from 'chai';
import {IdoFront} from '../../../../src/server/cards/eros/corp/IdoFront';
import {CardName} from '../../../../src/common/cards/CardName';
import {testGame} from '../../../TestingUtils';
import {TestPlayer} from '../../../TestPlayer';
import {IGame} from '../../../../src/server/IGame';
import {PowerPlant} from '../../../../src/server/cards/base/PowerPlant';
import {Lichen} from '../../../../src/server/cards/base/Lichen';
import {Tag} from '../../../../src/common/cards/Tag';
import {ResearchCoordination} from '../../../../src/server/cards/prelude/ResearchCoordination';
import {ImportedGHG} from '../../../../src/server/cards/base/ImportedGHG';
import {GeothermalPower} from '../../../../src/server/cards/base/GeothermalPower';
import {SolarWindPower} from '../../../../src/server/cards/base/SolarWindPower';
import {SolarPower} from '../../../../src/server/cards/base/SolarPower';


describe('IdoFront', () => {
  let card: IdoFront;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new IdoFront();
    [game, player] = testGame(1, {skipInitialShuffling: true});
  });

  it('首次打出tag无奖励，重复tag奖励，流程贴合真实打牌', () => {
    player.playCorporationCard(card);
    // 第一次打出 POWER tag
    player.playCard(new PowerPlant());
    expect(player.megaCredits).to.eq(0);
    // 再次打出 POWER tag
    player.playCard(new GeothermalPower());
    expect(player.megaCredits).to.eq(4);
    // 打出 Lichen (PLANT tag)
    player.playCard(new Lichen());
    expect(player.megaCredits).to.eq(4);
    // 打出 Solar Wind Power (POWER SPACE SCIENCE tag)
    player.playCard(new SolarWindPower());
    expect(player.megaCredits).to.eq(6);
    // 再次打出 PowerPlant（POWER tag 已有）
    player.playCard(new SolarPower());
    expect(player.megaCredits).to.eq(10);
  });

  it('打出纯wild tag卡牌不奖励', () => {
    player.playCorporationCard(card);
    // 真实流程获得wild tag：打出ResearchCoordination
    player.playCard(new ResearchCoordination());
    expect(player.megaCredits).to.eq(0);
  });

  it('打出事件牌tag不计入allTags', () => {
    player.playCorporationCard(card);
    // 用真实事件牌ImportedGHG（带EVENT类型）
    player.playCard(new ImportedGHG());
    expect(card.allTags.has(Tag.POWER)).to.be.false;
  });

  it('已有wild tag时，打任意tag牌也能触发奖励', () => {
    player.playCorporationCard(card);
    // 先打出一张真实带wild tag的牌
    player.playCard(new ResearchCoordination());
    // 再打出一张POWER tag牌，正常不会奖励，但有wild tag应奖励
    player.playCard(new PowerPlant());
    expect(player.megaCredits).to.eq(2);
  });


  it('应支持序列化/反序列化后allTags一致', () => {
    player.playCorporationCard(card);
    player.playCard(new PowerPlant());
    const data = game.serialize();
    const game2 = game.loadFromJSON(data);
    const player2 = game2.players[0];
    const card2 = player2.playedCards.get(CardName.IDO_FRONT)! as IdoFront;
    expect(card2).to.exist;
    expect(card2.allTags.has(Tag.POWER)).to.be.true;
  });
});
