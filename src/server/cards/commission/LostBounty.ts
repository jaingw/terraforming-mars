/*
 * @Author: Ender Wiggin
 * @Date: 2026-02-11 00:44:07
 * @LastEditors: Ender Wiggin
 * @LastEditTime: 2026-02-11 21:49:17
 * @Description:
 */
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class LostBounty extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.LOST_BOUNTY,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 12,

      behavior: {
        production: {megacredits: -1, titanium: 1},
      },

      metadata: {
        cardNumber: 'XB63',
        description: 'Decrease your M€ production 1 step and increase your titanium production 1 step.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(-1).titanium(1));
          b.br;
          b.effect('When any of your production is decreased (incl. this), gain 2 M€.', (eb) => {
            eb.production((pb) => pb.wild(-1)).asterix().startEffect.megacredits(2);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer): undefined {
    player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    return undefined;
  }

  public onProductionGain(player: IPlayer, _resource: Resource, amount: number): void {
    if (amount < 0) {
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
    }
  }
}
