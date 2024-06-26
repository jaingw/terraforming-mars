import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {BuildColony} from '../../deferredActions/BuildColony';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';

// 已在pathfinders中添加 这里先改个名
export class VitalColony_ extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.VITAL_COLONY,

      metadata: {
        cardNumber: 'Y18',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).colonyPlacementBonus().br;
          b.minus().megacredits(5);
        }),
        description: 'Place a colony. Gain its placement bonus a second time. Pay 5 M€.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(
      new BuildColony(
        player,
        {giveBonusTwice: true}));

    player.stock.add(Resource.MEGACREDITS, -5);
    return undefined;
  }
}

