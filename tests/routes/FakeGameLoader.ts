import {IGameLoader} from '../../src/server/database/IGameLoader';
import {IGame} from '../../src/server/IGame';
import {IPlayer} from '../../src/server/IPlayer';
import {GameId, isGameId, PlayerId, SpectatorId} from '../../src/common/Types';
import {State} from '../../src/server/database/IGameLoader';

export class FakeGameLoader implements IGameLoader {
  public state: State = State.READY;
  private games: Map<GameId, IGame> = new Map();
  add(game: IGame): void {
    this.games.set(game.id, game);
  }
  public getGame(id: GameId | PlayerId | SpectatorId): Promise<IGame | undefined> {
    if (isGameId(id)) {
      return Promise.resolve(this.games.get(id));
    }

    for (const game of Array.from(this.games.values())) {
      const matches = game.playersInGenerationOrder.some((player) => player.id === id) || game.spectatorId === id;
      if (matches) {
        return Promise.resolve(game);
      }
    }
    return Promise.resolve(undefined);
  }
  public getByPlayerId(_playerId: PlayerId | SpectatorId): Promise<IGame | undefined> {
    return this.getGame(_playerId);
  }
  public saveGame(_game: IGame) {
    return Promise.resolve(undefined);
  }
  public ensureUserRanksLoaded(_players: ReadonlyArray<IPlayer>): Promise<void> {
    return Promise.resolve();
  }
}
