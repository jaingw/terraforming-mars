import {BaseMilestone} from './IMilestone';
import {Player} from '../Player';
import {CardType} from '../../common/cards/CardType';
import {CardName} from '../../common/cards/CardName';

export class Tactician extends BaseMilestone {
  constructor() {
    super(
      'Tactician',
      'Have 5 cards with requirements',
      5);
  }
  public getScore(player: Player): number {
    // 事件公司判断
    if (player.isCorporation(CardName._INTERPLANETARY_CINEMATICS_) || player.isCorporation(CardName.ODYSSEY) ) {
      return player.playedCards.filter((card) => card.type !== CardType.PRELUDE &&
        card.requirements !== undefined).length;
    } else {
      return player.playedCards.filter((card) => card.type !== CardType.PRELUDE &&
        card.type !== CardType.EVENT &&
        card.requirements !== undefined).length;
    }
  }
}
