import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {Player} from '../../Player';

export class Thermopoli extends Card implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THERMOPOLI,
      tags: [Tag.SPACE],
      startingMegaCredits: 53,
      type: CardType.CORPORATION,


      metadata: {
        cardNumber: 'XB12',
        description: 'You start with 53 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(53);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('When you send a delegate ,you gain 2 heat.', (eb) => {
              eb.delegates(1).startEffect.heat(2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Gain 2 heat for each influence you have.', (eb) => {
              eb.empty().startAction.heat(2).slash().influence({amount: 1});
            });
          });
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: Player) {
    if (player.game.turmoil) {
      const bonus = player.game.turmoil.getPlayerInfluence(player);
      player.addResource(Resource.HEAT, 2 * bonus, {log: true});
    }
  }
}
