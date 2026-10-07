import {request} from '@/client/utils/request';
import {ILobbyListResponse, ICreateRoomResponse} from '@/common/lobby/LobbyTypes';
import {Color} from '@/common/Color';

class LobbyService {
  getRooms(userId: string): Promise<ILobbyListResponse> {
    return request.get('/api/v2/lobby/list?userId=' + encodeURIComponent(userId));
  }

  createRoom(options: {
    userId: string;
    userName: string;
    gameConfig: any;
    maxPlayers: number;
  }): Promise<ICreateRoomResponse> {
    return request.post<ICreateRoomResponse>('/api/v2/lobby/create', options);
  }

  joinRoom(roomId: string, options: {
    userId: string;
    userName: string;
    color: Color;
  }): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/join`, options);
  }

  leaveRoom(roomId: string, userId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/leave`, {userId});
  }

  kickPlayer(roomId: string, userId: string, targetUserName: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/kick`, {userId, targetUserName});
  }

  startGame(roomId: string, userId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/start`, {userId});
  }

  confirmReady(roomId: string, userId: string): Promise<void> {
    return request.post(`/api/v2/lobby/${roomId}/confirm`, {userId});
  }
}

export const lobbyService = new LobbyService();
