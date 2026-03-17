import {expect} from 'chai';
import {WeylandYutani} from '../../../src/server/cards/commission/WeylandYutani';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {IGame} from '../../../src/server/IGame';
import {Research} from '../../../src/server/cards/base/Research';
import {SearchForLife} from '../../../src/server/cards/base/SearchForLife';
import {Leavitt} from '../../../src/server/cards/community/Leavitt';
import {HabitatMarte} from '../../../src/server/cards/pathfinders/HabitatMarte';
import {AgroDrones} from '../../../src/server/cards/pathfinders/AgroDrones';
import {MartianCulture} from '../../../src/server/cards/pathfinders/MartianCulture';

describe('WeylandYutani', () => {
  let card: WeylandYutani;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new WeylandYutani();
    [game, player, player2] = testGame(2, {skipInitialShuffling: true});
    player.megaCredits = 100;
    player2.megaCredits = 100;
  });


  it('初始行动应抽取一张带科学标签的卡牌', () => {
    // 记录初始手牌数量
    const initialHandSize = player.cardsInHand.length;

    player.playCorporationCard(card);

    // 执行初始行动
    player.defer(card.initialAction(player));
    runAllActions(game);

    // 验证手牌增加了1张
    expect(player.cardsInHand.length).to.eq(initialHandSize + 1);

    // 验证最后一张是科学标签卡
    const drawnCard = player.cardsInHand[player.cardsInHand.length - 1];
    expect(drawnCard.tags).to.include(Tag.SCIENCE);

    expect(player.megaCredits).to.eq(100 + 2);
  });

  it('其他玩家打出科学标签卡时，双方都获得MC', () => {
    // 玩家1打出公司卡
    player.playCorporationCard(card);
    runAllActions(game);

    // 记录初始MC
    const initialMC1 = player.megaCredits;
    const initialMC2 = player2.megaCredits;

    // 玩家2打出科学标签卡
    const scienceCard = new Research();
    player2.playCard(scienceCard);

    // 验证双方都获得了MC（对于每个科学标签）
    // Research有2个科学标签
    expect(player.megaCredits).to.eq(initialMC1 + 2); // 公司卡持有者获得2MC
    expect(player2.megaCredits).to.eq(initialMC2 + 2); // 打出科学卡的玩家获得2MC
  });

  it('同一玩家打出科学标签卡时，该玩家获得两次MC', () => {
    // 玩家1打出公司卡
    player.playCorporationCard(card);
    runAllActions(game);

    // 记录初始MC
    const initialMC = player.megaCredits;

    // 玩家1打出科学标签卡
    const scienceCard = new SearchForLife(); // 1个科学标签
    player.playCard(scienceCard);

    // 验证玩家1获得了额外的MC作为打出科学卡的玩家，也获得了作为公司卡持有者的MC
    expect(player.megaCredits).to.eq(initialMC + 2); // 1MC作为打出者 + 1MC作为公司卡持有者
  });


  it('Leavitt殖民地获得科学标志时，相关玩家获得MC', () => {
    // 玩家1打出公司卡
    player.playCorporationCard(card);
    runAllActions(game);

    // 记录初始MC
    const initialMC = player.megaCredits;

    const leavitt = new Leavitt();
    leavitt.addColony(player);

    runAllActions(game);

    expect(player.megaCredits).to.eq(initialMC + 2);


    const initialMC2 = player2.megaCredits;
    const initialMC3 = player.megaCredits;
    leavitt.addColony(player2);

    runAllActions(game);
    expect(player.megaCredits).to.eq(initialMC3 + 1);
    expect(player2.megaCredits).to.eq(initialMC2 + 1);
  });

  describe('WeylandYutani与HabitatMarte联动', () => {
    it('单人场景：同时拥有WeylandYutani和HabitatMarte时，打出Mars标签卡触发效果', () => {
      // 玩家1打出WeylandYutani和HabitatMarte
      player.playCorporationCard(card);
      const habitatMarte = new HabitatMarte();
      player.playedCards.push(habitatMarte);
      runAllActions(game);

      // 记录初始MC
      const initialMC = player.megaCredits;

      // 玩家1打出Mars标签卡
      const marsCard = new AgroDrones(); // 有1个Mars标签
      player.playCard(marsCard);

      expect(player.megaCredits).to.eq(initialMC + 2);

      // 玩家1打出2个 Mars标签卡
      player.playCard(new MartianCulture);
      expect(player.megaCredits).to.eq(initialMC + 2 + 4);
    });

    it('多人场景：玩家1有WeylandYutani，玩家2有HabitatMarte并打出Mars标签卡', () => {
      // 玩家1打出WeylandYutani
      player.playCorporationCard(card);

      // 玩家2获得HabitatMarte
      const habitatMarte = new HabitatMarte();
      player2.playedCards.push(habitatMarte);
      runAllActions(game);

      // 记录初始MC
      const initialMC1 = player.megaCredits;
      const initialMC2 = player2.megaCredits;

      // 玩家2打出Mars标签卡
      const marsCard = new AgroDrones(); // 有1个Mars标签
      player2.playCard(marsCard);

      expect(player.megaCredits).to.eq(initialMC1 + 1);
      expect(player2.megaCredits).to.eq(initialMC2 + 1);
    });
  });
});
