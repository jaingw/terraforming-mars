
import {CorporationCard} from '../../corporation/CorporationCard';
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {IProjectCard} from '../../IProjectCard';
import {Game} from '../../../Game';
import {CardType} from '../../CardType';

export class _EcoLine_ implements CorporationCard {
    public name: CardName = CardName._ECOLINE_;
    public tags: Array<Tags> = [Tags.PLANT];
    public startingMegaCredits: number = 36;
    public cardType: CardType = CardType.CORPORATION;

    public play(player: Player) {
      player.addProduction(Resources.PLANTS, 2);
      player.plants = 3;
      player.plantsNeededForGreenery = 7;
      return undefined;
    }


    public onCardPlayed(player: Player, _game: Game, card: IProjectCard) {
      if (player.corporationCard !== undefined && player.corporationCard.name === this.name) {
        for (const tag of card.tags) {
          if (tag === Tags.PLANT) {
            player.setResource(Resources.MEGACREDITS, 2);
          }
        }
      }
    }
}
