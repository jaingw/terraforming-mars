/**
 * Hono 中间件模块
 *
 * 提供可复用的中间件：
 * - errorHandler: 统一错误处理
 * - requireAdmin: 管理员认证
 */

import {Context, Next} from 'hono';
import {ServiceError} from '../services/ServiceError';
import {serverId as expectedServerId} from '../utils/server-ids';
import {isProduction} from '../utils/server';

export interface ApiErrorResponse {
  error: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function errorHandler(c: Context, next: Next): Promise<Response | undefined> {
  try {
    await next();
    return undefined;
  } catch (err) {
    if (err instanceof ServiceError) {
      return c.json<ApiErrorResponse>({error: err.message}, err.statusCode as 400 | 401 | 403 | 404 | 500);
    }
    console.error('[Hono] Unhandled error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json<ApiErrorResponse>({error: message}, 500);
  }
}

export async function requireAdmin(c: Context, next: Next): Promise<Response | undefined> {
  const serverId = c.req.query('serverId');

  if (isProduction() && (!serverId || serverId !== expectedServerId)) {
    return c.json<ApiErrorResponse>({error: 'Unauthorized'}, 401);
  }

  await next();
  return undefined;
}

export function createSafeHandler<T>(
  fn: (c: Context) => T | Promise<T>,
): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    try {
      const result = await fn(c);
      return c.json(result);
    } catch (err) {
      if (err instanceof ServiceError) {
        return c.json<ApiErrorResponse>({error: err.message}, err.statusCode as any);
      }
      console.error('[Hono] Handler error:', err);
      const message = err instanceof Error ? err.message : 'Internal server error';
      return c.json<ApiErrorResponse>({error: message}, 500);
    }
  };
}
