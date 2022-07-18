import {IProjectCard} from '../IProjectCard';
import {Tags} from '../../common/cards/Tags';
import {CardType} from '../../common/cards/CardType';
import {Player} from '../../Player';
import {CardResource} from '../../common/CardResource';
import {CardName} from '../../common/cards/CardName';
import {IResourceCard} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {VictoryPoints} from '../ICard';
import {played} from '../Options';

export class JovianDefenseDepartment extends Card implements IResourceCard {
  constructor() {
    super({
      name: CardName.JOVIAN_DEFENSE_DEPARTMENT,
      cardType: CardType.ACTIVE,
      tags: [Tags.JOVIAN],
      cost: 16,
      resourceType: CardResource.ASTEROID,
      victoryPoints: VictoryPoints.resource(1, 1),

      metadata: {
        cardNumber: 'Q43',
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
  public play() {
    return undefined;
  }
  public onCardPlayed(player: Player, card: IProjectCard): void {
    player.addResourceTo(this, player.cardTagCount(card, Tags.JOVIAN));
  }
}
