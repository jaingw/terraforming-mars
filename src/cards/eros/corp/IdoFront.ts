import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {IProjectCard} from '../../IProjectCard';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {Card} from '../../Card';
import {CardRenderer} from '../../render/CardRenderer';

export class IdoFront extends Card implements CorporationCard {
    public allTags = new Set();

    constructor() {
      super({
        name: CardName.IDO_FRONT,
        tags: [],
        startingMegaCredits: 32,
        cardType: CardType.CORPORATION,

        metadata: {
          cardNumber: 'Q23',
          description: `You start with 32 M€.`,
          renderData: CardRenderer.builder((b) => {
            b.br.br.br;
            b.megacredits(32);
            b.corpBox('effect', (ce) => {
              ce.effect('When you play a card, gain 2 M€ for each tag on that card that you already have.', (eb) => {
                eb.blankTag().startEffect.megacredits(2);
              });
            });
          }),
        },
      });
    }

    public onCardPlayed(player: Player, card: IProjectCard) {
      if (card.tags.filter((tag) => tag !== Tags.WILDCARD ).length === 0 || !player.isCorporation(this.name)) return undefined;
      let count = 0;
      for (const tag of card.tags.filter((tag) => tag !== Tags.WILDCARD )) {
        if (this.allTags.has(tag)) {
          count +=1;
        }
        if ( card.cardType !== CardType.EVENT ) {
          this.allTags.add(tag);
        }
      }

      const wildCount = player.getTagCount(Tags.WILDCARD, false, false);
      if (card.tags.length >= count) {
        player.addResource(Resources.MEGACREDITS, 2*Math.min(card.tags.length, count+wildCount));
      }
      return undefined;
    }

    public onCorpCardPlayed(player: Player, card: CorporationCard) {
      return this.onCardPlayed(player, card as IProjectCard);
    }

    public play() {
      return undefined;
    }
}
