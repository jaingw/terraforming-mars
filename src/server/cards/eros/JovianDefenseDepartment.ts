import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {Player} from '../../Player';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {VictoryPoints} from '../ICard';
import {played} from '../Options';

export class JovianDefenseDepartment extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.JOVIAN_DEFENSE_DEPARTMENT,
      cardType: CardType.ACTIVE,
      tags: [Tag.JOVIAN],
      cost: 14,
      resourceType: CardResource.ASTEROID,
      victoryPoints: VictoryPoints.resource(1, 1),

      metadata: {
        cardNumber: 'Q57',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Jovian tag, including this, add 1 Asteroid to this card.', (eb)=> {
            eb.jovian({played}).startEffect.asteroids(1);
          }).br;
          b.vpText('1 VP per Asteroid on this card.');
        }),
      },
    });
  }
  public override resourceCount: number = 0;
  public onCardPlayed(player: Player, card: IProjectCard): void {
    player.addResourceTo(this, player.tags.cardTagCount(card, Tag.JOVIAN));
  }
}
