import {Database} from '../../src/database/Database';
import {IDatabase} from '../../src/database/IDatabase';

const FAKE_DATABASE: IDatabase = {
  cleanSaves: () => {},
  deleteGameNbrSaves: () => {},
  getClonableGames: () => {},
  getClonableGameByGameId: () => {},
  getGame: () => {},
  getGameId: () => {},
  getGameVersion: () => {},
  getGames: () => {},
  initialize: () => Promise.resolve(),
  restoreGame: () => {},
  saveGameResults: () => {},
  saveGameState: () => {},
  purgeUnfinishedGames: () => {},
  restoreReferenceGame: () => {},
  cleanGame: () => {},
  cleanGameSave: () => {},
  saveUser: () => {},
  getUsers: () => {},
  refresh: () => {},
};

let databaseUnderTest: IDatabase = FAKE_DATABASE;

export function restoreTestDatabase() {
  databaseUnderTest = FAKE_DATABASE;
}

Database.getInstance = function() {
  // don't save to database during tests
  return databaseUnderTest;
};

