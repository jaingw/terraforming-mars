import {CardRenderer} from '../../render/CardRenderer';
import {Factorum} from '../../promo/Factorum';
import {CardName} from '../../../../common/cards/CardName';
import {CardMetadata} from '../../../../common/cards/CardMetadata';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';

export class _Factorum_ extends Factorum {
  public override get name() {
    return CardName._FACTORUM_;
  }
  public override get startingMegaCredits() : number {
    return 45;
  }

  constructor() {
    super();
  }

  public override get metadata(): CardMetadata {
    return {
      cardNumber: 'R22',
      description: 'You start with 45 M€. Increase your steel production 1 step.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(45).nbsp.production((pb) => pb.steel(1));
        b.corpBox('action', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.action('Increase your energy production 1 step IF YOU HAVE NO ENERGY RESOURCES, or spend 3M€ to draw a building card.', (eb) => {
            eb.empty().arrow().production((pb) => pb.energy(1));
            eb.or().megacredits(3).startAction.cards(1, {secondaryTag: Tag.BUILDING});
          });
        });
      }),
    };
  }
}

