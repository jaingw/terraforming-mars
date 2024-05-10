import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {CorporationCard} from '../corporation/CorporationCard';

export class ScolexIndustries extends CorporationCard {
  constructor() {
    super({
      name: CardName.SCOLEX_INDUSTRIES,
      tags: [Tag.PLANT, Tag.POWER],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'XB05',
        description: 'You start with 1 steel, titanium, plant and energy production, and 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.production((pb) => pb.steel(1).titanium(1).plants(1).energy(1)).megacredits(45);
          b.corpBox('action', (ce) => {
            ce.action('Decrease 1 production (not MC), and Increase 1 production.', (eb) => {
              eb.minus(Size.SMALL).production((eb) => eb.wild(1)).startAction.plus(Size.SMALL).production((eb) => eb.wild(1));
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.STEEL, 1);
    player.production.add(Resource.TITANIUM, 1);
    player.production.add(Resource.PLANTS, 1);
    player.production.add(Resource.ENERGY, 1);
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    return player.production.get(Resource.STEEL) >= 1 ||
    player.production.get(Resource.TITANIUM) >= 1 || player.production.get(Resource.PLANTS) >= 1 ||
      player.production.get(Resource.ENERGY) >= 1 || player.production.get(Resource.HEAT) >= 1;
  }


  private increaseSelectedProduction(player: IPlayer) {
    const options: Array<SelectOption> = [];
    [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].forEach((resource) => {
      const option = new SelectOption('Increase ' + resource + ' production 1 step', 'Select').andThen( () => {
        player.production.add(resource, 1, {log: true});
        return undefined;
      });
      options.push(option);
    });
    const result = new OrOptions();
    result.options = options;
    return result;
  }


  private log(player: IPlayer, type: string) {
    player.game.log('${0}\'s ${1} decreased by 1.', (b) => b.player(player).string(type).string(type));
  }
  public action(player: IPlayer) {
    const result = new OrOptions();
    result.title = 'Select production to decrease one step and increase a production one step';

    const options: Array<SelectOption> = [];


    const reduceSteel = new SelectOption('Decrease steel production', 'Decrease production').andThen( () => {
      player.production.add(Resource.STEEL, -1);

      this.log(player, 'steel');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceTitanium = new SelectOption('Decrease titanium production', 'Decrease production').andThen( () => {
      player.production.add(Resource.TITANIUM, -1);
      this.log(player, 'titanium');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reducePlants = new SelectOption('Decrease plants production', 'Decrease production').andThen(() => {
      player.production.add(Resource.PLANTS, -1);

      this.log(player, 'plant');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceEnergy = new SelectOption('Decrease energy production', 'Decrease production').andThen( () => {
      player.production.add(Resource.ENERGY, -1);

      this.log(player, 'energy');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceHeat = new SelectOption('Decrease heat production', 'Decrease production').andThen( () => {
      player.production.add(Resource.HEAT, -1);

      this.log(player, 'heat');
      this.increaseSelectedProduction(player);
      return undefined;
    });


    if (player.production.get(Resource.STEEL) > 0) {
      options.push(reduceSteel);
    }
    if (player.production.get(Resource.TITANIUM) > 0) {
      options.push(reduceTitanium);
    }
    if (player.production.get(Resource.PLANTS) > 0) {
      options.push(reducePlants);
    }
    if (player.production.get(Resource.ENERGY) > 0) {
      options.push(reduceEnergy);
    }
    if (player.production.get(Resource.HEAT) > 0) {
      options.push(reduceHeat);
    }

    result.options = options;
    player.game.defer(new SimpleDeferredAction(player, () => result));
    player.game.defer(new SimpleDeferredAction(player, () => this.increaseSelectedProduction(player)));
    return undefined;
  }
}
