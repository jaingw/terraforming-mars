import {Player} from '../../../Player';
import {IProjectCard} from '../../IProjectCard';
import {Card} from '../../Card';
import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {Tag} from '../../../../common/cards/Tag';
import {Resources} from '../../../../common/Resources';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {SerializedCard} from '../../../SerializedCard';

export class IdoFront extends Card implements ICorporationCard {
  public allTags = new Set<Tag>();

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
    if (card.tags.filter((tag) => tag !== Tag.WILD ).length === 0 || !player.isCorporation(this.name)) return undefined;
    let count = 0;
    for (const tag of card.tags.filter((tag) => tag !== Tag.WILD )) {
      if (this.allTags.has(tag)) {
        count +=1;
      }
      if ( card.cardType !== CardType.EVENT ) {
        this.allTags.add(tag);
      }
    }

    const wildCount = player.tags.count(Tag.WILD);
    if (card.tags.length >= count) {
      player.addResource(Resources.MEGACREDITS, 2*Math.min(card.tags.length, count+wildCount));
    }
    return undefined;
  }

  public onCorpCardPlayed(player: Player, card:ICorporationCard) {
    return this.onCardPlayed(player, card as unknown as IProjectCard);
  }

  public serialize(serialized: SerializedCard) {
    serialized.allTags = Array.from(this.allTags);
  }

  public deserialize(serialized: SerializedCard) {
    this.allTags = new Set(serialized.allTags);
  }
}
