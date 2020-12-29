import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _TerralabsResearch_ implements CorporationCard {
    public name: CardName = CardName._TERRALABS_RESEARCH_;
    public tags: Array<Tags> = [Tags.SCIENCE, Tags.EARTH];
    public startingMegaCredits: number = 20;
    public cardType: CardType = CardType.CORPORATION;

    public play(player: Player) {
      player.decreaseTerraformRating();
      player.cardCost = 1;
      return undefined;
    }
}
