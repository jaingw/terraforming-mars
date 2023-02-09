import {Player} from '../../../Player';
import {Splice} from '../../promo/Splice';
import {CardRenderer} from '../../render/CardRenderer';
import {played, all} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';

export class _Splice_ extends Splice {
  public override get name() {
    return CardName._SPLICE_;
  }

  public override get initialActionText() {
    return 'Draw 2 cards with a microbe tag';
  }
  public initialAction(player: Player ) {
    player.drawCard(2, {tag: Tag.MICROBE});
    return undefined;
  }

  public override get metadata() {
    return {
      cardNumber: 'R28',
      description: 'You start with 44 M€. As your first action, reveal cards until you have revealed 2 microbe tag. Take these cards into hand and discard the rest.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(44).nbsp.cards(1, {secondaryTag: Tag.MICROBE}).cards(1, {secondaryTag: Tag.MICROBE});
        b.corpBox('effect', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.effect(undefined, (eb) => {
            eb.microbes(1, {played, all}).startEffect;
            eb.megacredits(2, {all}).or().microbes(1, {all}).asterix();
          });
          ce.vSpace();
          ce.effect('when a microbe tag is played, incl. this, THAT PLAYER gains 2 M€, or adds a microbe to THAT card, and you gain 2 M€.', (eb) => {
            eb.microbes(1, {played, all}).startEffect;
            eb.megacredits(2);
          });
        });
      }),
    };
  }
}
