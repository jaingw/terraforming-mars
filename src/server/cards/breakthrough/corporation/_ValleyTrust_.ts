
import {Player} from '../../../Player';
import {IProjectCard} from '../../IProjectCard';
import {Game} from '../../../Game';
import {SelectCard} from '../../../inputs/SelectCard';
import {Card} from '../../Card';
import {CardRenderer} from '../../render/CardRenderer';
import {played} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {Tag} from '../../../../common/cards/Tag';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _ValleyTrust_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
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
              eb.science(1, {played}).startEffect.megacredits(-2);
            });
          });
        }),
      },
    });
  }

  public override getCardDiscount(player: Player, card: IProjectCard) {
    // TODO(chosta) -> improve once the discounts property is given a go
    return player.tags.cardTagCount(card, Tag.SCIENCE) * 2;
  }

  public initialAction(player: Player) {
    const game:Game = player.game;
    if (game.gameOptions.preludeExtension) {
      const cardsDrawn: Array<IProjectCard> = [
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
        game.preludeDeck.draw(game),
      ];
      return new SelectCard('Choose prelude card to play', 'Play', cardsDrawn, (foundCards: Array<IProjectCard>) => {
        if (foundCards[0].canPlay === undefined || foundCards[0].canPlay(player)) {
          return player.playCard(foundCards[0]);
        } else {
          throw new Error('You cannot pay for this card');
        }
      });
    } else {
      console.warn('Prelude extension isn\'t selected.');
      return undefined;
    }
  }
}
