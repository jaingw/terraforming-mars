export const myId = process.env.myId;

// 2020-08-18 11:04
export function getDate() {
  return new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0, 16).replace('T', ' ');
}

// 2020-08-18
export function getDay() {
  return new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0, 10).replace('T', ' ');
}

