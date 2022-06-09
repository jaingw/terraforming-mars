import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {IResourceCard, VictoryPoints} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {ResourceType} from '../../common/ResourceType';

export class HydrothermalVentArchaea extends Card implements IProjectCard, IResourceCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.HYDROTHERMAL_VENT_ARCHAEA,
      tags: [Tags.MICROBE],
      cost: 8,
      resourceType: ResourceType.MICROBE,
      victoryPoints: VictoryPoints.resource(1, 2),
      requirements: CardRequirements.builder((b) => b.oceans(3)),
      metadata: {
        cardNumber: 'Q12',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you increase Temperature 1 step, add a microbe to this card.', (eb) => {
            eb.temperature(1).startEffect.microbes(1);
          }).br;
          b.vpText('1 VP per 2 Microbes on this card.');
        }),
        description: 'Requires 3 oceans.',
      },
    });
  }
  public override resourceCount: number = 0;

  public override canPlay(player: Player): boolean {
    return super.canPlay(player);
  }

  public play() {
    return undefined;
  }
}
