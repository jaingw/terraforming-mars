import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {IActionCard, IResourceCard, VictoryPoints} from '../ICard';
import {DecreaseAnyProduction} from '../../deferredActions/DecreaseAnyProduction';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {ResourceType} from '../../common/ResourceType';

export class ElectricSheep extends Card implements IActionCard, IProjectCard, IResourceCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.ELECTRIC_SHEEP,
      tags: [Tags.ENERGY, Tags.ANIMAL],
      cost: 10,
      resourceType: ResourceType.ANIMAL,
      victoryPoints: VictoryPoints.resource(1, 1),

      requirements: CardRequirements.builder((b) => b.tag(Tags.ENERGY, 4)),
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

    public override canPlay(player: Player): boolean {
      return player.getTagCount(Tags.ENERGY) >= 4;
    }

    public action(player: Player) {
      player.addResourceTo(this);
      return undefined;
    }

    public play(player: Player) {
      player.game.defer(new DecreaseAnyProduction(player, Resources.ENERGY, {count: 1}));
      return undefined;
    }
}

