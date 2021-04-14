import {Game, SpectatorId} from '../Game';
import {PlayerId} from '../Player';

type LoadCallback = (game: Game | undefined) => void;
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
   * @param {LoadCallback} cb called with game when available
   */
  // getByGameId(gameId: GameId, bypassCache: boolean, cb: LoadCallback): void;
  getByPlayerId(playerId: PlayerId, cb: LoadCallback): void;
  getBySpectatorId(spectatorId: SpectatorId, cb: LoadCallback): void;
  // restoreGameAt(gameId: GameId, saveId: number, cb: LoadCallback): void;
}
