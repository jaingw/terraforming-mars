
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {Viron} from '../../venusNext/Viron';

export class _Viron_ extends Viron {
  public get name() {
    return CardName._VIRON_;
  }
  public get tags() {
    return [Tags.WILDCARD];
  }
}
