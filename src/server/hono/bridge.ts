/**
 * Hono 与 Node.js HTTP Server 的桥接
 *
 * 将 /api/v2/ 前缀的请求转发给 Hono 处理，其余交回旧路由。
 */

import type * as http from 'http';
import {getRequestListener} from '@hono/node-server';
import {app} from './app';

const honoListener = getRequestListener(app.fetch);

/**
 * 将请求转发给 Hono 处理
 * @returns true 如果路径匹配 /api/v2/ 且已转发，false 则未处理
 */
export function handleWithHono(
  req: http.IncomingMessage | any,
  res: http.ServerResponse | any,
): boolean {
  const url = req.url || '';
  if (!url.startsWith('/api/v2/')) {
    return false;
  }
  honoListener(req, res);
  return true;
}
