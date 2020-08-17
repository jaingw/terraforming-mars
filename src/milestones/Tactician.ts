import { IMilestone } from "./IMilestone";
import { Player } from "../Player";
import { CardType } from "../cards/CardType";

export class Tactician implements IMilestone {
    public name: string = "Tactician";
    public description: string = "Requires that you have 5 cards with requirements in play"
    public getScore(player: Player): number {
        return player.playedCards.filter((card) => card.cardType !== CardType.PRELUDE
            && card.cardType !== CardType.EVENT
            && card.canPlay  && (card.hasRequirements === undefined || card.hasRequirements)).length  ;
    }
    
    public canClaim(player: Player): boolean {
        return this.getScore(player) >= 5;
    }
}