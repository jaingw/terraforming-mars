import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _Inventrix_ implements CorporationCard {
    public name: CardName = CardName._INVENTRIX_;
    public tags: Array<Tags> = [Tags.SCIENCE, Tags.SCIENCE];
    public startingMegaCredits: number = 45;
    public cardType: CardType = CardType.CORPORATION;

    public initialAction(player: Player) {
      player.drawCard(3);
      return undefined;
    }

    public getRequirementBonus(_player: Player): number {
      return 3;
    }
    public play() {
      return undefined;
    }

    public get metadata() {
      return undefined;
    }
}
