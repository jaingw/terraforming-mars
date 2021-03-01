import {Tags} from '../../Tags';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {CardRenderItemSize} from '../../render/CardRenderItemSize';
import {Factorum} from '../../promo/Factorum';
import {CardName} from '../../../CardName';

export class _Factorum_ extends Factorum {
  public get name() {
    return CardName._FACTORUM_;
  }
  public get startingMegaCredits() : number {
    return 45;
  }

  public get metadata(): CardMetadata {
    return {
      cardNumber: 'R22',
      description: 'You start with 45 MC. Increase your steel production 1 step.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(45).nbsp.production((pb) => pb.steel(1));
        b.corpBox('action', (ce) => {
          ce.vSpace(CardRenderItemSize.LARGE);
          ce.action('Increase your energy production 1 step IF YOU HAVE NO ENERGY RESOURCES, or spend 3MC to draw a building card.', (eb) => {
            eb.empty().arrow().production((pb) => pb.energy(1));
            eb.or().megacredits(3).startAction.cards(1).secondaryTag(Tags.BUILDING);
          });
        });
      }),
    };
  }
}

