
import { IActionCard } from "../../ICard";
import { Tags } from "../../Tags";
import { Player } from "../../../Player";
import { Game } from "../../../Game";
import { CorporationCard } from "../../corporation/CorporationCard";
import { CardName } from "../../../CardName";
import { CardType } from "../../CardType";

export class _UnitedNationsMarsInitiative_ implements IActionCard, CorporationCard {
    public name: CardName = CardName._UNITED_NATIONS_MARS_INITIATIVE_;
    public tags: Array<Tags> = [Tags.EARTH];
    public startingMegaCredits: number = 40;
    public cardType: CardType = CardType.CORPORATION; 

    public play() {
        return undefined;
    }
    public canAct(player: Player): boolean {
        return player.hasIncreasedTerraformRatingThisGeneration && player.canAfford(5); 
    }
    public action(player: Player, game: Game) {
        player.megaCredits -= 5;
        player.increaseTerraformRating(game);
        return undefined;
    }
}
