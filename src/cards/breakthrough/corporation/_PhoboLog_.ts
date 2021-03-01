import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {PhoboLog} from '../../corporation/PhoboLog';
import {CardRenderer} from '../../render/CardRenderer';
import {CardRenderItemSize} from '../../render/CardRenderItemSize';

export class _PhoboLog_ extends PhoboLog {
  public get name() {
    return CardName._PHOBOLOG_;
  }
  public initialAction(player: Player) {
    player.drawCard(2, {tag: Tags.SPACE});
    return undefined;
  }

  public get metadata() {
    return {
      cardNumber: 'R09',
      description: 'You start with 10 titanium and 23 MC.As your first action, draw 2 space cards.',
      renderData: CardRenderer.builder((b) => {
        b.br.br;
        b.megacredits(23).nbsp.titanium(10).digit.nbsp.cards(2).secondaryTag(Tags.SPACE); ;
        b.corpBox('effect', (ce) => {
          ce.effect('Your titanium resources are each worth 1 MC extra.', (eb) => {
            eb.titanium(1).startEffect.plus(CardRenderItemSize.SMALL).megacredits(1);
          });
        });
      }),
    };
  }
}
