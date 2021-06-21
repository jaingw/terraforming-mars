import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {PlaceCityTile} from '../../../deferredActions/PlaceCityTile';
import {Resources} from '../../../Resources';

export class CityStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.CITY_STANDARD_PROJECT,
      cost: 25,
      metadata: {
        cardNumber: 'SP4',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 25 M€ to place a city tile and increase your M€ production 1 step.', (eb) => {
            eb.megacredits(25).startAction.city().production((pb) => {
              pb.megacredits(1);
            });
          }),
        ),
      },
    });
  }

  public canAct(player: Player): boolean {
    /* 矿业公司突破：标动城市可以用铁 */
    if (player.isCorporation(CardName._MINING_GUILD_)) {
      return player.canAfford(this.cost-player.steelValue*player.steel) &&
        player.game.board.getAvailableSpacesForCity(player).length > 0;
    }
    return player.canAfford(this.cost- super.discount(player)) && player.game.board.getAvailableSpacesForCity(player).length > 0;
  }

  actionEssence(player: Player): void {
    player.game.defer(new PlaceCityTile(player));
    player.addProduction(Resources.MEGACREDITS, 1);
  }
}
