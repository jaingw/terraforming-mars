import {expect} from 'chai';
import {GreenRing} from '../../../src/server/cards/commission/GreenRing';
import {CardName} from '../../../src/common/cards/CardName';
import {cast, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {Research} from '../../../src/server/cards/base/Research';
import {AICentral} from '../../../src/server/cards/base/AICentral';
import {UrbanizedArea} from '../../../src/server/cards/base/UrbanizedArea';
import {AstraMechanica} from '../../../src/server/cards/promo/AstraMechanica';
import {IGame} from '../../../src/server/IGame';
import {SearchForLife} from '../../../src/server/cards/base/SearchForLife';
import {AdvancedAlloys} from '../../../src/server/cards/base/AdvancedAlloys';
import {Resource} from '../../../src/common/Resource';
import {Payment} from '../../../src/common/inputs/Payment';
import {Crashlanding} from '../../../src/server/cards/pathfinders/Crashlanding';


describe('GreenRing', () => {
  let card: GreenRing;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new GreenRing();
    [game, player] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
  });

  // it('should start with 53 M€ and draw 2 green cards', () => {
  //   expect(card.startingMegaCredits).to.eq(53);
  //   // 模拟公司初始抽牌流程
  //   player.playCorporationCard(card);
  //   runAllActions(game);
  //   // 断言手牌多了2张绿卡（AUTOMATED）
  //   expect(player.cardsInHand.length).to.eq(2);
  //   expect(player.cardsInHand.filter(c => c.type === CardType.AUTOMATED).length).to.eq(2);
  // });

  it('should not act if no valid green/blue card to recycle', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    expect(card.canAct(player)).to.be.false;
  });

  it('should act and recycle a valid green card (Research)', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    // 先打出一张绿卡 Research
    const research = new Research();
    player.playCard(research);
    runAllActions(game);
    expect(player.playedCards.get(research.name)).to.deep.eq(research);
    // 触发 GreenRing 行动
    expect(card.canAct(player)).to.be.true;
    const select = cast(card.action(player), SelectProjectCardToPlay);
    // 只应有 research 可选
    expect(select.cards.length).to.eq(1);
    expect(select.cards[0].name).to.eq(CardName.RESEARCH);

    const cardNumber = player.cardsInHand.length;
    // 回收并重新打出
    select.process({
      type: 'projectCard',
      payment: Payment.of({megaCredits: 11}),
      card: research.name,
    });
    runAllActions(game);
    // 重新打出后依然在 playedCards
    expect(player.playedCards.get(research.name)).to.be.undefined;
    expect(player.removedFromPlayCards).to.include(research);
    expect(game.projectDeck.discardPile).to.not.include(research);
    expect(player.cardsInHand.length).to.eq(cardNumber + 2);
  });

  it('should remove replayed cards from the discard pile', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    const research = new Research();
    player.playCard(research);
    runAllActions(game);

    const select = cast(card.action(player), SelectProjectCardToPlay);
    select.process({
      type: 'projectCard',
      payment: Payment.of({megaCredits: 11}),
      card: research.name,
    });
    game.projectDeck.discard(research);
    runAllActions(game);

    expect(player.playedCards.get(research.name)).to.be.undefined;
    expect(player.removedFromPlayCards).to.include(research);
    expect(game.projectDeck.discardPile).to.not.include(research);
  });

  it('should act and recycle a valid blue card (AICentral)', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    player.megaCredits = 100;
    player.production.add(Resource.ENERGY, 1);
    const aiCentral = new AICentral();
    // 满足条件：3科学标签
    player.playCard(new Research());
    player.playCard(new SearchForLife());
    player.playCard(new AdvancedAlloys());
    runAllActions(game);
    player.playCard(aiCentral);
    runAllActions(game);

    // 没有电能产量时不能打出
    expect(player.playedCards.get(aiCentral.name)).to.deep.eq(aiCentral);
    expect(card.canAct(player)).to.be.true;
    const select2 = cast(card.action(player), SelectProjectCardToPlay);
    expect(select2.cards.some((c) => c.name === aiCentral.name)).to.be.false;

    // 有电能产量时可以打出
    player.popWaitingFor();
    player.production.add(Resource.ENERGY, 1);
    const select = cast(card.action(player), SelectProjectCardToPlay);
    expect(select.cards.some((c) => c.name === aiCentral.name)).to.be.true;

    const cardNumber = player.cardsInHand.length;
    select.process({
      type: 'projectCard',
      payment: Payment.of({megaCredits: 21}),
      card: aiCentral.name,
    });

    // select.cb(aiCentral);
    runAllActions(game);
    expect(player.megaCredits).to.eq(79); // AICentral 21
    expect(player.playedCards.get(aiCentral.name)).to.be.undefined;
    expect(player.removedFromPlayCards).to.include(aiCentral);
    expect(game.projectDeck.discardPile).to.not.include(aiCentral);
    expect(player.cardsInHand.length).to.eq(cardNumber );
  });

  it('should not replay events like Crashlanding', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    player.playedCards.push(new Crashlanding());

    expect(card.canAct(player)).to.be.false;
  });

  it('should not recycle special tile cards', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    // UrbanizedArea 是绿卡且带特殊板块
    const urbanized = new UrbanizedArea();
    player.playCard(urbanized);
    runAllActions(game);
    expect(card.canAct(player)).to.be.false;
  });

  it('should not recycle Astra Mechanica', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    const astra = new AstraMechanica();
    player.playCard(astra);
    runAllActions(game);
    expect(card.canAct(player)).to.be.false;
  });

  it('should handle cannot afford to replay card', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    const research = new Research();
    player.playCard(research);
    runAllActions(game);
    player.megaCredits = 0; // 不足以重打
    expect(card.canAct(player)).to.be.false;
  });

  it('should keep state after serialize/deserialize', () => {
    player.playCorporationCard(card);
    runAllActions(game);
    const research = new Research();
    player.playCard(research);
    runAllActions(game);
    // 序列化
    const data = game.serialize();
    // @ts-ignore
    const game2 = game.loadFromJSON(data);
    const player2 = game2.players[0] as TestPlayer;
    const card2 = player2.playedCards.get(CardName.GREENRING) as GreenRing;
    expect(card2.name).to.eq(CardName.GREENRING);
    expect(player2.playedCards.get(research.name)).to.not.be.undefined;
  });
});
