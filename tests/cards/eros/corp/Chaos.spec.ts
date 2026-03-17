import {expect} from 'chai';
import {Chaos} from '../../../../src/server/cards/eros/corp/Chaos';
import {testGame, runAllActions, cast} from '../../../TestingUtils';
import {TestPlayer} from '../../../TestPlayer';
import {IGame} from '../../../../src/server/IGame';
import {AndOptions} from '../../../../src/server/inputs/AndOptions';
import {PowerPlant} from '../../../../src/server/cards/base/PowerPlant';
import {Lichen} from '../../../../src/server/cards/base/Lichen';
import {AntiGravityTechnology} from '../../../../src/server/cards/base/AntiGravityTechnology';
import {Tag} from '../../../../src/common/cards/Tag';
import {SearchForLife} from '../../../../src/server/cards/base/SearchForLife';
import {FusionPower} from '../../../../src/server/cards/base/FusionPower';
import {Sponsors} from '../../../../src/server/cards/base/Sponsors';
import {SpaceElevator} from '../../../../src/server/cards/base/SpaceElevator';
import {Mine} from '../../../../src/server/cards/base/Mine';
import {AcquiredCompany} from '../../../../src/server/cards/base/AcquiredCompany';
import {AdvancedAlloys} from '../../../../src/server/cards/base/AdvancedAlloys';
import {InventorsGuild} from '../../../../src/server/cards/base/InventorsGuild';
import {AdaptedLichen} from '../../../../src/server/cards/base/AdaptedLichen';
import {Grass} from '../../../../src/server/cards/base/Grass';


describe('Chaos', () => {
  let card: Chaos;
  let player: TestPlayer;
  let game: IGame;
  let opponent: TestPlayer;
  let player3: TestPlayer;


  beforeEach(() => {
    card = new Chaos();
    [game, player, opponent, player3] = testGame(3, {skipInitialShuffling: true});
  });

  it('solo模式生产阶段应正确分配资源', () => {
    [game, player] = testGame(1, {skipInitialShuffling: true});
    player.playCorporationCard(card);
    // 通过打出3张不同tag的牌模拟distinctCount为3
    player.playCard(new PowerPlant()); // POWER
    player.playCard(new Lichen()); // PLANT
    card.onProductionPhase(player);
    runAllActions(game);

    // 捕获 deferred action
    const input = cast(player.popWaitingFor(), AndOptions);
    // 模拟玩家选择全部分配到 plants
    input.options[3].cb(3); // plants
    input.options[0].cb(0); // megacredits
    input.options[1].cb(0); // steel
    input.options[2].cb(0); // titanium
    input.options[4].cb(0); // energy
    input.options[5].cb(0); // heat
    input.cb(undefined);
    runAllActions(game);
    expect(player.plants).to.eq(3);
    expect(player.megaCredits + player.steel + player.titanium + player.energy + player.heat).to.eq(0);
  });

  it('多人模式生产阶段应正确分配资源', () => {
    player.playCorporationCard(card);
    // 主玩家打出3张Lichen（PLANT），1张PowerPlant（POWER）
    player.playCard(new Lichen()); // PLANT
    player.playCard(new AdaptedLichen()); // PLANT
    player.playCard(new Grass()); // PLANT
    player.playCard(new PowerPlant()); // POWER
    // 对手打出1张Lichen（PLANT），1张PowerPlant（POWER）
    opponent.playCard(new Lichen()); // PLANT
    opponent.playCard(new PowerPlant()); // POWER

    // 主玩家plant产量高于对手，应获得bonus=1
    expect(player.tags.count(Tag.PLANT)).to.be.greaterThan(opponent.tags.count(Tag.PLANT));

    card.onProductionPhase(player);
    runAllActions(game);
    let input = cast(player.popWaitingFor(), AndOptions);

    const resources = {
      megacredits: player.megaCredits,
      steel: player.steel,
      titanium: player.titanium,
      plants: player.plants,
      energy: player.energy,
      heat: player.heat,
    };
    // 只分配1个资源，比如分配到 energy
    input.options[4].cb(1); // energy
    input.options[0].cb(0); // megacredits
    input.options[1].cb(0); // steel
    input.options[2].cb(0); // titanium
    input.options[3].cb(0); // plants
    input.options[5].cb(0); // heat
    input.cb(undefined);
    runAllActions(game);

    expect(player.energy-resources.energy).to.eq(1);
    expect(player.megaCredits-resources.megacredits).to.eq(0);
    expect(player.steel-resources.steel).to.eq(0);
    expect(player.titanium-resources.titanium).to.eq(0);
    expect(player.plants-resources.plants).to.eq(0);
    expect(player.heat-resources.heat).to.eq(0);

    player.playCard(new SearchForLife()); // SCIENCE
    card.onProductionPhase(player);
    runAllActions(game);

    const resources2 = {
      megacredits: player.megaCredits,
      steel: player.steel,
      titanium: player.titanium,
      plants: player.plants,
      energy: player.energy,
      heat: player.heat,
    };

    input = cast(player.popWaitingFor(), AndOptions);
    // 只分配1个资源，比如分配到 energy
    input.options[4].cb(1); // energy
    input.options[5].cb(1); // heat
    input.options[0].cb(0); // megacredits
    input.options[1].cb(0); // steel
    input.options[2].cb(0); // titanium
    input.options[3].cb(0); // plants

    input.cb(undefined);
    runAllActions(game);
    expect(player.energy-resources2.energy).to.eq(1);
    expect(player.heat-resources2.heat).to.eq(1);
    expect(player.megaCredits-resources2.megacredits).to.eq(0);
    expect(player.steel-resources2.steel).to.eq(0);
    expect(player.titanium-resources2.titanium).to.eq(0);
    expect(player.plants-resources2.plants).to.eq(0);
  });


  it('行动时最高生产力可提供wild tag，并可满足卡牌打出前置', () => {
    player.megaCredits = 100;
    player.playCorporationCard(card);
    // 构造一张需要2个power tag的卡牌
    const cardNeed2Power = new FusionPower(); // 需要2个power tag
    // 未提升生产力前不能打出
    expect(player.canPlay(cardNeed2Power)).to.be.false;

    // 通过打出卡牌提升生产力
    player.playCard(new PowerPlant()); // +1 power tag
    // 触发chaos hook ， 更改tags
    player.getActions();
    // 提产量后能打出
    expect(player.canPlay(cardNeed2Power)).to.be.true;
    // 检查Chaos的tags中的wild数量
    const wildCount = card.tags.filter((t) => t === Tag.WILD).length;
    expect(wildCount).to.eq(1); // 具体数量视hook实现
  });


  it('行动时最高生产力可提供wild tag，并可满足卡牌打出前置2', () => {
    player.playCorporationCard(card);
    player.megaCredits = 100;
    // 构造一张需要2个power tag的卡牌
    const cardNeed2Power = new FusionPower(); // 需要2个power tag
    // 未提升生产力前不能打出
    expect(player.canPlay(cardNeed2Power)).to.be.false;

    player.playCard(new Sponsors());
    player.playCard(new SpaceElevator());
    // 检查Chaos的tags中的wild数量
    // 触发chaos hook ， 更改tags
    player.getActions();
    const wildCount = card.tags.filter((t) => t === Tag.WILD).length;
    expect(wildCount).to.eq(2); // 具体数量视hook实现

    // 提产量后能打出
    expect(player.canPlay(cardNeed2Power)).to.be.true;
  });

  it('wild tag可与真实tag组合满足多tag前置 ', () => {
    player.megaCredits = 100;
    player.playCorporationCard(card);
    player.playCard(new PowerPlant());
    player.playCard(new Sponsors());
    player.playCard(new SpaceElevator());
    player.playCard(new Mine());

    player.playCard(new SearchForLife());
    player.playCard(new AdvancedAlloys());
    player.getActions();

    const cardNeed7Science = new AntiGravityTechnology(); // 需要7个 science tag
    // 未提升生产力前不能打出
    expect(player.canPlay(cardNeed7Science)).to.be.false;

    player.playCard(new InventorsGuild());
    player.getActions();
    expect(player.canPlay(cardNeed7Science)).to.be.true;
  });

  it('多玩家场景下chaos行动阶段wild tag数量应等于独占第一的生产力种类数', () => {
    // 初始化三人局
    player.playCorporationCard(card);

    // 玩家1打出PowerPlant（energy产量+1）、Sponsors（钱产+2）、SpaceElevator（钢产+1）、Mine（钢产+1）
    player.playCard(new PowerPlant()); // energy+1
    player.playCard(new Sponsors()); // megacredits+2
    player.playCard(new SpaceElevator()); // titanium+1
    player.playCard(new Mine()); // steel+1
    // 玩家2打出PowerPlant（energy+1）、Mine（steel+1）
    opponent.playCard(new PowerPlant());
    // 玩家3打出Sponsors（钱产+2）、SpaceElevator（titanium+1）
    player3.playCard(new Sponsors());
    player3.playCard(new SpaceElevator());

    // 现在：
    // player1: megacredits=2, steel=1, energy=1, titanium=1
    // player2: energy=1
    // player3: megacredits=2, titanium=1
    player.getActions();// 触发chaos hook ， 更改tags
    expect(card.tags.filter((t) => t === Tag.WILD).length).to.eq(1);

    // 玩家1再打出一张 AcquiredCompany (钱产+3) ，megacredits=5
    player.playCard(new AcquiredCompany());
    player.getActions();
    expect(card.tags.filter((t) => t === Tag.WILD).length).to.eq(2);

    // 玩家2再打出一张Mine（steel+1），player1和player2钢产并列2
    opponent.playCard(new Mine());
    player.getActions();
    expect(card.tags.filter((t) => t === Tag.WILD).length).to.eq(1);
  });
});
