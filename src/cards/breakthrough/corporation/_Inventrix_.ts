import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {Card} from '../../Card';
import {CardRenderer} from '../../render/CardRenderer';

export class _Inventrix_ extends Card implements CorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._INVENTRIX_,
      tags: [Tags.SCIENCE, Tags.SCIENCE],
      initialActionText: 'Draw 3 cards',
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'R43',
        description: 'As your first action in the game, draw 3 cards. Start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).nbsp.cards(3);
          b.corpBox('effect', (ce) => {
            ce.effect('Your temperature, oxygen, ocean, and Venus requirements are +3 or -3 steps, your choice in each case.', (eb) => {
              eb.plate('Global requirements').startEffect.text('+/- 3');
            });
          });
        }),
      },
    });
  }

  public initialAction(player: Player) {
    player.drawCard(3);
    return undefined;
  }

  public getRequirementBonus(_player: Player): number {
    return 3;
  }
  public play() {
    return undefined;
  }
}
