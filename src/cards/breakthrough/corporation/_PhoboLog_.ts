import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _PhoboLog_ implements CorporationCard {
    public name: CardName = CardName._PHOBOLOG_;
    public tags: Array<Tags> = [Tags.SPACE];
    public startingMegaCredits: number = 23;
    public cardType: CardType = CardType.CORPORATION;

    public play(player: Player, _game: Game) {
      player.titanium = 10;
      player.increaseTitaniumValue();
      return undefined;
    }
    public initialAction(player: Player, game: Game) {
      const drawnCards = game.drawCardsByTag(Tags.SPACE, 2);
      for (const foundCard of drawnCards) {
        player.cardsInHand.push(foundCard);
      }

      game.log('${0} drew ${1} and ${2}', (b) => b.player(player).card(drawnCards[0]).card(drawnCards[1]));
      return undefined;
    }
}
