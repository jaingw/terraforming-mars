import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
export class AntiGravityExperiment extends Card implements IProjectCard {
  public data: {generation: number} = {generation: -1};

  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ANTI_GRAVITY_EXPERIMENT,
      tags: [Tag.SCIENCE],
      cost: 12,

      victoryPoints: 2,

      requirements: {tag: Tag.SCIENCE, count: 6},
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

  public override getCardDiscount(player: IPlayer) {
    if (this.data.generation !== undefined && player.game.generation === this.data.generation) {
      return 2;
    }
    return 0;
  }

  public override bespokePlay(player: IPlayer) {
    this.data = {generation: player.game.generation};
    return undefined;
  }
}
