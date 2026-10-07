import {ParticipantId} from '../../common/Types';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
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
   */
  getGame(id: string): Promise<IGame | undefined>;
  getByPlayerId(playerId: ParticipantId): Promise<IGame | undefined>;
  /**
   * Reload a game at a specific version, deleting all versions ahead of it.
   *
   * @param {GameId} gameId the id of the game to retrieve
   * @param {number} saveId the save id to load
   */
  // restoreGameAt(gameId: GameId, saveId: number): Promise<Game>;

  /**
   * Saves a game (but takes into account that the game might have already been purged.)
   *
   * Do not call IDatabase.saveGame directly in a running system.
   */
  saveGame(game: IGame): Promise<void>;

  /**
   * 预热给定玩家的天梯缓存（命中即缓存，未命中才查库）。
   * 展示层 ServerModel 是同步的，构建玩家模型前需先调用本方法。
   */
  ensureUserRanksLoaded(players: ReadonlyArray<IPlayer>): Promise<void>;
}
