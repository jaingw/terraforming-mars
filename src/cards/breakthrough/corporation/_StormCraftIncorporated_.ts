import {CardName} from '../../../common/cards/CardName';
import {Tags} from '../../../common/cards/Tags';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';
import {VictoryPoints} from '../../ICard';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  public override get name() {
    return CardName._STORMCRAFT_INCORPORATED_;
  }

  public override get victoryPoints() {
    return VictoryPoints.tags(Tags.JOVIAN, 1, 1);
  }
}

