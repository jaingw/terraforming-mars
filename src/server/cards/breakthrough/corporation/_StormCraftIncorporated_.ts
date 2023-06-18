import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {StormCraftIncorporated} from '../../colonies/StormCraftIncorporated';

export class _StormCraftIncorporated_ extends StormCraftIncorporated {
  public override get name() {
    return CardName._STORMCRAFT_INCORPORATED_;
  }

  constructor() {
    super(
      CardName._STORMCRAFT_INCORPORATED_,
      {tag: Tag.JOVIAN},
    );
  }
}

