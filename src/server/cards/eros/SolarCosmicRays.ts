import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';

export class SolarCosmicRays extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SOLAR_COSMIC_RAYS,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
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
  public override bespokePlay(player: Player) {
    player.production.add(Resource.ENERGY, 1);
    let alllEnergyProd = 0;
    for (const otherPlayer of player.game.getPlayers().filter((p) => p.id !== player.id)) {
      alllEnergyProd += otherPlayer.production.get(Resource.ENERGY);
    }
    alllEnergyProd= Math.min(alllEnergyProd, 15);
    player.production.add(Resource.HEAT, alllEnergyProd);
    return undefined;
  }
}
