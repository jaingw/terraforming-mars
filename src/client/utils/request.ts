/**
 * 通用 HTTP 请求工具
 *
 * 替代各组件中散落的 fetch / XMLHttpRequest / axios 调用，
 * 提供统一的错误处理、JSON 序列化、类型推导。
 *
 * 用法：
 *   import {request} from '@/client/utils/request';
 *
 *   // GET（自动解析 JSON）
 *   const data = await request.get<{seasonId: string}>('/api/v2/season/info');
 *
 *   // GET with query params
 *   const data = await request.get('/api/v2/season/history', {seasonId: '123'});
 *
 *   // POST（自动序列化 body 为 JSON）
 *   const data = await request.post<{status: string}>('/api/v2/season/reset', {seasonId: '2024-S1'});
 *
 *   // PUT
 *   const data = await request.put('/api/v2/some/resource', {name: 'foo'});
 *
 *   // DELETE
 *   await request.del('/api/v2/some/resource/123');
 *
 *   // 底层方法（自定义 options）
 *   const resp = await request.raw('/api/something', {method: 'PATCH', body: ...});
 */

/** 请求异常，携带 HTTP 状态码和响应体 */
export class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'RequestError';
  }
}

/** query 参数类型 */
type TQueryParams = Record<string, string | number | boolean | undefined | null>;

/** 内部：将 query 对象拼接为 URL 查询字符串 */
function buildUrl(path: string, params?: TQueryParams): string {
  if (!params) return path;

  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null);

  if (entries.length === 0) return path;

  const query = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
}

/** 内部：解析响应 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new RequestError(response.status, response.statusText, body);
  }

  // 204 No Content 或空响应
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  // JSON 响应
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  // 其他情况返回文本
  return response.text() as unknown as Promise<T>;
}

/** 内部：基础请求 */
function baseRequest<T>(
  url: string,
  options: Record<string, any> = {},
): Promise<T> {
  return fetch(url, options).then((response) => parseResponse<T>(response));
}

/**
 * GET 请求
 *
 * @param path   请求路径，如 '/api/v2/season/info'
 * @param params 可选的 query 参数对象
 */
function get<T = any>(path: string, params?: TQueryParams): Promise<T> {
  return baseRequest<T>(buildUrl(path, params), {
    method: 'GET',
  });
}

/**
 * POST 请求
 *
 * @param path 请求路径
 * @param data 请求体（自动 JSON 序列化）
 */
function post<T = any>(path: string, data?: any): Promise<T> {
  return baseRequest<T>(path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 请求
 *
 * @param path 请求路径
 * @param data 请求体（自动 JSON 序列化）
 */
function put<T = any>(path: string, data?: any): Promise<T> {
  return baseRequest<T>(path, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 请求
 *
 * @param path 请求路径
 */
function del<T = any>(path: string): Promise<T> {
  return baseRequest<T>(path, {
    method: 'DELETE',
  });
}

/**
 * 原始请求（当需要自定义选项时使用）
 *
 * 不做 JSON 自动解析，直接返回 Response 对象。
 */
function raw(path: string, options?: Record<string, any>): Promise<Response> {
  return fetch(path, options);
}

export const request = {
  get,
  post,
  put,
  del,
  raw,
} as const;
