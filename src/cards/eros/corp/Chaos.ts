import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';
import {Game} from '../../../Game';
import {SelectAmount} from '../../../inputs/SelectAmount';
import {ITagCount} from '../../../ITagCount';
import {AndOptions} from '../../../inputs/AndOptions';
import {DeferredAction} from '../../../deferredActions/DeferredAction';
import {Tags} from '../../Tags';

export class Chaos implements CorporationCard {
    public name = CardName.CHAOS;
    public tags = [];
    public startingMegaCredits: number = 42;
    public cardType = CardType.CORPORATION;

    public play() {
      return undefined;
    }

    public onProductionPhase(player: Player) {
      let bonus: number = 0;
      let playerTags : ITagCount[] = player.getAllTags();
      const game = player.game;
      if (game.isSoloMode() || game.getPlayers().length ===1 ) {
        bonus = player.getDistinctTagCount(false);
      } else {
        playerTags = playerTags.filter((tag) => tag.tag !== Tags.WILDCARD && tag.tag !== Tags.EVENT);
        // 遍历每个玩家，再遍历每个我已打出的标志，过滤其他玩家标志数量大于自己的标志
        game.getPlayers().forEach((other) => {
          if (other === player ) {
            return;
          }
          playerTags = playerTags.filter((mytag) =>{
            // > , later can change to >= if possible
            if (mytag.count > other.getTagCount(mytag.tag, false, false)) {
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

    private selectResources(player: Player, game: Game, resourceCount: number) {
      let megacreditsAmount: number = 0;
      let steelAmount: number = 0;
      let titaniumAmount: number = 0;
      let plantsAmount: number = 0;
      let energyAmount: number = 0;
      let heatAmount: number = 0;
      const selectMegacredit = new SelectAmount('Megacredits', 'Select', (amount: number) => {
        megacreditsAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectSteel = new SelectAmount('Steel', 'Select', (amount: number) => {
        steelAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectTitanium = new SelectAmount('Titanium', 'Select', (amount: number) => {
        titaniumAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectPlants = new SelectAmount('Plants', 'Select', (amount: number) => {
        plantsAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectEnergy = new SelectAmount('Energy', 'Select', (amount: number) => {
        energyAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectHeat = new SelectAmount('Heat', 'Select', (amount: number) => {
        heatAmount = amount;
        return undefined;
      }, 0, resourceCount);
      const selectResources = new AndOptions(
        () => {
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
        }, selectMegacredit, selectSteel, selectTitanium, selectPlants, selectEnergy, selectHeat);
      selectResources.title = 'Chaos effect: select ' + resourceCount + ' resource(s)';
      game.defer(new DeferredAction(
        player,
        () => selectResources,
      ));
    }

    public metadata: CardMetadata = {
      cardNumber: 'Q21',
      renderData: CardRenderer.builder((b) => {
        b.br;
        b.megacredits(42);
        b.text('(You start with 42 M€.)', Size.TINY, false, false);
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.LARGE);
            eb.production((pb) => pb.wild(1)).startEffect.wild(1).played.asterix();
          });
          ce.vSpace();
          ce.effect('When perform an action, each of your highest production can provide a wild tag; When producing, each of your highest tag number can provide a standard resource.', (eb) => {
            eb.diverseTag(1).startEffect.wild(1).asterix();
          });
        });
      }),
    }
}
