let lastIdTime = 0;
let sameTimeSequence = 0;
const TIME_MODULO = Math.pow(2, 40);
const HALF_MODULO = Math.pow(2, 24);
const MAX_SEQUENCE = 0xff;
const scrambleKeys = [0x8f3a21, 0x4c9d7e, 0xd125ab, 0x36e0f4];

// 生成 48 bit 原始值：低 40 位毫秒时间 + 8 位同毫秒序号，保持旧格式的 12 位十六进制长度。
function nextRawIdPart(): number {
  const now = Date.now();
  if (now > lastIdTime) {
    lastIdTime = now;
    sameTimeSequence = 0;
  } else if (sameTimeSequence < MAX_SEQUENCE) {
    sameTimeSequence++;
  } else {
    // 同一毫秒内超过 256 个时推进逻辑时间，继续保证本进程内不重复。
    lastIdTime++;
    sameTimeSequence = 0;
  }
  return (lastIdTime % TIME_MODULO) * 0x100 + sameTimeSequence;
}

// Feistel 轮函数只处理 24 bit 半区，固定 key 会把时间和序号稳定打散到整个 12 位 hex 中。
function scrambleRound(value: number, key: number): number {
  let mixed = (value ^ key) & 0xffffff;
  mixed = Math.imul(mixed ^ (mixed >>> 13), 0x5bd1e995) & 0xffffff;
  return (mixed ^ (mixed >>> 15)) & 0xffffff;
}

// 对 48 bit 原始值做可逆打散：长度不变，但相近时间生成的 ID 不会呈现相近前缀。
function scramble48(value: number): number {
  let left = Math.floor(value / HALF_MODULO);
  let right = value % HALF_MODULO;
  for (const key of scrambleKeys) {
    const nextLeft = right;
    const nextRight = (left ^ scrambleRound(right, key)) & 0xffffff;
    left = nextLeft;
    right = nextRight;
  }
  return left * HALF_MODULO + right;
}

// 生成带时间信息但不可直观看出时间规律的 ID，前缀保持原有 g/p/s/u 等约定。
export function generateRandomId(prefix: string): string {
  return prefix + scramble48(nextRawIdPart()).toString(16).padStart(12, '0');
}
export const serverId = process.env.SERVER_ID || generateRandomId('');
export const statsId = process.env.STATS_ID || generateRandomId('');
export const runId = generateRandomId('r');
