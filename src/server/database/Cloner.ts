import {Game} from '../Game';
import {GameId, isPlayerId} from '../../common/Types';
import {GameSetup} from '../GameSetup';
import {Player} from '../Player';
import {SerializedGame} from '../SerializedGame';
import {SerializedPlayer} from '../SerializedPlayer';
import {Color} from '../../common/Color';

export class Cloner {
  public static clone(
    newGameId: GameId,
    players: Array<Player>,
    firstPlayerIndex: number,
    serialized: SerializedGame): Game {
    const sourceGameId: GameId = serialized.id;
    const oldPlayerIds: Array<string> = serialized.players.map((player) => player.id);
    const newPlayerIds: Array<string> = players.map((player) => player.id);
    if (oldPlayerIds.length !== newPlayerIds.length) {
      throw new Error(`Failing to clone from a ${oldPlayerIds.length} game ${sourceGameId} to a ${newPlayerIds.length} game.`);
    }
    Cloner.replacestrings(serialized, oldPlayerIds, newPlayerIds);
    if (oldPlayerIds.length === 1) {
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

    const player = new Player('test', Color.BLUE, false, 0, 'p000');
    const player2 = new Player('test2', Color.RED, false, 0, 'p111');
    const gameToRebuild = Game.newInstance('gtest', [player, player2], player);
    const game = gameToRebuild.loadFromJSON(serialized);
    return game;
  }

  private static replacestrings(obj: any, oldstrings:Array<string>, newstrings: Array<string>) {
    if (obj === undefined || obj === null) {
      return;
    }
    const keys = Object.entries(obj);
    keys.forEach(([key, val]) => {
      if (obj.hasOwnProperty(key)) {
        if (isPlayerId(val)) {
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

