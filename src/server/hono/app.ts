/**
 * Hono 应用入口
 *
 * 所有新 API 路由在此挂载。通过 bridge.ts 与旧的 Node.js HTTP Server 集成。
 * requestProcessor 在旧路由未匹配时，将请求转发给 Hono。
 *
 * 添加新路由：
 *   1. 在 hono/ 目录下创建路由模块（如 season.ts）
 *   2. 在本文件中 import 并 app.route() 挂载
 */

import {Hono} from 'hono';
import {seasonRoutes} from './season';
import {lobbyRoutes} from './lobby';
import {testRoutes} from './test';
import {userProfileRoutes} from './userProfile';
import {userStatsRoutes} from './userStats';
import {serverRoutes} from './server';

const app = new Hono().basePath('/api/v2');

// 全局错误处理
app.onError((err, c) => {
  console.error('[Hono] Unhandled error:', err);
  return c.json({error: err.message || 'Internal Server Error'}, 500);
});

// 路由挂载
app.route('/season', seasonRoutes);
app.route('/lobby', lobbyRoutes);
app.route('/test', testRoutes);
app.route('/user-profile', userProfileRoutes);
app.route('/user-stats', userStatsRoutes);
app.route('/server', serverRoutes);

export {app};
