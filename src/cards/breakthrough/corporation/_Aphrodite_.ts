
import { CorporationCard } from "../../corporation/CorporationCard";
import { Player } from "../../../Player";
import { Game } from "../../../Game";
import { Tags } from "../../Tags";
import { CardName } from "../../../CardName";
import { CardType } from "../../CardType";

export class _Aphrodite_ implements CorporationCard {
    public name: CardName = CardName._APHRODITE_;
    public tags: Array<Tags> = [Tags.PLANT,Tags.VENUS];
    public startingMegaCredits: number = 40;
    public cardType: CardType = CardType.CORPORATION; 

    public play() {
        return undefined;
    }
    public initialAction(player: Player, game: Game) {
        game.increaseVenusScaleLevel(player,2);
        return undefined;
    }
}
