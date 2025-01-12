import * as fs from 'fs';
import * as path from 'path';
// ts-node .\logparse.ts
async function logparse() {
  const {Database} = await import('sqlite3');
  const dbFolder = path.resolve(process.cwd(), './db');
  const dbPath = path.resolve(dbFolder, 'game.db');
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
  }
  const db = new Database(String(dbPath));

  console.log('run start');

  const dataJson = fs.readFileSync(path.join('./db', 'error.log'), 'utf8');
  console.log('dataJson'+dataJson.length);
  let splitstr = '[202'
  let leng = 30 - splitstr.length;
  for (const data of dataJson.split(splitstr)) {
    db.run('INSERT INTO logparse(time, msg) VALUES(?, ?)', [splitstr + data.substring(0, leng), data.substring(leng)], function(err: { message: any; }) {
      if (err) {
        return console.error(err);
      }
      console.log('run finish');
    }); 
  }
  console.log('run end');
}

console.log('logparse start');
logparse();
console.log('logparse end');
