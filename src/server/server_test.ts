
import {generateRandomId} from './server-ids';
import {serverId} from './server-ids';

console.log(generateRandomId('') + ' hello '+ serverId);

/**
 * .env添加测试端口号
 * index.html 修改title添加测试版字样
 * .env修改数据库
 */
