import {Database} from '../../src/server/database/Database';
import {IDatabase} from '../../src/server/database/IDatabase';
import {SerializedGame} from '../../src/server/SerializedGame';
import {GameLoader} from '../../src/server/database/GameLoader';
import {globalInitialize} from '../../src/server/globalInitialize';
import {UserRank} from '../../src/common/rank/RankManager';
import {State} from '../../src/server/database/IGameLoader';
import {LoadState} from '../../src/server/Game';
import {IGame} from '../../src/server/IGame';

const FAKE_DATABASE: IDatabase = {
  markFinished: () => Promise.resolve(),
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
  purgeUnfinishedGames: () => Promise.resolve([]),
  compressCompletedGames: () => Promise.resolve(),
  stats: () => Promise.resolve({}),
  cleanGame: () => Promise.resolve(),
  cleanGameAllSaves: () => {},
  cleanGameSave: () => {},
  saveUser: () => {},
  getUsers: () => {},
  refresh: () => {},
  storeParticipants: () => Promise.resolve(),
  getParticipants: () => Promise.resolve([]),

  // 天梯测试
  addUserRank: () => Promise.resolve(),
  getUserRanks: () => Promise.resolve({} as UserRank[]),
  updateUserRank: () => Promise.resolve(),
  saveUserGameResult: () => {},
  updateUserProp: () => Promise.resolve(),
  getUserGameStats: () => Promise.resolve({
    allTime: {totalGames: 0, wins: 0, losses: 0, winRate: 0, fleeCount: 0, fleeRate: 0, avgScore: 0, avgPosition: 0, totalRankGames: 0, rankWins: 0},
    recent3Months: {totalGames: 0, wins: 0, losses: 0, winRate: 0, fleeCount: 0, fleeRate: 0, avgScore: 0, avgPosition: 0, totalRankGames: 0, rankWins: 0},
  }),

  // 赛季
  saveSeasonSnapshot: () => Promise.resolve(),
  getSeasonSnapshots: () => Promise.resolve([]),
  updateUserPoints: () => Promise.resolve(),
  getCurrentSeason: () => Promise.resolve(undefined),
  setCurrentSeason: () => Promise.resolve(),
  getAvailableSeasons: () => Promise.resolve([]),

  // 兼容
  // getGameIds: () => Promise.resolve([]),
  // loadCloneableGame: () => Promise.resolve({} as SerializedGame),
  // updateUser: () => {},
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
gameLoaderUnderTest.state = State.READY;
const oldadd = gameLoaderUnderTest.add;
gameLoaderUnderTest.add = function(game: IGame) {
  oldadd.call(gameLoaderUnderTest, game);
  game.loadState = LoadState.LOADED;
};
export function restoreTestGameLoader() {
  setTestGameLoader(defaultGameLoader);
}
export function setTestGameLoader(gameLoader: GameLoader) {
  gameLoaderUnderTest = gameLoader;
}
GameLoader.getInstance = () => gameLoaderUnderTest;
globalInitialize();
