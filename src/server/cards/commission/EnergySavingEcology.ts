/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 12:21:26
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-29 13:43:55
 * @Description:
 */
import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {Priority} from '../../deferredActions/Priority';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';
import {IProjectCard, isIProjectCard} from '../IProjectCard';

export class EnergySavingEcology extends CorporationCard {
  constructor() {
    super({
      name: CardName.ENERGY_SAVING_ECOLOGY,
      tags: [Tag.SPACE],
      startingMegaCredits: 47,
      resourceType: CardResource.ASTEROID,

      behavior: {
        production: {heat: 2},
        // addResourcesToAnyCard: {count: 1, type: CardResource.DATA},
      },

      metadata: {
        cardNumber: 'XB20',
        description: 'You start with 2 heat production and 47 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2)).nbsp.megacredits(47).br;
          b.minus().megacredits(10).slash().production((pb) => pb.heat(1)).colon().resource(CardResource.ASTEROID, 1).or().br; // asteroids
          b.effect(undefined, (eb) => {
            eb.minus().resource(CardResource.ASTEROID, {amount: 4, digit}).startAction.oceans(1).or();
          }).br;
          b.effect('当你打出费用10或更少的牌或每次提升热产（而不是每1热产）时，拿1陨石资源在此卡上，或移除此卡上的3陨石放1海，或移除此卡上的5陨石放1树,', (eb) => {
            eb.minus().resource(CardResource.ASTEROID, {amount: 6, digit}).startAction.greenery();
          });
        }),
      },
    });
  }

  // 增加一个数据资源,然后触发技能
  private effect(player: IPlayer) {
    const PLACE_OCEAN_COUNT = 4;
    const PLACE_GREENERY_COUNT = 6;
    player.defer(() => {
      // Can't remove a resource
      if (this.resourceCount <= PLACE_OCEAN_COUNT) {
        player.addResourceTo(this, 1);
        return;
      }
      const options = new OrOptions();
      options.options.push(
        new SelectOption('Add an asteroid resource to this card', 'Add resource').andThen(() => {
          player.addResourceTo(this, 1);
          return undefined;
        }),
        new SelectOption(`Remove ${PLACE_OCEAN_COUNT} asteroid resources from this card to place an Ocean`, 'Remove resource').andThen(() => {
          player.removeResourceFrom(this, PLACE_OCEAN_COUNT);
          player.game.defer(new PlaceOceanTile(player));
          return undefined;
        }));

      if (this.resourceCount >= PLACE_GREENERY_COUNT) {
        options.options.push( new SelectOption(`Remove ${PLACE_GREENERY_COUNT} asteroid resource from this card to place an Ocean`, 'Remove resource').andThen(() => {
          player.removeResourceFrom(this, PLACE_GREENERY_COUNT);
          player.game.defer(new PlaceGreeneryTile(player));
          return undefined;
        }));
      }

      options.title = 'Select an option for Energy Saving Ecology';
      return options;
    },
    Priority.SUPERPOWER); // Unshift that deferred action
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard): void {
    if (player.isCorporation(this.name) && isIProjectCard(card) && card.cost <= 10) {
      this.effect(player);
    }
  }

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (amount > 0 && resource === Resource.HEAT) {
      this.effect(player);
    }
  }
}
