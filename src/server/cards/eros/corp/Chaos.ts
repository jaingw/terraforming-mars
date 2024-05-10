import {IPlayer} from '../../../IPlayer';
import {CardRenderer} from '../../render/CardRenderer';
import {SelectAmount} from '../../../inputs/SelectAmount';
import {AndOptions} from '../../../inputs/AndOptions';
import {SimpleDeferredAction} from '../../../deferredActions/DeferredAction';
import {played} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';
import {IGame} from '../../../IGame';
import {TagCount} from '../../../../common/cards/TagCount';

export class Chaos extends CorporationCard {
  public _tags :[] = [];
  public override set tags(tags:[]) {
    this._tags = tags;
  }
  public override get tags() {
    return this._tags === undefined ? [] : this._tags;
  }
  constructor() {
    super({
      name: CardName.CHAOS,
      tags: [],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'Q21',
        // description: `You start with 32 M€.`,
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(42);
          b.text('(You start with 42 M€.)', Size.TINY, false, false);
          b.corpBox('effect', (ce) => {
            ce.effect(undefined, (eb) => {
              ce.vSpace(Size.LARGE);
              eb.production((pb) => pb.wild(1)).startEffect.wild(1, {played}).asterix();
            });
            ce.vSpace();
            ce.effect('When perform an action, each of your highest production can provide a wild tag; When producing, each of your highest tag number can provide a standard resource.', (eb) => {
              eb.diverseTag(1).startEffect.wild(1).asterix();
            });
          });
        }),
      },
    });
  }


  public onProductionPhase(player: IPlayer) {
    let bonus: number = 0;
    let playerTags : Array<TagCount> = player.tags.countAllTags();
    const game = player.game;
    if (game.isSoloMode() || game.getPlayers().length ===1 ) {
      bonus = player.tags.distinctCount('globalEvent');
    } else {
      playerTags = playerTags.filter((tag) => tag.tag !== Tag.WILD && tag.tag !== Tag.EVENT);
      // 遍历每个玩家，再遍历每个我已打出的标志，过滤其他玩家标志数量大于自己的标志
      game.getPlayers().forEach((other) => {
        if (other === player ) {
          return;
        }
        playerTags = playerTags.filter((mytag) =>{
          // > , later can change to >= if possible
          if (mytag.count > other.tags.count(mytag.tag, 'raw')) {
            return true;
          }
          return false;
        });
      });
      bonus = playerTags.length;
    }
    if (bonus > 0) {
      this.selectResources(player, game, bonus);
    }
    return undefined;
  }

  private selectResources(player: IPlayer, game: IGame, resourceCount: number) {
    let megacreditsAmount: number = 0;
    let steelAmount: number = 0;
    let titaniumAmount: number = 0;
    let plantsAmount: number = 0;
    let energyAmount: number = 0;
    let heatAmount: number = 0;
    const selectMegacredit = new SelectAmount('Megacredits', 'Select', 0, resourceCount).andThen((amount: number) => {
      megacreditsAmount = amount;
      return undefined;
    });
    const selectSteel = new SelectAmount('Steel', 'Select', 0, resourceCount).andThen((amount: number) => {
      steelAmount = amount;
      return undefined;
    });
    const selectTitanium = new SelectAmount('Titanium', 'Select', 0, resourceCount).andThen((amount: number) => {
      titaniumAmount = amount;
      return undefined;
    });
    const selectPlants = new SelectAmount('Plants', 'Select', 0, resourceCount).andThen((amount: number) => {
      plantsAmount = amount;
      return undefined;
    });
    const selectEnergy = new SelectAmount('Energy', 'Select', 0, resourceCount).andThen((amount: number) => {
      energyAmount = amount;
      return undefined;
    });
    const selectHeat = new SelectAmount('Heat', 'Select', 0, resourceCount ).andThen((amount: number) => {
      heatAmount = amount;
      return undefined;
    });
    const selectResources = new AndOptions(selectMegacredit, selectSteel, selectTitanium, selectPlants, selectEnergy, selectHeat)
      .andThen( () => {
        const selectedResources = megacreditsAmount +
                steelAmount +
                titaniumAmount +
                plantsAmount +
                energyAmount +
                heatAmount;
        if ( selectedResources > resourceCount || selectedResources < resourceCount) {
          throw new Error('Need to select ' + resourceCount + ' resource(s)');
        }
        player.megaCredits += megacreditsAmount;
        player.steel += steelAmount;
        player.titanium += titaniumAmount;
        player.plants += plantsAmount;
        player.energy += energyAmount;
        player.heat += heatAmount;
        return undefined;
      });
    selectResources.title = 'Chaos effect: select ' + resourceCount + ' resource(s)';
    game.defer(new SimpleDeferredAction(
      player,
      () => selectResources,
    ));
  }
}
