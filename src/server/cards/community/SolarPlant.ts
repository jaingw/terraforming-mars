/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 11:51:43
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-10-29 23:49:08
 * @Description:
 */
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {digit} from '../Options';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';

export class SolarPlant extends CorporationCard {
  constructor() {
    super({
      name: CardName.SOLARPLANT,
      tags: [Tag.POWER],
      startingMegaCredits: 45,

      behavior: {
        production: {energy: 2},
        stock: {energy: 3},
      },

      metadata: {
        cardNumber: 'XB14',
        description: 'You start with 45 M€..',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.production((pb) => pb.energy(2)).nbsp.megacredits(45).energy(3, {digit});
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.action('Decrease your heat production any number of steps and increase your energy production the same number of steps.', (eb) => {
              eb.production((pb) => pb.text('-X').heat(1)).startAction.production((pb) => pb.text('+X').energy(1));
            });
            ce.vSpace();
            ce.effect('For each energy resource you spend in action phase, gain 1 heat.', (eb) => {
              eb.text('x').energy(1).asterix().startEffect.text('x').heat(1);
            });
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.production.get(Resource.HEAT) >= 1;
  }

  public action(player: IPlayer) {
    return new SelectAmount('Select amount of heat production to decrease', 'Confirm', 1, player.production.heat)
      .andThen((amount) => {
        player.production.add(Resource.HEAT, -amount, {log: true});
        player.production.add(Resource.ENERGY, amount, {log: true});
        return undefined;
      });
  }
}
