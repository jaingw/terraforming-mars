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
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {CardRenderer} from '../render/CardRenderer';

export class EnergyStation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ENERGY_STATION,
      tags: [Tag.SPACE],
      cost: 14,

      metadata: {
        cardNumber: 'Q60',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend X Plant to gain 2X Heat.', (eb) => {
            eb.plants(1, {text: '1x'}).startAction.text('2x').heat(1);
          });
          b.or().br;
          b.action('Spend 2X Heat to gain X Plant.', (eb) => {
            eb.heat(1, {text: '2x'}).startAction.text('x').plants(1);
          }).br;
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.plants >= 1 || player.heat >= 2;
  }

  private getHeatOption(player: IPlayer, availableMC: number): SelectAmount {
    return new SelectAmount(
      'Select amount of heat to gain', 'Gain heat', 1, Math.floor(availableMC / 2))
      .andThen((amount) => {
        player.game.defer(new SelectPaymentDeferred(player, amount * 2))
          .andThen(() => player.stock.add(Resource.ENERGY, amount, {log: true}));
        return undefined;
      });
  }

  private getMegacreditsOption(player: IPlayer) {
    player.production.add(Resource.ENERGY, -1);
    player.stock.add(Resource.MEGACREDITS, 8);
    player.game.log('${0} decreased energy production 1 step to gain 8 M€', (b) => b.player(player));
    return undefined;
  }

  public action(player: IPlayer) {
    const availableMC = player.spendableMegacredits();
    if (availableMC >= 2 && player.production.energy >= 1) {
      return new OrOptions(
        new SelectOption('Spend 2X Heat to gain X Plant', 'Spend Heat').andThen(() => {
          return this.getEnergyOption(player, availableMC);
        }),
        new SelectOption('Decrease energy production 1 step to gain 8 M€', 'Decrease energy').andThen(() => {
          return this.getMegacreditsOption(player);
        }),
      );
    } else if (availableMC >= 2) {
      return this.getEnergyOption(player, availableMC);
    } else if (player.production.energy >= 1) {
      return this.getMegacreditsOption(player);
    }
    return undefined;
  }

  public static resourceHook(player: IPlayer, resource: Resource, amount: number, from: IPlayer) {
    if (from === player || amount >= 0) {
      return;
    }
    if (resource === Resource.PLANTS && amount < 0) {
      // player.game.someoneHasRemovedOtherPlayersPlants = true;
      // FIMXE: 有个 api
      player.heat += 2 * Math.abs(amount);
    }
  }
}
