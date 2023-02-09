import {ICorporationCard} from '../corporation/ICorporationCard';
import {Player} from '../../Player';
import {ICard, isIActionCard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {Tag} from '../../../common/cards/Tag';

export class Tyrell extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.TYRELL,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 50,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'XB03',
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

  // For Viron
  private checkLoops = 0;

  public getCheckLoops(): number {
    return this.checkLoops;
  }

  private getActionCards(cardOwner: Player):Array<ICard> {
    const result: Array<ICard> = [];
    this.checkLoops++;

    cardOwner.game.getPlayers().filter((player)=>player.id !== cardOwner.id).forEach((player)=>{
      for (const playedCard of player.tableau) {
        if (isIActionCard(playedCard) &&
            playedCard.resourceType === undefined &&
            playedCard.canAct(cardOwner)) {
          result.push(playedCard);
        }
      }
    });

    this.checkLoops--;
    return result;
  }

  public canAct(player: Player): boolean {
    return this.getActionCards(player).length > 0 && player.cardsInHand.length >= 1;
  }

  public action(player: Player) {
    if (this.getActionCards(player).length === 0 ) {
      return undefined;
    }
    player.game.defer(new DiscardCards(player));
    return new SelectCard(
      'Perform again an action from a card',
      'Take action',
      this.getActionCards(player),
      (foundCards: Array<ICard>) => {
        const foundCard = foundCards[0];
        if (isIActionCard(foundCard)) {
          player.game.log('${0} copy ${1} action with ${2}', (b) => b.player(player).card(foundCard).card(this));
          return foundCard.action?.(player);
        }
        return undefined;
      },
    );
  }
}
