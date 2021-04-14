
import {generateRandomId} from './UserUtil';
import * as server from './server';

console.log(generateRandomId('') + ' hello '+ server.serverId);

/**
 * .env添加测试端口号
 * index.html 修改title添加测试版字样
 */
