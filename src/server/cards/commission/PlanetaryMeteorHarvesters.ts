/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-28 18:07:01
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-29 13:35:08
 * @Description:
 */
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {SelectCard} from '../../inputs/SelectCard';

export class PlanetaryMeteorHarvesters extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.PLANETARY_METEOR_HARVESTERS,
      type: CardType.ACTIVE,
      tags: [Tag.SPACE],
      cost: 10,
      resourceType: CardResource.ASTEROID,
      victoryPoints: {resourcesHere: {}, per: 3},

      metadata: {
        cardNumber: 'XB52',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Space tag, including this, add 1 Asteroid to this card.', (eb)=> {
            eb.tag(Tag.SPACE).startEffect.resource(CardResource.ASTEROID);
          }).br;
          b.action('Add 1 Asteroid to ANOTHER card.', (eb) => {
            eb.empty().startAction.resource(CardResource.ASTEROID).asterix();
          });
          b.vpText('1 VP per 3 Asteroids on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    // >1 because this player already has bioengineering enclosure.
    return this.resourceCount > 0 && player.getResourceCards(this.resourceType).length > 1;
  }

  public action(player: IPlayer) {
    player.defer(
      () => {
        const resourceCards = player.getResourceCards(this.resourceType).filter((card) => card.name !== CardName.PLANETARY_METEOR_HARVESTERS);

        if (resourceCards.length === 0) {
          return undefined;
        }

        if (resourceCards.length === 1) {
          this.resourceCount--;
          player.addResourceTo(resourceCards[0], 1);
          player.game.log('${0} moved 1 Asteroid from Planetary Meteor Harvesters to ${1}.', (b) => b.player(player).card(resourceCards[0]));
          return undefined;
        }

        return new SelectCard(
          'Select card to add 1 Asteroid',
          'Add Asteroid',
          resourceCards)
          .andThen(
            ([card]) => {
              this.resourceCount--;
              player.addResourceTo(card, 1);
              player.game.log('${0} moved 1 animal from Bioengineering Enclosure to ${1}.', (b) => b.player(player).card(card));
              return undefined;
            },
          );
      },
    );
    return undefined;
  }

  public override resourceCount: number = 0;
  public onCardPlayed(player: IPlayer, card: IProjectCard): void {
    player.addResourceTo(this, player.tags.cardTagCount(card, Tag.SPACE));
  }
}
