
import {IActionCard} from '../../ICard';
import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {UnitedNationsMarsInitiative} from '../../corporation/UnitedNationsMarsInitiative';
import {Phase} from '../../../../common/Phase';
import {Resources} from '../../../../common/Resources';

const ACTION_COST = 5;
export class _UnitedNationsMarsInitiative_ extends UnitedNationsMarsInitiative implements IActionCard, ICorporationCard {
  public override get name() {
    return CardName._UNITED_NATIONS_MARS_INITIATIVE_;
  }

  public override canAct(player: Player): boolean {
    return player.hasIncreasedTerraformRatingThisGeneration && player.canAfford(ACTION_COST, {tr: {tr: 1}});
  }

  public override action(player: Player) {
    player.megaCredits -= 5;
    player.increaseTerraformRating();
    return undefined;
  }

  public override get metadata() {
    return {
      cardNumber: 'R32',
      description: 'You start with 40 M€.',
      renderData: CardRenderer.builder((b) => {
        // TODO(chosta): find a not so hacky solutions to spacing
        b.br.br.br;
        b.empty().nbsp.nbsp.nbsp.nbsp.megacredits(40);
        b.corpBox('action', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.LARGE);
            eb.megacredits(5).startAction.tr(1, {size: Size.SMALL}).asterix();
            eb.description(undefined);
          });
          ce.vSpace();
          ce.action('If your TR was raised this generation, you may pay 5 M€ to raise 1 step. When you raise TR in generation, gain 2 M€.', (eb) => {
            eb.tr(1, {size: Size.SMALL}).asterix().startEffect.megacredits(2);
          });
        });
      }),
    };
  }

  public onIncreaseTerraformRating(player: Player, cardOwner: Player, steps: number) {
    const game = player.game;
    if (player !== cardOwner) {
      return;
    }
    if (game.phase === Phase.ACTION || game.phase === Phase.PRELUDES) {
      cardOwner.addResource(Resources.MEGACREDITS, steps * 2, {log: true});
    }
  }
}
