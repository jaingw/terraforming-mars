import {IMilestone} from './IMilestone';
import {Player} from '../Player';
import {CardType} from '../cards/CardType';
import {CardName} from '../CardName';

export class Tactician implements IMilestone {
    public name: string = 'Tactician';
    public description: string = 'Requires that you have 5 cards with requirements in play'
    public getScore(player: Player): number {
      // 事件公司判断
      if (player.isCorporation(CardName._INTERPLANETARY_CINEMATICS_)) {
        return player.playedCards.filter((card) => card.cardType !== CardType.PRELUDE &&
        card.requirements !== undefined).length;
      } else {
        return player.playedCards.filter((card) => card.cardType !== CardType.PRELUDE &&
        card.cardType !== CardType.EVENT &&
        card.requirements !== undefined).length;
      }
    }

    public canClaim(player: Player): boolean {
      return this.getScore(player) >= 5;
    }
}
