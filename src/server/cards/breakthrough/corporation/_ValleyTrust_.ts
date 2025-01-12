
import {IPlayer} from '../../../IPlayer';
import {IProjectCard} from '../../IProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';
import {IGame} from '../../../IGame';
import {IPreludeCard} from '../../prelude/IPreludeCard';

export class _ValleyTrust_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._VALLEY_TRUST_,
      tags: [Tag.EARTH, Tag.SCIENCE],
      startingMegaCredits: 37,
      initialActionText: 'Draw 3 Prelude cards, and play one of them',

      cardDiscount: {tag: Tag.SCIENCE, amount: 2},
      metadata: {
        cardNumber: 'R34',
        description: 'You start with 37 M€. As your first action, draw 4 Prelude cards, and play one of them. Discard the other three.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(37).nbsp.prelude().asterix();
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a Science tag, you pay 2M€ less for it.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.megacredits(-2);
            });
          });
        }),
      },
    });
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    // TODO(chosta) -> improve once the discounts property is given a go
    return player.tags.cardTagCount(card, Tag.SCIENCE) * 2;
  }

  public initialAction(player: IPlayer) {
    const game:IGame = player.game;
    if (game.gameOptions.preludeExtension) {
      const cardsDrawn: Array<IPreludeCard > = [
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
      ].filter((x) => x !== undefined) as Array<IPreludeCard>;
      return new SelectCard('Choose prelude card to play', 'Play', cardsDrawn ).andThen((foundCards: ReadonlyArray<IProjectCard>) => {
        if (foundCards[0].canPlay === undefined || foundCards[0].canPlay(player)) {
          player.playCard(foundCards[0]);
        } else {
          throw new Error('You cannot pay for this card');
        }
        return undefined;
      });
    } else {
      console.warn('Prelude extension isn\'t selected.');
      return undefined;
    }
  }
}
