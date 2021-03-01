import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {IProjectCard} from '../../IProjectCard';
import {CardName} from '../../../CardName';
import {Arklight} from '../../colonies/Arklight';
import {CardMetadata} from '../../CardMetadata';

export class _Arklight_ extends Arklight {
    public name: CardName = CardName._ARKLIGHT_;

    public onCardPlayed(player: Player, card: IProjectCard): void {
      if (player.isCorporation(CardName._ARKLIGHT_)) {
        const count = card.tags.filter((cardTag) => cardTag === Tags.ANIMAL || cardTag === Tags.PLANT).length;
        if (count > 0 ) {
          player.addResourceTo(this, count);
        }
      }
    }

    // public get metadata() {
    //   return undefined;
    // }
    public metadata?: CardMetadata = undefined;
}
