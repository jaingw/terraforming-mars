import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';

export class HydrothermalVentArchaea extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HYDROTHERMAL_VENT_ARCHAEA,
      tags: [Tag.MICROBE],
      cost: 8,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 2},
      requirements: {oceans: 3},
      metadata: {
        cardNumber: 'Q12',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you increase Temperature 1 step, add a microbe to this card.', (eb) => {
            eb.temperature(1).startEffect.tag(Tag.MICROBE);
          }).br;
          b.vpText('1 VP per 2 Microbes on this card.');
        }),
        description: 'Requires 3 oceans.',
      },
    });
  }
  public override resourceCount: number = 0;
}
