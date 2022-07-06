import {Game} from '../../../src/Game';
import {cast, setCustomGameOptions} from '../../TestingUtils';
import {TestPlayers} from '../../TestPlayers';
import {AnOfferYouCantRefuse} from '../../../src/cards/moon/AnOfferYouCantRefuse';
import {expect} from 'chai';
import {TestPlayer} from '../../TestPlayer';
import {NeutralPlayer, Turmoil} from '../../../src/turmoil/Turmoil';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Player} from '../../../src/Player';
import {IParty} from '../../../src/turmoil/parties/IParty';
import {OrOptions} from '../../../src/inputs/OrOptions';

const GAME_OPTIONS = setCustomGameOptions({moonExpansion: true, turmoilExtension: true});

describe('AnOfferYouCantRefuse', () => {
  let player: TestPlayer;
  let redPlayer: TestPlayer;
  let greenPlayer: TestPlayer;
  let game: Game;
  let turmoil: Turmoil;
  let parties: Parties;
  let card: AnOfferYouCantRefuse;

  beforeEach(() => {
    player = TestPlayers.BLUE.newPlayer();
    redPlayer = TestPlayers.RED.newPlayer();
    greenPlayer = TestPlayers.GREEN.newPlayer();
    game = Game.newInstance('id', [player, redPlayer, greenPlayer], player, GAME_OPTIONS);
    turmoil = game.turmoil!;
    parties = new Parties(turmoil);
    clearParties();
    card = new AnOfferYouCantRefuse();
  });

  it('can play fails, all neutral delegates', () => {
    populateParty(parties.greens, 'NEUTRAL');
    expect(card.canPlay(player)).is.false;
  });

  it('can play fails, only active player delegates', () => {
    populateParty(parties.greens, player);
    expect(card.canPlay(player)).is.false;
  });

  it('can play fails, only available player is leader.', () => {
    populateParty(parties.greens, redPlayer);
    expect(parties.greens.partyLeader).eq(redPlayer);
    expect(card.canPlay(player)).is.false;
  });

  it('can play succeeds', () => {
    populateParty(parties.greens, redPlayer, greenPlayer);
    expect(parties.greens.partyLeader).eq(redPlayer);
    expect(card.canPlay(player)).is.true;
  });

  it('play', () => {
    populateParty(parties.greens, player, redPlayer, greenPlayer);
    expect(parties.greens.partyLeader).eq(player);
    populateParty(parties.reds, 'NEUTRAL', redPlayer, 'NEUTRAL', redPlayer);
    expect(parties.reds.partyLeader).eq('NEUTRAL');

    const options = card.play(player);
    expect(options.options.map((option) => option.title)).deep.eq(
      [
        'Greens / player-red', // Option 0
        'Greens / player-green', // Option 1
        'Reds / player-red', // Option 2
      ]);

    // Now do a delegate exchange
    // Swap with Reds / red
    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(6);
    expect(turmoil.getAvailableDelegateCount(redPlayer, 'reserve')).eq(6);
    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, redPlayer]);

    const switchParties = cast(options.options[2].cb(), OrOptions);

    expect(turmoil.getAvailableDelegateCount(player, 'reserve')).eq(5);
    expect(turmoil.getAvailableDelegateCount(redPlayer, 'reserve')).eq(7);
    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, player]);

    // Now player may switch parties.
    expect(switchParties.options.map((option) => option.title)).deep.eq(
      [
        'Mars First',
        'Scientists',
        'Unity',
        'Greens',
        'Do not move',
        'Kelvinists',
      ]);

    // This is a repeat assertion from above but it makes the test easier to read.
    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, player]);
    expect(parties.scientists.delegates).to.have.members([]);
    expect(parties.scientists.partyLeader).is.undefined;

    // Choose scientists
    switchParties.options[1].cb();

    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer]);
    expect(parties.scientists.delegates).to.have.members([player]);
    expect(parties.scientists.partyLeader).eq(player);
  });

  it('play, player chooses not to switch parties', () => {
    populateParty(parties.greens, player, redPlayer, greenPlayer);
    populateParty(parties.reds, 'NEUTRAL', redPlayer, 'NEUTRAL', redPlayer);

    const options = card.play(player);
    expect(options.options.map((option) => option.title)).deep.eq(
      [
        'Greens / player-red', // Option 0
        'Greens / player-green', // Option 1
        'Reds / player-red', // Option 2
      ]);

    // Now do a delegate exchange
    // Swap with Reds / red
    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, redPlayer]);
    const switchParties = cast(options.options[2].cb(), OrOptions);
    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, player]);

    // Do not move
    switchParties.options[4].cb();

    expect(parties.reds.delegates).to.have.members(['NEUTRAL', 'NEUTRAL', redPlayer, player]);
  });

  it('play can change leadership twice', () => {
    populateParty(parties.greens, redPlayer, greenPlayer, player);
    expect(parties.greens.partyLeader).eq(redPlayer);
    populateParty(parties.reds, 'NEUTRAL', player);
    expect(parties.reds.partyLeader).eq('NEUTRAL');

    const options = card.play(player);
    expect(options.options.map((option) => option.title)).deep.eq(['Greens / player-green']);

    // Now do a delegate exchange
    // Swap with Greens / green
    const switchParties = cast(options.options[0].cb(), OrOptions);

    expect(parties.greens.delegates).to.have.members([redPlayer, player, player]);
    expect(parties.greens.partyLeader).to.eq(player);

    // Now choose reds (option 4).
    switchParties.options[4].cb();

    expect(parties.greens.delegates).to.have.members([redPlayer, player]);
    expect(parties.greens.partyLeader).to.eq(player);
    expect(parties.reds.delegates).to.have.members([player, player, 'NEUTRAL']);
    expect(parties.reds.partyLeader).to.eq(player);
  });

  function clearParties() {
    turmoil.parties.forEach((party) => {
      turmoil.delegateReserve.push(...party.delegates.filter((delegate) => delegate !== 'NEUTRAL'));
      party.delegates = [];
      party.partyLeader = undefined;
    });
  }

  function populateParty(party: IParty, ...delegates: Array<Player | NeutralPlayer>) {
    delegates.forEach((delegate) => party.sendDelegate(delegate, game));
  }
});

class Parties {
  public greens: IParty;
  public reds: IParty;
  public scientists: IParty;
  public unity: IParty;
  public kelvinists: IParty;
  public marsFirst: IParty;
  constructor(public turmoil: Turmoil) {
    this.greens = turmoil.getPartyByName(PartyName.GREENS);
    this.reds = turmoil.getPartyByName(PartyName.REDS);
    this.scientists = turmoil.getPartyByName(PartyName.SCIENTISTS);
    this.unity = turmoil.getPartyByName(PartyName.UNITY);
    this.kelvinists = turmoil.getPartyByName(PartyName.KELVINISTS);
    this.marsFirst = turmoil.getPartyByName(PartyName.MARS);
  }
}
