import {ICorporationCard} from '../corporation/ICorporationCard';
import {Player} from '../../Player';
import {ICard, isIActionCard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {Priority} from '../../deferredActions/DeferredAction';
import {Tags} from '../../common/cards/Tags';

export class Tyrell extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.TYRELL,
      tags: [Tags.SCIENCE],
      startingMegaCredits: 50,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'XUEBAO04',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(50);
          b.corpBox('action', (ce) => {
            ce.action('Discard a card, and use a non resource card action from other opponents.', (eb) => {
              eb.minus().cards(1).startAction.text('Action').cards(1, {all});
            });
          });
        }),
      },
    });
  }

  private getActionCards(cardOwner: Player):Array<ICard> {
    const result: Array<ICard> = [];

    cardOwner.game.getPlayers().filter((player)=>player.id !== cardOwner.id).forEach((player)=>{
      if (player.corpCard !== undefined && player.corpCard.name !== this.name) {
        if (
          !(player.corpCard.resourceType !== undefined && player.corpCard.resourceCount && player.corpCard.resourceCount > 0)&&
          player.corpCard.action !== undefined &&
          player.corpCard.canAct !== undefined &&
          // player.getActionsThisGeneration().has(player.corpCard.name) &&
          player.corpCard.canAct(cardOwner)) {
          result.push(player.corpCard);
        }
      }
      if (player.corpCard2 !== undefined && player.corpCard2.name !== this.name) {
        if (
          !(player.corpCard2.resourceType !== undefined && player.corpCard2.resourceCount && player.corpCard2.resourceCount > 0)&&
          player.corpCard2.action !== undefined &&
          player.corpCard2.canAct !== undefined &&
          // player.getActionsThisGeneration().has(player.corpCard2.name) &&
          player.corpCard2.canAct(cardOwner)) {
          result.push(player.corpCard2);
        }
      }

      for (const playedCard of player.playedCards.filter((card) => !(card.resourceType !== undefined && card.resourceCount && card.resourceCount > 0))) {
        if (isIActionCard(playedCard) &&
          // player.getActionsThisGeneration().has(playedCard.name) &&
          playedCard.canAct(cardOwner)) {
          result.push(playedCard);
        }
      }
    });
    return result;
  }

  public canAct(player: Player): boolean {
    return this.getActionCards(player).length > 0 && player.cardsInHand.length >= 1;
  }

  public action(player: Player) {
    if (this.getActionCards(player).length === 0 ) {
      return undefined;
    }
    player.game.defer(new DiscardCards(player), Priority.DISCARD_BEFORE_DRAW);
    return new SelectCard(
      'Perform again an action from a card',
      'Take action',
      this.getActionCards(player),
      (foundCards: Array<ICard>) => {
        const foundCard = foundCards[0];
        player.game.log('${0} copy ${1} action with ${2}', (b) => b.player(player).card(foundCard).card(this));
        return foundCard.action?.(player);
      },
    );
  }

  public play() {
    return undefined;
  }
}
