
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CorporationCard} from '../../corporation/CorporationCard';
import {IProjectCard} from '../../IProjectCard';
import {Game} from '../../../Game';
import {SelectCard} from '../../../inputs/SelectCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _ValleyTrust_ implements CorporationCard {
    public name: CardName = CardName._VALLEY_TRUST_;
    public tags: Array<Tags> = [Tags.EARTH, Tags.SCIENCE];
    public startingMegaCredits: number = 37;
    public cardType: CardType = CardType.CORPORATION;

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

    public get metadata() {
      return undefined;
    }
}
