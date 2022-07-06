import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../common/cards/CardType';
import {Player} from '../../Player';
import {CardName} from '../../common/cards/CardName';
import {Playwrights} from '../community/Playwrights';
import {IActionCard, ICard, isIActionCard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../common/cards/render/Size';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class ProjectInspection extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.EVENT,
      name: CardName.PROJECT_INSPECTION,
      cost: 0,

      metadata: {
        cardNumber: 'X02',
        renderData: CardRenderer.builder((b) => {
          b.text('Use a card action that has been used this generation.', Size.SMALL, true);
        }),
      },
    });
  }
  private getActionCards(player: Player): Array<IActionCard & ICard> {
    const result: Array<IActionCard & ICard> = [];

    if (this.addCorpCard(player.corpCard, player) && isIActionCard(player.corpCard) && player.corpCard.canAct(player)) {
      result.push(player.corpCard);
    }
    if (this.addCorpCard(player.corpCard2, player) && isIActionCard(player.corpCard2) && player.corpCard2.canAct(player)) {
      result.push(player.corpCard2);
    }


    for (const playedCard of player.playedCards) {
      if (isIActionCard(playedCard) && playedCard.canAct(player) && player.getActionsThisGeneration().has(playedCard.name)) {
        result.push(playedCard);
      }
    }
    return result;
  }

  private addCorpCard(corp: ICorporationCard |undefined, player: Player): boolean {
    if (corp !== undefined && player.getActionsThisGeneration().has(corp.name)) {
      if (corp.name !== CardName.PLAYWRIGHTS || (corp as Playwrights).getCheckLoops() < 2) {
        return true;
      }
    }
    return false;
  }

  public override canPlay(player: Player): boolean {
    return this.getActionCards(player).length > 0;
  }

  public play(player: Player) {
    const actionCards = this.getActionCards(player);
    if (actionCards.length === 0 ) {
      return undefined;
    }
    return new SelectCard<IActionCard & ICard>(
      'Perform an action from a played card again',
      'Take action',
      actionCards,
      (foundCards: Array<IActionCard & ICard>) => {
        const foundCard = foundCards[0];
        player.game.log('${0} used ${1} action with ${2}', (b) => b.player(player).card(foundCard).card(this));
        return foundCard.action(player);
      },
    );
  }
}
