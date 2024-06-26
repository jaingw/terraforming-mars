import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
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
            eb.text('X').cards(1).startAction.megacredits(1, {text: 'x'});
          }),
        ),
      },
    });
  }

  public override canAct(player: IPlayer): boolean {
    return player.cardsInHand.length > 0;
  }

  actionEssence(): void {
    // no-op
  }

  public override action(player: IPlayer): SelectCard<IProjectCard> {
    return new SelectCard(
      'Sell patents',
      'Sell',
      player.cardsInHand,
      {max: player.cardsInHand.length, played: false})
      .andThen((cards) => {
        let result = undefined;
        // 霞
        if (player.playedCards.find((playedCard) => playedCard.name === CardName.WASTE_INCINERATOR) !== undefined) {
          result = new OrOptions(
            new SelectOption('Sell patents for heat', 'Confirm' ).andThen(() => {
              player.heat += 2*cards.length;
              return undefined;
            }),
            new SelectOption('Sell patents for MC', 'Confirm' ).andThen( () => {
              if (player.isCorporation(CardName._POLYPHEMOS_)) player.megaCredits += 3* cards.length;
              else player.megaCredits += cards.length;
              return undefined;
            }),
          );
        } else if (player.isCorporation(CardName._POLYPHEMOS_)) {
          // 卖牌3元
          player.megaCredits += 3*cards.length;
        } else {
          player.megaCredits += cards.length;
        }
        cards.forEach((card) => player.discardCardFromHand(card));
        this.projectPlayed(player);
        player.game.log('${0} sold ${1} patents', (b) => b.player(player).number(cards.length));
        return result;
      });
  }
}
