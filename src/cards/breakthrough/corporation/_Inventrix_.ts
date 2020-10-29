import { CorporationCard } from "../../corporation/CorporationCard";
import { Player } from "../../../Player";
import { Tags } from "../../Tags";
import { Game } from "../../../Game";
import { CardName } from "../../../CardName";
import { LogHelper } from "../../../components/LogHelper";
import { CardType } from "../../CardType";


export class _Inventrix_ implements CorporationCard {
    public name: CardName = CardName._INVENTRIX_;
    public tags: Array<Tags> = [Tags.SCIENCE, Tags.SCIENCE];
    public startingMegaCredits: number = 45;
    public cardType: CardType = CardType.CORPORATION; 

    public initialAction(player: Player, game: Game) {
        player.cardsInHand.push(
            game.dealer.dealCard(),
            game.dealer.dealCard(),
            game.dealer.dealCard()
        );
        
        LogHelper.logCardChange(game, player, "drew", 3);
        
        return undefined;
    }
    public getRequirementBonus(_player: Player, _game: Game): number {
        return 3;
    }
    public play() {
        return undefined;
    }
}
