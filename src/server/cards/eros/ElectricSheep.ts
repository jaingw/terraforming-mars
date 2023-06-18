import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {IActionCard} from '../ICard';
import {DecreaseAnyProduction} from '../../deferredActions/DecreaseAnyProduction';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';

export class ElectricSheep extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ELECTRIC_SHEEP,
      tags: [Tag.POWER, Tag.ANIMAL],
      cost: 10,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      requirements: CardRequirements.builder((b) => b.tag(Tag.POWER, 4)),
      metadata: {
        cardNumber: 'Q13',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 Animal to this card.', (eb) => {
            eb.empty().startAction.animals(1);
          }).br;
          b.production((pb) => pb.minus().energy(1, {all})).br;
          b.vpText('1 VP per Animal on this card.');
        }),
        description: {
          text: 'Requires 4 Power tags. Decrease any Energy production 1 step.',
          align: 'left',
        },
      },
    });
  }
  public override resourceCount: number = 0;

  public canAct(): boolean {
    return true;
  }

  public override bespokeCanPlay(player: Player): boolean {
    return player.tags.count(Tag.POWER) >= 4;
  }

  public action(player: Player) {
    player.addResourceTo(this);
    return undefined;
  }

  public override bespokePlay(player: Player) {
    player.game.defer(new DecreaseAnyProduction(player, Resource.ENERGY, {count: 1}));
    return undefined;
  }
}

