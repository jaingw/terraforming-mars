import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {ICard} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {played} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Behavior} from '../../behavior/Behavior';
import {getBehaviorExecutor} from '../../behavior/BehaviorExecutor';
import {Units} from '../../../common/Units';

export class CloneTechnology extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
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

  public specialPlantCardsNames: ReadonlyArray<CardName> = [
    CardName.MOSS,
    CardName.NITROPHILIC_MOSS,
    CardName.POTATOES,
    // CardName.WETLANDS   -4 plants
    // CardName.GUERILLA_ECOLOGISTS -4 plants
  ];

  public override bespokePlay(player: IPlayer) {
    const availableCards = this.getAvailableCards(player);

    if (availableCards.length === 0) {
      return undefined;
    }

    return new SelectCard('Select plant card to copy', 'Copy', availableCards ).andThen((selectedCards: Array<ICard>) => {
      const foundCard: ICard = selectedCards[0];

      if (foundCard.produce) {
        foundCard.produce(player);
      } else if (foundCard.productionBox) {
        player.production.adjust(foundCard.productionBox(player), {log: true});
      } else if (foundCard.behavior !== undefined) {
        getBehaviorExecutor().execute(this.productionBehavior(foundCard.behavior), player, foundCard);
      }

      if (this.specialPlantCardsNames.includes(foundCard.name) && foundCard instanceof Card) {
        foundCard.bespokePlay(player);
      }
      player.game.log('${0} copied ${1} production and plant resource with ${2}', (b) =>
        b.player(player).card(foundCard).card(this));

      return undefined;
    });
  }

  /**
   * Returns a copy of behavior with just `production` and `decreaseAnyProduction` fields.
   */
  protected productionBehavior(behavior: Behavior): Behavior {
    const filtered: Behavior = {};
    if (behavior.production !== undefined) {
      filtered.production = behavior.production;
    }
    if (behavior.decreaseAnyProduction !== undefined) {
      filtered.decreaseAnyProduction = behavior.decreaseAnyProduction;
    }
    if (behavior.stock !== undefined) {
      filtered.stock = behavior.stock;
    }
    return filtered;
  }

  private isCardApplicable(card: ICard, player: IPlayer): boolean {
    if (!card.tags.includes(Tag.PLANT) && !card.tags.includes(Tag.WILD)) {
      return false;
    }
    if (card.type === CardType.EVENT) {
      return false;
    }

    if (card.productionBox !== undefined && ! player.production.canAdjust(card.productionBox(player))) {
      return false;
    }

    if (card.behavior !== undefined) {
      const productionBehavior = this.productionBehavior(card.behavior);
      if (Object.keys(productionBehavior).length > 0) {
        if (!getBehaviorExecutor().canExecute(productionBehavior, player, card)) {
          return false;
        }
      }
    }

    if (this.specialPlantCardsNames.includes(card.name)) {
      if (card instanceof Card && !card.bespokeCanPlay(player, {cost: 0})) {
        return false;
      }
    } else {
      const reserveUnits = (card as Card).reserveUnits ?? Units.EMPTY;
      if (player.plants < reserveUnits.plants) {
        const viralEnhancers = player.playedCards.find((card) => card.name === CardName.VIRAL_ENHANCERS) !== undefined ? 1 : 0;
        let manutech = 0;
        if ( player.isCorporation(CardName.MANUTECH) && card.productionBox !== undefined) {
          manutech = card.productionBox(player).plants;
        }
        if (player.plants + viralEnhancers + manutech < reserveUnits.plants) {
          return false;
        }
      }
    }

    // Card has no production box.
    if (card.behavior === undefined) {
      return false;
    }

    return true;
  }

  private getAvailableCards(player: IPlayer): ReadonlyArray<ICard> {
    return player.tableau.filter((card) => this.isCardApplicable(card, player));
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return this.getAvailableCards(player).length > 0;
  }
}
