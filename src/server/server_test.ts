
import {generateRandomId} from './utils/server-ids';
import {serverId} from './utils/server-ids';
import * as server from './server';

console.log(generateRandomId('') + ' hello '+ serverId+' ' + server.server);

/**
 * .env添加测试端口号
 * index.html 修改title添加测试版字样
 * .env修改数据库
 */
