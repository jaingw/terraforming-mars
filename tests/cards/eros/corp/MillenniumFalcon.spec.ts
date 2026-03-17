import {expect} from 'chai';
import {MillenniumFalcon} from '../../../../src/server/cards/eros/corp/MillenniumFalcon';
import {testGame} from '../../../TestGame';
import {TestPlayer} from '../../../TestPlayer';
import {runAllActions} from '../../../TestingUtils';
import {IGame} from '../../../../src/server/IGame';
import {ColonyName} from '../../../../src/common/colonies/ColonyName';
import {SelectColony} from '../../../../src/server/inputs/SelectColony';

describe('MillenniumFalcon', () => {
  let card: MillenniumFalcon;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new MillenniumFalcon();
    [game, player] = testGame(2, {
      coloniesExtension: true,
      customColoniesList: [ColonyName.CALLISTO, ColonyName.CERES, ColonyName.TITANIA, ColonyName.LUNA, ColonyName.IO],
      skipInitialShuffling: true,
      communityCardsOption: true,
    });
  });


  it('初始行动应放置一个殖民地', () => {
    // 执行初始行动
    player.playCorporationCard(card);
    player.defer(card.initialAction(player));
    runAllActions(game);

    // 验证等待输入是选择殖民地
    const input = player.popWaitingFor();
    expect(input).to.exist;
    expect(input!.type).to.eq('colony');

    // 选择第一个殖民地
    const selectColony = input as SelectColony;
    const callisto = selectColony.colonies.find((colony) => colony.name === ColonyName.CALLISTO)!;
    expect(callisto).to.exist;
    selectColony.cb(callisto);
    runAllActions(game);

    // 验证殖民地已被放置
    expect(callisto.colonies.includes(player)).to.be.true;
  });


  it('行动：应能将殖民地从一个地方移动到另一个地方（不包括TITANIA）', () => {
    // 打出公司卡并完成初始行动
    player.playCorporationCard(card);
    runAllActions(game);

    // 在CALLISTO建立一个殖民地
    const callisto = game.colonies.find((colony) => colony.name === ColonyName.CALLISTO)!;
    expect(callisto).to.exist;
    callisto.colonies.push(player);

    // 验证现在可以执行行动
    expect(card.canAct(player)).to.be.true;

    // 执行行动
    card.action(player);
    runAllActions(game);

    // 验证第一个输入是选择要移动的殖民地
    const moveFromInput = player.popWaitingFor();
    expect(moveFromInput).to.exist;
    expect(moveFromInput!.type).to.eq('colony');

    // 验证可选择的殖民地中不包括TITANIA
    const moveFromSelectColony = moveFromInput as SelectColony;
    const availableColonies = moveFromSelectColony.colonies.map((colony) => colony.name);
    expect(availableColonies).to.include(ColonyName.CALLISTO);
    expect(availableColonies).to.not.include(ColonyName.TITANIA);

    // 选择CALLISTO作为起始殖民地
    moveFromSelectColony.cb(callisto);
    runAllActions(game);

    // 验证第二个输入是选择目标殖民地
    const moveToInput = player.popWaitingFor();
    expect(moveToInput).to.exist;
    expect(moveToInput!.type).to.eq('colony');

    // 验证可选择的目标殖民地中不包括TITANIA和已有殖民地的CALLISTO
    const moveToSelectColony = moveToInput as SelectColony;
    const targetColonies = moveToSelectColony.colonies.map((colony) => colony.name);
    expect(targetColonies).to.include(ColonyName.CERES);
    expect(targetColonies).to.not.include(ColonyName.CALLISTO); // 已经有殖民地，不能选择
    expect(targetColonies).to.not.include(ColonyName.TITANIA);

    // 选择CERES作为目标殖民地
    const ceres = moveToSelectColony.colonies.find((colony) => colony.name === ColonyName.CERES)!;
    expect(ceres).to.exist;
    moveToSelectColony.cb(ceres);
    runAllActions(game);

    // 验证殖民地已被移动
    expect(callisto.colonies.includes(player)).to.be.false;
    expect(ceres.colonies.includes(player)).to.be.true;
  });
});
