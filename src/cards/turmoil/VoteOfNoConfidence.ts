import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Player} from '../../Player';
import {Card} from '../Card';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';
import {all} from '../Options';

export class VoteOfNoConfidence extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.VOTE_OF_NO_CONFIDENCE,
      cardType: CardType.EVENT,
      cost: 5,
      tr: {tr: 1},

      // TODO(kberg): this renders a delegate with a tie and a black background. On the physical card, there is
      // no black background.
      requirements: CardRequirements.builder((b) => b.partyLeaders()),
      metadata: {
        cardNumber: 'T16',
        renderData: CardRenderer.builder((b) => {
          b.minus().chairman({all}).asterix();
          b.nbsp.plus().partyLeaders().br;
          b.tr(1);
        }),
        description: 'Requires that you have a Party Leader in any party and that the sitting Chairman is neutral. ' +
          'Remove the NEUTRAL Chairman and move your own delegate (from the reserve) there instead. Gain 1 TR.',
      },
    });
  }

  public override canPlay(player: Player): boolean {
    const turmoil = TurmoilUtil.getTurmoil(player.game);
    if (!turmoil.hasDelegatesInReserve(player)) return false;

    return turmoil.chairman === 'NEUTRAL';
  }

  public play(player: Player) {
    const turmoil = TurmoilUtil.getTurmoil(player.game);
    turmoil.chairman = player;
    const index = turmoil.delegateReserve.indexOf(player);
    if (index > -1) {
      turmoil.delegateReserve.splice(index, 1);
    }
    player.increaseTerraformRating();
    return undefined;
  }
}
