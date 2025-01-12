import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import { TurmoilUtil } from '../../turmoil/TurmoilUtil';

export class Lobbyist extends BaseMilestone {
  constructor() {
    super(
      'Lobbyist',
      'Having all 7 delegates in parties (Party Leaders and Chairman also count)',
      7);
  }
  public getScore(player: IPlayer): number {
    const game = player.game;
    const turmoil = TurmoilUtil.getTurmoil(game);

    return 7 - turmoil.delegateReserve.get(player);
    // if (turmoil.chairman === player) {
    //   delegateCount++;
    // }
  }
}
