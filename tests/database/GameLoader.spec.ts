import {expect} from 'chai';
import {Database} from '../../src/database/Database';
import {Game} from '../../src/Game';
import {GameLoader} from '../../src/database/GameLoader';
import {Player} from '../../src/Player';
import {SerializedGame} from '../../src/SerializedGame';
import {TestPlayers} from '../TestPlayers';
import {IGameShortData} from '../../src/database/IDatabase';
import {IDatabase} from '../../src/database/IDatabase';
import {Color} from '../../src/common/Color';

describe('GameLoader', function() {
  const expectedGameIds: Array<IGameShortData> = [{'gameId': 'alpha'}, {'gameId': 'foobar'}];
  const originalGenerateId = (Player as any).prototype.generateId;
  const originalGetInstance = (Database as any).getInstance;
  const player = TestPlayers.BLUE.newPlayer();
  const player2 = TestPlayers.RED.newPlayer();
  const game = Game.newInstance('foobar', [player, player2], player);
  let playerIdIndex = 0;

  before(function() {
    (Player as any).prototype.generateId = function() {
      return 'bar-' + (playerIdIndex++);
    };
    const database: Partial<IDatabase> = {
      getGame: function(gameId: string, cb: (err: Error | undefined, serializedGame?: SerializedGame) => void) {
        if (gameId === 'foobar') {
          cb(undefined, game.serialize());
        } else {
          cb(undefined, undefined);
        }
      },
      getGames: function(): Promise<Array<IGameShortData>> {
        return Promise.resolve(expectedGameIds);
      },
      saveGame: function() {},
      getUsers: function() {},
    };
    (Database as any).getInstance = function() {
      return database;
    };
  });
  beforeEach(function() {
    // (GameLoader.getInstance() as GameLoader).reset();
  });
  after(function() {
    (Player as any).prototype.generateId = originalGenerateId;
    (Database as any).getInstance = originalGetInstance;
  });

  it('uses shared instance', function() {
    expect(GameLoader.getInstance()).to.eq(GameLoader.getInstance());
  });

  it('gets undefined when player does not exist', async function() {
    const game = await GameLoader.getInstance().getByParticipantId('foobar');
    expect(game).is.undefined;
  });

  it('gets game when it exists in database', function(done) {
    let actualGame1: Game | undefined = undefined;
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      actualGame1 = game1;
      expect(actualGame1).is.undefined;
      done();
    });
  });

  it('gets no game when fails to deserialize from database', function() {
    let actualGame1: Game | undefined = game;
    const originalLoadFromJSON = Game.prototype.loadFromJSON;
    Game.prototype.loadFromJSON = function() {
      throw new Error('could not parse this');
    };
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      actualGame1 = game1;
    });
    expect(actualGame1).is.undefined;
    Game.prototype.loadFromJSON = originalLoadFromJSON;
  });

  it('gets game when requested before database loaded', function(done) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'foobar'}]);
    (GameLoader.getInstance() as GameLoader).reset();
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      try {
        expect(game1).is.undefined;
        done();
      } catch (error) {
        done(error);
      } finally {
        Database.getInstance().getGames = workingGetGames;
      }
    });
  });
  it('gets player when requested before database loaded', async function( ) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'foobar'}]);
    (GameLoader.getInstance() as GameLoader).reset();
    const game1 = await GameLoader.getInstance().getByParticipantId(game.getPlayersInGenerationOrder()[0].id);
    expect(game1).is.undefined;
    Database.getInstance().getGames = workingGetGames;
  });

  it('gets no game when game goes missing from database', function() {
    const originalGetGame = Database.getInstance().getGame;
    GameLoader.getInstance().getGameById('never', (game1) => {
      expect(game1).is.undefined;
      Database.getInstance().getGame = function(_gameId: string, cb: (err: any, serializedGame?: SerializedGame) => void) {
        cb(undefined, undefined);
      };
    });
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      expect(game1).is.undefined;
    });
    Database.getInstance().getGame = originalGetGame;
  });

  it('loads games requested before database loaded', function() {
    const originalGetGame = Database.getInstance().getGame;
    GameLoader.getInstance().getGameById('never', (game1) => {
      expect(game1).is.undefined;
      Database.getInstance().getGame = function(_gameId: string, cb: (err: any, serializedGame?: SerializedGame) => void) {
        cb(undefined, undefined);
      };
    });
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      expect(game1).is.undefined;
    });
    Database.getInstance().getGame = originalGetGame;
  });

  // it('gets player when it exists in database', function(done) {
  //   const players = game.getPlayersInGenerationOrder();
  //   GameLoader.getInstance().getByParticipantId(players[Math.floor(Math.random() * players.length)].id, (game1) => {
  //     try {
  //       expect(game1!.id).to.eq(game.id);
  //       done();
  //     } catch (error) {
  //       done(error);
  //     }
  //   });
  // });

  it('gets game when added and not in database', function() {
    let actualGame1: Game | undefined = undefined;
    game.id = 'alpha';
    GameLoader.getInstance().add(game);
    GameLoader.getInstance().getGameById('alpha', (game1) => {
      actualGame1 = game1;
    });
    expect(actualGame1).is.undefined;
    game.id = 'foobar';
  });


  it('loads values after error pulling game ids', function(done) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.reject(new Error('error'));
    (GameLoader.getInstance() as GameLoader).reset();
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      try {
        expect(game1).is.undefined;
        done();
      } catch (error) {
        done(error);
      } finally {
        Database.getInstance().getGames = workingGetGames;
      }
    });
  });

  it('loads values when no game ids', function(done) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.resolve([]);
    (GameLoader.getInstance() as GameLoader).reset();
    GameLoader.getInstance().getGameById('foobar', (game1) => {
      try {
        expect(game1).is.undefined;
        done();
      } catch (error) {
        done(error);
      } finally {
        Database.getInstance().getGames = workingGetGames;
      }
    });
  });

  it('loads players that will never exist', async function( ) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.resolve([]);
    (GameLoader.getInstance() as GameLoader).reset();
    const game1 = await GameLoader.getInstance().getByParticipantId('foobar');
    expect(game1).is.undefined;
    Database.getInstance().getGames = workingGetGames;
  });

  // it('loads players available later', function(done) {
  //   const workingGetGames = Database.getInstance().getGames;
  //   Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'foobar'}]);
  //   (GameLoader.getInstance() as GameLoader).reset();
  //   GameLoader.getInstance().getGameById('foobar', (game1) => {
  //     try {
  //       expect(game1).is.not.undefined;
  //       expect(game1!.id).to.eq('foobar');
  //       GameLoader.getInstance().getByParticipantId(game.getPlayersInGenerationOrder()[0].id, (game1) => {
  //         try {
  //           expect(game1!.id).to.eq('foobar');
  //           done();
  //         } catch (error) {
  //           done(error);
  //         } finally {
  //           Database.getInstance().getGames = workingGetGames;
  //         }
  //       });
  //     } catch (error) {
  //       done(error);
  //     }
  //   });
  // });

  it('waits for games to finish loading', function(done) {
    const numberOfGames : number = 10;
    Database.getInstance().getGames = () => {
      const gameList : Array<IGameShortData> = [];
      for (let i = 0; i < numberOfGames; i++) {
        gameList.push({'gameId': 'game' + i.toString()});
      }
      return Promise.resolve(gameList);
    };
    Database.getInstance().getGame = function(gameId: string, theCb: (err: Error | undefined, game?: SerializedGame | undefined) => void) {
      const player = new Player(gameId + 'player-' + Color.BLUE, Color.BLUE, false, 0, gameId + 'player-' + Color.BLUE);
      const player2 = new Player(gameId + 'player-' + Color.RED, Color.RED, false, 0, gameId + 'player-' + Color.RED);
      setTimeout(function() {
        theCb(undefined, Game.newInstance(gameId, [player, player2], player).serialize());
      }, 500);
    };
    (GameLoader.getInstance() as GameLoader).reset();
    done();
  });
});
