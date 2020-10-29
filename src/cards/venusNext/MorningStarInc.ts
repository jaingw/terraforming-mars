
import { CorporationCard } from "../corporation/CorporationCard";
import { Player } from "../../Player";
import { Tags } from "../Tags";
import { Game } from "../../Game";
import { CardName } from "../../CardName";
import { CardType } from "../CardType";
import { IProjectCard } from "../IProjectCard";

export class MorningStarInc implements CorporationCard {
    public name: CardName = CardName.MORNING_STAR_INC;
    public tags: Array<Tags> = [Tags.VENUS];
    public startingMegaCredits: number = 50;
    public cardType: CardType = CardType.CORPORATION;

    public initialAction(player: Player, game: Game) {
        if (game.hasCardsWithTag(Tags.VENUS, 3)) {
            const drawnCards : Array<IProjectCard> = [];
            for (const foundCard of game.drawCardsByTag(Tags.VENUS, 3)) {
                player.cardsInHand.push(foundCard);
                drawnCards.push(foundCard);
            }

            game.log("${0} drew ${1}, ${2} and ${3}", b =>
                b.player(player).card(drawnCards[0]).card(drawnCards[1]).card(drawnCards[2]));
        }

        return undefined;
    }

    public getRequirementBonus(_player: Player, _game: Game, venusOnly?: boolean): number {
        if (venusOnly !== undefined && venusOnly) return 2;
        return 0;
    }

    public play() {
        return undefined;
    }
}
