import {IPlayer} from '../../../IPlayer';
import {CardRenderer} from '../../render/CardRenderer';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {LogHelper} from '../../../LogHelper';
import {PlaceOceanTile} from '../../../deferredActions/PlaceOceanTile';
import {PartyHooks} from '../../../turmoil/parties/PartyHooks';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {REDS_RULING_POLICY_COST, MAX_VENUS_SCALE, MAX_TEMPERATURE, MAX_OXYGEN_LEVEL, MAX_OCEAN_TILES} from '../../../../common/constants';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {SelectPaymentDeferred} from '../../../deferredActions/SelectPaymentDeferred';
import {CorporationCard} from '../../corporation/CorporationCard';

export class WGParternship extends CorporationCard {
  constructor() {
    super({
      name: CardName.WG_PARTERNSHIP,
      tags: [Tag.EARTH],
      startingMegaCredits: 48,

      metadata: {
        cardNumber: 'Q22',
        description: `You start with 48 M€.`,
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(48);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.action(undefined, (eb) => {
              eb.empty().startAction.temperature(1).slash().oxygen(1).slash().venus(1);
            });
            ce.vSpace(Size.SMALL);
            ce.action(`inrease temperature/oxygen/venus 1step or spend ${WGParternship.oceanCost}M€ to place an ocean`, (eb) => {
              eb.or().megacredits(WGParternship.oceanCost).startAction.oceans(1, {size: Size.SMALL});
            });
            ce.vSpace(Size.SMALL);
          });
        }),
      },
    });
  }

  public static oceanCost = 5;

  public canAct(player: IPlayer): boolean {
    const game = player.game;
    const shouldApplyRed = PartyHooks.shouldApplyPolicy(player, PartyName.REDS, 'rp01');

    if (shouldApplyRed && !player.canAfford( REDS_RULING_POLICY_COST)) {
      return false;
    }
    if ( game.gameOptions.venusNextExtension && game.getVenusScaleLevel() !== MAX_VENUS_SCALE) {
      return true;
    }
    if ( game.getTemperature() !== MAX_TEMPERATURE || game.getOxygenLevel() !== MAX_OXYGEN_LEVEL ) {
      return true;
    }
    if (game.board.getOceanSpaces().length === MAX_OCEAN_TILES || !player.canAfford(WGParternship.oceanCost) ||
            shouldApplyRed && !player.canAfford(WGParternship.oceanCost+REDS_RULING_POLICY_COST) ) {
      return false;
    }
    return true;
  }

  public action(player: IPlayer) {
    const game = player.game;
    const action: OrOptions = new OrOptions();
    action.title = 'Select Your first action';
    const increaseTemp = new SelectOption('Raise temperature 1 step', 'Raise temperature').andThen(() => {
      game.increaseTemperature(player, 1);
      game.log('${0} increased temperature ${1} step', (b) => b.player(player).number(1));
      return undefined;
    });
    const increaseOxygen = new SelectOption('Raise oxygen 1 step', 'Raise oxygen').andThen(() => {
      game.log('${0} increased oxygen ${1} step', (b) => b.player(player).number(1));
      player.game.increaseOxygenLevel(player, 1);
      return undefined;
    });
    const increaseVenus = new SelectOption('Raise venus 1 step', 'Raise venus').andThen( () => {
      game.increaseVenusScaleLevel(player, 1);
      LogHelper.logVenusIncrease( player, 1);
      return undefined;
    });

    const addOcean = new SelectOption(`Spend ${WGParternship.oceanCost}M€ to place an ocean`, 'Place ocean').andThen(() => {
      player.game.defer(new SelectPaymentDeferred(player, WGParternship.oceanCost, {title: 'Select how to pay for action'})
        .andThen(() => {
          player.game.defer(new PlaceOceanTile(player));
        }));
      game.log('${0} place an ocean', (b) => b.player(player));
      return undefined;
    });

    if (game.getTemperature() !== MAX_TEMPERATURE) {
      action.options.push(increaseTemp);
    }
    if (game.getOxygenLevel() !== MAX_OXYGEN_LEVEL) {
      action.options.push(increaseOxygen);
    }
    if (game.gameOptions.venusNextExtension && game.getVenusScaleLevel() !== MAX_VENUS_SCALE) {
      action.options.push(increaseVenus);
    }
    const shouldApplyRed = PartyHooks.shouldApplyPolicy(player, PartyName.REDS, 'rp01');
    const canAfford = player.canAfford(WGParternship.oceanCost) || shouldApplyRed && player.canAfford(WGParternship.oceanCost+REDS_RULING_POLICY_COST);
    if (game.board.getOceanSpaces().length < MAX_OCEAN_TILES && canAfford) {
      action.options.push(addOcean);
    }
    return action;
  }
}
