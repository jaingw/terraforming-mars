
import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {multiplier, all} from '../../Options';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {Resources} from '../../../common/Resources';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _Helion_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._HELION_,
      tags: [Tags.SPACE],
      startingMegaCredits: 48,
      metadata: {
        cardNumber: 'R18',
        description: 'You start with 3 heat production and 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(3)).nbsp.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.effect(undefined, (eb) => {
              ce.vSpace(Size.LARGE);
              eb.text('x').heat(1).startEffect.megacredits(0, {multiplier});
            });
            ce.effect('You may use heat as M€. You may not use M€ as heat. Any player increase Temperature, that player gain 1 heat.', (eb) => {
              eb.temperature(1, {all}).startEffect.heat(1, {all}).asterix();
            });
          });
        }),
      },
    });
  }

  public play(player: Player) {
    player.canUseHeatAsMegaCredits = true;
    player.addProduction(Resources.HEAT, 3);
    return undefined;
  }
}

