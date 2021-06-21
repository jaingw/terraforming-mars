import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {Splice} from '../../promo/Splice';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';

export class _Splice_ extends Splice {
  public get name() {
    return CardName._SPLICE_;
  }

  public get initialActionText() {
    return 'Draw 2 cards with a microbe tag';
  }
  public initialAction(player: Player ) {
    player.drawCard(2, {tag: Tags.MICROBE});
    return undefined;
  }

  public get metadata() {
    return {
      cardNumber: 'R28',
      description: 'You start with 44 M€. As your first action, reveal cards until you have revealed 2 microbe tag. Take these cards into hand and discard the rest.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(44).nbsp.cards(1).secondaryTag(Tags.MICROBE).cards(1).secondaryTag(Tags.MICROBE);
        b.corpBox('effect', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.effect(undefined, (eb) => {
            eb.microbes(1).played.any.startEffect;
            eb.megacredits(2).any.or().microbes(1).any.asterix();
          });
          ce.vSpace();
          ce.effect('when a microbe tag is played, incl. this, THAT PLAYER gains 2 M€, or adds a microbe to THAT card, and you gain 2 M€.', (eb) => {
            eb.microbes(1).played.any.startEffect;
            eb.megacredits(2);
          });
        });
      }),
    };
  }
}
