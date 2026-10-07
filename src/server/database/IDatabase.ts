import {IGame, Score} from '../IGame';
import {GameOptions} from '../game/GameOptions';
import {SerializedGame} from '../SerializedGame';
import {SerializedPlayer} from '../SerializedPlayer';
import {GameId} from '../../common/Types';
import {Phase} from '../../common/Phase';
import {User} from '../User';
import {UserRank} from '../../common/rank/RankManager';

export class GameNotFoundError extends Error {
  constructor(gameId: string) {
    super(`Game ${gameId} not found`);
    this.name = 'GameNotFoundError';
  }
}

export class UserNameExistsError extends Error {
  constructor(name: string) {
    super(`User name ${name} already exists`);
    this.name = 'UserNameExistsError';
  }
}

export interface IUserGameStatsBlock {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    fleeCount: number;
    fleeRate: number;
    avgScore: number;
    avgPosition: number;
    totalRankGames: number;
    rankWins: number;
}

export interface IUserGameStats {
    allTime: IUserGameStatsBlock;
    recent3Months: IUserGameStatsBlock;
}

export interface IShortData {
    id:string,
    phase : Phase,
    createtime : string,
    updatetime : string,
    gameAge :number,
    lastSaveId :number,

    //  id name color exited userId
    players : Array<SerializedPlayer>;
}
export interface IGameMetadata {
    gameId: GameId;
    shortData? :IShortData;
    // 单局唯一参与者标识，只放 playerId/spectatorId，不放账号 userId。
    participants: Array<string>;
    // 账号维度归属，用于“我的游戏”这类 userId 查询。
    userids: Array<string>;
    updatedTime: string;
}

export interface IUserRankSeasonSnapshot {
    userId: string;
    userName: string;
    rankValue: number;
    mu: number;
    sigma: number;
    trueskill: number;
    pointsEarned: number;
    finalPosition: number;
}

/**
 * A game store. Load, save, you know the drill.
 *
 * Each game has a unique ID represented belowe as `gameId`. As games proceed,
 * the game is saved at later states. Inidividual saves of a game's state have a
 * unique and growing `saveId`. A game's initial _save point_ is always 0.
 *
 * Game state is stored as a single JSON string, which is why the `game` parameter is
 * often JSON.
 *
 * Finally, `players` as a number merely represents the number of players
 * in the game. Why, I have no idea, says kberg.
*/
export interface IDatabase {
    /**
     * Creates any tables needed
     */
    initialize(): Promise<unknown>;

    /**
     * Pulls most recent version of game
     * @param gameId the game id to load
     */
    getGame(gameId: string): Promise<SerializedGame>;

    /**
     * Get all the save ids assocaited with a game.
     */
    getSaveIds(gameId: GameId): Promise<Array<number>>;

    /**
     * Load a game at a specific save point.
     */
    getGameVersion(gameId: GameId, saveId: number): Promise<SerializedGame>;

    /**
     * 返回列表页用的轻量游戏元数据，不反序列化完整 games 存档。
     */
    getGames(): Promise<Array<IGameMetadata>>;

    /**
     * 按 playerId/spectatorId 查询游戏 id；这里不处理账号 userId。
     */
    getGameIdByParticipant(participantId: string): Promise<GameId | undefined>;

    /**
     * 按账号 userId 一次性查询最近的游戏元数据，避免先查 id 再逐条查 metadata。
     */
    getGamesByUserId(userId: string, limit?: number): Promise<Array<IGameMetadata>>;

    /**
     * Get the player count for a game.
     *
     * @param gameId the game id to search for
     */
    getPlayerCount(gameId: GameId): Promise<number>;

    /**
     * Saves the current state of the game at a supplied save point. Used for
     * interim game updates.
     *
     * Do not call directly.
     * game to increment its state count.
     */
    // TODO(kberg): why is `players` a useful first-class piece of data?
    saveGame(game: IGame): Promise<void>;

    /**
     * Stores the results of a game in perpetuity in a separate table from normal
     * games. Called at a game's conclusion along with {@link markFinished}.
     *
     * This is not impliemented in {@link SQLite}.
     *
     * @param generations the generation number at the end of the game
     * @param gameOptions the options used for this game.
     * @param scores an array of scores correlated to the player's corporation.
     */
    saveGameResults(gameId: GameId, players: number, generations: number, gameOptions: GameOptions, scores: Array<Score>): void;

    /**
     * The meat behind player undo. Loads the game at the given save point
     * and overwrites all data in `game`.
     */
    // TODO(kberg): it's not clear to me how this save_id is known to
    // be the absolute prior game id, so that could use some clarification.
    restoreGame(game_id: GameId, save_id: number, game: IGame, playId: string): Promise<IGame>;

    /*
     * Deletes the last `rollbackCount` saves of the specified game.
     *
     * Used as part of undo, reset, and via API to roll back a broken game.
     */
    deleteGameNbrSaves(gameId: GameId, rollbackCount: number): Promise<void>;

    /**
     * A maintenance task on a single game to mark it as complete.
     *
     * It will:
     *
     * * Mark the game as finished.
     * * Put it on queue to compress it after a given amount of time.
     *   (Purges all saves between `(0, last save]`.)
     */
    cleanGame(gameId: GameId): Promise<void>;
    markFinished(gameId: GameId): Promise<void>;
    // DELETE all saves
    cleanGameAllSaves(game_id: string): void;
    cleanGameSave(game_id: string, save_id: number): void;
    saveUser(id: string, name: string, password: string, prop: string): Promise<void>;
    updateUserProp(id: string, prop: string): void;
    getUsers(cb:(err: any, allUsers:Array<User>)=> void): void ;

    /**
     * 按 userId 单查用户，供 GameLoader 懒加载使用，避免启动时全量加载 users。
     */
    getUser(id: string): Promise<User | undefined>;

    /**
     * 按用户名单查用户，供登录等路径懒加载使用。
     */
    getUserByName(name: string): Promise<User | undefined>;
    refresh(): void ;

    /**
     * 按 game 表状态清理早于 dayAgo 的未完结游戏。
     * 返回被清理的 gameId。
     */
    purgeUnfinishedGames(dayAgo?: string): Promise<Array<GameId>>;

    /**
     * Generate database statistics for admin purposes.
     *
     * Key/value responses will vary between databases.
     */
    stats(): Promise<{[key: string]: string | number}>;

    addUserRank(userRank: UserRank): void ;

    /**
     * 按 userId 单查排名，避免启动时全量加载 user_rank。
     */
    getUserRank(userId: string): Promise<UserRank | undefined>;
    getUserRanks(limit?: number, seasonId?: string): Promise<Array<UserRank>>;
    updateUserRank(userRank: UserRank): Promise<void>;
    saveUserGameResult(user_id: string, game_id: string, phase: string, score: Score, players: number, generations: number, create_time: string, position: number, is_rank: boolean, user_rank: UserRank | undefined, is_timeout?: boolean): void;

    /**
     * Get aggregated game stats for a user.
     * Returns all-time and recent (last 3 months) stats.
     */
    getUserGameStats(userId: string): Promise<IUserGameStats>;

    // 赛季相关
    saveUserRankSeasonSnapshot(userId: string, seasonId: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number): Promise<void>;
    getUserRankSeasonSnapshots(seasonId: string, limit?: number): Promise<Array<IUserRankSeasonSnapshot>>;
    getAvailableSeasons(): Promise<Array<string>>;
    updateUserPoints(userId: string, points: number): Promise<void>;
  setCurrentSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void>;
  getCurrentSeason(): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined>;
  saveSeason(seasonId: string, seasonName: string, startDate: Date, endDate: Date): Promise<void>;
  getSeason(seasonId: string): Promise<{seasonId: string, seasonName: string, startDate: string, endDate: string} | undefined>;
}
