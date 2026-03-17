import {request} from '@/client/utils/request';
import {ILobbyRoom, ILobbyListResponse, ICreateRoomResponse} from '@/common/lobby/LobbyTypes';
import {Color} from '@/common/Color';

class LobbyService {
  async getRooms(): Promise<ILobbyListResponse> {
    return request.get('/api/v2/lobby/list');
  }

  async createRoom(options: {
    userId: string;
    userName: string;
    gameConfig: any;
    maxPlayers: number;
  }): Promise<ICreateRoomResponse> {
    return request.post<ICreateRoomResponse>('/api/v2/lobby/create', options);
  }

  async joinRoom(roomId: string, options: {
    userId: string;
    userName: string;
    color: Color;
  }): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/join`, options);
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/leave`, {userId});
  }

  async kickPlayer(roomId: string, userId: string, targetUserId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/kick`, {userId, targetUserId});
  }

  async startGame(roomId: string, userId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/start`, {userId});
  }

  async confirmReady(roomId: string, userId: string): Promise<{
    allReady: boolean;
    gameConfig?: any;
  }> {
    return request.post(`/api/v2/lobby/${roomId}/confirm`, {userId});
  }

  async markStarted(roomId: string, gameId: string, gameData: any): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/markStarted`, {gameId, gameData});
  }
}

export const lobbyService = new LobbyService();
