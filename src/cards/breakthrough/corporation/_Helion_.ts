
import {CorporationCard} from '../../corporation/CorporationCard';
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';

export class _Helion_ implements CorporationCard {
    public name: CardName = CardName._HELION_;
    public tags: Array<Tags> = [Tags.SPACE];
    public startingMegaCredits: number = 48;
    public cardType: CardType = CardType.CORPORATION;

    public play(player: Player) {
      player.canUseHeatAsMegaCredits = true;
      player.addProduction(Resources.HEAT, 3);
      return undefined;
    }

    public metadata: CardMetadata = {
      cardNumber: 'R18',
      description: 'You start with 3 heat production and 48 M€.',
      renderData: CardRenderer.builder((b) => {
        b.production((pb) => pb.heat(3)).nbsp.megacredits(48);
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.LARGE);
            eb.text('x').heat(1).startEffect.megacredits(0).multiplier;
          });
          ce.effect('You may use heat as M€. You may not use M€ as heat. Any player increase Temperature, that player gain 1 heat.', (eb) => {
            eb.temperature(1).any.startEffect.heat(1);
          });
        });
      }),
    }
}

