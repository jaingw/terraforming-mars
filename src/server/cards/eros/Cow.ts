import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';

export class Cow extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.COW,
      tags: [Tag.ANIMAL],
      cost: 6,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      requirements: {oxygen: 5},
      metadata: {
        cardNumber: 'Q15',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 plant to add 1 Animal to this card and gain 5 M€.', (eb) => {
            eb.plants(1).startAction.megacredits(5).nbsp.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP for per 2 Animals on this card.');
        }),
        description: 'Requires 5% oxygen.',
      },
    });
  }
  public override resourceCount = 0;

  public canAct(player: IPlayer): boolean {
    return player.stock.get(Resource.PLANTS) >= 1;
  }
  public action(player: IPlayer) {
    player.addResourceTo(this, 1);
    player.stock.add(Resource.PLANTS, -1);
    player.stock.add(Resource.MEGACREDITS, 5);
    return undefined;
  }
}

