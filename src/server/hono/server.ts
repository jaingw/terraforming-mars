/**
 * 服务器信息 API 路由
 *
 * 挂载路径: /api/v2/server
 *
 * GET  /info - 获取服务器信息（包括 serverId）
 */

import {Hono} from 'hono';
import {serverId} from '../utils/server-ids';
import {isProduction} from '../utils/server';

const serverRoutes = new Hono();

serverRoutes.get('/info', (c) => {
  return c.json({
    serverId,
    isProduction: isProduction(),
  });
});

export {serverRoutes};
