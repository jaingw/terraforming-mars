// 为了避免前端打包时引入 Turmoil.ts 以及进一步的引入Player.ts导致打包失败， 将 ifTurmoil 等方法移出来
import {IGame} from '../IGame';
import {Turmoil} from './Turmoil';

export class TurmoilUtil {
  public static getTurmoil(game: IGame): Turmoil {
    if (game.turmoil === undefined) {
      throw new Error(`Assertion error: Turmoil not defined for ${game.id}`);
    }
    return game.turmoil;
  }

  public static ifTurmoil(game: IGame, cb: (turmoil: Turmoil) => void) {
    if (game.gameOptions.turmoilExtension !== false) {
      if (game.turmoil === undefined) {
        console.log(`Assertion failure: game.turmoil is undefined for ${game.id}`);
      } else {
        return cb(game.turmoil);
      }
    }
  }

  public static ifTurmoilElse<T>(game: IGame, cb: (turmoil: Turmoil) => T, elseCb: () => T): T {
    if (game.gameOptions.turmoilExtension !== false) {
      if (game.turmoil === undefined) {
        console.log(`Assertion failure: game.turmoil is undefined for ${game.id}`);
      } else {
        return cb(game.turmoil);
      }
    }
    return elseCb();
  }
}
