import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {getBehaviorExecutor} from '../../behavior/BehaviorExecutor';
import {Behavior} from '../../behavior/Behavior';
import {SelectCard} from '../../inputs/SelectCard';
import {Priority} from '../../deferredActions/Priority';
import {PlayerInput} from '../../PlayerInput';
import {Tag} from '../../../common/cards/Tag';
import {played} from '../Options';
import {Resource} from '../../../common/Resource';

export class MirrorCoat extends CorporationCard implements ICard {
  public data: {'isUsed': boolean} = {'isUsed': false};
  constructor() {
    super({
      name: CardName.MIRRORCOAT,
      tags: [],
      startingMegaCredits: 49,

      metadata: {
        cardNumber: 'XB18',
        description: 'You start with 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(49).nbsp.cards(3);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.text('效果: 对手减少你的资源或产能无效.', Size.SMALL);
            ce.action('once per game:Raise your steel production 1 step. Copy the production boxes of 2 of your other cards with building tags.', (eb) => {
              eb.empty().startAction.production((pb) => pb.steel(1)).text('Copy', Size.SMALL, true)
                .production((pb) => pb.building(1, {played}))
                .production((pb) => pb.building(1, {played}));
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.drawCard(3);
    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    if (this.data.isUsed !== true && player.isCorporation(CardName.MIRRORCOAT) && this.getPlayableBuildingCards(player).length > 0) return true;
    return false;
  }

  protected getPlayableBuildingCards(player: IPlayer): ReadonlyArray<ICard> {
    return player.tableau.filter((card) => this.isCardApplicable(card, player));
  }


  protected isCardApplicable(card: ICard, player: IPlayer): boolean {
    if (!card.tags.includes(Tag.BUILDING) && !card.tags.includes(Tag.WILD)) {
      return false;
    }

    // Small Open Pit Mine allows a player to choose between two options. Both are
    // positive production so accept it rather than dig deep.
    if (card.name === CardName.SMALL_OPEN_PIT_MINE) {
      return true;
    }

    if (card.productionBox !== undefined) {
      return player.production.canAdjust(card.productionBox(player));
    }

    if (card.behavior !== undefined) {
      const productionBehavior = this.productionBehavior(card.behavior);
      if (Object.keys(productionBehavior).length > 0) {
        return getBehaviorExecutor().canExecute(productionBehavior, player, card);
      }
    }

    // Card has no production box.
    return false;
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
    return filtered;
  }

  public action(player: IPlayer) {
    this.data.isUsed = true;

    player.production.add(Resource.STEEL, 1, {log: true});

    const firstSet = this.getPlayableBuildingCards(player);
    const selectFirstCard = this.selectBuildingCard(player, firstSet, 'Select first builder card to copy', (card) => {
      const secondSet = this.getPlayableBuildingCards(player).filter((c) => c !== card);
      player.defer(this.selectBuildingCard(player, secondSet, 'Select second card to copy'), Priority.ROBOTIC_WORKFORCE);
      return undefined;
    });

    player.defer(selectFirstCard, Priority.ROBOTIC_WORKFORCE);
    return undefined;
  }

  protected selectBuildingCard(player: IPlayer, cards: ReadonlyArray<ICard>, title: string, cb: (card: ICard) => PlayerInput | undefined = () => undefined) {
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard(title, 'Copy', cards)
      .andThen(([card]) => {
        player.game.log('${0} copied ${1} production with ${2}', (b) =>
          b.player(player).card(card).card(this));

        if (card.produce) {
          card.produce(player);
        } else if (card.productionBox) {
          player.production.adjust(card.productionBox(player), {log: true});
        } else if (card.behavior !== undefined) {
          getBehaviorExecutor().execute(this.productionBehavior(card.behavior), player, card);
        }
        return cb(card);
      });
  }
}
