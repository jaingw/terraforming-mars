
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CorporationCard} from '../../corporation/CorporationCard';
import {IProjectCard} from '../../IProjectCard';
import {Game} from '../../../Game';
import {SelectCard} from '../../../inputs/SelectCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {Card} from '../../Card';
import {CardRenderer} from '../../render/CardRenderer';

export class _ValleyTrust_ extends Card implements CorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._VALLEY_TRUST_,
      tags: [Tags.EARTH, Tags.SCIENCE],
      startingMegaCredits: 37,
      initialActionText: 'Draw 3 Prelude cards, and play one of them',

      cardDiscount: {tag: Tags.SCIENCE, amount: 2},
      metadata: {
        cardNumber: 'R34',
        description: 'You start with 37 M€. As your first action, draw 4 Prelude cards, and play one of them. Discard the other three.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(37).nbsp.prelude().asterix();
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a Science tag, you pay 2M€ less for it.', (eb) => {
              eb.science(1).played.startEffect.megacredits(-2);
            });
          });
        }),
      },
    });
  }

  public getCardDiscount(_player: Player, card: IProjectCard) {
    return card.tags.filter((tag) => tag === Tags.SCIENCE).length * 2;
  }

  public initialAction(player: Player) {
    const game:Game = player.game;
    if (game.gameOptions.preludeExtension) {
      const cardsDrawn: Array<IProjectCard> = [
        game.dealer.dealPreludeCard(),
        game.dealer.dealPreludeCard(),
        game.dealer.dealPreludeCard(),
        game.dealer.dealPreludeCard(),
      ];
      return new SelectCard('Choose prelude card to play', 'Play', cardsDrawn, (foundCards: Array<IProjectCard>) => {
        return player.playCard(foundCards[0]);
      }, 1, 1);
    } else {
      console.warn('Prelude extension isn\'t selected.');
      return undefined;
    }
  }

  public play() {
    return undefined;
  }
}
