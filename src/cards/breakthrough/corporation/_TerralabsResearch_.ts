import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';

export class _TerralabsResearch_ implements CorporationCard {
    public name: CardName = CardName._TERRALABS_RESEARCH_;
    public tags: Array<Tags> = [Tags.SCIENCE, Tags.EARTH];
    public startingMegaCredits: number = 20;
    public cardType: CardType = CardType.CORPORATION;
    public cardCost = 1;

    public play(player: Player) {
      player.decreaseTerraformRating();
      player.cardCost = 1;
      return undefined;
    }
    public metadata: CardMetadata = {
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
    }
}
