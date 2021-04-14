export const myId = process.env.myId;

// 2020-08-18 11:04
export function getDate() {
  return new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0, 16).replace('T', ' ');
}

// 2020-08-18
export function getDay() {
  return new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0, 10).replace('T', ' ');
}


export function generateRandomId(prefix: string): string {
  // 281474976710656 possible values.
  let id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  while (id.length < 12) {
    id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  }
  return prefix + id;
}
