import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {IProjectCard} from '../../IProjectCard';
// import {DeferredAction} from '../../../deferredActions/DeferredAction';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';

export class SellPatentsStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.SELL_PATENTS_STANDARD_PROJECT,
      cost: 0,
      metadata: {
        cardNumber: 'SP8',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Discard any number of cards to gain that amount of M€.', (eb) => {
            eb.text('X').cards(1).startAction.megacredits(0).multiplier;
          }),
        ),
      },
    });
  }

  public canAct(player: Player): boolean {
    return player.cardsInHand.length > 0;
  }

  actionEssence(): void {
    // no-op
  }

  public action(player: Player): SelectCard<IProjectCard> {
    return new SelectCard(
      'Sell patents',
      'Sell',
      player.cardsInHand,
      (foundCards: Array<IProjectCard>) => {
        let result = undefined;
        // 霞
        if (player.playedCards.find((playedCard) => playedCard.name === CardName.WASTE_INCINERATOR) !== undefined) {
          result = new OrOptions(
            new SelectOption('Sell patents for heat', 'Confirm', () => {
              player.heat += 2*foundCards.length;
              return undefined;
            }),
            new SelectOption('Sell patents for MC', 'Confirm', () => {
              if (player.isCorporation(CardName._POLYPHEMOS_)) player.megaCredits += 3*foundCards.length;
              else player.megaCredits += foundCards.length;
              return undefined;
            }),
          );
        } else if (player.isCorporation(CardName._POLYPHEMOS_)) {
          // 卖牌3元
          player.megaCredits += 3*foundCards.length;
        } else {
          player.megaCredits += foundCards.length;
        }
        foundCards.forEach((card) => {
          for (let i = 0; i < player.cardsInHand.length; i++) {
            if (player.cardsInHand[i].name === card.name) {
              player.cardsInHand.splice(i, 1);
              break;
            }
          }
          player.game.dealer.discard(card);
        });
        this.projectPlayed(player);
        player.game.log('${0} sold ${1} patents', (b) => b.player(player).number(foundCards.length));
        return result;
      }, player.cardsInHand.length,
    );
  }
}
