import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardRenderer} from '../../render/CardRenderer';
import {Tags} from '../../Tags';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {LogHelper} from '../../../LogHelper';
import {PlaceOceanTile} from '../../../deferredActions/PlaceOceanTile';
import {SelectHowToPayDeferred} from '../../../deferredActions/SelectHowToPayDeferred';
import {MAX_TEMPERATURE, MAX_OCEAN_TILES, MAX_OXYGEN_LEVEL, MAX_VENUS_SCALE, REDS_RULING_POLICY_COST} from '../../../constants';
import {PartyName} from '../../../turmoil/parties/PartyName';
import {PartyHooks} from '../../../turmoil/parties/PartyHooks';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {Size} from '../../render/Size';
import {Priority} from '../../../deferredActions/DeferredAction';

export class WGParternship extends Card implements ICard, CorporationCard {
  constructor() {
    super({
      name: CardName.WG_PARTERNSHIP,
      tags: [Tags.EARTH],
      startingMegaCredits: 48,
      cardType: CardType.CORPORATION,

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
              eb.or().megacredits(WGParternship.oceanCost).startAction.oceans(1, Size.SMALL);
            });
            ce.vSpace(Size.SMALL);
          });
        }),
      },
    });
  }

  public static oceanCost = 5;

  public play() {
    return undefined;
  }

  public canAct(player: Player): boolean {
    const game = player.game;
    const shouldApplyRed = PartyHooks.shouldApplyPolicy(player.game, PartyName.REDS);

    if (shouldApplyRed && !player.canAfford( REDS_RULING_POLICY_COST)) {
      return false;
    }
    if ( game.gameOptions.venusNextExtension && game.getVenusScaleLevel() !== MAX_VENUS_SCALE) {
      return true;
    }
    if ( game.getTemperature() !== MAX_TEMPERATURE || game.getOxygenLevel() !== MAX_OXYGEN_LEVEL ) {
      return true;
    }
    if (game.board.getOceansOnBoard() === MAX_OCEAN_TILES || !player.canAfford(WGParternship.oceanCost) ||
            shouldApplyRed && !player.canAfford(WGParternship.oceanCost+REDS_RULING_POLICY_COST) ) {
      return false;
    }
    return true;
  }

  public action(player: Player) {
    const game = player.game;
    const action: OrOptions = new OrOptions();
    action.title = 'Select Your first action';
    const increaseTemp = new SelectOption('Raise temperature 1 step', 'Raise temperature', () => {
      game.increaseTemperature(player, 1);
      game.log('${0} increased temperature ${1} step', (b) => b.player(player).number(1));
      return undefined;
    });
    const increaseOxygen = new SelectOption('Raise oxygen 1 step', 'Raise oxygen', () => {
      game.log('${0} increased oxygen ${1} step', (b) => b.player(player).number(1));
      player.game.increaseOxygenLevel(player, 1);
      return undefined;
    });
    const increaseVenus = new SelectOption('Raise venus 1 step', 'Raise venus', () => {
      game.increaseVenusScaleLevel(player, 1);
      LogHelper.logVenusIncrease( player, 1);
      return undefined;
    });

    const addOcean = new SelectOption(`Spend ${WGParternship.oceanCost}M€ to place an ocean`, 'Place ocean', () => {
      player.game.defer(new PlaceOceanTile(player));
      player.game.defer(new SelectHowToPayDeferred(player, WGParternship.oceanCost, {title: 'Select how to pay for action'}), Priority.COST);
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
    const shouldApplyRed = PartyHooks.shouldApplyPolicy(player.game, PartyName.REDS);
    const canAfford = player.canAfford(WGParternship.oceanCost) || shouldApplyRed && player.canAfford(WGParternship.oceanCost+REDS_RULING_POLICY_COST);
    if (game.board.getOceansOnBoard() < MAX_OCEAN_TILES && canAfford) {
      action.options.push(addOcean);
    }
    return action;
  }
}
