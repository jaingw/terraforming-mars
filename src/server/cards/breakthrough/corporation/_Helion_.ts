
import {IPlayer} from '../../../IPlayer';
import {CardRenderer} from '../../render/CardRenderer';
import {all} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {CorporationCard} from '../../corporation/CorporationCard';

export class _Helion_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._HELION_,
      tags: [Tag.SPACE],
      startingMegaCredits: 48,
      metadata: {
        cardNumber: 'R18',
        description: 'You start with 3 heat production and 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(3)).nbsp.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.effect(undefined, (eb) => {
              ce.vSpace(Size.LARGE);
              eb.text('x').heat(1).startEffect.megacredits(0, {text: 'x'});
            });
            ce.effect('You may use heat as M€. You may not use M€ as heat. Any player increase Temperature, that player gain 1 heat.', (eb) => {
              eb.temperature(1, {all}).startEffect.heat(1, {all}).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.canUseHeatAsMegaCredits = true;
    player.production.add(Resource.HEAT, 3);
    return undefined;
  }
}

