import { CorporationCard } from "../../corporation/CorporationCard";
import { Player } from "../../../Player";
import { Tags } from "../../Tags";
import { ResourceType } from "../../../ResourceType";
import { IProjectCard } from "../../IProjectCard";
import { Resources } from "../../../Resources";
import { Game } from "../../../Game";
import { CardName } from "../../../CardName";
import { IResourceCard } from "../../ICard";
import { CardType } from "../../CardType";

export class _Arklight_ implements CorporationCard, IResourceCard {
    public name: CardName =  CardName._ARKLIGHT_;
    public tags: Array<Tags> = [Tags.ANIMAL];
    public startingMegaCredits: number = 45;
    public cardType: CardType = CardType.CORPORATION; 
    public resourceType: ResourceType = ResourceType.ANIMAL;
    public resourceCount: number = 0;

    public play(player: Player) {
        player.addProduction(Resources.MEGACREDITS, 2);
        player.addResourceTo(this);
        return undefined;
    }

    public onCardPlayed(player: Player, _game: Game, card: IProjectCard): void {
        if (player.isCorporation(CardName._ARKLIGHT_)) {
            player.addResourceTo(this, card.tags.filter((cardTag) => cardTag === Tags.ANIMAL || cardTag === Tags.PLANT).length);
        }
    }

    public getVictoryPoints(): number {
        return Math.floor(this.resourceCount / 2);
    }
}
