import {CardName} from '../../../../common/cards/CardName';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {CorporationCard} from '../../corporation/CorporationCard';
import {CardRenderer} from '../../render/CardRenderer';

export class _Inventrix_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._INVENTRIX_,
      tags: [Tag.SCIENCE, Tag.SCIENCE],
      initialActionText: 'Draw 3 cards',
      startingMegaCredits: 45,
      globalParameterRequirementBonus: {steps: 3},

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

  public initialAction(player: IPlayer) {
    player.drawCard(3);
    return undefined;
  }
}
