import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';
import {CardMetadata} from '../../CardMetadata';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
    public name: CardName = CardName._STORMCRAFT_INCORPORATED_;

    public getVictoryPoints(player: Player) {
      return player.getTagCount(Tags.JOVIAN, false, false);
    }

    // public get metadata() {
    //   return undefined;
    // }
    public metadata?: CardMetadata = undefined;
}

