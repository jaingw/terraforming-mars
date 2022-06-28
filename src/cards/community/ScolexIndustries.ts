import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Resources} from '../../common/Resources';
import {Size} from '../../common/cards/render/Size';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {IActionCard} from '../../cards/ICard';

export class ScolexIndustries extends Card implements IActionCard, ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.SCOLEX_INDUSTRIES,
      tags: [Tags.PLANT, Tags.ENERGY],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'XUEBAO5',
        description: 'You start with 1 steel, titanium, plant and energy production, and 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.production((pb) => pb.steel(1).titanium(1).plants(1).energy(1)).megacredits(40);
          b.corpBox('action', (ce) => {
            ce.action('Decrease 1 production, and Increase 1 production', (eb) => {
              eb.minus(Size.SMALL).production((eb) => eb.wild(1)).startAction.plus(Size.SMALL).production((eb) => eb.wild(1));
            });
          });
        }),
      },
    });
  }

  public play(player: Player) {
    player.addProduction(Resources.STEEL, 1);
    player.addProduction(Resources.TITANIUM, 1);
    player.addProduction(Resources.PLANTS, 1);
    player.addProduction(Resources.ENERGY, 1);
    return undefined;
  }

  public canAct(player: Player): boolean {
    return player.getProduction(Resources.MEGACREDITS) >= -5 || player.getProduction(Resources.STEEL) >= 1 ||
    player.getProduction(Resources.TITANIUM) >= 1 || player.getProduction(Resources.PLANTS) >= 1 ||
      player.getProduction(Resources.ENERGY) >= 1 || player.getProduction(Resources.HEAT) >= 1;
  }


  private increaseSelectedProduction(player: Player) {
    const options: Array<SelectOption> = [];
    [Resources.MEGACREDITS, Resources.STEEL, Resources.TITANIUM, Resources.PLANTS, Resources.ENERGY, Resources.HEAT].forEach((resource) => {
      const option = new SelectOption('Increase ' + resource + ' production 1 step', 'Select', () => {
        player.addProduction(resource, 1, {log: true});
        return undefined;
      });
      options.push(option);
    });
    const result = new OrOptions();
    result.options = options;
    return result;
  }


  private log(player: Player, type: string) {
    player.game.log('${0}\'s ${1} decreased by 1.', (b) => b.player(player).string(type).string(type));
  }
  public action(player: Player) {
    const result = new OrOptions();
    result.title = 'Select production to decrease one step and increase a production one step';

    const options: Array<SelectOption> = [];

    const reduceMegacredits = new SelectOption('Decrease M€ production', 'Decrease production', () => {
      player.addProduction(Resources.MEGACREDITS, -1);
      this.log(player, 'megacredit');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceSteel = new SelectOption('Decrease steel production', 'Decrease production', () => {
      player.addProduction(Resources.STEEL, -1);

      this.log(player, 'steel');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceTitanium = new SelectOption('Decrease titanium production', 'Decrease production', () => {
      player.addProduction(Resources.TITANIUM, -1);
      this.log(player, 'titanium');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reducePlants = new SelectOption('Decrease plants production', 'Decrease production', () => {
      player.addProduction(Resources.PLANTS, -1);

      this.log(player, 'plant');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceEnergy = new SelectOption('Decrease energy production', 'Decrease production', () => {
      player.addProduction(Resources.ENERGY, -1);

      this.log(player, 'energy');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    const reduceHeat = new SelectOption('Decrease heat production', 'Decrease production', () => {
      player.addProduction(Resources.HEAT, -1);

      this.log(player, 'heat');
      this.increaseSelectedProduction(player);
      return undefined;
    });

    if (player.getProduction(Resources.MEGACREDITS) > -5) {
      options.push(reduceMegacredits);
    }
    if (player.getProduction(Resources.STEEL) > 0) {
      options.push(reduceSteel);
    }
    if (player.getProduction(Resources.TITANIUM) > 0) {
      options.push(reduceTitanium);
    }
    if (player.getProduction(Resources.PLANTS) > 0) {
      options.push(reducePlants);
    }
    if (player.getProduction(Resources.ENERGY) > 0) {
      options.push(reduceEnergy);
    }
    if (player.getProduction(Resources.HEAT) > 0) {
      options.push(reduceHeat);
    }

    result.options = options;
    player.game.defer(new DeferredAction(player, () => result));
    player.game.defer(new DeferredAction(player, () => this.increaseSelectedProduction(player)));
    return undefined;
  }
}
