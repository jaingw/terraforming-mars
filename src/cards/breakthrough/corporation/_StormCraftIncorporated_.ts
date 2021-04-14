import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  public get name() {
    return CardName._STORMCRAFT_INCORPORATED_;
  }
  public getVictoryPoints(player: Player) {
    return player.getTagCount(Tags.JOVIAN, false, false);
  }

  public get metadata() {
    return undefined;
  }
}

