import {GameIdLedger, IDatabase, IGameShortData} from './IDatabase';
import {Game, Score} from '../Game';
import {GameOptions} from '../GameOptions';
import {GameId} from '../../common/Types';
import {SerializedGame} from '../SerializedGame';
import {Dirent} from 'fs';

const path = require('path');
const fs = require('fs');
const defaultDbFolder = path.resolve(process.cwd(), './db/files');

export class LocalFilesystem implements IDatabase {
  protected readonly dbFolder: string;
  private readonly historyFolder: string;
  constructor(dbFolder: string = defaultDbFolder) {
    this.dbFolder = dbFolder;
    this.historyFolder = path.resolve(dbFolder, 'history');
  }

  async initialize(): Promise<void> {

  }

  private filename(gameId: string): string {
    return path.resolve(this.dbFolder, `${gameId}.json`);
  }

  private historyFilename(gameId: string, saveId: number) {
    const saveIdString = saveId.toString().padStart(5, '0');
    return path.resolve(this.historyFolder, `${gameId}-${saveIdString}.json`);
  }
  saveSerializedGame(serializedGame: SerializedGame): void {
    const text = JSON.stringify(serializedGame, null, 2);
    fs.writeFileSync(this.filename(serializedGame.id), text);
    fs.writeFileSync(this.historyFilename(serializedGame.id, serializedGame.lastSaveId), text);
  }

  getGame(game_id: GameId): Promise<SerializedGame> {
    try {
      console.log(`Loading ${game_id}`);
      const text = fs.readFileSync(this.filename(game_id));
      const serializedGame = JSON.parse(text);
      return Promise.resolve(serializedGame);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      throw error;
    }
  }

  getGameId(_playerId: string): Promise<GameId> {
    throw new Error('Not implemented');
  }

  getSaveIds(gameId: GameId): Promise<Array<number>> {
    const re = /(.*)-(.*).json/;
    const results = fs.readdirSync(this.historyFolder, {withFileTypes: true})
      .filter((dirent: Dirent) => dirent.name.startsWith(gameId + '-'))
      .filter((dirent: Dirent) => dirent.isFile())
      .map((dirent: Dirent) => dirent.name.match(re))
      .filter((result: RegExpMatchArray) => result !== null)
      .map((result: RegExpMatchArray) => result[2]);
    return Promise.resolve(results);
  }

  getGameVersion(_game_id: GameId, _save_id: number): Promise<SerializedGame> {
    throw new Error('Not implemented');
  }

  getPlayerCount(gameId: GameId): Promise<number> {
    return this.getGames().then((gameIds) => {
      const found = gameIds.find((gId) => gId.gameId === gameId && fs.existsSync(this.historyFilename(gameId, 0)));
      if (found === undefined) {
        throw new Error(`${gameId} not found`);
      }
      const text = fs.readFileSync(this.historyFilename(gameId, 0));
      const serializedGame = JSON.parse(text) as SerializedGame;
      return serializedGame.players.length;
    });
  }

  loadCloneableGame(game_id: GameId): Promise<SerializedGame> {
    try {
      console.log(`Loading ${game_id} at save point 0`);
      const text = fs.readFileSync(this.historyFilename(game_id, 0));
      const serializedGame = JSON.parse(text);
      return Promise.resolve(serializedGame);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return Promise.reject(error);
    }
  }

  getGames(): Promise<Array<IGameShortData>> {
    const gameIds: Array<IGameShortData> = [];

    // TODO(kberg): use readdir since this is expected to be async anyway.
    fs.readdirSync(this.dbFolder, {withFileTypes: true}).forEach((dirent: Dirent) => {
      if (!dirent.isFile()) {
        return;
      }
      const re = /(.*).json/;
      const result = dirent.name.match(re);
      if (result === null) {
        return;
      }
      gameIds.push({gameId: result[1] as GameId});
    });
    return Promise.resolve(gameIds);
  }

  saveGameResults(_gameId: GameId, _players: number, _generations: number, _gameOptions: GameOptions, _scores: Array<Score>): void {
    // Not implemented
  }

  cleanGame(_gameId: GameId): Promise<void> {
    // Not implemented here.
    return Promise.resolve();
  }

  purgeUnfinishedGames(): Promise<void> {
    // Not implemented.
    return Promise.resolve();
  }
  async restoreGame(game_id: GameId, save_id: number, _game: Game, _playId: string): Promise<void> {
    await fs.copyFile(this.historyFilename(game_id, save_id), this.filename(game_id));
    // return this.getGame(game_id);
    return Promise.resolve();
  }

  deleteGameNbrSaves(_gameId: GameId, _rollbackCount: number): Promise<void> {
    console.error('deleting old saves not implemented.');
    return Promise.resolve();
  }

  public stats(): Promise<{[key: string]: string | number}> {
    return Promise.resolve({
      type: 'Local Filesystem',
      path: this.dbFolder.toString(),
      history_path: this.historyFolder.toString(),
    });
  }
  saveUser(_id: string, _name: string, _password: string, _prop: string): void {
    throw new Error('Method not implemented.');
  }
  getUsers(_cb: (err: any, allUsers: import('../User').User[]) => void): void {
    throw new Error('Method not implemented.');
  }
  refresh(): void {
    throw new Error('Method not implemented.');
  }
  saveGame(_game: Game ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  cleanGameAllSaves(_game_id: string): void {
    throw new Error('Method not implemented.');
  }
  cleanGameSave(_game_id: string, _save_id: number): void {
    throw new Error('Method not implemented.');
  }
  storeParticipants(_entry: GameIdLedger): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getParticipants(): Promise<Array<GameIdLedger>> {
    throw new Error('Method not implemented.');
  }
}
