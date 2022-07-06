import {Player} from '../../Player';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectColony} from '../../inputs/SelectColony';
import {SelectOption} from '../../inputs/SelectOption';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Size} from '../../common/cards/render/Size';
import {Tags} from '../../common/cards/Tags';
import {MAX_COLONY_TRACK_POSITION} from '../../common/constants';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IColony} from '@/colonies/IColony';
import {CardResource} from '../../common/CardResource';

export class ColonialOne extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.COLONIAL_ONE,
      tags: [Tags.SPACE],
      startingMegaCredits: 35,
      resourceType: CardResource.FIGHTER,

      metadata: {
        cardNumber: 'R42',
        description: 'You start with 35 M€ and 1 extra trade fleet. Add 3 fighter resources to this card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(35).tradeFleet().fighter(3);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.action(undefined, (eb) => {
              eb.empty().startAction.text('+/-', Size.LARGE).colonies(1, {size: Size.SMALL}).text(' TRACK', Size.SMALL);
            });
            ce.action('Increase or decrease any colony tile track 1 step, or spend 1 fighter resource on this card to trade for free.', (eb) => {
              eb.or(Size.MEDIUM).nbsp.fighter().startAction.trade();
            });
          });
        }),
      },
    });
  }

  public override resourceCount: number = 0;

  public play(player: Player) {
    player.increaseFleetSize();
    this.resourceCount = 3;
    return undefined;
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: Player) {
    const game = player.game;
    if (game.gameOptions.coloniesExtension === false) return undefined;

    const opts: Array<SelectOption> = [];
    const activeColonies = game.colonies.filter((colony) => colony.isActive);
    const openColonies = activeColonies.filter((colony) => colony.visitor === undefined);

    const moveColonyTrack = new SelectOption('Increase or decrease a colony tile track', 'Select colony', () => {
      game.defer(new SimpleDeferredAction(
        player,
        () => new SelectColony('Select colony tile to increase or decrease track', 'Select', activeColonies, (colony: IColony) => {
          if (activeColonies.includes(colony)) {
            game.defer(new SimpleDeferredAction(player, () => new OrOptions(
              new SelectOption('Increase track for ' + colony.name, 'Increase', () => {
                if (colony.trackPosition < MAX_COLONY_TRACK_POSITION) {
                  colony.increaseTrack();
                  game.log('${0} increased ${1} colony track 1 step', (b) => b.player(player).colony(colony));
                }

                return undefined;
              }),
              new SelectOption('Decrease track for ' + colony.name, 'Decrease', () => {
                if (colony.trackPosition > 0) {
                  colony.decreaseTrack();
                  game.log('${0} decreased ${1} colony track 1 step', (b) => b.player(player).colony(colony));
                }

                return undefined;
              }),
            )));
          }
          return undefined;
        }),
      ));

      return undefined;
    });

    const spendResource = new SelectOption('Spend 1 fighter resource on this card to trade for free', 'Spend resource', () => {
      game.defer(new SimpleDeferredAction(
        player,
        () => new SelectColony('Select colony to trade with for free', 'Select', openColonies, (colony: IColony) => {
          if (openColonies.includes(colony)) {
            this.resourceCount--;
            game.log('${0} traded with ${1}', (b) => b.player(player).colony(colony));
            colony.trade(player);
            return undefined;
          }
          return undefined;
        }),
      ));

      return undefined;
    });

    if (openColonies.length > 0 && player.getFleetSize() > player.tradesThisGeneration && this.resourceCount > 0) {
      opts.push(spendResource);
    }

    opts.push(moveColonyTrack);

    return new OrOptions(...opts);
  }
}
