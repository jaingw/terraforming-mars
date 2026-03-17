import {expect} from 'chai';
import {MartianFencing} from '../../../src/server/cards/eros/MartianFencing';
import {testGame, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {cast} from '../../TestingUtils';
import {EROS_CARD_MANIFEST} from '../../../src/server/cards/eros/ErosCardManifest';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';


describe('MartianFencing', () => {
  let card: MartianFencing;
  let player: TestPlayer;
  let game: IGame;
  const erosCardNames = Object.keys(EROS_CARD_MANIFEST.projectCards);

  beforeEach(() => {
    card = new MartianFencing();
    [game, player] = testGame(2, {skipInitialShuffling: true, erosCardsOption: true});
    player.megaCredits = 100; // 确保有钱买牌
  });

  it('play - 能顺序找到牌堆中的 Eros 卡牌', () => {
    const initialMegaCredits = player.megaCredits;
    game.cardDrew = false;
    expect(player.cardsInHand).to.have.lengthOf(0);
    player.playCard(card);
    runAllActions(game);

    const chooseMaybe = cast(player.popWaitingFor(), SelectCard);
    expect(chooseMaybe).to.not.be.undefined;
    const choose = chooseMaybe!;

    // deferred action 只包含一张卡，且 name 属于 Eros 卡池
    expect(choose.cards).to.have.lengthOf(1);
    expect(erosCardNames).to.include(choose.cards[0].name);

    // 模拟玩家选择买入卡牌
    (choose as any).cb([choose.cards[0]]);
    runAllActions(game);

    // 验证卡牌已添加到玩家手牌
    expect(player.cardsInHand.map((c) => c.name)).to.include(choose.cards[0].name);

    // 验证玩家支付了3MC
    expect(player.megaCredits).to.equal(initialMegaCredits - 3);

    expect(game.cardDrew).is.true;
  });

  it('play - 牌堆中没有 Eros 卡牌时不触发 deferred action', () => {
    // 移除所有 Eros 卡牌
    game.cardDrew = false;
    game.projectDeck.drawPile = game.projectDeck.drawPile.filter((c) => !erosCardNames.includes(c.name));
    expect(game.projectDeck.drawPile.find((c) => erosCardNames.includes(c.name))).to.be.undefined;
    expect(player.cardsInHand).to.have.lengthOf(0);
    player.playCard(card);
    runAllActions(game);
    // 不应有等待的 ChooseCards
    const chooseMaybe = player.popWaitingFor();
    expect(chooseMaybe).to.be.undefined;
    // 手牌无变化
    expect(player.cardsInHand).to.have.lengthOf(0);
    expect(game.cardDrew).is.false;
  });

  it('play - deferred action 选择不买入 Eros 卡牌', () => {
    const initialMegaCredits = player.megaCredits;
    game.cardDrew = false;
    player.playCard(card);
    runAllActions(game);

    const chooseMaybe = cast(player.popWaitingFor(), SelectCard);
    expect(chooseMaybe).to.exist;
    const choose = chooseMaybe!;

    expect(choose.cards).to.have.lengthOf(1);
    expect(erosCardNames).to.include(choose.cards[0].name);

    // 模拟玩家不买入卡牌
    (choose as any).cb([]);
    runAllActions(game);

    // 验证卡牌未添加到玩家手牌
    expect(player.cardsInHand.map((c) => c.name)).to.not.include(choose.cards[0].name);

    // 验证玩家未支付MC
    expect(player.megaCredits).to.equal(initialMegaCredits);

    expect(game.cardDrew).is.true;
  });
});
