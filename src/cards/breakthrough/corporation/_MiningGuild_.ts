import {CardRenderer} from '../../render/CardRenderer';
import {MiningGuild} from '../../corporation/MiningGuild';
import {digit} from '../../Options';
import {Player} from '../../../Player';
import {IColonyTrader} from '../../../colonies/IColonyTrader';
import {Colony} from '../../../colonies/Colony';
import {CardName} from '../../../common/cards/CardName';
import {ICardMetadata} from '../../../common/cards/ICardMetadata';
import {Size} from '../../../common/cards/render/Size';
import {Resources} from '../../../common/Resources';

export class _MiningGuild_ extends MiningGuild {
  public override get name() {
    return CardName._MINING_GUILD_;
  }

  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'B02',
      // description: 'You start with 30 M€, 5 steel and 1 steel production.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(30).steel(5, {digit}).nbsp.production((pb) => pb.steel(1));
        b.text('(You start with 30 M€, 5 steel and 1 steel production.)', Size.TINY, false, false);
        b.corpBox('effect', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.effect(undefined, (eb) => {
            eb.steel(1).slash().titanium(1).startEffect.production((pb) => pb.steel(1));
          });
          ce.effect('Each time you get steel/titanium as placement bonus, increase 1 steel prod.You can use 4 steel to trade or pay for city standard project.', (eb) => {
            eb.steel(4, {digit}).startAction.trade().city({size: Size.SMALL}).openBrackets.steel(1).closeBrackets;
          });
        });
      }),
    };
  }
}

const STEEL_TRADE_COST = 4;
export class TradeWithSteel implements IColonyTrader {
  private tradeCost : number;

  constructor(private player: Player) {
    this.tradeCost = STEEL_TRADE_COST - player.colonyTradeDiscount;
  }

  public canUse() {
    return this.player.isCorporation(CardName._MINING_GUILD_ )&& this.player.steel >= this.tradeCost;
  }
  public optionText() {
    return 'Pay ' + this.tradeCost +' Steel';
  }

  public trade(colony: Colony) {
    this.player.deductResource(Resources.STEEL, this.tradeCost);
    this.player.game.log('${0} spent ${1} steel to trade with ${2}', (b) => b.player(this.player).number(this.tradeCost).colony(colony));
    colony.trade(this.player);
  }
}
