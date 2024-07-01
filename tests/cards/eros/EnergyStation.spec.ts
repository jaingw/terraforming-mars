import {expect} from 'chai';
import {cast} from '../../TestingUtils';
import {SmallAsteroid} from '../../../src/server/cards/promo/SmallAsteroid';
import {Game} from '../../../src/server/Game';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {EnergyStation} from '../../../src/server/cards/eros/EnergyStation';
import {Resource} from '../../../src/common/Resource';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {runAllActions} from '../../TestingUtils';

describe('EnergyStation', function() {
  let card: EnergyStation;
  let player: TestPlayer;

  beforeEach(function() {
    card = new EnergyStation();
    [/* game */, player] = testGame(2);
  });

  it('Game does not have global owner', function() {
    expect(player.game.energyStationOwner).is.undefined;
  });

  it('Game has global owner after playing this card', function() {
    player.playCard(card);
    // player.playedCards.push(card);
    expect(player.game.energyStationOwner).to.eq(player);
  });

  it('Can gain heat if another player is removed plants', function() {
    // 一开始全局没有这个记录
    // 先打出这张牌
    player.playCard(card);
    expect(player.game.energyStationOwner).to.eq(player);

    // player.playedCards.push(card);
    expect(player.heat).to.eq(0);

    const player2 = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, player2], player);
    player2.plants = 1;

    // 触发效果,移除另一个玩家植物
    const smallAsteroid = new SmallAsteroid();
    smallAsteroid.play(player);
    // Choose Remove 1 plant option
    const orOptions = cast(player.game.deferredActions.peek()!.execute(), OrOptions);
    orOptions.options[0].cb([player2]);
    expect(player2.plants).to.eq(0);

    // runAllActions(player.game);


    // expect(card.canPlay(player)).is.true;
    expect(player.heat).to.eq(2);
  });

  it('Cannot gain heat if himself is removed plants', function() {
    // 先打出这张牌
    player.playCard(card);
    expect(player.heat).to.eq(0);

    const player2 = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, player2], player);
    player.plants = 1;

    // 触发效果,移除另一个玩家植物
    const smallAsteroid = new SmallAsteroid();
    smallAsteroid.play(player2);
    // Choose Remove 1 plant option
    const orOptions = cast(player.game.deferredActions.peek()!.execute(), OrOptions);
    orOptions.options[0].cb([player]);

    // runAllActions(player.game);
    expect(player.heat).to.eq(0);
  });

  it('Can not act', function() {
    player.stock.add(Resource.HEAT, 1);
    expect(card.canAct(player)).is.not.true;
  });

  it('Can act when sufficient Heat resources available', function() {
    player.stock.add(Resource.HEAT, 2);
    expect(card.canAct(player)).is.true;
  });

  it('Can act when sufficient Plant resources available', function() {
    player.stock.add(Resource.PLANTS, 1);
    expect(card.canAct(player)).is.true;
  });

  it('Should act and provide options when resources are available', function() {
    player.stock.add(Resource.HEAT, 2);
    player.stock.add(Resource.PLANTS, 1);
    expect(card.canAct(player)).is.true;

    cast(card.action(player), OrOptions);
  });

  it('Should act when sufficient Heat resources available', function() {
    player.stock.add(Resource.HEAT, 8);
    const selectAmount = cast(card.action(player), SelectAmount);
    expect(selectAmount.max).eq(4);
    const next = selectAmount.cb(3);
    expect(next).is.undefined;
    runAllActions(player.game);
    cast(player.getWaitingFor(), undefined);
    expect(player.heat).eq(2);
    expect(player.plants).eq(3);
  });

  it('Should act when sufficient Plant resources available', function() {
    player.stock.add(Resource.PLANTS, 8);
    const selectAmount = cast(card.action(player), SelectAmount);
    expect(selectAmount.max).eq(8);
    const next = selectAmount.cb(1);
    expect(next).is.undefined;
    runAllActions(player.game);
    cast(player.getWaitingFor(), undefined);
    expect(player.heat).eq(2);
    expect(player.plants).eq(7);
  });
});
