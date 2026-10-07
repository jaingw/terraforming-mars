/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 11:51:43
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-12-08 12:39:35
 * @Description:
 */
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';

export class IntegratedMicroorganisms extends CorporationCard {
  constructor() {
    super({
      name: CardName.INTEGRATED_MICROORGANISMS,
      tags: [Tag.MICROBE],
      startingMegaCredits: 50,

      initialActionText: 'Draw 2 cards with a microbe tag',
      metadata: {
        cardNumber: 'XB07',
        description: 'You start with 50 M€. As your first action, draw 2 cards with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(50).cards(2, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a Microbe tag, including this, you draw 1 card.', (eb) => {
              eb.tag(Tag.MICROBE).startEffect.cards(1);
            });
          });
        }),
      },
    });
  }


  public override initialAction(player: IPlayer) {
    player.drawCard(2, {tag: Tag.MICROBE});
    return undefined;
  }

  private effectResolve(player: IPlayer, card: ICard) {
    const microbeTags = player.tags.cardTagCount(card, Tag.MICROBE);
    for (let i = 0; i < microbeTags; i++) {
      player.drawCard(1);
      // player.game.defer(new SimpleDeferredAction(
      //   player,
      //   () => {
      //     // No card to discard
      //     if (player.cardsInHand.length === 0) {
      //       return undefined;
      //     }
      //     return new OrOptions(
      //       new SelectCard('Select a card to discard', 'Discard', player.cardsInHand).andThen( (foundCards: Array<IProjectCard>) => {
      //         player.cardsInHand.splice(player.cardsInHand.indexOf(foundCards[0]), 1);
      //         player.game.projectDeck.discard(foundCards[0]);
      //         player.game.log('${0} is using their ${1} effect to draw 1 cards by discarding a card.', (b) => b.player(player).card(this));
      //         player.game.log('You discarded ${0}', (b) => b.card(foundCards[0]), {reservedFor: player});
      //         player.drawCard(1);
      //         return undefined;
      //       }),
      //       new SelectOption('Do nothing', 'Confirm').andThen( () => {
      //         return undefined;
      //       }),
      //     );
      //   },
      // ));
    }
    return undefined;
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (player.playedCards.has(this.name)) {
      this.effectResolve(player, card);
    }
  }
}
