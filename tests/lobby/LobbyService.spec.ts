import {expect} from 'chai';
import {LobbyService} from '../../src/server/services/LobbyService';
import {ELobbyRoomStatus} from '../../src/common/lobby/LobbyTypes';

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

  it('keeps non-started rooms within one day', () => {
    const freshRoom = LobbyService.createRoom({
      userId: 'u_fresh_owner',
      userName: 'FreshOwner',
      gameConfig: {} as any,
      maxPlayers: 4,
    });
    freshRoom.createdAt = Date.now() - (23 * 60 * 60 * 1000);

    LobbyService.cleanup();

    const listedRoomIds = LobbyService.listRooms().map((room) => room.roomId);
    expect(listedRoomIds).to.include(freshRoom.roomId);
    expect(freshRoom.status).to.equal(ELobbyRoomStatus.WAITING);
  });
});
