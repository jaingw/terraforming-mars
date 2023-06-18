import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';

export class StarcorePlunder extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.STARCORE_PLUNDER,
      tags: [Tag.PLANT, Tag.POWER, Tag.SPACE, Tag.BUILDING],
      cost: 60,
      metadata: {
        cardNumber: 'Q07',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => {
            pb.megacredits(3).nbsp.steel(3, {digit}).nbsp.titanium(3, {digit}).br;
            pb.plants(3, {digit}).nbsp.energy(3, {digit}).nbsp.heat(3, {digit});
          });
        }),
        description: 'Increase all production 3 steps.Decrease all production 2 steps(as low as 0) after being played 3 gens later.Can\'t be copied by other cards.Can\'t be played before Gen 3.',
      },
    });
  }

  public override bespokeCanPlay(player: Player): boolean {
    if (player.game.generation <3 ) {
      return false;
    }
    return true;
  }

  public override bespokePlay(player: Player) {
    player.production.add(Resource.MEGACREDITS, 3);
    player.production.add(Resource.STEEL, 3);
    player.production.add(Resource.TITANIUM, 3);
    player.production.add(Resource.PLANTS, 3);
    player.production.add(Resource.ENERGY, 3);
    player.production.add(Resource.HEAT, 3);
    // player.game.starCoreGen= player.game.generation;
    return undefined;
  }

  // if (this.starCoreGen > 0 && this.generation - this.starCoreGen ===2) {
  //   this.players.forEach((x) => {
  //     const starcore = x.playedCards.find((y) => y.name === CardName.STARCORE_PLUNDER);
  //     if (starcore !== undefined) {
  //       (starcore as StarcorePlunder).destory(x);
  //     }
  //   });
  //   this.starCoreGen = 0;
  // }

  public destory(player: Player) {
    player.production.add(Resource.MEGACREDITS, -Math.min(player.production.get(Resource.MEGACREDITS), 2));
    player.production.add(Resource.STEEL, -Math.min(player.production.get(Resource.STEEL), 2));
    player.production.add(Resource.TITANIUM, -Math.min(player.production.get(Resource.TITANIUM), 2));
    player.production.add(Resource.PLANTS, -Math.min(player.production.get(Resource.PLANTS), 2));
    player.production.add(Resource.ENERGY, -Math.min(player.production.get(Resource.ENERGY), 2));
    player.production.add(Resource.HEAT, -Math.min(player.production.get(Resource.HEAT), 2));
    player. game.log('${0}\'s all production decreased by 2', (b) =>
      b.player(player),
    );
    return undefined;
  }
}

