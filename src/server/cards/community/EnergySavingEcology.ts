/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 12:21:26
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-12-08 14:50:26
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
      startingMegaCredits: 39,
      resourceType: CardResource.ASTEROID,

      behavior: {
        production: {heat: 2},
        // addResourcesToAnyCard: {count: 1, type: CardResource.DATA},
      },

      metadata: {
        cardNumber: 'XB20',
        description: 'You start with 2 heat production and 39 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2)).nbsp.megacredits(39);
          b.br;
          b.minus().megacredits(10).slash().production((pb) => pb.heat(1)).colon().asteroids(1).or().br;
          b.effect('', (eb) => {
            eb.minus().asteroids(4, {digit}).startAction.oceans(1).or();
          }).br;
          b.effect('当你打出费用10或更少的牌或每次提升热产（而不是每1热产）时，拿1数据资源在此卡上，或移除此卡上的4数据放1海，或移除此卡上的6数据放1树,', (eb) => {
            eb.minus().asteroids(6, {digit}).startAction.greenery();
          }).br;
          // b.minus().asteroid({amount: 6, digit, all}).startAction.greenery().br;
          // b.text('当你打出费用10或更少的牌或提升热产时，拿1数据资源在此卡上（即使1次升2+热产，也只能拿1数据），或移除此卡上的4数据放1海，或移除此卡上的6数据放1树,');
        }),
      },
    });
  }

  // 增加一个数据资源,然后触发技能
  private effect(player: IPlayer) {
    player.defer(() => {
      // Can't remove a resource
      if (this.resourceCount <= 3) {
        player.addResourceTo(this, 1);
        return;
      }
      const options = new OrOptions();
      options.options.push(
        new SelectOption('Add an asteroid resource to this card', 'Add resource').andThen(() => {
          player.addResourceTo(this, 1);
          return undefined;
        }),
        new SelectOption('Remove 4 asteroid resources from this card to place an Ocean', 'Remove resource').andThen(() => {
          player.removeResourceFrom(this, 4);
          player.game.defer(new PlaceOceanTile(player));
          return undefined;
        }));

      if (this.resourceCount >= 6) {
        options.options.push( new SelectOption('Remove 6 asteroid resource from this card to place an Ocean', 'Remove resource').andThen(() => {
          player.removeResourceFrom(this, 6);
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
