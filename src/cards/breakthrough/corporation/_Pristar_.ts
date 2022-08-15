import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../common/cards/CardName';
import {Size} from '../../../common/cards/render/Size';
import {Pristar} from '../../../cards/turmoil/Pristar';
import {digit} from '../../../cards/Options';
import {SimpleDeferredAction} from '../../../deferredActions/DeferredAction';
// import {SelectCard} from '../../../inputs/SelectCard';
// import {IProjectCard} from '../../../cards/IProjectCard';

export class _Pristar_ extends Pristar {
  public override get name() {
    return CardName._PRISTAR_;
  }
  public initialAction(player: Player) {
    player.game.defer(new SimpleDeferredAction(player, () => player.drawCardKeepSome(10, {keepMax: 10, logDrawnCard: true, paying: true})));

    // return player.drawCardKeepSome(10, {keepMax: 10, paying: true});
    player.pass();
    player.game.log('${0} passed', (b) => b.player(player));
    return undefined;
  }

  public override get metadata() {
    return {
      cardNumber: 'R07',
      description: 'You start with 53 M€. Decrease your TR 2 steps. As your first action, draw 10 cards and spend 3 MC to keep each card. 1 VP per preservation resource here.',

      renderData: CardRenderer.builder((b) => {
        b.megacredits(53).nbsp.nbsp.minus().tr(2, {size: Size.SMALL}).br;
        b.cards(10, {digit}).asterix().nbsp.plate('PASS');
        b.corpBox('effect', (ce) => {
          ce.effect('During production phase, if you did not get TR so far this generation, add one preservation resource here and gain 6 M€.', (eb) => {
            eb.tr(1, {size: Size.SMALL, cancelled: true}).startEffect.preservation(1).megacredits(6);
          });
        });
      }),
    };
  }
}
