
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
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

    public getCardDiscount(_player: Player, card: IProjectCard) {
      if (card.tags.indexOf(Tags.ENERGY) !== -1) {
        return 3;
      }
      return 0;
    }
    /* Start with 2 energy prod and 1 extra science tag */
    public play(player: Player) {
      player.addProduction(Resources.ENERGY, 2);
      return undefined;
    }


    public get metadata() {
      return undefined;
    }
}

