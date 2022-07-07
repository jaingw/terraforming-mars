
import {CardName} from '../../../common/cards/CardName';
import {Tags} from '../../../common/cards/Tags';
import {Viron} from '../../venusNext/Viron';

export class _Viron_ extends Viron {
  public override get name() {
    return CardName._VIRON_;
  }
  public override get tags() {
    return [Tags.WILD];
  }
}
