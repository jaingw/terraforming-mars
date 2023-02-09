export function generateRandomId(prefix: string): string {
  // 281474976710656 possible values.
  let id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  while (id.length < 12) {
    id = Math.floor(Math.random() * Math.pow(16, 12)).toString(16);
  }
  return prefix + id;
}
export const serverId = process.env.SERVER_ID || generateRandomId('');
export const statsId = process.env.STATS_ID || generateRandomId('');
