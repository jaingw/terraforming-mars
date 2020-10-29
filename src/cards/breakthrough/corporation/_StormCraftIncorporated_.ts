import { Tags } from "../../Tags";
import { Player } from "../../../Player";
import { CorporationCard } from "../../corporation/CorporationCard";
import { ResourceType } from "../../../ResourceType";
import { ICard, IActionCard, IResourceCard } from "../../ICard";
import { SelectCard } from "../../../inputs/SelectCard";
import { CardName } from "../../../CardName";
import { CardType } from "../../CardType";

export class _StormCraftIncorporated_ implements IActionCard, CorporationCard, IResourceCard {
    public name: CardName =  CardName._STORMCRAFT_INCORPORATED_;
    public tags: Array<Tags> = [Tags.JOVIAN];
    public startingMegaCredits: number = 48;
    public cardType: CardType = CardType.CORPORATION; 
    public resourceType: ResourceType = ResourceType.FLOATER;
    public resourceCount: number = 0;

    public play() {
        return undefined;
    }
    public getVictoryPoints(player: Player) {
        return player.getTagCount(Tags.JOVIAN, false, false);
    }
    public canAct(): boolean {
        return true; 
    }

    public action(player: Player) {
        const floaterCards = player.getResourceCards(ResourceType.FLOATER);
        if (floaterCards.length === 1) {
            player.addResourceTo(this);
            return undefined;
        }

        return new SelectCard(
            "Select card to add 1 floater",
            "Add floater",
            floaterCards,
            (foundCards: Array<ICard>) => {
                player.addResourceTo(foundCards[0], 1);
                return undefined;
            }
        );
    }
}

