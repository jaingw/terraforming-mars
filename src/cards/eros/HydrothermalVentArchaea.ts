import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {ResourceType} from '../../ResourceType';
import {CardName} from '../../CardName';
import {IResourceCard} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {CardRenderDynamicVictoryPoints} from '../render/CardRenderDynamicVictoryPoints';
import {Card} from '../Card';

export class HydrothermalVentArchaea extends Card implements IProjectCard, IResourceCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.HYDROTHERMAL_VENT_ARCHAEA,
      tags: [Tags.MICROBE],
      cost: 8,
      resourceType: ResourceType.MICROBE,

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
        victoryPoints: CardRenderDynamicVictoryPoints.microbes(1, 2),
      },
    });
  }
    public resourceCount: number = 0;

    public canPlay(player: Player): boolean {
      return super.canPlay(player);
    }

    public getVictoryPoints(): number {
      return Math.floor(this.resourceCount / 2);
    }

    public play() {
      return undefined;
    }
}
