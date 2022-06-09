import {IActionCard, IResourceCard, VictoryPoints} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {ResourceType} from '../../common/ResourceType';

export class Cow extends Card implements IActionCard, IProjectCard, IResourceCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.COW,
      tags: [Tags.ANIMAL],
      cost: 6,
      resourceType: ResourceType.ANIMAL,
      victoryPoints: VictoryPoints.resource(1, 2),

      requirements: CardRequirements.builder((b) => b.oxygen(5)),
      metadata: {
        cardNumber: 'Q15',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 plant to add 1 Animal to this card and gain 5 M€.', (eb) => {
            eb.plants(1).startAction.megacredits(5).nbsp.animals(1);
          }).br;
          b.vpText('1 VP for each 2 Animals on this card.');
        }),
        description: 'Requires 5% oxygen.',
      },
    });
  }
  public override resourceCount = 0;
  public override canPlay(player: Player): boolean {
    return super.canPlay(player);
  }
  public play() {
    return undefined;
  }
  public canAct(player: Player): boolean {
    return player.getResource(Resources.PLANTS) >= 1;
  }
  public action(player: Player) {
    player.addResourceTo(this, 1);
    player.addResource(Resources.PLANTS, -1);
    player.addResource(Resources.MEGACREDITS, 5);
    return undefined;
  }
}

