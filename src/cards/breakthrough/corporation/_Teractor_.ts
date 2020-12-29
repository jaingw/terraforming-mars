import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {IProjectCard} from '../../IProjectCard';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _Teractor_ implements CorporationCard {
    public name: CardName = CardName._TERACTOR_;
    public tags: Array<Tags> = [Tags.EARTH];
    public startingMegaCredits: number = 55;
    public cardType: CardType = CardType.CORPORATION;

    /* Start with 55 MC and draw 1 earth card as first sction*/
    public initialAction(player: Player, game: Game) {
      const drawnCard = game.drawCardsByTag(Tags.EARTH, 1)[0];
      player.cardsInHand.push(drawnCard);

      game.log('${0} drew ${1}', (b) => b.player(player).card(drawnCard));

      return undefined;
    }

    public getCardDiscount(_player: Player, _game: Game, card: IProjectCard) {
      return card.tags.filter((tag) => tag === Tags.EARTH).length * 3;
    }
    public play() {
      return undefined;
    }
}
