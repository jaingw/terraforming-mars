// Exports a game locally for debugging.
// See README.md for instructions.

import {mkdirSync, writeFileSync} from 'fs';
import path from 'path';
import {GameId, isGameId, isPlayerId, isSpectatorId} from '../../common/Types';
import {Database} from '../database/Database';
import {IDatabase} from '../database/IDatabase';
import {GameLoader} from '../database/GameLoader';
import {State} from '../database/IGameLoader';
import {exportLogs} from './exportLogs';

const args = process.argv.slice(2);
const id = args[0];

if (id === undefined) {
  throw new Error('missing game id');
}

const db: IDatabase = Database.getInstance();
const exportRoot = path.resolve(process.cwd(), './db/files');
const historyRoot = path.resolve(exportRoot, 'history');

async function getGameId(id: string): Promise<GameId | undefined> {
  if (isGameId(id)) {
    return id;
  }
  if (isPlayerId(id) || isSpectatorId(id)) {
    console.log(`Finding game for player/spectator ${id}`);
    const game = await (await getGameLoader()).getByPlayerId(id);
    return game?.id;
  }
  return undefined;
}

async function getGameLoader(): Promise<GameLoader> {
  const loader = GameLoader.getInstance();
  if (loader.state === State.READY) {
    return loader;
  }
  return await new Promise((resolve) => {
    loader.start(() => resolve(loader));
  });
}

async function main() {
  const gameId = await getGameId(id);
  if (gameId === undefined) {
    console.log('Game is undefined');
    process.exit(1);
  }
  await load(gameId);
}

function showProgressBar(current: number, total: number, width: number = process.stdout.columns ?? 40) {
  const bar = '█';
  const emptyBar = ' ';

  // reserve space for the end
  width = width - 10;

  const filledLength = Math.floor((current / total) * width);
  const emptyLength = width - filledLength;

  const progressString = bar.repeat(filledLength) + emptyBar.repeat(emptyLength);

  const percentage = Math.round((current / total) * 100);

  process.stdout.write(`\r${progressString} ${percentage}% ${current}`);
}

async function load(gameId: GameId) {
  mkdirSync(historyRoot, {recursive: true});
  console.log(`Loading game ${gameId}`);
  const game = await db.getGame(gameId);

  console.log(`Last version is ${game.lastSaveId}`);
  let errors = 0;
  let writes = 0;

  const saveIds = await db.getSaveIds(gameId);
  for (const saveId of saveIds) {
    try {
      const serialized = await db.getGameVersion(gameId, saveId);
      showProgressBar(saveId, game.lastSaveId);
      saveSerializedGame(serialized);
      writes++;
    } catch (err) {
      console.warn(`failed to process saveId ${saveId}: ${err}`);
      errors++;
    }
  }

  console.log(); // Necessary because of the ANSI output above.

  try {
    mkdirSync('logs');
  } catch (_) {
    // ignored. Most of the time this isn't a problem.
  }

  const logs = await exportLogs(db, gameId);
  const logFilename = `logs/${gameId}.log`;

  writeFileSync(logFilename, logs.join('\n'));
  console.log(`Log at ${logFilename}`);
  console.log(`Wrote ${writes} records and had ${errors} failures.`);
  console.log(`id: ${gameId}`);
}

function saveSerializedGame(serializedGame: Awaited<ReturnType<IDatabase['getGame']>>) {
  const text = JSON.stringify(serializedGame, null, 2);
  writeFileSync(path.resolve(exportRoot, `${serializedGame.id}.json`), text);
  const saveIdString = serializedGame.lastSaveId.toString().padStart(5, '0');
  writeFileSync(path.resolve(historyRoot, `${serializedGame.id}-${saveIdString}.json`), text);
}

main();
