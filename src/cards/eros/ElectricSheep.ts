import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {ResourceType} from '../../ResourceType';
import {Resources} from '../../Resources';
import {IActionCard, IResourceCard} from '../ICard';
import {DecreaseAnyProduction} from '../../deferredActions/DecreaseAnyProduction';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {CardRenderDynamicVictoryPoints} from '../render/CardRenderDynamicVictoryPoints';
import {Card} from '../Card';

export class ElectricSheep extends Card implements IActionCard, IProjectCard, IResourceCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.ELECTRIC_SHEEP,
      tags: [Tags.ENERGY, Tags.ANIMAL],
      cost: 10,
      resourceType: ResourceType.ANIMAL,

      requirements: CardRequirements.builder((b) => b.tag(Tags.ENERGY, 4)),
      metadata: {
        cardNumber: 'Q13',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 Animal to this card.', (eb) => {
            eb.empty().startAction.animals(1);
          }).br;
          b.production((pb) => pb.minus().energy(1).any).br;
          b.vpText('1 VP per Animal on this card.');
        }),
        description: {
          text: 'Requires 4 Power tags. Decrease any Energy production 1 step.',
          align: 'left',
        },
        victoryPoints: CardRenderDynamicVictoryPoints.animals(1, 1),
      },
    });
  }
    public resourceCount: number = 0;

    public canAct(): boolean {
      return true;
    }

    public canPlay(player: Player): boolean {
      return player.getTagCount(Tags.ENERGY) >= 4;
    }

    public action(player: Player) {
      player.addResourceTo(this);
      return undefined;
    }

    public play(player: Player) {
      player.game.defer(new DecreaseAnyProduction(player, Resources.ENERGY, 1));
      return undefined;
    }

    public getVictoryPoints(): number {
      return this.resourceCount;
    }
}

