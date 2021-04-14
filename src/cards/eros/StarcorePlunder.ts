import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {CardMetadata} from '../CardMetadata';
import {CardRenderer} from '../render/CardRenderer';

export class StarcorePlunder implements IProjectCard {
    public cost: number = 60;
    public tags: Array<Tags> = [Tags.PLANT, Tags.ENERGY, Tags.SPACE, Tags.BUILDING];
    public name: CardName = CardName.STARCORE_PLUNDER;
    public cardType: CardType = CardType.AUTOMATED;
    public canPlay(player: Player): boolean {
      if (player.game.generation <3 ) {
        return false;
      }
      return true;
    }

    public play(player: Player) {
      player.addProduction(Resources.MEGACREDITS, 3);
      player.addProduction(Resources.STEEL, 3);
      player.addProduction(Resources.TITANIUM, 3);
      player.addProduction(Resources.PLANTS, 3);
      player.addProduction(Resources.ENERGY, 3);
      player.addProduction(Resources.HEAT, 3);
      player.game.starCoreGen= player.game.generation;
      return undefined; ;
    }

    public destory(player: Player) {
      player.addProduction(Resources.MEGACREDITS, -Math.min(player.getProduction(Resources.MEGACREDITS), 2));
      player.addProduction(Resources.STEEL, -Math.min(player.getProduction(Resources.STEEL), 2));
      player.addProduction(Resources.TITANIUM, -Math.min(player.getProduction(Resources.TITANIUM), 2));
      player.addProduction(Resources.PLANTS, -Math.min(player.getProduction(Resources.PLANTS), 2));
      player.addProduction(Resources.ENERGY, -Math.min(player.getProduction(Resources.ENERGY), 2));
      player.addProduction(Resources.HEAT, -Math.min(player.getProduction(Resources.HEAT), 2));
      player. game.log('${0}\'s all production decreased by 2', (b) =>
        b.player(player),
      );
      return undefined; ;
    }

    public metadata: CardMetadata = {
      cardNumber: 'Q07',
      renderData: CardRenderer.builder((b) => {
        b.production((pb) => {
          pb.megacredits(3).nbsp.steel(3).digit.nbsp.titanium(3).digit.br;
          pb.plants(3).digit.nbsp.energy(3).digit.nbsp.heat(3).digit;
        });
      }),
      description: 'Increase all production 3 steps.Decrease all production 2 steps(as low as 0) after being played 3 gens later.Can\'t be copied by other cards.Can\'t be played before Gen 3.',
    }
}

