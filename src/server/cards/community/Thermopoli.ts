import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {CorporationCard} from '../corporation/CorporationCard';

export class Thermopoli extends CorporationCard {
  constructor() {
    super({
      name: CardName.THERMOPOLI,
      tags: [Tag.SPACE],
      startingMegaCredits: 53,


      metadata: {
        cardNumber: 'XB12',
        description: 'You start with 53 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(53);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('When you send a delegate ,you gain 1 heat.', (eb) => {
              eb.delegates(1).startEffect.heat(1);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Gain 2 heat for each influence you have.', (eb) => {
              eb.empty().startAction.heat(2).slash().influence({amount: 1});
            });
          });
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    if (player.game.turmoil) {
      const bonus = player.game.turmoil.getPlayerInfluence(player);
      player.stock.add(Resource.HEAT, 2 * bonus, {log: true});
    }
  }
}
