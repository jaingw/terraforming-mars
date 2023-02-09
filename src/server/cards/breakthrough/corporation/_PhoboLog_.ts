import {Player} from '../../../Player';
import {PhoboLog} from '../../corporation/PhoboLog';
import {CardRenderer} from '../../render/CardRenderer';
import {digit} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';

export class _PhoboLog_ extends PhoboLog {
  public override get name() {
    return CardName._PHOBOLOG_;
  }
  public initialAction(player: Player) {
    player.drawCard(2, {tag: Tag.SPACE});
    return undefined;
  }

  public override get metadata() {
    return {
      cardNumber: 'R09',
      description: 'You start with 10 titanium and 23 M€.As your first action, draw 2 space cards.',
      renderData: CardRenderer.builder((b) => {
        b.br.br;
        b.megacredits(23).nbsp.titanium(10, {digit}).nbsp.cards(2, {secondaryTag: Tag.SPACE});
        b.corpBox('effect', (ce) => {
          ce.effect('Your titanium resources are each worth 1 M€ extra.', (eb) => {
            eb.titanium(1).startEffect.plus(Size.SMALL).megacredits(1);
          });
        });
      }),
    };
  }
}
