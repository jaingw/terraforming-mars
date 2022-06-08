import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';

export class RespirationEnhance extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.RESPIRATION_ENHANCE,
      tags: [Tags.SCIENCE, Tags.PLANT],
      cost: 7,

      metadata: {
        cardNumber: 'Q10',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a greenery, you can choose to increase temperature 1 step, intead of oxygen.', (eb) => {
            eb.greenery().asterix().startEffect.temperature(1);
          }).br;
        }),
      },
    });
  }
  public play() {
    return undefined;
  }
}

