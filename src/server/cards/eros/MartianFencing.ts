import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {EROS_CARD_MANIFEST} from '../../cards/eros/ErosCardManifest';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {DrawCards} from '../../deferredActions/DrawCards';
import {CardManifest} from '../ModuleManifest';

export class MartianFencing extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MARTIAN_FENCING,
      cardType: CardType.EVENT,
      tags: [],
      cost: 0,

      metadata: {
        cardNumber: 'Q56',
        renderData: CardRenderer.builder((b) => b.text('1 群友').cards(1)),
        description: 'Find one Eros card. Choose to buy it or not.',
      },
    });
  }
  public override bespokePlay(player: Player) {
    this.drawErosCard(player);

    return undefined;
  }

  private drawErosCard(player: Player) {
    const erosCards: Array<CardName> = [];
    erosCards.push(...CardManifest.keys(EROS_CARD_MANIFEST.projectCards));
    const drawnCard = player.game.projectDeck.drawPile.find((card) => erosCards.includes(card.name));

    if (drawnCard) {
      const cardIndex = player.game.projectDeck.drawPile.findIndex((c) => c.name === drawnCard.name);
      player.game.projectDeck.drawPile.splice(cardIndex, 1);

      player.game.defer(new SimpleDeferredAction(player, () => DrawCards.choose(player, [drawnCard], {paying: true})));
      player.game.cardDrew = true;
      player.game.log('${0} drew ${1}', (b) => b.player(player).card(drawnCard));
    }

    return undefined;
  }
}
