import {expect} from 'chai';
import {PoliticalReform} from '../../../src/server/cards/commission/PoliticalReform';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Resource} from '../../../src/common/Resource';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {cast, finishGeneration, runAllActions} from '../../TestingUtils';
import {SelectParty} from '../../../src/server/inputs/SelectParty';
import {TurmoilUtil} from '../../../src/server/turmoil/TurmoilUtil';
import {IGame} from '../../../src/server/IGame';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {SendDelegateToArea} from '../../../src/server/deferredActions/SendDelegateToArea';
import {PoliticalAgendas} from '../../../src/server/turmoil/PoliticalAgendas';
import {Tag} from '../../../src/common/cards/Tag';

describe('PoliticalReform', () => {
  let card: PoliticalReform;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;
  let turmoil: Turmoil;

  beforeEach(() => {
    card = new PoliticalReform();
    [game, player, player2] = testGame(2, {turmoilExtension: true, skipInitialShuffling: true});
    turmoil = TurmoilUtil.getTurmoil(game);

    // 清空各党派的代表以便于测试
    turmoil.parties.forEach((party) => party.delegates.clear());

    // 设置执政党为科学家党
    const scientists = turmoil.getPartyByName(PartyName.SCIENTISTS);
    turmoil.rulingParty = scientists;

    // 初始化公司卡
    player.playCorporationCard(card);
    runAllActions(game);
  });


  it('第一次派送代表到非执政党触发公司效果', () => {
    // 确认卡牌的data属性初始为undefined
    expect(card.data).to.be.undefined;

    player.megaCredits = 20;

    // 派送代表到热主义者党（非执政党）
    turmoil.sendDelegateToParty(player, PartyName.KELVINISTS, game);
    runAllActions(game);

    // 确认data属性已设置为热主义者党
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.KELVINISTS);

    // 检查是否可以使用热主义者党的政策行动
    expect(card.canAct(player)).to.be.true;

    // 使用公司行动（热主义者党）
    // 玩家支付10MC
    card.action(player);
    runAllActions(game);

    // 检查玩家支付了10MC，获得1电产和1热产
    expect(player.megaCredits).to.equal(10);
    expect(player.production.get(Resource.ENERGY)).to.equal(1);
    expect(player.production.get(Resource.HEAT)).to.equal(1);
  });

  it('第二次派送代表不触发效果', () => {
    // 第一次派送代表
    turmoil.sendDelegateToParty(player, PartyName.KELVINISTS, game);
    runAllActions(game);
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.KELVINISTS);

    // 第二次派送代表到另一个非执政党
    turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
    runAllActions(game);

    // 确认data属性仍然是第一次设置的党派
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.KELVINISTS);
  });

  it('其他玩家派送代表不触发公司效果', () => {
    // player2派送代表到非执政党
    turmoil.sendDelegateToParty(player2, PartyName.KELVINISTS, game);
    runAllActions(game);

    // 确认card.data仍然是undefined
    expect(card.data).to.be.undefined;
  });

  it('派送到当前执政党不触发效果', () => {
    // 派送代表到执政党（科学家党）
    turmoil.sendDelegateToParty(player, PartyName.SCIENTISTS, game);
    runAllActions(game);

    // 确认card.data仍然是undefined
    expect(card.data).to.be.undefined;
  });

  it('触发科学家政党奖励时可以使用行动能力', () => {
    // 设置公司卡数据为科学家党
    card.data = PartyName.SCIENTISTS;

    player.megaCredits = 20;
    // 确认可以使用行动能力
    expect(card.canAct(player)).to.be.true;

    // 使用行动能力
    card.action(player);
    runAllActions(game);

    // 检查科学家党政策效果是否生效
    // 检查玩家支付了10MC
    expect(player.megaCredits).to.equal(10);
    // 检查玩家摸了3张牌
    expect(player.cardsInHand.length).to.equal(3);
  });

  it('通过游戏API发送代表测试', () => {
    // 使用游戏机制发送代表
    const action = new SendDelegateToArea(player, 'Send a delegate');
    const selectParty = cast(action.execute(), SelectParty);

    // 选择非执政党
    selectParty.cb(PartyName.KELVINISTS);
    runAllActions(game);

    // 验证触发了公司效果
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.KELVINISTS);
  });

  it('应该在新的一代重置效果', () => {
    // 第一次派送代表触发效果
    turmoil.sendDelegateToParty(player, PartyName.KELVINISTS, game);
    runAllActions(game);
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.KELVINISTS);

    // 结束当前时代
    finishGeneration(game);
    runAllActions(game);

    // 验证效果已重置
    expect(card.data).to.be.undefined;

    // 新的时代应该能再次触发效果
    turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
    runAllActions(game);
    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.GREENS);
  });

  it('支持议会扩的行动政策', () => {
    const marsAgenda = PoliticalAgendas.getAgenda(turmoil, PartyName.MARS);
    marsAgenda.policyId = 'mp04';

    player.megaCredits = 20;
    const handBefore = player.cardsInHand.length;

    turmoil.sendDelegateToParty(player, PartyName.MARS, game);
    turmoil.sendDelegateToParty(player2, PartyName.GREENS, game);
    turmoil.sendDelegateToParty('NEUTRAL', PartyName.GREENS, game);
    runAllActions(game);

    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.MARS);
    expect(card.canAct(player)).to.be.true;

    card.action(player);
    runAllActions(game);

    expect(player.megaCredits).to.equal(16);
    expect(player.cardsInHand.length).to.equal(handBefore + 1);
    expect(player.cardsInHand[player.cardsInHand.length - 1].tags).to.include(Tag.BUILDING);
  });

  it('支持议会扩的被动政策并在时代结束时移除', () => {
    const marsAgenda = PoliticalAgendas.getAgenda(turmoil, PartyName.MARS);
    marsAgenda.policyId = 'mp03';

    expect(player.getSteelValue()).to.equal(2);

    turmoil.sendDelegateToParty(player, PartyName.MARS, game);
    turmoil.sendDelegateToParty(player2, PartyName.GREENS, game);
    turmoil.sendDelegateToParty('NEUTRAL', PartyName.GREENS, game);
    runAllActions(game);

    expect(PoliticalReform.getPartyName(card.data)).to.equal(PartyName.MARS);
    expect(player.getSteelValue()).to.equal(3);

    finishGeneration(game);
    runAllActions(game);

    expect(card.data).to.be.undefined;
    expect(player.getSteelValue()).to.equal(2);
  });
});
