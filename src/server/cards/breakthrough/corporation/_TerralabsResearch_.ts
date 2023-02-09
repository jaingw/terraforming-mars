import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {Tag} from '../../../../common/cards/Tag';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _TerralabsResearch_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._TERRALABS_RESEARCH_,
      tags: [Tag.SCIENCE, Tag.EARTH],
      startingMegaCredits: 20,
      cardCost: 1,
      metadata: {
        cardNumber: 'R14',
        description: 'You start with 20 M€. Lower your TR 1 step.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(20).nbsp.minus().tr(1);
          b.corpBox('effect', (ce) => {
            ce.effect('Buying cards to hand costs 1M€. You can draw 5 cards in research phase (keep 2 in first turn if drafting)', (eb) => {
              eb.cards(1).startEffect.megacredits(1).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: Player) {
    player.decreaseTerraformRating();
    return undefined;
  }
}
