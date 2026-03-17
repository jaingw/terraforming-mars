/**
 * LobbyService — 游戏大厅（房间制）的业务逻辑服务层
 *
 * 内存存储所有房间数据，重启后丢失。
 */

import {Color, PLAYER_COLORS} from '../../common/Color';
import {
  ELobbyRoomStatus,
  ILobbyPlayer,
  ILobbyRoom,
  ICreateRoomRequest,
  IJoinRoomRequest,
  IKickPlayerRequest,
} from '../../common/lobby/LobbyTypes';
import {NewGameConfig, NewPlayerModel} from '../../common/game/NewGameConfig';
import {ServiceError} from './ServiceError';

/** 房间存储 */
const rooms = new Map<string, ILobbyRoom>();
const ROOM_CLEANUP_INTERVAL_MS = 30 * 60 * 1000;
const NON_STARTED_ROOM_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const FINISHED_PHASES = new Set(['end', 'timeout', 'abandon']);

/** 自增 ID 计数器 */
let roomIdCounter = 1;

function generateRoomId(): string {
  return `room_${Date.now()}_${roomIdCounter++}`;
}

function isFinishedStartedRoom(room: ILobbyRoom): boolean {
  if (room.status !== ELobbyRoomStatus.STARTED) {
    return false;
  }
  const phase = room.gameData?.phase;
  return typeof phase === 'string' && FINISHED_PHASES.has(phase);
}

/** 获取房间，不存在则抛异常 */
function getRoom(roomId: string): ILobbyRoom {
  const room = rooms.get(roomId);
  if (!room) {
    throw new ServiceError(404, 'Room not found');
  }
  return room;
}

/** 检查是否房主 */
function assertOwner(room: ILobbyRoom, userId: string): void {
  if (room.ownerId !== userId) {
    throw new ServiceError(403, 'Only the room owner can perform this action');
  }
}

/** 获取可用颜色（未被占用的） */
function getAvailableColors(room: ILobbyRoom): Array<Color> {
  const usedColors = new Set(room.players.map((p) => p.color));
  return PLAYER_COLORS.filter((c) => !usedColors.has(c));
}

export class LobbyService {
  /**
   * 创建房间
   */
  static createRoom(req: ICreateRoomRequest): ILobbyRoom {
    if (!req.userId) {
      throw new ServiceError(400, 'Missing userId');
    }
    if (!req.userName) {
      throw new ServiceError(400, 'Missing userName');
    }
    if (!req.gameConfig) {
      throw new ServiceError(400, 'Missing gameConfig');
    }
    if (!req.maxPlayers || req.maxPlayers < 2 || req.maxPlayers > 6) {
      throw new ServiceError(400, 'maxPlayers must be between 2 and 6');
    }

    const roomId = generateRoomId();

    // 房主默认占第一个颜色 slot（红色）
    const ownerColor: Color = 'red';

    const owner: ILobbyPlayer = {
      userId: req.userId,
      name: req.userName,
      color: ownerColor,
      isOwner: true,
      isReady: true, // 房主默认已确认
    };

    const room: ILobbyRoom = {
      roomId,
      ownerId: req.userId,
      ownerName: req.userName,
      players: [owner],
      gameConfig: req.gameConfig,
      status: ELobbyRoomStatus.WAITING,
      maxPlayers: req.maxPlayers,
      createdAt: Date.now(),
    };

    rooms.set(roomId, room);
    console.log(`[Lobby] Room ${roomId} created by ${req.userName} (${req.userId}), maxPlayers: ${req.maxPlayers}`);
    return room;
  }

  /**
   * 获取所有房间列表（包括已启动的游戏）
   */
  static listRooms(): Array<ILobbyRoom> {
    const result: Array<ILobbyRoom> = [];
    for (const room of rooms.values()) {
      if (
        room.status === ELobbyRoomStatus.WAITING ||
        room.status === ELobbyRoomStatus.CONFIRMING ||
        room.status === ELobbyRoomStatus.STARTED
      ) {
        if (isFinishedStartedRoom(room)) {
          continue;
        }
        result.push(room);
      }
    }
    // 按创建时间降序排列（最新的在前面）
    result.sort((a, b) => b.createdAt - a.createdAt);
    return result;
  }

  /**
   * 获取房间详情
   */
  static getRoom(roomId: string): ILobbyRoom {
    return getRoom(roomId);
  }

  /**
   * 加入房间
   */
  static joinRoom(roomId: string, req: IJoinRoomRequest): ILobbyRoom {
    const room = getRoom(roomId);

    if (room.status !== ELobbyRoomStatus.WAITING) {
      throw new ServiceError(400, 'Room is not accepting new players');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new ServiceError(400, 'Room is full');
    }

    // 检查是否已在房间中
    if (room.players.some((p) => p.userId === req.userId)) {
      throw new ServiceError(400, 'You are already in this room');
    }

    // 检查颜色是否可用
    const availableColors = getAvailableColors(room);
    let color = req.color;
    if (!availableColors.includes(color)) {
      if (availableColors.length === 0) {
        throw new ServiceError(400, 'No available colors');
      }
      // 自动分配第一个可用颜色
      color = availableColors[0];
    }

    const player: ILobbyPlayer = {
      userId: req.userId,
      name: req.userName,
      color,
      isOwner: false,
      isReady: false,
    };

    room.players.push(player);
    console.log(`[Lobby] ${req.userName} joined room ${roomId} as ${color}`);
    return room;
  }

  /**
   * 离开房间
   */
  static leaveRoom(roomId: string, userId: string): ILobbyRoom | null {
    const room = getRoom(roomId);

    // 房主离开 = 关闭房间
    if (room.ownerId === userId) {
      room.status = ELobbyRoomStatus.CLOSED;
      rooms.delete(roomId);
      console.log(`[Lobby] Owner ${userId} left room ${roomId}, room closed`);
      return null;
    }

    const idx = room.players.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      throw new ServiceError(400, 'You are not in this room');
    }

    room.players.splice(idx, 1);

    // 如果在确认阶段有人离开，回到等待状态
    if (room.status === ELobbyRoomStatus.CONFIRMING) {
      room.status = ELobbyRoomStatus.WAITING;
      // 重置所有人的确认状态
      for (const p of room.players) {
        if (!p.isOwner) {
          p.isReady = false;
        }
      }
    }

    console.log(`[Lobby] ${userId} left room ${roomId}`);
    return room;
  }

  /**
   * 房主踢人
   */
  static kickPlayer(roomId: string, req: IKickPlayerRequest): ILobbyRoom {
    const room = getRoom(roomId);
    assertOwner(room, req.userId);

    if (req.targetUserId === req.userId) {
      throw new ServiceError(400, 'Cannot kick yourself');
    }

    const idx = room.players.findIndex((p) => p.userId === req.targetUserId);
    if (idx === -1) {
      throw new ServiceError(404, 'Target player not found in room');
    }

    room.players.splice(idx, 1);

    // 如果在确认阶段踢人，回到等待状态
    if (room.status === ELobbyRoomStatus.CONFIRMING) {
      room.status = ELobbyRoomStatus.WAITING;
      for (const p of room.players) {
        if (!p.isOwner) {
          p.isReady = false;
        }
      }
    }

    console.log(`[Lobby] Owner kicked ${req.targetUserId} from room ${roomId}`);
    return room;
  }

  /**
   * 房主发起开始游戏（状态变为 CONFIRMING）
   */
  static startConfirm(roomId: string, userId: string): ILobbyRoom {
    const room = getRoom(roomId);
    assertOwner(room, userId);

    if (room.status !== ELobbyRoomStatus.WAITING) {
      throw new ServiceError(400, 'Room is not in waiting state');
    }

    if (room.players.length < 2) {
      throw new ServiceError(400, 'Need at least 2 players to start');
    }

    if (room.players.length > room.maxPlayers) {
      throw new ServiceError(400, 'Too many players');
    }

    room.status = ELobbyRoomStatus.CONFIRMING;
    // 房主默认已确认
    for (const p of room.players) {
      p.isReady = p.isOwner;
    }

    console.log(`[Lobby] Room ${roomId} entering confirm phase`);
    return room;
  }

  /**
   * 玩家确认准备
   */
  static confirmReady(roomId: string, userId: string): ILobbyRoom {
    const room = getRoom(roomId);

    if (room.status !== ELobbyRoomStatus.CONFIRMING) {
      throw new ServiceError(400, 'Room is not in confirming state');
    }

    const player = room.players.find((p) => p.userId === userId);
    if (!player) {
      throw new ServiceError(404, 'Player not found in room');
    }

    player.isReady = true;
    console.log(`[Lobby] ${userId} confirmed ready in room ${roomId}`);
    return room;
  }

  /**
   * 检查是否所有玩家都已确认
   */
  static isAllReady(roomId: string): boolean {
    const room = getRoom(roomId);
    return room.status === ELobbyRoomStatus.CONFIRMING &&
      room.players.every((p) => p.isReady);
  }

  /**
   * 将房间转换为 NewGameConfig，用于创建游戏
   */
  static buildNewGameConfig(roomId: string): NewGameConfig {
    const room = getRoom(roomId);

    if (!this.isAllReady(roomId)) {
      throw new ServiceError(400, 'Not all players are ready');
    }

    const players: Array<NewPlayerModel> = room.players.map((p, index) => ({
      name: p.name,
      color: p.color,
      beginner: false,
      handicap: 0,
      first: index === 0, // 房主（第一位）先手
    }));

    // gameConfig 已是 Omit<NewGameConfig, 'players'>，
    // 需要合并 players 和 userId
    const config: NewGameConfig = {
      ...(room.gameConfig as any),
      players,
    };

    return config;
  }

  /**
   * 标记房间已启动
   */
  static markStarted(roomId: string, gameId: string, gameData?: any): ILobbyRoom {
    const room = getRoom(roomId);
    room.status = ELobbyRoomStatus.STARTED;
    room.gameId = gameId;
    room.gameData = gameData;
    console.log(`[Lobby] Room ${roomId} game started: ${gameId}`);

    // 五分钟后从内存中移除（给玩家足够时间看到跳转链接）
    setTimeout(() => {
      rooms.delete(roomId);
    }, 5 * 60_000);

    return room;
  }

  /**
   * 获取可用颜色列表
   */
  static getAvailableColors(roomId: string): Array<Color> {
    const room = getRoom(roomId);
    return getAvailableColors(room);
  }

  /**
   * 清理超时房间（超过 1 天且未启动的房间）
   */
  static cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [roomId, room] of rooms) {
      if (room.status !== ELobbyRoomStatus.STARTED && now - room.createdAt > NON_STARTED_ROOM_MAX_AGE_MS) {
        rooms.delete(roomId);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[Lobby] Cleaned up ${cleaned} expired rooms`);
    }
    return cleaned;
  }
}

// 每 30 分钟清理一次过期房间
setInterval(() => LobbyService.cleanup(), ROOM_CLEANUP_INTERVAL_MS);
