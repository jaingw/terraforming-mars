import {Game} from '../../../src/Game';
import {TempestConsultancy} from '../../../src/cards/moon/TempestConsultancy';
import {expect} from 'chai';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Turmoil} from '../../../src/turmoil/Turmoil';
import {TestPlayer} from '../../TestPlayer';
import {TestPlayers} from '../../TestPlayers';
import {SendDelegateToArea} from '../../../src/deferredActions/SendDelegateToArea';
import {Greens} from '../../../src/turmoil/parties/Greens';
import {TestingUtils} from '../../TestingUtils';

describe('TempestConsultancy', () => {
  let player: TestPlayer;
  let otherPlayer: TestPlayer;
  let game: Game;
  let card: TempestConsultancy;
  let turmoil: Turmoil;

  beforeEach(() => {
    player = TestPlayers.BLUE.newPlayer();
    otherPlayer = TestPlayers.RED.newPlayer();
    game = Game.newInstance('id', [player, otherPlayer], player, TestingUtils.setCustomGameOptions());
    card = new TempestConsultancy();
    turmoil = game.turmoil!;
  });

  it('can act', () => {
    player.tagsForTest = {moon: 5};
    expect(card.canAct(player)).is.true;

    player.tagsForTest = {moon: 4};
    expect(card.canAct(player)).is.false;
  });

  it('can act, not enough delegates', () => {
    player.tagsForTest = {moon: 5};
    expect(card.canAct(player)).is.true;
    turmoil.delegateReserve = [];
    // Can still play, just ... no delegates
    expect(card.canAct(player)).is.true;
  });

  it('action, 1 delegate', () => {
    player.tagsForTest = {moon: 5};
    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(6);
    // This test is brittle - it assumes mars first will be orOptions[0]. But OK.
    const marsFirst = turmoil.getPartyByName(PartyName.MARS)!;
    expect(marsFirst.getDelegates(player)).eq(0);
    card.action(player);
    const action = player.game.deferredActions.pop() as SendDelegateToArea;
    const options = action.execute();
    options!.cb(marsFirst.name);

    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(5);
    expect(marsFirst.getDelegates(player)).eq(1);
  });

  it('action, 3 delegates', () => {
    player.tagsForTest = {moon: 16};
    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(6);
    // This test is brittle - it assumes mars first will be orOptions[0]. But OK.
    const marsFirst = turmoil.getPartyByName(PartyName.MARS)!;
    expect(marsFirst.getDelegates(player)).eq(0);
    card.action(player);
    const action = player.game.deferredActions.pop() as SendDelegateToArea;
    const options = action.execute();
    options!.cb(marsFirst.name);

    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(3);
    expect(marsFirst.getDelegates(player)).eq(3);
  });

  it('action, 3 delegates, only 2 available', () => {
    player.tagsForTest = {moon: 16};
    turmoil.delegateReserve = [player, player];
    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(2);
    // This test is brittle - it assumes mars first will be orOptions[0]. But OK.
    const marsFirst = turmoil.getPartyByName(PartyName.MARS)!;
    expect(marsFirst.getDelegates(player)).eq(0);

    card.action(player);

    const action = player.game.deferredActions.pop() as SendDelegateToArea;
    const options = action.execute();
    options!.cb(marsFirst.name);

    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(0);
    expect(marsFirst.getDelegates(player)).eq(2);
  });

  it('new chairman', () => {
    player.corpCard = card;
    turmoil.rulingParty = new Greens();
    turmoil.rulingParty.partyLeader = player;
    expect(player.getTerraformRating()).eq(20);

    turmoil.setRulingParty(game);
    TestingUtils.runAllActions(game);

    expect(turmoil.chairman).eq(player);
    expect(player.getTerraformRating()).eq(22);
  });
});

