import {Game} from '../Game';
import {PlayerId, SpectatorId} from '../common/Types';

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
  add(game: Game): void;
  // getLoadedGameIds(): Array<string>;
  /**
   * Gets a game from javascript memory or pulls from database if needed.
   * @param {GameId} gameId the id of the game to retrieve
   * @param {boolean} bypassCache always pull from database
   */
  // getByGameId(gameId: GameId, bypassCache: boolean): Promise<Game | undefined>;
  getByParticipantId(playerId: PlayerId | SpectatorId): Promise<Game | undefined>;
  // restoreGameAt(gameId: GameId, saveId: number): Promise<Game>;
}
