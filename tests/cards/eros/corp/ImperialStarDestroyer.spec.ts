import {expect} from 'chai';
import {ImperialStarDestroyer} from '../../../../src/server/cards/eros/corp/ImperialStarDestroyer';
import {runAllActions, testGame} from '../../../TestingUtils';
import {TestPlayer} from '../../../TestPlayer';
import {IGame} from '../../../../src/server/IGame';
import {Luna} from '../../../../src/server/colonies/Luna';


describe('ImperialStarDestroyer', () => {
  let card: ImperialStarDestroyer;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new ImperialStarDestroyer();
    [game, player] = testGame(2, {coloniesExtension: true, skipInitialShuffling: true});
  });

  it('打出时应增加舰队规模', () => {
    const before = player.colonies.getFleetSize();
    player.playCorporationCard(card);
    expect(player.colonies.getFleetSize()).to.eq(before + 1);
  });

  it('双倍贸易奖励：与殖民地贸易时应获得双倍奖励', () => {
    player.playCorporationCard(card);

    // 初始化殖民地Luna
    const luna = new Luna();
    luna.isActive = true;
    game.colonies.push(luna);
    // 玩家成为殖民地所有者
    luna.colonies.push(player);
    luna.trackPosition = 6;//  17mc
    // 记录初始钱资源
    const before = player.megaCredits;
    // 进行贸易
    luna.trade(player);
    runAllActions(game);
    const after = player.megaCredits;
    expect(after - before).to.eq(17+2+2);
  });
});
