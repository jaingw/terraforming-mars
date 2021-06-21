import {CardName} from '../../../CardName';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';
import {MiningGuild} from '../../corporation/MiningGuild';

export class _MiningGuild_ extends MiningGuild {
  public get name() {
    return CardName._MINING_GUILD_;
  }

  public get metadata(): CardMetadata {
    return {
      cardNumber: 'B02',
      // description: 'You start with 30 M€, 5 steel and 1 steel production.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(30).steel(5).digit.nbsp.production((pb) => pb.steel(1));
        b.text('(You start with 30 M€, 5 steel and 1 steel production.)', Size.TINY, false, false);
        b.corpBox('effect', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.effect(undefined, (eb) => {
            eb.steel(1).slash().titanium(1).startEffect.production((pb) => pb.steel(1));
          });
          ce.effect('Each time you get steel/titanium as placement bonus, increase 1 steel prod.You can use 4 steel to trade or pay for city standard project.', (eb) => {
            eb.steel(4).digit.startAction.trade().city(Size.SMALL).steel(1).brackets;
          });
        });
      }),
    };
  }
}
