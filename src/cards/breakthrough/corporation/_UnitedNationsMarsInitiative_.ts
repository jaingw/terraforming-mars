
import {IActionCard} from '../../ICard';
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {PartyHooks} from '../../../turmoil/parties/PartyHooks';
import {REDS_RULING_POLICY_COST} from '../../../constants';
import {PartyName} from '../../../turmoil/parties/PartyName';

export class _UnitedNationsMarsInitiative_ implements IActionCard, CorporationCard {
    public name: CardName = CardName._UNITED_NATIONS_MARS_INITIATIVE_;
    public tags: Array<Tags> = [Tags.EARTH];
    public startingMegaCredits: number = 40;
    public cardType: CardType = CardType.CORPORATION;

    public play() {
      return undefined;
    }
    public canAct(player: Player, game: Game): boolean {
      const hasIncreasedTR = player.hasIncreasedTerraformRatingThisGeneration;
      const actionCost = 5;

      if (PartyHooks.shouldApplyPolicy(game, PartyName.REDS)) {
        return hasIncreasedTR && player.canAfford(REDS_RULING_POLICY_COST + actionCost);
      }

      return hasIncreasedTR && player.canAfford(actionCost);
    }

    public action(player: Player, game: Game) {
      player.megaCredits -= 5;
      player.increaseTerraformRating(game);
      return undefined;
    }
}
