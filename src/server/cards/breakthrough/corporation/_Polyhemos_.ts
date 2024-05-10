import {IPlayer} from '../../../IPlayer';
import {digit} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Resource} from '../../../../common/Resource';
import {CardRenderer} from '../../render/CardRenderer';
import {CorporationCard} from '../../corporation/CorporationCard';

export class _Polyphemos_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._POLYPHEMOS_,
      tags: [],
      startingMegaCredits: 50,
      cardCost: 5,
      metadata: {
        cardNumber: 'R11',
        description: 'You start with 50 M€. Increase your M€ production 5 steps. Gain 5 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(50).nbsp.production((pb) => pb.megacredits(5)).nbsp.titanium(5, {digit});
          b.corpBox('effect', (ce) => {
            ce.effect('When you buy a card to hand, pay 5M€ instead of 3, including the starting hand. When you sell patent, you gain 3 instead of 1.', (eb) => {
              eb.cards(1).asterix().startEffect.megacredits(5).slash().megacredits(3);
            });
          });
        }),
      },
    });
  }


  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, 5);
    player.titanium += 5;
    return undefined;
  }
}
