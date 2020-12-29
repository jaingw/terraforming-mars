
import {Color} from '../Color';
import {Database} from './Database';
import {Game, LoadState} from '../Game';
import {Player} from '../Player';
import {User} from '../User';

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

export class GameLoader {
    public state: State = State.WAITING;
    public readonly games = new Map<string, Game>();
    private readonly pendingGame = new Map<string, Array<LoadCallback>>();
    private readonly pendingPlayer = new Map<string, Array<LoadCallback>>();
    public readonly playerToGame = new Map<string, Game>();
    public readonly userIdMap: Map<string, User> = new Map<string, User>();
    public readonly userNameMap: Map<string, User> = new Map<string, User>();
    public readonly usersToGames: Map<string, Array<string>> = new Map<string, Array<string>>();

    private static instance?: GameLoader;

    private constructor() {}

    public static getInstance(): GameLoader {
      if (GameLoader.instance === undefined) {
        GameLoader.instance = new GameLoader();
      }
      return GameLoader.instance;
    }

    public start(cb = () => {}): void {
      switch (this.state) {
      case State.READY:
        console.warn('already loaded, ignoring');
        return;
      case State.LOADING:
        console.warn('already loading, ignoring');
        return;
      case State.WAITING:
        this.loadAllGames(cb);
      }
    }

    public add(game: Game): void {
      this.games.set(game.id, game);
      for (const player of game.getAllPlayers()) {
        this.playerToGame.set(player.id, game);
        const user = this.userNameMap.get(player.name);
        if (user !== undefined) {
          let strings = this.usersToGames.get(user.id);
          if (strings !== undefined) {
            strings.push(game.id);
          } else {
            strings = [];
            strings.push(game.id);
            this.usersToGames.set(user.id, strings);
          }
        }
      }
    }

    public getLoadedstrings(): Array<string> {
      return Array.from(this.games.keys());
    }

    public getGameById(gameId: string, cb: LoadCallback): void {
      if (this.state === State.READY && this.games.has(gameId)) {
        const game:any = this.games.get(gameId);
        if (game.loadState === LoadState.LOADED) {
          cb(game);
          return;
        }
        if (game.loadState === LoadState.HALFLOADED) {
          game.loadState === LoadState.LOADING;
          this.loadFullGame( game);
        }

        // LOADING 等待读库回调
        const pendingGame = this.pendingGame.get(gameId);
        if (pendingGame !== undefined) {
          pendingGame.push(cb);
        } else {
          this.pendingGame.set(gameId, [cb]);
        }
      } else {
        cb(undefined);
      }
    }

    public getByPlayerId(playerId: string, cb: LoadCallback): void {
      if (this.state === State.READY && this.playerToGame.has(playerId)) {
        const game:any = this.playerToGame.get(playerId);
        if (game.loadState === LoadState.LOADED) {
          cb(game);
          return;
        }
        if (game.loadState !== LoadState.LOADING) {
          game.loadState === LoadState.LOADING;
          this.loadFullGame(game);
        }

        // LOADING 等待读库回调
        const pendingPlayer = this.pendingPlayer.get(playerId);
        if (pendingPlayer !== undefined) {
          pendingPlayer.push(cb);
        } else {
          this.pendingPlayer.set(playerId, [cb]);
        }
      } else {
        cb(undefined);
      }
    }

    private loadFullGame( game:Game ): void{
      const gameId = game.id;
      Database.getInstance().getGame(
        gameId,
        (err, serializedGame?) => {
          if (err || (serializedGame === undefined)) {
            console.error(`unable to load game ${gameId}`, err);
            this.onGameLoaded( game, true);
          } else {
            game.loadFromJSON(serializedGame);
            this.onGameLoaded( game);
          }
        },
      );
    }

    private onGameLoaded( game: Game, err: boolean = false): void {
      const gameId = game.id;
      console.log(`load game ${gameId}`);
      if (err) {
        this.games.delete(gameId);
        for (const player of game.getAllPlayers()) {
          this.playerToGame.delete(player.id);
          const user = this.userNameMap.get(player.name);
          if (user !== undefined) {
            const strings = this.usersToGames.get(user.id);
            if (strings !== undefined && strings.indexOf(game.id) > -1) {
              strings.splice(strings.indexOf(game.id), 1);
            }
          }
        }
      } else {
        this.games.set(game.id, game);
        for (const player of game.getAllPlayers()) {
          this.playerToGame.set(player.id, game);
          const user = this.userNameMap.get(player.name);
          if (user !== undefined) {
            let strings = this.usersToGames.get(user.id);
            if (strings !== undefined) {
              strings.push(game.id);
            } else {
              strings = [];
              strings.push(game.id);
              this.usersToGames.set(user.id, strings);
            }
          }
        }
      }


      const pendingGames = this.pendingGame.get(gameId);
      if (pendingGames !== undefined) {
        for (const pendingGame of pendingGames) {
          pendingGame(err ? undefined : game);
        }
        this.pendingGame.delete(gameId);
      }
      for (const player of game.getAllPlayers()) {
        const pendingPlayers = this.pendingPlayer.get(player.id);
        if (pendingPlayers !== undefined) {
          for (const pendingPlayer of pendingPlayers) {
            pendingPlayer(err ? undefined : this.playerToGame.get(player.id));
          }
          this.pendingPlayer.delete(player.id);
        }
      }
    }

    private onAllGamesLoaded(): void {
      this.state = State.READY;

      // any pendingPlayer or pendingGame callbacks
      // are waiting for a train that is never coming
      // send them packing. call their callbacks with
      // undefined and remove from pending
      for (const pendingGame of Array.from(this.pendingGame.values())) {
        for (const cb of pendingGame) {
          cb(undefined);
        }
      }
      this.pendingGame.clear();
      for (const pendingPlayer of Array.from(this.pendingPlayer.values())) {
        for (const cb of pendingPlayer) {
          cb(undefined);
        }
      }
      this.pendingPlayer.clear();
    }

    private loadAllGames(cb = () => {}): void {
      this.state = State.LOADING;
      const $this = this;
      Database.getInstance().getUsers(function(err, allUser) {
        if (err) {
          return;
        }
        allUser.forEach((user) => {
          $this.userIdMap.set(user.id, user);
          $this.userNameMap.set(user.name, user);
        });
      });

      Database.getInstance().getGames((err, allGames) => {
        if (err) {
          console.error('error loading all games', err);
          this.onAllGamesLoaded();
          cb();
          return;
        }

        if (allGames.length === 0) {
          this.onAllGamesLoaded();
          cb();
        };

        let loaded = 0;
        allGames.forEach((game_id) => {
          const player = new Player('test', Color.BLUE, false, 0, '000');
          const player2 = new Player('test2', Color.RED, false, 0, '111');
          const gameToRebuild = Game.newInstance(game_id, [player, player2], player);
          Database.getInstance().getGame(
            game_id,
            (err, serializedGame) => {
              loaded++;
              if (err || (serializedGame === undefined)) {
                console.error(`unable to load game ${game_id}`, err);
              } else {
                gameToRebuild.loadFromJSON(serializedGame);
                console.log(`load game ${game_id}`);
                this.onGameLoaded(gameToRebuild);
              }
              if (loaded === allGames.length) {
                this.onAllGamesLoaded();
                cb();
              }
            },
          );
        });
      });
    }
}
