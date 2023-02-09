import {expect} from 'chai';
import {Database} from '../../src/server/database/Database';
import {Game} from '../../src/server/Game';
import {GameLoader} from '../../src/server/database/GameLoader';
import {Player} from '../../src/server/Player';
import {SerializedGame} from '../../src/server/SerializedGame';
import {IGameShortData} from '../../src/server/database/IDatabase';
import {IDatabase} from '../../src/server/database/IDatabase';
import {TestPlayer} from '../TestPlayer';

describe('GameLoader', function() {
  const expectedGameIds: Array<IGameShortData> = [{'gameId': 'galpha'}, {'gameId': 'gfoobar'}];
  const originalGenerateId = (Player as any).prototype.generateId;
  const originalGetInstance = (Database as any).getInstance;
  const player = TestPlayer.BLUE.newPlayer();
  const player2 = TestPlayer.RED.newPlayer();
  const game = Game.newInstance('gfoobar', [player, player2], player);
  let playerIdIndex = 0;

  before(function() {
    (Player as any).prototype.generateId = function() {
      return 'bar-' + (playerIdIndex++);
    };
    const database: Partial<IDatabase> = {
      getGame: function(gameId: string) : Promise<SerializedGame > {
        if (gameId === 'gfoobar') {
          return Promise.resolve(game.serialize());
        } else {
          return Promise.resolve( game.serialize());
        }
      },
      getGames: function(): Promise<Array<IGameShortData>> {
        return Promise.resolve(expectedGameIds);
      },
      saveGame: function(): Promise<void> {
        return Promise.resolve();
      },
      getUsers: function(): Promise<void> {
        return Promise.resolve();
      },
      initialize: function(): Promise<void> {
        return Promise.resolve();
      },
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
    const game = await GameLoader.getInstance().getByParticipantId('pfoobar');
    expect(game).is.undefined;
  });

  it('gets game when it exists in database', function(done) {
    let actualGame1: Game | undefined = undefined;
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
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
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
      actualGame1 = game1;
    });
    expect(actualGame1).is.undefined;
    Game.prototype.loadFromJSON = originalLoadFromJSON;
  });

  it('gets game when requested before database loaded', function(done) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'gfoobar'}]);
    (GameLoader.getInstance() as GameLoader).reset();
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
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
    Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'gfoobar'}]);
    (GameLoader.getInstance() as GameLoader).reset();
    const game1 = await GameLoader.getInstance().getByParticipantId(game.getPlayersInGenerationOrder()[0].id);
    expect(game1).is.not.undefined;
    Database.getInstance().getGames = workingGetGames;
  });

  it('gets no game when game goes missing from database', function() {
    const originalGetGame = Database.getInstance().getGame;
    GameLoader.getInstance().getGameById('never', (game1) => {
      expect(game1).is.undefined;
    });
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
      expect(game1).is.not.undefined;
    });
    Database.getInstance().getGame = originalGetGame;
  });

  it('loads games requested before database loaded', function() {
    const originalGetGame = Database.getInstance().getGame;
    GameLoader.getInstance().getGameById('never', (game1) => {
      expect(game1).is.undefined;
    });
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
      expect(game1).is.not.undefined;
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
    game.id = 'galpha';
    GameLoader.getInstance().add(game);
    GameLoader.getInstance().getGameById('galpha', (game1) => {
      actualGame1 = game1;
    });
    expect(actualGame1).is.undefined;
    game.id = 'gfoobar';
  });


  it('loads values after error pulling game ids', function(done) {
    const workingGetGames = Database.getInstance().getGames;
    Database.getInstance().getGames = () => Promise.reject(new Error('error'));
    (GameLoader.getInstance() as GameLoader).reset();
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
      try {
        expect(game1).is.not.undefined;
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
    GameLoader.getInstance().getGameById('gfoobar', (game1) => {
      try {
        expect(game1).is.not.undefined;
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
    const game1 = await GameLoader.getInstance().getByParticipantId('pfoobar');
    expect(game1).is.undefined;
    Database.getInstance().getGames = workingGetGames;
  });

  // it('loads players available later', function(done) {
  //   const workingGetGames = Database.getInstance().getGames;
  //   Database.getInstance().getGames = () => Promise.resolve([{'gameId': 'gfoobar'}]);
  //   (GameLoader.getInstance() as GameLoader).reset();
  //   GameLoader.getInstance().getGameById('gfoobar', (game1) => {
  //     try {
  //       expect(game1).is.not.undefined;
  //       expect(game1!.id).to.eq('gfoobar');
  //       GameLoader.getInstance().getByParticipantId(game.getPlayersInGenerationOrder()[0].id, (game1) => {
  //         try {
  //           expect(game1!.id).to.eq('gfoobar');
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
});
