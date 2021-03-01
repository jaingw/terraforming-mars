import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {ResourceType} from '../../../ResourceType';
import {Resources} from '../../../Resources';
import {IProjectCard} from '../../IProjectCard';
import {SelectOption} from '../../../inputs/SelectOption';
import {OrOptions} from '../../../inputs/OrOptions';
import {CardName} from '../../../CardName';
import {IResourceCard} from '../../ICard';
import {CardType} from '../../CardType';


export class _Recyclon_ implements CorporationCard, IResourceCard {
    public name: CardName = CardName._RECYCLON_;
    public tags: Array<Tags> = [Tags.MICROBE, Tags.BUILDING];
    public startingMegaCredits: number = 38;
    public cardType: CardType = CardType.CORPORATION;
    public resourceType: ResourceType = ResourceType.MICROBE;
    public resourceCount: number = 0;

    public play(player: Player) {
      player.addProduction(Resources.STEEL);
      player.addResourceTo(this);
      return undefined;
    }

    public initialAction(player: Player) {
      if (player.isCorporation(this.name)) {
        player.addResourceTo(this, 2);
      }
      return undefined;
    }

    public onCardPlayed(player: Player, card: IProjectCard) {
      if (card.tags.indexOf(Tags.BUILDING) === -1 || !player.isCorporation(this.name)) {
        return undefined;
      }
      if (this.resourceCount < 2) {
        player.addResourceTo(this);
        return undefined;
      }

      const addResource = new SelectOption('Add a microbe resource to this card', 'Add microbe', () => {
        player.addResourceTo(this);
        return undefined;
      });

      const spendResource = new SelectOption('Remove 2 microbes on this card and increase plant production 1 step', 'Remove microbes', () => {
        player.removeResourceFrom(this, 2);
        player.addProduction(Resources.PLANTS);
        return undefined;
      });
      return new OrOptions(spendResource, addResource);
    }

    public get metadata() {
      return undefined;
    }
}
