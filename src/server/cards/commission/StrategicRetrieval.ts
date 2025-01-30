/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-28 15:05:36
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-29 13:35:20
 * @Description:
 */
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {ChooseCards} from '../../deferredActions/ChooseCards';

export class StrategicRetrieval extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STRATEGIC_RETRIEVAL,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 10,

      metadata: {
        cardNumber: 'XB51',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 energy to draw the top 3 cards from the discard pile. Choose 1 to keep and discard the rest.', (eb) => {
            eb.energy(2).startAction.cards(3).asterix();
          });
        }),
      },
    });
  }


  public canAct(player: IPlayer): boolean {
    return player.energy > 0 && player.game.projectDeck.discardPile.length > 0;
  }

  public action(player: IPlayer) {
    player.energy -= 2;
    const cards = [];
    for (let idx = 0; idx < 3; idx++) {
      const card = player.game.projectDeck.discardPile.pop();
      if (card === undefined) break;
      cards.push(card);
    }
    player.game.cardDrew = true;
    const cardsToKeep = Math.min(1, cards.length);
    player.game.defer(new ChooseCards(player, cards, {keepMax: cardsToKeep}));

    return undefined;
  }
}
