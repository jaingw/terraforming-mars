
import { CorporationCard } from "../../corporation/CorporationCard";
import { Tags } from "../../Tags";
import { Player } from "../../../Player";
import { Resources } from "../../../Resources";
import { CardName } from "../../../CardName";
import { CardType } from "../../CardType";

export class _Helion_ implements CorporationCard {
    public name: CardName = CardName._HELION_;
    public tags: Array<Tags> = [Tags.SPACE, Tags.STEEL];
    public startingMegaCredits: number = 48;
    public cardType: CardType = CardType.CORPORATION; 

    public play(player: Player) {
        player.canUseHeatAsMegaCredits = true;
        player.addProduction(Resources.HEAT,3);
        player.setResource(Resources.HEAT,3);
        return undefined;
    }
}
