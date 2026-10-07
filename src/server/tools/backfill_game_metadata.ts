require('dotenv').config();
import {Database} from '../database/Database';
import {GameId} from '../../common/Types';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
import {IShortData} from '../database/IDatabase';
import {SerializedGame} from '../SerializedGame';
import {SerializedPlayer} from '../SerializedPlayer';

type LatestGameRow = {
  game_id: GameId;
  prop?: string | IShortData | null;
  game?: string | SerializedGame | null;
  status?: string | null;
  createtime?: string | Date | null;
}

type BackfillStats = {
  scanned: number;
  updated: number;
  skipped: number;
  failed: number;
}

// 手动执行记录：正式回填前先按当前数据库类型执行这些 schema SQL。
// 这里不自动执行，避免 backfill 跑数据时隐式改表结构。
export const MANUAL_GAME_METADATA_SCHEMA_SQL = {
  postgresql: [
    'ALTER TABLE game ADD COLUMN IF NOT EXISTS participants varchar[]',
    'ALTER TABLE game ADD COLUMN IF NOT EXISTS userids varchar[]',
    'ALTER TABLE game ADD COLUMN IF NOT EXISTS prop text',
    'ALTER TABLE game ADD COLUMN IF NOT EXISTS updated_time timestamp default now()',
    'CREATE INDEX IF NOT EXISTS game_i1 on game(updated_time)',
    'CREATE INDEX IF NOT EXISTS game_participants_i1 on game USING GIN (participants)',
    'CREATE INDEX IF NOT EXISTS game_userids_i1 on game USING GIN (userids)',
  ],
  sqlite: [
    'ALTER TABLE game ADD COLUMN participants text',
    'ALTER TABLE game ADD COLUMN userids text',
    'ALTER TABLE game ADD COLUMN prop text',
    'ALTER TABLE game ADD COLUMN updated_time timestamp',
    'DROP TRIGGER IF EXISTS game_updated_time_trigger',
    'CREATE INDEX IF NOT EXISTS game_i1 on game(updated_time)',
  ],
} as const;

// 兼容数据库字段已经是对象或字符串两种情况，避免回填脚本依赖固定驱动返回类型。
function parseJson<T>(value: unknown): T | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }
  return value as T;
}

// 旧 games.prop 缺失时，从完整 SerializedGame 构造列表页需要的短数据。
function buildShortData(game: SerializedGame): IShortData {
  return {
    id: game.id,
    phase: game.phase,
    createtime: game.createtime,
    updatetime: game.updatetime,
    gameAge: game.gameAge,
    lastSaveId: game.lastSaveId,
    players: game.players,
  };
}

// 回填参与者时同时看当前玩家和已退出玩家，避免老游戏漏掉退出玩家的 userId。
function getPlayers(shortData: IShortData, game: SerializedGame | undefined): Array<SerializedPlayer> {
  return [
    ...(shortData.players ?? []),
    ...(game?.exitedPlayers ?? []),
  ];
}

// 构造 participants 字段，只放 playerId/spectatorId，不放账号 userId。
function buildParticipants(shortData: IShortData, game: SerializedGame | undefined): Array<string> {
  const participants = new Set<string>();
  for (const player of getPlayers(shortData, game)) {
    participants.add(player.id);
  }
  if (game?.spectatorId !== undefined) {
    participants.add(game.spectatorId);
  }
  return Array.from(participants);
}

// 构造 userids 字段，专门服务账号维度的“我的游戏”查询。
function buildUserIds(shortData: IShortData, game: SerializedGame | undefined): Array<string> {
  const userIds = new Set<string>();
  for (const player of getPlayers(shortData, game)) {
    if (player.userId !== undefined && player.userId !== '') {
      userIds.add(normalizeUserId(player.userId));
    }
  }
  return Array.from(userIds);
}

// 尽量保留历史更新时间，避免回填把旧游戏统一刷成当前时间。
function getUpdatedTime(row: LatestGameRow, shortData: IShortData): string | Date | undefined {
  return shortData.updatetime ?? row.createtime ?? undefined;
}

function getGameOptions(game: SerializedGame | undefined): string | null {
  return game?.gameOptions === undefined ? null : JSON.stringify(game.gameOptions);
}

// PostgreSQL 回填：只更新已有 game 行，不插入新行。
async function backfillPostgreSQL(): Promise<BackfillStats> {
  const db = Database.getInstance() as any;
  await db.initialize();
  // 只为 participants 尚未回填的 game 取最新一条存档。
  const res = await db.client.query(
    `SELECT games.game_id, games.prop, games.game, games.status, games.createtime
     FROM games
     JOIN (
       SELECT game_id, max(save_id) AS save_id
       FROM games
       GROUP BY game_id
     ) latest ON latest.game_id = games.game_id AND latest.save_id = games.save_id
     JOIN game metadata ON metadata.game_id = games.game_id
     WHERE metadata.participants IS NULL
     ORDER BY games.createtime DESC`,
  );

  const stats: BackfillStats = {scanned: res.rows.length, updated: 0, skipped: 0, failed: 0};
  for (const row of res.rows as Array<LatestGameRow>) {
    try {
      const game = parseJson<SerializedGame>(row.game);
      const shortData = parseJson<IShortData>(row.prop) ?? (game === undefined ? undefined : buildShortData(game));
      if (shortData === undefined) {
        // 无法得到短数据的老记录跳过，不制造空 metadata。
        stats.skipped++;
        continue;
      }
      const participants = buildParticipants(shortData, game);
      const userids = buildUserIds(shortData, game);
      const gameOptions = getGameOptions(game);
      // 只 UPDATE 已有 game 行；rowCount 为 0 表示目标 game 行不存在。
      const update = await db.client.query(
        `UPDATE game
         SET participants = $2,
             userids = $3,
             prop = $4,
             updated_time = COALESCE($5::timestamp, updated_time),
             status = COALESCE($6, status),
             options = CASE
               WHEN LENGTH(options) < 10 AND $7::text IS NOT NULL THEN $7
               ELSE options
             END
         WHERE game_id = $1`,
        [row.game_id, participants, userids, JSON.stringify(shortData), getUpdatedTime(row, shortData), row.status, gameOptions],
      );
      console.log(`更新 ${[row.game_id, participants, userids, JSON.stringify(shortData), getUpdatedTime(row, shortData), row.status]}`);
      if (update.rowCount === 0) {
        stats.skipped++;
      } else {
        stats.updated++;
      }
    } catch (err) {
      stats.failed++;
      console.error(`[backfill_game_metadata] failed ${row.game_id}`, err);
    }
  }
  return stats;
}

// SQLite 回填：逻辑与 PostgreSQL 一致，数组字段用 JSON text 存储。
async function backfillSQLite(): Promise<BackfillStats> {
  const db = Database.getInstance() as any;
  await db.initialize();
  // 只为 participants 尚未回填的 game 取最新一条存档。
  const rows = await db.asyncAll(
    `SELECT games.game_id, games.prop, games.game, games.status, games.createtime
     FROM games
     JOIN (
       SELECT game_id, max(save_id) AS save_id
       FROM games
       GROUP BY game_id
     ) latest ON latest.game_id = games.game_id AND latest.save_id = games.save_id
     JOIN game metadata ON metadata.game_id = games.game_id
     WHERE metadata.participants IS NULL
     ORDER BY games.createtime DESC`,
  ) as Array<LatestGameRow>;

  const stats: BackfillStats = {scanned: rows.length, updated: 0, skipped: 0, failed: 0};
  for (const row of rows) {
    try {
      const game = parseJson<SerializedGame>(row.game);
      const shortData = parseJson<IShortData>(row.prop) ?? (game === undefined ? undefined : buildShortData(game));
      if (shortData === undefined) {
        // 无法得到短数据的老记录跳过，不制造空 metadata。
        stats.skipped++;
        continue;
      }
      const gameOptions = getGameOptions(game);
      // 只 UPDATE 已有 game 行；changes 为 0 表示目标 game 行不存在。
      const update = await db.asyncRun(
        `UPDATE game
         SET participants = ?,
             userids = ?,
             prop = ?,
             updated_time = COALESCE(?, updated_time),
             status = COALESCE(?, status),
             options = CASE
               WHEN LENGTH(options) < 10 AND ? IS NOT NULL THEN ?
               ELSE options
             END
         WHERE game_id = ?`,
        [
          JSON.stringify(buildParticipants(shortData, game)),
          JSON.stringify(buildUserIds(shortData, game)),
          JSON.stringify(shortData),
          getUpdatedTime(row, shortData),
          row.status,
          gameOptions,
          gameOptions,
          row.game_id,
        ],
      );
      if (update.changes === 0) {
        stats.skipped++;
      } else {
        stats.updated++;
      }
    } catch (err) {
      stats.failed++;
      console.error(`[backfill_game_metadata] failed ${row.game_id}`, err);
    }
  }
  return stats;
}

// 脚本入口只执行数据回填；表结构 SQL 只记录在常量里，需手动执行。
async function main() {
  const stats = process.env.POSTGRES_HOST !== undefined ?
    await backfillPostgreSQL() :
    await backfillSQLite();
  console.log(`[backfill_game_metadata] scanned=${stats.scanned} updated=${stats.updated} skipped=${stats.skipped} failed=${stats.failed}`);
  if (stats.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[backfill_game_metadata] fatal', err);
  process.exitCode = 1;
});
