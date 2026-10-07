import {expect} from 'chai';
import {BorderCheckpoint} from '../../../src/server/cards/eros/BorderCheckpoint';
import {CardName} from '../../../src/common/cards/CardName';
import {cast, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Research} from '../../../src/server/cards/base/Research';
import {IGame} from '../../../src/server/IGame';
import {SelectCard} from '../../../src/server/inputs/SelectCard';


describe('BorderCheckpoint', () => {
  let card: BorderCheckpoint;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new BorderCheckpoint();
    [game, player] = testGame(2, {skipInitialShuffling: true});
  });

  function setEnergyProduction(val: number) {
    player.production.override({energy: val});
  }

  it('should not be playable with insufficient energy production', () => {
    setEnergyProduction(0);
    expect(card.canPlay(player)).to.be.false;
  });

  it('should not be playable if no border spaces available', () => {
    setEnergyProduction(1);
    // 占满所有边界地块
    const all = game.board.getAvailableSpacesOnLand(player).filter((s) => s.x === 0 || s.x === 8 || s.y === 0 || s.y === 8 || s.x === Math.abs(4-s.y));
    for (const s of all) {
      game.addCity(player, s);
    }
    expect(card.canPlay(player)).to.be.false;
  });

  it('should be playable with enough energy and border space, and place city', () => {
    setEnergyProduction(1);
    const before = player.production.energy;
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces.length).to.be.greaterThan(0);
    select.cb(select.spaces[0]);
    runAllActions(game);
    expect(game.board.getCities().some((c) => c.player === player)).to.be.true;
    expect(player.production.energy).to.eq(before - 1);
    expect(player.production.megacredits).to.eq(2);
    expect(player.playedCards.get(CardName.BORDER_CHECKPOINT)).to.exist;
  });

  it('should not act if discard pile is empty', () => {
    expect(card.canAct(player)).to.be.false;
  });

  it('should act and draw a card from discard pile', () => {
    // 丢弃一张牌到弃牌堆
    const research = new Research();
    game.projectDeck.discard(research);
    expect(card.canAct(player)).to.be.true;
    card.action(player);
    runAllActions(game);
    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard).to.exist;
    selectCard.cb([research]);
    runAllActions(game);
    expect(player.cardsInHand.some((c: any) => c.name === CardName.RESEARCH)).to.be.true;
    expect(game.projectDeck.discardPile.length).to.eq(0);
  });

  it('should persist after serialization/deserialization', () => {
    setEnergyProduction(1);
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    runAllActions(game);
    const research = new Research();
    game.projectDeck.discard(research);
    expect(game.projectDeck.discardPile.length).to.eq(1);
    card.action(player);
    runAllActions(game);
    expect(game.projectDeck.discardPile.length).to.eq(0);
    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard).to.exist;
    selectCard.cb([research]);
    runAllActions(game);
    expect(game.projectDeck.discardPile.length).to.eq(0);
    const data = game.serialize();
    const game2 = game.loadFromJSON(data);
    const player2 = game2.players[0];
    expect(player2.playedCards.get(CardName.BORDER_CHECKPOINT)).to.exist;
    expect(player2.cardsInHand.some((c: any) => c.name === CardName.RESEARCH)).to.be.true;
  });
});
