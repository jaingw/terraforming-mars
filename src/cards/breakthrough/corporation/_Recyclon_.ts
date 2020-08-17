import { CorporationCard } from "../../corporation/CorporationCard";
import { Player } from "../../../Player";
import { Tags } from "../../Tags";
import { ResourceType } from "../../../ResourceType";
import { Resources } from "../../../Resources";
import { Game } from "../../../Game";
import { IProjectCard } from "../../IProjectCard";
import { SelectOption } from "../../../inputs/SelectOption";
import { OrOptions } from "../../../inputs/OrOptions";
import { CardName } from "../../../CardName";
import { IResourceCard } from "../../ICard";


export class _Recyclon_ implements CorporationCard, IResourceCard {
    public name: CardName = CardName._RECYCLON_;
    public tags: Array<Tags> = [Tags.MICROBES, Tags.STEEL];
    public startingMegaCredits: number = 38;
    public resourceType: ResourceType = ResourceType.MICROBE;
    public resourceCount: number = 0;

    public play(player: Player) {
        player.setProduction(Resources.STEEL);
        this.resourceCount++;
        return undefined;
    }

    public initialAction(player: Player, _game: Game) {
        if (player.isCorporation(this.name)){
            this.resourceCount += 2;
        }
        return undefined;
    }

    public onCardPlayed(player: Player, _game: Game, card: IProjectCard) {
        if (card.tags.indexOf(Tags.STEEL) === -1 || !player.isCorporation(this.name)) {return undefined;}
        if (this.resourceCount < 2) {
            this.resourceCount++;
            return undefined;
        }

        const addResource = new SelectOption("Add a microbe resource to this card", "Add microbe", () => {
            this.resourceCount++;
            return undefined;
        });

        const spendResource = new SelectOption("Remove 2 microbes on this card and increase plant production 1 step", "Remove microbes", () => {
            player.removeResourceFrom(this, 2);
            player.setProduction(Resources.PLANTS);
            return undefined;
        });
        return new OrOptions(spendResource, addResource);
    }


}