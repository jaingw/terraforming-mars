import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';

export class AccumulatedKnowledge extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.ACCUMULATED_KNOWLEDGE,
      tags: [Tag.SCIENCE],

      metadata: {
        cardNumber: 'Y08',
        renderData: CardRenderer.builder((b) => {
          b.cards(4).br;
          b.minus().cards(1).nbsp.plus().cards(1);
        }),
        description: 'Draw 4 cards. You may discard a card to draw a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    player.drawCard(4);

    game.defer(new SimpleDeferredAction(player, () => new OrOptions(
      new SelectCard('Discard a card to draw a card', 'Discard', player.cardsInHand).andThen( (foundCards: Array<IProjectCard>) => {
        player.cardsInHand.splice(player.cardsInHand.indexOf(foundCards[0]), 1);
        game.projectDeck.discard(foundCards[0]);
        player.cardsInHand.push(game.projectDeck.drawOrThrow(game));
        return undefined;
      }),
      new SelectOption('Do nothing', 'Confirm' ).andThen( () => {
        return undefined;
      }),
    )));

    return undefined;
  }
}

