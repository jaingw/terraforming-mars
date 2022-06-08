import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {Recyclon} from '../../promo/Recyclon';
import {played, digit} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {ICardMetadata} from '../../../common/cards/ICardMetadata';


export class _Recyclon_ extends Recyclon {
  public override get name() {
    return CardName._RECYCLON_;
  }

  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'R26',
      description: 'You start with 38 M€ and 1 steel production. As your first action, add 2 mocrobed to this card',
      renderData: CardRenderer.builder((b) => {
        b.br.br;
        b.megacredits(38).microbes(1).microbes(1).asterix().nbsp.production((pb) => pb.steel(1));
        b.corpBox('effect', (ce) => {
          ce.effect('When you play a building tag, including this, gain 1 microbe to this card, or remove 2 microbes here and raise your plant production 1 step.', (eb) => {
            eb.building(1, {played}).colon().microbes(1).or();
            eb.microbes(2, {digit}).startEffect.production((pb) => pb.plants(1));
          });
        });
      }),
    };
  }

    public override resourceCount: number = 0;

    public initialAction(player: Player) {
      if (player.isCorporation(this.name)) {
        player.addResourceTo(this, 2);
      }
      return undefined;
    }
}
