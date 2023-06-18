import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRequirements} from '../CardRequirements';
export class AntiGravityExperiment extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ANTI_GRAVITY_EXPERIMENT,
      tags: [Tag.SCIENCE],
      cost: 12,

      victoryPoints: 2,
      requirements: CardRequirements.builder((b) => b.tag(Tag.SCIENCE, 6)),
      // cardDiscount: {amount: 2}, //避免显示bug
      metadata: {
        description: 'Requires 6 science tags.',
        cardNumber: 'Q53',
        renderData: CardRenderer.builder((b) => {
          b.effect('For this generation, when you play a card, you pay 2 MC less for it.', (be) => be.empty().startEffect.megacredits(-2));
        }),
      },
    });
  }

  public isDisabled = true;

  public override getCardDiscount() {
    if (this.isDisabled) return 0;
    return 2;
  }

  public override bespokePlay() {
    this.isDisabled = false;
    return undefined;
  }
}
