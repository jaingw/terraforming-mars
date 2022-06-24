import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../../common/cards/Tags';

export class TeiaiGroup extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.TEIAI_GROUP,
      tags: [Tags.BUILDING],
      startingMegaCredits: 51,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q30',
        description: `You start with 51 MC.`,
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(51);
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.action('Decrease 1 TR to draw 2 card. If you have no card, you do not need to decrease TR.', (eb) => {
              eb.minus().tr(1).asterix().startAction.text('2').cards(1);
            });
          });
        }),
      },
    });
  }

  public play() {
    return undefined;
  }
  // public play(player:Player) {
  //   // TEST ONLY
  //   player.drawCard(350);
  //   return undefined;
  // }

  public canAct(): boolean {
    return true;
  }

  public action(player: Player) {
    if (player.cardsInHand.length === 0) {
      player.drawCard(2);
    } else {
      player.decreaseTerraformRatingSteps(1);
      player.drawCard(2);
    }
    return undefined;
  }
}
