import {Game, GameId} from '../Game';
import {GameSetup} from '../GameSetup';
import {Player} from '../Player';
import {SerializedGame} from '../SerializedGame';
import {SerializedPlayer} from '../SerializedPlayer';

export class Cloner {
  public static clone(
    newGameId: GameId,
    players: Array<Player>,
    firstPlayerIndex: number,
    err: Error | undefined,
    serialized: SerializedGame | undefined,
    cb: () => {}) {
    const response: {err?: Error, game: Game | undefined} = {err: err, game: undefined};

    try {
      if ((err === undefined || err === null) && serialized !== undefined) {
        const sourceGameId: GameId = serialized.id;
        const oldstrings: Array<string> = serialized.players.map((player) => player.id);
        const newstrings: Array<string> = players.map((player) => player.id);
        if (oldstrings.length !== newstrings.length) {
          throw new Error(`Failing to clone from a ${oldstrings.length} game ${sourceGameId} to a ${newstrings.length} game.`);
        }
        Cloner.replacestrings(serialized, oldstrings, newstrings);
        if (oldstrings.length === 1) {
          // The neutral player has a different ID in different games, and yet, it isn't serialized. So it gets a special case.
          Cloner.replacestrings(
            serialized,
            [GameSetup.neutralPlayerFor(sourceGameId).id],
            [GameSetup.neutralPlayerFor(newGameId).id]);
        }
        serialized.id = newGameId;

        for (let idx = 0; idx < players.length; idx++) {
          this.updatePlayer(players[idx], serialized.players[idx]);
        }
        serialized.first = serialized.players[firstPlayerIndex];
        serialized.clonedGamedId = '#' + sourceGameId;

        // response.game = Game.load(serialized);
      }
    } catch (e) {
      response.err = e;
    }
    cb();
    // cb(response.err, response.game);
  }

  private static replacestrings(obj: any, oldstrings:Array<string>, newstrings: Array<string>) {
    if (obj === undefined || obj === null) {
      return;
    }
    const keys = Object.entries(obj);
    keys.forEach(([key, val]) => {
      if (obj.hasOwnProperty(key)) {
        if (typeof val === 'string') {
          const idx = oldstrings.indexOf(val);
          if (idx > -1) {
            obj[key] = newstrings[idx];
          }
        } else if (typeof val === 'object') {
          Cloner.replacestrings(val, oldstrings, newstrings);
        }
      }
    });
  }

  private static updatePlayer(from: Player, to: SerializedPlayer) {
    // id is already copied over.
    to.color = from.color;
    to.name = from.name;

    // Handicap updates are only done during game set-up. So when cloning, adjust the
    // terraforming rating to the difference between the two handicaps.
    const terraformRatingDelta = Number(from.handicap) - Number(to.handicap);
    const newTerraformRating = Number(to.terraformRating) + terraformRatingDelta;
    to.terraformRating = newTerraformRating;
    // Also update the handicap to reflect appropriately.
    to.handicap = Number(from.handicap);
  }
}

