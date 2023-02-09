import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {SelectCard} from '../../inputs/SelectCard';
import {ICard} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {played} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resources} from '../../../common/Resources';

export class CloneTechnology extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.CLONE_TECHNOLOGY,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 13,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'Q04',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.text('X').plants(1, {played})).nbsp.text('X').plants(1).asterix();
        }),
        description: 'Duplicate the production box and plant resource of one of your plant cards.',
      },
    });
  }

  public override bespokeCanPlay(player: Player): boolean {
    return this.getAvailableCards(player).length > 0;
  }

  public plantCardsNames: ReadonlyArray<CardName> = [
    CardName.ARCTIC_ALGAE,
    CardName.EOS_CHASMA_NATIONAL_PARK,
    CardName.ALGAE,
    CardName.ADAPTED_LICHEN,
    CardName.KELP_FARMING,
    CardName.TREES,
    CardName.GRASS,
    CardName.HEATHER,
    CardName.BUSHES,
    CardName.GREENHOUSES,
    CardName.FARMING,
    CardName.LICHEN,
    CardName.TUNDRA_FARMING,
    CardName.PROTECTED_VALLEY,
    CardName.NOCTIS_FARMING,
    CardName.SNOW_ALGAE,
    CardName.FREYJA_BIODOMES,
    CardName.VENUS_SOILS,
    CardName.ECOLOGY_RESEARCH,
    CardName.BIOSPHERE_SUPPORT,
    CardName.DOME_FARMING,
    CardName.ECOLOGY_EXPERTS,
    CardName.OCEAN_FARM,
    CardName.PLANT_SMUGGLING,
    // moon
    CardName.ALGAE_BIOREACTORS,
    CardName.ARCHIMEDES_HYDROPONICS_STATION,
    CardName.GEODESIC_TENTS,

    // path
    CardName.ORBITAL_LABORATORIES,
    CardName.POLLINATORS,
    CardName.SOIL_DETOXIFICATION,
  ];

  public corporationCardsNames: ReadonlyArray<CardName> = [
    CardName.ECOLINE,
    CardName._ECOLINE_,
    CardName.APHRODITE,
    CardName.AGRICOLA_INC,
    CardName.SCOLEX_INDUSTRIES, // 新星核

  ];

  private getAvailableCards(player: Player): Array<ICard> {
    const availableCards: Array<ICard> = player.playedCards.filter((card) => {
      if (card.name === CardName.MOSS) {
        const hasViralEnhancers = player.playedCards.find((card) => card.name === CardName.VIRAL_ENHANCERS);
        const hasEnoughPlants = player.plants >= 1 || hasViralEnhancers !== undefined || player.isCorporation(CardName.MANUTECH);
        if (hasEnoughPlants) {
          return true;
        }
      } else if (card.name === CardName.NITROPHILIC_MOSS) {
        const hasViralEnhancers = player.playedCards.find((card) => card.name === CardName.VIRAL_ENHANCERS);
        const hasEnoughPlants = player.plants >= 2 || player.isCorporation(CardName.MANUTECH) || player.plants >= 1 && hasViralEnhancers !== undefined;
        if (hasEnoughPlants) {
          return true;
        }
      } else if (card.name === CardName.POTATOES) {
        const hasViralEnhancers = player.playedCards.find((card) => card.name === CardName.VIRAL_ENHANCERS);
        const hasEnoughPlants = player.plants >= 2 || player.plants >= 1 && hasViralEnhancers !== undefined;
        if (hasEnoughPlants) {
          return true;
        }
      } else if (card.name === CardName.FREYJA_BIODOMES) {
        if (player.production.energy >= 1) {
          return true;
        }
      } else if (card.name === CardName.BIOSPHERE_SUPPORT) {
        if (player.production.megacredits >= -4) {
          return true;
        }
      } else if (card.name === CardName.ALGAE_BIOREACTORS) {
        if (player.production.plants >= 1) {
          return true;
        }
      } else if (card.name === CardName.GEODESIC_TENTS) {
        if (player.production.energy >= 1) {
          return true;
        }
      } else if (card.name === CardName.ARCHIMEDES_HYDROPONICS_STATION) {
        if (player.production.energy >= 1 && player.production.megacredits >= -4) {
          return true;
        }
      } else if (this.plantCardsNames.includes(card.name)) {
        return true;
      }
      return false;
    });

    player.corporations.forEach((corpCard) => {
      if (corpCard !== undefined && this.corporationCardsNames.includes(corpCard.name)) {
        availableCards.push(corpCard);
      }
    });

    return availableCards;
  }

  public override bespokePlay(player: Player) {
    const availableCards = this.getAvailableCards(player);

    if (availableCards.length === 0) {
      return undefined;
    }

    return new SelectCard('Select plant card to copy', 'Copy', availableCards, (selectedCards: Array<ICard>) => {
      const foundCard: ICard = selectedCards[0];

      class Updater {
        constructor(
          public name: CardName,
          public energyProduction: number,
          public megaCreditProduction: number,
          public plantProduction: number,
          public heatProduction: number,
          public plantResource: number) {}
      }

      const updaters: Array<Updater> = [


        new Updater(CardName.ARCTIC_ALGAE, 0, 0, 0, 0, 1),
        new Updater(CardName.EOS_CHASMA_NATIONAL_PARK, 0, 0, 2, 0, 3),
        new Updater(CardName.ALGAE, 0, 0, 2, 0, 1),
        new Updater(CardName.ADAPTED_LICHEN, 0, 0, 1, 0, 0),
        new Updater(CardName.KELP_FARMING, 0, 2, 3, 0, 2),
        new Updater(CardName.TREES, 0, 0, 3, 0, 1),
        new Updater(CardName.GRASS, 0, 0, 1, 0, 3),
        new Updater(CardName.HEATHER, 0, 0, 1, 0, 1),
        new Updater(CardName.BUSHES, 0, 0, 2, 0, 2),
        new Updater(CardName.GREENHOUSES, 0, 0, 0, 0, player.game.getCitiesCount()),
        new Updater(CardName.FARMING, 0, 2, 2, 0, 2),
        new Updater(CardName.LICHEN, 0, 0, 0, 0, 0),
        new Updater(CardName.TUNDRA_FARMING, 0, 2, 1, 0, 1),
        new Updater(CardName.PROTECTED_VALLEY, 0, 2, 0, 0, 0),
        new Updater(CardName.NOCTIS_FARMING, 0, 1, 0, 0, 2),
        new Updater(CardName.SNOW_ALGAE, 0, 0, 0, 1, 1),
        new Updater(CardName.FREYJA_BIODOMES, -1, 2, 0, 0, 0),
        new Updater(CardName.VENUS_SOILS, 0, 0, 1, 0, 0),
        new Updater(CardName.ECOLOGY_RESEARCH, 0, 0, player.getColoniesCount(), 0, 0),
        new Updater(CardName.BIOSPHERE_SUPPORT, 0, -1, 2, 0, 0),
        new Updater(CardName.DOME_FARMING, 0, 2, 1, 0, 0),
        new Updater(CardName.ECOLOGY_EXPERTS, 0, 0, 1, 0, 0),
        new Updater(CardName.OCEAN_FARM, 0, 0, 1, 1, 0),
        new Updater(CardName.POTATOES, 0, 2, 0, 0, -2),
        new Updater(CardName.MOSS, 0, 0, 1, 0, -1),
        new Updater(CardName.NITROPHILIC_MOSS, 0, 0, 2, 0, -2),
        new Updater(CardName.ECOLINE, 0, 0, 2, 0, 3),
        new Updater(CardName._ECOLINE_, 0, 0, 2, 0, 3),

        new Updater(CardName.AGRICOLA_INC, 0, 1, 1, 0, 0),
        new Updater(CardName.SCOLEX_INDUSTRIES, 1, 0, 1, 0, 0),
        new Updater(CardName.PLANT_SMUGGLING, 0, 2, 2, 0, 3),

        // moon
        new Updater(CardName.ALGAE_BIOREACTORS, 0, 0, -1, 0, 0),
        new Updater(CardName.ARCHIMEDES_HYDROPONICS_STATION, -1, -1, 2, 0, 0),
        new Updater(CardName.GEODESIC_TENTS, -1, 0, 1, 0, 0),

        // path
        new Updater(CardName.ORBITAL_LABORATORIES, 0, 0, 2, 0, 1),
        new Updater(CardName.POLLINATORS, 0, 2, 1, 0, 0),
        new Updater(CardName.SOIL_DETOXIFICATION, 0, 0, 1, 0, 0),


      ];

      const result:Updater = updaters.filter((u) => u.name === foundCard.name)[0];

      if (!result) {
        throw new Error('Production not found for selected card');
      }

      if (player.production.energy + result.energyProduction < 0) {
        throw new Error('not enough energy production');
      }
      if (player.production.plants + result.plantProduction < 0) {
        throw new Error('not enough plant production');
      }
      if (player.production.heat + result.heatProduction < 0) {
        throw new Error('not enough heat production');
      }

      player.production.add(Resources.ENERGY, result.energyProduction);
      player.production.add(Resources.MEGACREDITS, result.megaCreditProduction);
      player.production.add(Resources.PLANTS, result.plantProduction);
      player.production.add(Resources.HEAT, result.heatProduction);
      player.addResource(Resources.PLANTS, result.plantResource);

      player.game.log('${0} copied ${1} production and plant resource with ${2}', (b) =>
        b.player(player).cardName(result.name).card(this));

      return undefined;
    });
  }
}
