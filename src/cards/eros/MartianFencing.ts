import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {EROS_CARD_MANIFEST} from '../../cards/eros/ErosCardManifest';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {DrawCards} from '../../deferredActions/DrawCards';

export class MartianFencing extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MARTIAN_FENCING,
      cardType: CardType.EVENT,
      tags: [],
      cost: 0,

      metadata: {
        cardNumber: 'Q42',
        renderData: CardRenderer.builder((b) => b.text('1 群友').cards(1)),
        description: 'Find one Eros card. Choose to buy it or not.',
      },
    });
  }
  public play(player: Player) {
    this.drawErosCard(player);

    return undefined;
  }

  private drawErosCard(player: Player) {
    const erosCards: Array<CardName> = [];
    EROS_CARD_MANIFEST.projectCards.factories.forEach((cf) => erosCards.push(cf.cardName));
    const drawnCard = player.game.dealer.deck.find((card) => erosCards.includes(card.name));

    if (drawnCard) {
      const cardIndex = player.game.dealer.deck.findIndex((c) => c.name === drawnCard.name);
      player.game.dealer.deck.splice(cardIndex, 1);

      // player.cardsInHand.push(drawnCard);
      player.game.defer(new DeferredAction(player, () => DrawCards.choose(player, [drawnCard], {paying: true})));
      player.game.cardDrew = true;
      player.game.log('${0} drew ${1}', (b) => b.player(player).card(drawnCard));
    }

    return undefined;
  }
}
