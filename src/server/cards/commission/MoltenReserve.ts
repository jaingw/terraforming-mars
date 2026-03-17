import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class MoltenReserve extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MOLTEN_RESERVE,
      type: CardType.ACTIVE,
      tags: [Tag.SPACE],
      cost: 11,

      behavior: {
        production: {heat: 1},
        stock: {heat: 1},
      },

      metadata: {
        cardNumber: 'XB62',
        description: 'Increase your heat production 1 step and gain 1 heat.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(1)).heat(1);
          b.br;
          b.effect('When you gain heat, gain 1 M€ (once per gain event).', (eb) => {
            eb.heat(1).asterix().startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer): undefined {
    player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    return undefined;
  }

  /**
   * Hook for production phase: if the player produced heat, gain 1 MC.
   * During production, heat is added directly (not via stock.add),
   * so we use onProductionPhase to detect production-phase heat gains.
   */
  public onProductionPhase(player: IPlayer): void {
    if (player.production.heat > 0) {
      player.stock.add(Resource.MEGACREDITS, 1, {log: true});
    }
  }

  /**
   * Static hook called from Stock.add() when heat is gained during action phase.
   * This mirrors the SOLARPLANT hook pattern in Stock.ts.
   */
  public static onHeatGain(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, 1, {log: true});
  }
}
