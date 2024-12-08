import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectAmount} from '../../inputs/SelectAmount';

import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {GainResources} from '../../deferredActions/GainResources';
import {Priority} from '../../deferredActions/Priority';
import {IActionCard} from '../ICard';

export class EnergyStation extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ENERGY_STATION,
      tags: [Tag.SPACE],
      cost: 12,

      metadata: {
        cardNumber: 'Q60',
        renderData: CardRenderer.builder((b) => {
          b.effect('When another player is removed a plant, gain 1 Heat.', (eb) => {
            eb.startEffect.plants(1, {all}).colon().heat(1);
          }).br;
          // b.plants(1, {all}).colon().heat(2).br;
          b.action('Spend X Plant to gain 2X Heat.', (eb) => {
            eb.text('x').plants(1).startAction.text('2x').heat(1);
          });
          b.or().br;
          b.action('Spend 2X Heat to gain X Plant.', (eb) => {
            eb.text('2x').heat(1).startAction.text('x').plants(1);
          }).br;
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // 标记这张牌的所有者
    player.game.energyStationOwner = player;
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    return player.plants >= 1 || player.heat >= 2;
  }

  private getPlantsOption(player: IPlayer, availableHeat: number): SelectAmount {
    return new SelectAmount(
      'Select amount of plants to gain', 'Gain plants', 1, Math.floor(availableHeat / 2))
      .andThen((amount) => {
        player.stock.deduct(Resource.HEAT, 2 * amount);
        player.game.log('${0} spent ${1} heat', (b) => b.player(player).number(2 * amount));
        player.stock.add(Resource.PLANTS, amount, {log: true});
        return undefined;
      });
  }

  private getHeatOption(player: IPlayer, availablePlants: number): SelectAmount {
    return new SelectAmount(
      'Select amount of plant to spend', 'Gain heat', 1, availablePlants)
      .andThen((amount) => {
        player.stock.deduct(Resource.PLANTS, amount);
        player.game.log('${0} spent ${1} plants', (b) => b.player(player).number(amount));
        player.stock.add(Resource.HEAT, 2 * amount, {log: true});

        // player.game.defer(new SelectPaymentDeferred(player, amount))
        //   .andThen(() => player.stock.add(Resource.HEAT, 2 * amount, {log: true}));
        return undefined;
      });
  }

  public action(player: IPlayer) {
    const availableHeat = player.heat;
    const availablePlants = player.plants;
    if (availableHeat >= 2 && availablePlants >= 1) {
      return new OrOptions(
        new SelectOption('Spend 2X Heat to gain X Plant', 'Spend Heat').andThen(() => {
          return this.getPlantsOption(player, availableHeat);
        }),
        new SelectOption('Spend X Plants to gain 2X Heat', 'Spend Plant').andThen(() => {
          return this.getHeatOption(player, availablePlants);
        }),
      );
    } else if (availableHeat >= 2) {
      return this.getPlantsOption(player, availableHeat);
    } else if (availablePlants >= 1) {
      return this.getHeatOption(player, availablePlants);
    }
    return undefined;
  }

  public static resourceHook(player: IPlayer, resource: Resource, amount: number, from: IPlayer) {
    if (from === player || amount >= 0) {
      return;
    }
    const owner = player.game.energyStationOwner;

    console.log('aaa');
    if (!owner) return;
    if (resource === Resource.PLANTS && amount < 0) {
      // player.game.someoneHasRemovedOtherPlayersPlants = true;
      // FIMXE: 有个 api
      // player.heat += 2 * Math.abs(amount);

      const heatAmount = Math.abs(amount);

      player.game.defer(
        new GainResources(owner, Resource.HEAT, {count: heatAmount}).andThen(() => from.game.log(
          '${0} gained ${1} ${2} from ${3}',
          (b) => b.player(owner).number(heatAmount).string(Resource.HEAT).cardName(this.name as CardName))),
        player.id !== from.id ? Priority.OPPONENT_TRIGGER : undefined);
    }
  }
}
