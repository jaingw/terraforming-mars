
import {IActionCard} from '../../ICard';
import {Player} from '../../../Player';
import {PartyHooks} from '../../../turmoil/parties/PartyHooks';
import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {REDS_RULING_POLICY_COST} from '../../../common/constants';
import {PartyName} from '../../../common/turmoil/PartyName';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _UnitedNationsMarsInitiative_ extends Card implements IActionCard, ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._UNITED_NATIONS_MARS_INITIATIVE_,
      tags: [Tags.EARTH],
      startingMegaCredits: 40,
    });
  }

  public play() {
    return undefined;
  }
  public canAct(player: Player): boolean {
    const hasIncreasedTR = player.hasIncreasedTerraformRatingThisGeneration;
    const actionCost = 5;

    if (PartyHooks.shouldApplyPolicy(player, PartyName.REDS)) {
      return hasIncreasedTR && player.canAfford(REDS_RULING_POLICY_COST + actionCost);
    }

    return hasIncreasedTR && player.canAfford(actionCost);
  }

  public action(player: Player) {
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
}
