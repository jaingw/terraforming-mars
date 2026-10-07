import {expect} from 'chai';
import {LobbyService} from '../../src/server/services/LobbyService';
import {ELobbyRoomStatus} from '../../src/common/lobby/LobbyTypes';
import {RandomBoardOption} from '../../src/common/boards/RandomBoardOption';
import {RandomMAOptionType} from '../../src/common/ma/RandomMAOptionType';

function baseGameConfig() {
  return {
    expansions: {
      corpera: true,
      promo: false,
      venus: false,
      colonies: false,
      prelude: false,
      prelude2: false,
      turmoil: false,
      community: false,
      ares: false,
      moon: false,
      pathfinders: false,
      ceo: false,
      starwars: false,
      underworld: false,
      breakthrough: false,
      eros: false,
      commission: false,
    },
    board: RandomBoardOption.OFFICIAL,
    seed: '0',
    randomFirstPlayer: false,
    clonedGamedId: undefined,
    undoOption: false,
    showTimers: false,
    fastModeOption: false,
    showOtherPlayersVP: false,
    aresExtremeVariant: false,
    politicalAgendasExtension: 'Standard',
    solarPhaseOption: false,
    removeNegativeGlobalEventsOption: false,
    modularMA: false,
    draftVariant: false,
    initialDraft: false,
    preludeDraftVariant: false,
    ceosDraftVariant: false,
    startingCorporations: 0,
    shuffleMapOption: false,
    randomMA: RandomMAOptionType.NONE,
    includeFanMA: false,
    soloTR: false,
    customCorporationsList: [],
    bannedCards: [],
    includedCards: [],
    customColoniesList: [],
    customPreludes: [],
    requiresMoonTrackCompletion: false,
    requiresVenusTrackCompletion: false,
    moonStandardProjectVariant: false,
    moonStandardProjectVariant1: false,
    altVenusBoard: false,
    escapeVelocity: undefined,
    customCeos: [],
    startingCeos: 0,
    startingPreludes: 0,
    rankOption: false,
    userId: '',
    initialCorpDraftVariant: false,
    heatFor: false,
    doubleCorp: false,
    rankTimeLimit: undefined,
    rankTimePerGeneration: undefined,
  };
}

describe('LobbyService', () => {
  afterEach(() => {
    // Best-effort cleanup to avoid cross-test room leakage.
    for (const room of LobbyService.listRooms()) {
      try {
        LobbyService.leaveRoom(room.roomId, room.ownerId);
      } catch (_err) {
        // Ignore cleanup failure from already-removed rooms.
      }
    }
  });

  it('filters finished started rooms from list', () => {
    const waitingRoom = LobbyService.createRoom({
      userId: 'u_waiting_owner',
      userName: 'WaitingOwner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });

    const startedRoom = LobbyService.createRoom({
      userId: 'u_started_owner',
      userName: 'StartedOwner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });
    LobbyService.markStarted(startedRoom.roomId, 'g1', {phase: 'end'});

    const listedRoomIds = LobbyService.listRooms().map((room) => room.roomId);
    expect(listedRoomIds).to.include(waitingRoom.roomId);
    expect(listedRoomIds).to.not.include(startedRoom.roomId);
  });

  it('cleans non-started rooms older than one day', () => {
    const expiredRoom = LobbyService.createRoom({
      userId: 'u_expired_owner',
      userName: 'ExpiredOwner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });
    expiredRoom.createdAt = Date.now() - (24 * 60 * 60 * 1000) - 1;

    const cleanedCount = LobbyService.cleanup();
    expect(cleanedCount).to.be.greaterThan(0);

    const listedRoomIds = LobbyService.listRooms().map((room) => room.roomId);
    expect(listedRoomIds).to.not.include(expiredRoom.roomId);
  });

  it('keeps non-started rooms within cleanup threshold', () => {
    const freshRoom = LobbyService.createRoom({
      userId: 'u_fresh_owner',
      userName: 'FreshOwner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });
    // NON_STARTED_ROOM_MAX_AGE_MS = 3h，创建 2 小时前的房间应保留
    freshRoom.createdAt = Date.now() - (2 * 60 * 60 * 1000);

    LobbyService.cleanup();

    const listedRoomIds = LobbyService.listRooms().map((room) => room.roomId);
    expect(listedRoomIds).to.include(freshRoom.roomId);
    expect(freshRoom.status).to.equal(ELobbyRoomStatus.WAITING);
  });

  it('prevents the same logged-in user from joining twice with different tokens', () => {
    const userId = 'u123456789abc';
    const room = LobbyService.createRoom({
      userId: `${userId}t111111111111`,
      userName: 'Owner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });

    expect(() => LobbyService.joinRoom(room.roomId, {
      userId: `${userId}t222222222222`,
      userName: 'OwnerAgain',
      color: 'blue',
    })).to.throw('You are already in this room');
  });

  it('matches lobby actions by user id even when a later login token is used', () => {
    const userId = 'u123456789abd';
    const room = LobbyService.createRoom({
      userId: `${userId}t111111111111`,
      userName: 'Owner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });

    const updatedRoom = LobbyService.leaveRoom(room.roomId, `${userId}t222222222222`);

    expect(updatedRoom).to.equal(null);
  });

  it('does not expose user ids in the client room view', () => {
    const userId = 'u123456789abe';
    const room = LobbyService.createRoom({
      userId: `${userId}t111111111111`,
      userName: 'Owner',
      gameConfig: {...baseGameConfig(), userId: `${userId}t111111111111`} as any,
      maxPlayers: 4,
    });

    LobbyService.joinRoom(room.roomId, {
      userId: 'u_guest_token',
      userName: 'Guest',
      color: 'blue',
    });

    const view = LobbyService.toClientRoom(room, `${userId}t222222222222`) as any;

    expect(view.ownerId).to.equal(undefined);
    expect(view.players[0].userId).to.equal(undefined);
    expect(view.players[1].userId).to.equal(undefined);
    expect(view.gameConfig.userId).to.equal(undefined);
    expect(view.isOwner).to.equal(true);
    expect(view.isCurrentUserInRoom).to.equal(true);
    expect(view.players[0].isCurrentUser).to.equal(true);
  });

  it('auto starts the room when the last player confirms', async () => {
    const room = LobbyService.createRoom({
      userId: 'owner',
      userName: 'Owner',
      gameConfig: baseGameConfig() as any,
      maxPlayers: 2,
    });

    LobbyService.joinRoom(room.roomId, {
      userId: 'guest',
      userName: 'Guest',
      color: 'blue',
    });

    LobbyService.startConfirm(room.roomId, 'owner');
    const updatedRoom = await LobbyService.confirmReady(room.roomId, 'guest');

    expect(updatedRoom.status).to.equal(ELobbyRoomStatus.STARTED);
    expect(updatedRoom.gameId).to.match(/^g/);
    expect(updatedRoom.gameData?.id).to.equal(updatedRoom.gameId);
    expect(updatedRoom.gameData?.players).to.have.length(2);
  });
});
