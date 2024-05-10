import {Game} from '../Game';
import {IGame} from '../IGame';
import {GameId, isPlayerId, PlayerId} from '../../common/Types';
import {GameSetup} from '../GameSetup';
import {IPlayer} from '../IPlayer';
import {SerializedGame} from '../SerializedGame';
import {SerializedPlayer} from '../SerializedPlayer';
import {Color} from '../../common/Color';
import {Player} from '../Player';

export class Cloner {
  public static clone(
    newGameId: GameId,
    players: Array<IPlayer>,
    firstPlayerIndex: number,
    serialized: SerializedGame): IGame {
    const serializedGameId: GameId = serialized.id;
    const serializedPlayerIds: Array<PlayerId> = serialized.players.map((player) => player.id);
    const playerIds: Array<PlayerId> = players.map((player) => player.id);
    if (serializedPlayerIds.length !== playerIds.length) {
      throw new Error(`Failing to clone from a ${serializedPlayerIds.length} game ${serializedGameId} to a ${playerIds.length} game.`);
    }
    Cloner.replacestrings(serialized, serializedPlayerIds, playerIds);
    if (serializedPlayerIds.length === 1) {
      // The neutral player has a different ID in different games, and yet, it isn't serialized. So it gets a special case.
      Cloner.replacestrings(
        serialized,
        [GameSetup.neutralPlayerFor(serializedGameId).id],
        [GameSetup.neutralPlayerFor(newGameId).id]);
    }
    serialized.id = newGameId;

    for (let idx = 0; idx < players.length; idx++) {
      this.updatePlayer(players[idx], serialized.players[idx]);
    }
    serialized.first = serialized.players[firstPlayerIndex];
    serialized.clonedGamedId = '#' + serializedGameId;
    serialized.createdTimeMs = new Date().getTime();
    const player = new Player('test', Color.BLUE, false, 0, 'p000');
    const player2 = new Player('test2', Color.RED, false, 0, 'p111');
    const gameToRebuild = Game.rebuild('gtest', [player, player2], player);
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

  private static updatePlayer(from: IPlayer, to: SerializedPlayer) {
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

