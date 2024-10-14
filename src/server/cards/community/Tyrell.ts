import {IPlayer} from '../../IPlayer';
import {ICard, isIActionCard} from '../ICard';
import {SelectCard} from '../../inputs/SelectCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {DiscardCards} from '../../deferredActions/DiscardCards';
import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {CardType} from '../../../common/cards/CardType';

export class Tyrell extends CorporationCard {
  constructor() {
    super({
      name: CardName.TYRELL,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 57,

      metadata: {
        cardNumber: 'XB03',
        description: 'You start with 57 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(57);
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

  private getActionCards(cardOwner: IPlayer):Array<ICard> {
    const result: Array<ICard> = [];
    this.checkLoops++;

    cardOwner.game.getPlayers().filter((player)=>player.id !== cardOwner.id).forEach((player)=>{
      for (const playedCard of player.tableau) {
        if (isIActionCard(playedCard) &&
            playedCard.resourceType === undefined &&
            playedCard.type !== CardType.CEO &&
            playedCard.canAct(cardOwner)) {
          result.push(playedCard);
        }
      }
    });

    this.checkLoops--;
    return result;
  }

  public canAct(player: IPlayer): boolean {
    return this.getActionCards(player).length > 0 && player.cardsInHand.length >= 1;
  }

  public action(player: IPlayer) {
    if (this.getActionCards(player).length === 0 ) {
      return undefined;
    }
    player.game.defer(new DiscardCards(player));
    return new SelectCard('Perform again an action from a card', 'Take action', this.getActionCards(player))
      .andThen((foundCards: Array<ICard>) => {
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
