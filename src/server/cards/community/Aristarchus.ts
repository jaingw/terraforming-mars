import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class Aristarchus extends Card implements ICorporationCard {
  constructor() {
    super({
      type: CardType.CORPORATION,
      name: CardName.ARISTARCHUS,
      tags: [Tag.VENUS, Tag.EARTH, Tag.JOVIAN],
      startingMegaCredits: 33,

      metadata: {
        cardNumber: 'R50',
        description: 'You start with 33 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br.br;
          b.megacredits(33);
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.action('If you have exactly 0 M€, gain 10 M€', (eb) => {
              eb.empty().startAction.megacredits(10).asterix();
            });
          });
        }),
      },
    });
  }


  public canAct(player: Player): boolean {
    return player.megaCredits === 0;
  }

  public action(player: Player) {
    player.megaCredits += 10;
    return undefined;
  }
}
