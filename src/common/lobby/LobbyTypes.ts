import {Color} from '../Color';
import {NewGameConfig} from '../game/NewGameConfig';

/** 房间状态 */
export enum ELobbyRoomStatus {
  /** 等待玩家加入 */
  WAITING = 'waiting',
  /** 房主已发起开始，等待所有玩家确认 */
  CONFIRMING = 'confirming',
  /** 游戏已创建 */
  STARTED = 'started',
  /** 房间已关闭 */
  CLOSED = 'closed',
}

/** 大厅中的玩家 */
export interface ILobbyPlayer {
  userId: string;
  name: string;
  color: Color;
  isOwner: boolean;
  isReady: boolean;
  /** 玩家段位信息（可选） */
  rankValue?: number;
}

/** 大厅中的房间 */
export interface ILobbyRoom {
  roomId: string;
  ownerId: string;
  ownerName: string;
  players: Array<ILobbyPlayer>;
  /** 游戏设置（不含 players 信息） */
  gameConfig: Omit<NewGameConfig, 'players'>;
  status: ELobbyRoomStatus;
  maxPlayers: number;
  createdAt: number;
  /** 创建后的游戏 ID（仅 STARTED 状态有值） */
  gameId?: string;
  /** 创建后的游戏完整数据（包含每个玩家 ID） */
  gameData?: any;
}

/** 房间列表响应 */
export interface ILobbyListResponse {
  rooms: Array<ILobbyRoom>;
}

/** 创建房间请求 */
export interface ICreateRoomRequest {
  userId: string;
  userName: string;
  gameConfig: Omit<NewGameConfig, 'players'>;
  maxPlayers: number;
}

/** 创建房间响应 */
export interface ICreateRoomResponse {
  room: ILobbyRoom;
}

/** 加入房间请求 */
export interface IJoinRoomRequest {
  userId: string;
  userName: string;
  color: Color;
}

/** 踢人请求 */
export interface IKickPlayerRequest {
  userId: string;
  targetUserId: string;
}

/** 通用操作请求（加入/离开/确认/启动等） */
export interface ILobbyActionRequest {
  userId: string;
}

/** 房间详情响应 */
export interface IRoomDetailResponse {
  room: ILobbyRoom;
}

/** 启动游戏后返回结果 */
export interface IStartGameResponse {
  room: ILobbyRoom;
  /** 游戏创建结果 */
  gameData?: any;
}
