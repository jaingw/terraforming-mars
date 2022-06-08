import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Size} from '../../common/cards/render/Size';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';

export class SolarCosmicRays extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SOLAR_COSMIC_RAYS,
      cardType: CardType.AUTOMATED,
      tags: [Tags.SPACE],
      cost: 25,

      metadata: {
        cardNumber: 'Q01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1)).nbsp;
          b.production((pb) => pb.heat(1).slash().energy(1, {all}).asterix()).text('MAX 15', Size.SMALL);
        }),
        description: 'Increase your energy production 1 steps. For each energy production other player has, you increase your heat production 1 step[max 15].',
      },
    });
  }
  public play(player: Player) {
    player.addProduction(Resources.ENERGY, 1);
    let alllEnergyProd = 0;
    for (const otherPlayer of player.game.getPlayers().filter((p) => p.id !== player.id)) {
      alllEnergyProd += otherPlayer.getProduction(Resources.ENERGY);
    }
    alllEnergyProd= Math.min(alllEnergyProd, 15);
    player.addProduction(Resources.HEAT, alllEnergyProd);
    return undefined;
  }
}
