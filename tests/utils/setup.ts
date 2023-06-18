import {Database} from '../../src/server/database/Database';
import {IDatabase} from '../../src/server/database/IDatabase';
import {SerializedGame} from '../../src/server/SerializedGame';
import {GameLoader} from '../../src/server/database/GameLoader';
import {registerBehaviorExecutor} from '../../src/server/behavior/BehaviorExecutor';
import {Executor} from '../../src/server/behavior/Executor';
import {UserRank} from '../../src/common/rank/RankManager';

registerBehaviorExecutor(new Executor());

const FAKE_DATABASE: IDatabase = {
  cleanGame: () => Promise.resolve(),
  deleteGameNbrSaves: () => Promise.resolve(),
  getPlayerCount: () => Promise.resolve(0),
  getGame: () => Promise.resolve({} as SerializedGame),
  getGameId: () => Promise.resolve('g'),
  getGameVersion: () => Promise.resolve({} as SerializedGame),
  getGames: () => Promise.resolve([]),
  getSaveIds: () => Promise.resolve([]),
  initialize: () => Promise.resolve(),
  restoreGame: () => Promise.reject(new Error('game not found')),
  saveGameResults: () => {},
  saveGame: () => Promise.resolve(),
  purgeUnfinishedGames: () => Promise.resolve(),
  stats: () => Promise.resolve({}),
  cleanGameAllSaves: () => {},
  cleanGameSave: () => {},
  saveUser: () => {},
  getUsers: () => {},
  refresh: () => {},
  loadCloneableGame: () => Promise.resolve({} as SerializedGame),
  storeParticipants: () => Promise.resolve(),
  getParticipants: () => Promise.resolve([]),

  // 天梯测试
  addUserRank: () => Promise.resolve(),
  getUserRanks: () => Promise.resolve({} as UserRank[]),
  updateUserRank: () => Promise.resolve(),
  saveUserGameResult: () => {},
};

let databaseUnderTest: IDatabase = FAKE_DATABASE;
export function restoreTestDatabase() {
  setTestDatabase(FAKE_DATABASE);
}
export function setTestDatabase(db: IDatabase) {
  databaseUnderTest = db;
}
Database.getInstance = () => databaseUnderTest;

const defaultGameLoader = GameLoader.getInstance();
let gameLoaderUnderTest: GameLoader = GameLoader.getInstance();
export function restoreTestGameLoader() {
  setTestGameLoader(defaultGameLoader);
}
export function setTestGameLoader(gameLoader: GameLoader) {
  gameLoaderUnderTest = gameLoader;
}
GameLoader.getInstance = () => gameLoaderUnderTest;
