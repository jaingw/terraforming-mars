import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';

export class VenusUniversity extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.VENUS_UNIVERSITY,
      cardType: CardType.ACTIVE,
      tags: [Tags.VENUS, Tags.SCIENCE],
      cost: 10,

      requirements: CardRequirements.builder((b) => b.venus(8)),
      metadata: {
        cardNumber: 'Q034',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you increase Venus Rate, draw a card', (eb)=> {
            eb.venus(1).startEffect.cards(1);
          }).br;
        }),
        description: 'Requires Venus 8%',
        victoryPoints: 1,
      },
    });
  }
  public play() {
    return undefined;
  }
}
