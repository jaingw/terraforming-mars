/**
 * 游戏大厅 API 路由
 *
 * 挂载路径: /api/v2/lobby
 *
 * POST   /create          - 创建房间
 * GET    /list            - 获取房间列表
 * GET    /:roomId         - 获取房间详情
 * GET    /:roomId/colors  - 获取可用颜色
 * POST   /:roomId/join    - 加入房间
 * POST   /:roomId/leave   - 离开房间
 * POST   /:roomId/kick    - 房主踢人
 * POST   /:roomId/start   - 房主发起开始（进入确认阶段）
 * POST   /:roomId/confirm - 玩家确认准备
 * GET    /:roomId/poll    - 轮询房间状态
 * POST   /:roomId/markStarted - 标记游戏已创建
 */

import {Hono} from 'hono';
import {LobbyService} from '../services/LobbyService';
import {createSafeHandler, requireRouteParam} from './middleware';

const lobbyRoutes = new Hono();

lobbyRoutes.post(
  '/create',
  createSafeHandler(async (c) => {
    const body = await c.req.json();
    const room = LobbyService.createRoom(body);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

lobbyRoutes.get(
  '/list',
  createSafeHandler((c) => {
    const userId = c.req.query('userId');
    const rooms = LobbyService.listRoomViews(userId);
    return {rooms};
  }),
);

lobbyRoutes.get(
  '/:roomId',
  createSafeHandler((c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const userId = c.req.query('userId');
    const room = LobbyService.getRoom(roomId);
    return {room: LobbyService.toClientRoom(room, userId)};
  }),
);

lobbyRoutes.get(
  '/:roomId/colors',
  createSafeHandler((c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const colors = LobbyService.getAvailableColors(roomId);
    return {colors};
  }),
);

lobbyRoutes.post(
  '/:roomId/join',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = LobbyService.joinRoom(roomId, body);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

lobbyRoutes.post(
  '/:roomId/leave',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = LobbyService.leaveRoom(roomId, body.userId);
    return {room: room === null ? null : LobbyService.toClientRoom(room, body.userId), closed: room === null};
  }),
);

lobbyRoutes.post(
  '/:roomId/kick',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = LobbyService.kickPlayer(roomId, body);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

lobbyRoutes.post(
  '/:roomId/start',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = LobbyService.startConfirm(roomId, body.userId);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

lobbyRoutes.post(
  '/:roomId/confirm',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = await LobbyService.confirmReady(roomId, body.userId);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

lobbyRoutes.get(
  '/:roomId/poll',
  createSafeHandler((c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const userId = c.req.query('userId');
    const room = LobbyService.getRoom(roomId);
    return {room: LobbyService.toClientRoom(room, userId)};
  }),
);

lobbyRoutes.post(
  '/:roomId/markStarted',
  createSafeHandler(async (c) => {
    const roomId = requireRouteParam(c, 'roomId');
    const body = await c.req.json();
    const room = LobbyService.markStarted(roomId, body.gameId, body.gameData);
    return {room: LobbyService.toClientRoom(room, body.userId)};
  }),
);

export {lobbyRoutes};
