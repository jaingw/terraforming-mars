
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {IProjectCard} from '../../IProjectCard';
import {CorporationCard} from '../../corporation/CorporationCard';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _Thorgate_ implements CorporationCard {
    public name: CardName = CardName._THORGATE_;
    public tags: Array<Tags> = [Tags.ENERGY, Tags.SCIENCE];
    public startingMegaCredits: number = 44;
    public cardType: CardType = CardType.CORPORATION;

    public getCardDiscount(_player: Player, _game: Game, card: IProjectCard) {
      if (card.tags.indexOf(Tags.ENERGY) !== -1) {
        return 3;
      }
      return 0;
    }
    /* Start with 2 energy prod and 1 extra science tag */
    public play(player: Player, _game: Game) {
      player.addProduction(Resources.ENERGY, 2);
      return undefined;
    }
}

