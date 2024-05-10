import {PlayerId, SpectatorId} from '../../common/Types';
import {IGame} from '../IGame';
export enum State {
  /**
   * No id has been requested
   */
  WAITING,
  /**
   * Running query and populating ids
   */
  LOADING,
  /**
   * ids populated from database
   */
  READY
}
/**
 * Loads games from javascript memory or database
 * Loads games from database sequentially as needed
 */
export interface IGameLoader {
  add(game: IGame): void;
  // getLoadedGameIds(): Array<string>;
  /**
   * Gets a game from javascript memory or pulls from database if needed.
   * @param {GameId} gameId the id of the game to retrieve
   * @param {boolean} bypassCache always pull from database
   */
  // getByGameId(gameId: GameId, bypassCache: boolean): Promise<Game | undefined>;
  getByParticipantId(playerId: PlayerId | SpectatorId): Promise<IGame | undefined>;
  // restoreGameAt(gameId: GameId, saveId: number): Promise<Game>;

  /**
   * Saves a game (but takes into account that the game might have already been purged.)
   *
   * Do not call IDatabase.saveGame directly in a running system.
   */
  saveGame(game: IGame): Promise<void>;
  completeGame(game: IGame): Promise<void>;
  maintenance(): Promise<void>;
}
