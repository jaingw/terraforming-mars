
import {IActionCard} from '../../ICard';
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {PartyHooks} from '../../../turmoil/parties/PartyHooks';
import {REDS_RULING_POLICY_COST} from '../../../constants';
import {PartyName} from '../../../turmoil/parties/PartyName';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';

export class _UnitedNationsMarsInitiative_ implements IActionCard, CorporationCard {
    public name: CardName = CardName._UNITED_NATIONS_MARS_INITIATIVE_;
    public tags: Array<Tags> = [Tags.EARTH];
    public startingMegaCredits: number = 40;
    public cardType: CardType = CardType.CORPORATION;

    public play() {
      return undefined;
    }
    public canAct(player: Player): boolean {
      const hasIncreasedTR = player.hasIncreasedTerraformRatingThisGeneration;
      const actionCost = 5;

      if (PartyHooks.shouldApplyPolicy(player.game, PartyName.REDS)) {
        return hasIncreasedTR && player.canAfford(REDS_RULING_POLICY_COST + actionCost);
      }

      return hasIncreasedTR && player.canAfford(actionCost);
    }

    public action(player: Player) {
      player.megaCredits -= 5;
      player.increaseTerraformRating();
      return undefined;
    }

    public get metadata() {
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
              eb.megacredits(5).startAction.tr(1, Size.SMALL).asterix();
              eb.description(undefined);
            });
            ce.vSpace();
            ce.action('If your TR was raised this generation, you may pay 5 M€ to raise 1 step. When you raise TR in generation, gain 2 M€.', (eb) => {
              eb.tr(1, Size.SMALL).asterix().startEffect.megacredits(2);
            });
          });
        }),
      };
    }
}
