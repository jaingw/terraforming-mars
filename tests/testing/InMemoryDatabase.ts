import {IGame, Score} from '../../src/server/IGame';
import {GameOptions} from '../../src/server/game/GameOptions';
import {SerializedGame} from '../../src/server/SerializedGame';
import {GameNotFoundError, IDatabase, IGameMetadata, UserNameExistsError} from '../../src/server/database/IDatabase';
import {GameId} from '../../src/common/Types';

import {UserRank} from '../../src/common/rank/RankManager';
import {User} from '../../src/server/User';
import {Session, SessionId} from '../../src/server/auth/Session';
import {Clock} from '../../src/common/Timer';
import {normalizeUserId} from '../../src/common/utils/normalizeUserId';

export class InMemoryDatabase implements IDatabase {
  public games: Map<GameId, Array<SerializedGame | undefined>> = new Map();
  protected completedGames: Map<GameId, Date> = new Map();
  protected sessions: Map<SessionId, Session> = new Map();
  protected users: Map<string, User> = new Map();
  protected userRanks: Map<string, UserRank> = new Map();
  private clock: Clock;

  constructor(clock: Clock = new Clock()) {
    this.clock = clock;
  }
  initialize(): Promise<unknown> {
    return Promise.resolve();
  }

  async getGame(gameId: GameId): Promise<SerializedGame> {
    const row = this.games.get(gameId);
    if (row === undefined || row.length === 0) {
      throw new GameNotFoundError(gameId);
    } else {
      const game = row[row.length -1];
      return game!;
    }
  }
  getSaveIds(gameId: GameId): Promise<number[]> {
    const row = this.games.get(gameId);
    if (row === undefined || row.length === 0) {
      return Promise.reject(new Error('not found'));
    } else {
      const result = row!.map((value, idx) => value !== undefined ? idx : undefined);
      return Promise.resolve(result.filter((result) => result !== undefined));
    }
  }
  getGameVersion(gameId: GameId, saveId: number): Promise<SerializedGame> {
    const row = this.games.get(gameId);
    if (row === undefined || row.length === 0) {
      return Promise.reject(new Error(`Game ${gameId} not found`));
    }
    const serializedGame = row[saveId];
    if (serializedGame === undefined) {
      return Promise.reject(new Error(`Game ${gameId} not found`));
    }
    return Promise.resolve(serializedGame);
  }
  getGameIds(): Promise<GameId[]> {
    return Promise.resolve(Array.from(this.games.keys()));
  }
  async getGames(): Promise<Array<IGameMetadata>> {
    return Array.from(this.games.entries()).map(([gameId, saves]) => {
      let game: SerializedGame | undefined;
      for (let idx = saves.length - 1; idx >= 0; idx--) {
        if (saves[idx] !== undefined) {
          game = saves[idx];
          break;
        }
      }
      return {
        gameId,
        participants: game === undefined ? [] : this.getParticipantIds(game),
        userids: game === undefined ? [] : this.getUserIds(game),
        shortData: game === undefined ? undefined : {
          id: game.id,
          phase: game.phase,
          createtime: game.createtime,
          updatetime: game.updatetime,
          gameAge: game.gameAge,
          lastSaveId: game.lastSaveId,
          players: game.players,
        },
        updatedTime: game?.updatetime,
      };
    });
  }
  async getGameIdByParticipant(_participantId: string): Promise<GameId | undefined> {
    return (await this.getGames())
      .find((metadata) => metadata.participants.includes(_participantId))
      ?.gameId;
  }
  async getGamesByUserId(userId: string, limit: number = 30): Promise<Array<IGameMetadata>> {
    return (await this.getGames())
      .filter((metadata) => metadata.userids.includes(normalizeUserId(userId)))
      .slice(0, limit);
  }
  async getPlayerCount(gameId: GameId): Promise<number> {
    const game = await this.getGame(gameId);
    return game.players.length;
  }
  saveGame(game: IGame): Promise<void> {
    const gameId = game.id;
    const row = this.games.get(gameId) || [];
    this.games.set(gameId, row);
    while (row.length <= game.lastSaveId) {
      row.push(undefined);
    }
    row[game.lastSaveId] = game.serialize();
    game.lastSaveId++;
    return Promise.resolve();
  }
  private getParticipantIds(game: SerializedGame): Array<string> {
    const participantIds = new Set<string>(game.players.map((player) => player.id));
    if (game.spectatorId !== undefined) {
      participantIds.add(game.spectatorId);
    }
    return Array.from(participantIds);
  }
  private getUserIds(game: SerializedGame): Array<string> {
    const userIds = new Set<string>();
    for (const player of game.players) {
      if (player.userId !== undefined && player.userId !== '') {
        userIds.add(normalizeUserId(player.userId));
      }
    }
    return Array.from(userIds);
  }
  saveGameResults(_gameId: GameId, _players: number, _generations: number, _gameOptions: GameOptions, _scores: Score[]): void {
    throw new Error('Method not implemented.');
  }
  loadCloneableGame(gameId: GameId): Promise<SerializedGame> {
    return this.getGameVersion(gameId, 0);
  }

  deleteGameNbrSaves(gameId: GameId, rollbackCount: number): Promise<void> {
    const row = this.games.get(gameId);
    if (row === undefined) {
      throw new Error('Game not found ' + gameId);
    }
    row.splice(row.length - rollbackCount, rollbackCount);

    return Promise.resolve();
  }
  markFinished(gameId: GameId): Promise<void> {
    this.completedGames.set(gameId, new Date(this.clock.now()));
    return Promise.resolve();
  }
  purgeUnfinishedGames(dayAgo?: string): Promise<Array<GameId>> {
    if (dayAgo === undefined) {
      return Promise.resolve([]);
    }
    const dayAgoTime = new Date(dayAgo.replace(' ', 'T')).getTime();
    const gameIds: Array<GameId> = [];
    for (const [gameId, saves] of this.games) {
      const latest = saves.slice().reverse().find((save) => save !== undefined);
      if (latest === undefined || this.completedGames.has(gameId)) {
        continue;
      }
      if (new Date(latest.updatetime.replace(' ', 'T')).getTime() < dayAgoTime) {
        gameIds.push(gameId);
      }
    }
    for (const gameId of gameIds) {
      this.games.delete(gameId);
    }
    return Promise.resolve(gameIds);
  }
  stats(): Promise<{[ key: string ]: string | number;}> {
    return Promise.resolve({
      type: 'InMemoryDatabase',
    });
  }
  async saveUser(id: string, name: string, password: string, prop: string): Promise<void> {
    const normalizedName = name.trim().toLowerCase();
    if (Array.from(this.users.values()).some((user) => user.name.trim().toLowerCase() === normalizedName)) {
      throw new UserNameExistsError(name);
    }
    this.users.set(normalizeUserId(id), Object.assign(new User(name, password, id), JSON.parse(prop)));
  }
  getUsers(cb: (err: any, allUsers: User[]) => void): void {
    cb(undefined, Array.from(this.users.values()));
  }
  getUser(id: string): Promise<User | undefined> {
    return Promise.resolve(this.users.get(normalizeUserId(id)));
  }
  getUserByName(name: string): Promise<User | undefined> {
    const normalizedName = name.trim().toLowerCase();
    return Promise.resolve(Array.from(this.users.values()).find((user) => user.name.trim().toLowerCase() === normalizedName));
  }
  refresh(): void {
    throw new Error('Method not implemented.');
  }
  async cleanGame(_gameId: GameId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  cleanGameAllSaves(_game_id: string): void {
    throw new Error('Method not implemented.');
  }
  cleanGameSave(_game_id: string, _save_id: number): void {
    throw new Error('Method not implemented.');
  }
  addUserRank(userRank:UserRank): void {
    this.userRanks.set(normalizeUserId(userRank.userId), userRank);
  }
  getUserRank(userId: string): Promise<UserRank | undefined> {
    return Promise.resolve(this.userRanks.get(normalizeUserId(userId)));
  }
  getUserRanks(limit?: number, _seasonId?: string): Promise<Array<UserRank>> {
    const ranks = Array.from(this.userRanks.values()).map((userRank) => {
      userRank.userName = this.users.get(normalizeUserId(userRank.userId))?.name ?? 'Unknown';
      return userRank;
    });
    return Promise.resolve(limit === undefined || limit === 0 ? ranks : ranks.slice(0, limit));
  }
  updateUserRank(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  saveUserGameResult(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateUserProp(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getUserGameStats(): Promise<import('@/server/database/IDatabase').IUserGameStats> {
    const emptyBlock: import('@/server/database/IDatabase').IUserGameStatsBlock = {
      totalGames: 0, wins: 0, losses: 0, winRate: 0,
      fleeCount: 0, fleeRate: 0, avgScore: 0, avgPosition: 0,
      totalRankGames: 0, rankWins: 0,
    };
    return {allTime: emptyBlock, recent3Months: emptyBlock};
  }
  async restoreGame(_game_id: GameId, _save_id: number, _game: IGame, _playId: string): Promise<void> {
    return Promise.resolve();
  }
  saveSeasonSnapshot(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getSeasonSnapshots(): Promise<Array<{userId: string, rankValue: number, mu: number, sigma: number, trueskill: number, pointsEarned: number, finalPosition: number}>> {
    throw new Error('Method not implemented.');
  }
  updateUserPoints(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
