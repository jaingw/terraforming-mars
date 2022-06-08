import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tags} from '../../../common/cards/Tags';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';
import {VictoryPoints} from '../../ICard';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  constructor() {
    super({
      name: CardName._STORMCRAFT_INCORPORATED_,
      victoryPoints: VictoryPoints.tags(Tags.JOVIAN, 1, 1),
      cardType: CardType.CORPORATION,
    });
  }
}

